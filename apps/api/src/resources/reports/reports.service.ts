import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, Model} from 'mongoose';
import {filter, forkJoin, from, map, Observable, of, switchMap, tap} from 'rxjs';
import {AsFilteredListOf} from '../../database/filtered-list';
import {
    Comment,
    CommentDocument,
} from '../../database/schemas/comment.schema';
import {
    Environment,
    EnvironmentDocument,
} from '../../database/schemas/environment.schema';
import {
    Report,
    ReportDocument,
    REPORT_DETAILS_PROJECTION,
    REPORT_LIST_PROJECTION,
} from '../../database/schemas/report.schema';
import {Severity} from '../../database/schemas/severity.schema';
import {MongoGridFS} from 'mongo-gridfs';
import {GridFSBucketReadStream} from 'mongodb';
import {AiService} from "../ai/ai.service";
import {SystemConfigurationService} from "../system-configuration/system-configuration.service";
import {SystemConfig} from "../system-configuration/system-config";

export const ReportFilteredListClass = AsFilteredListOf(Report);
export type ReportFilteredList = InstanceType<typeof ReportFilteredListClass>;

@Injectable()
export class ReportsService {
    gridFS: MongoGridFS;
    private systemConfig: SystemConfig;

    constructor(
        @InjectModel(Report.name)
        private readonly reportModel: Model<ReportDocument>,
        @InjectModel(Environment.name)
        private readonly environmentModel: Model<EnvironmentDocument>,
        @InjectModel(Comment.name)
        private readonly commentModel: Model<CommentDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly aiService: AiService,
        private readonly systemConfigurationService: SystemConfigurationService
    ) {
        this.gridFS = new MongoGridFS(connection.db as any, 'fs');
        this.systemConfig = systemConfigurationService.config.getValue();
        this.systemConfigurationService.config.subscribe((config) => {
            this.systemConfig = config;
        });
    }

    private autoRunAiOn(reportId: string) {
        this.aiService.addProcessReportToQueue(reportId)
            .pipe(
                map(result => ({
                        ...(this.systemConfig.enableAIAutoSeverityAssignation ? {
                            severity: result.severity ?? 0
                        } : {}),
                        ...(this.systemConfig.enableAIAutoSummaryGeneration ? {
                            summary: result.summary ?? ''
                        } : {}),
                })),
                filter(({severity, summary}) => typeof severity === 'number' || typeof summary === 'string'),
                switchMap(updateReport => this.update(reportId, updateReport))
            )
            .subscribe()
    }

    readStream(id: string): Observable<GridFSBucketReadStream> {
        return from(this.gridFS.readFileStream(id));
    }

    findAll(
        environmentId: string,
        skip: number,
        limit: number,
        filter: string,
    ): Observable<ReportFilteredList> {
        return from(this.environmentModel.findOne({environmentId}).exec()).pipe(
            switchMap((environment) => {
                if (!environment) {
                    throw new NotFoundException('Environment not found');
                }

                const textFilter = filter
                    ? {title: {$regex: `(.*)${filter}(.*)`, $options: 'i'}}
                    : {};
                const query = {_id: {$in: environment.reports}, ...textFilter};

                return from(
                    this.reportModel
                        .find<Report>(query, REPORT_LIST_PROJECTION, {skip, limit})
                        .exec(),
                ).pipe(
                    switchMap((reports) =>
                        from(this.reportModel.countDocuments(query).exec()).pipe(
                            map((count) => ({reports, count})),
                        ),
                    ),
                );
            }),
            map(({reports, count}) => {
                return {
                    items: reports,
                    totalItemsCount: count,
                } as ReportFilteredList;
            }),
        );
    }

    create(reportFromUser: Report, environmentId: string): Observable<Report> {
        const newReport = new this.reportModel({
            ...reportFromUser,
            severity: null,
            summary: null,
            fixed: false,
            dataIsFromAuthService: false,
        });

        return from(newReport.save()).pipe(
            switchMap((savedReport) =>
                from(
                    this.environmentModel
                        .updateOne(
                            {environmentId},
                            {$push: {reports: savedReport._id}},
                        )
                        .exec(),
                ).pipe(
                    tap((res) => {
                        if (res.upsertedId)
                            this.autoRunAiOn(res.upsertedId + '');
                    }),
                    map(() => savedReport),
                ),
            ),
        ) as Observable<Report>;
    }

    findOne(reportId: string): Observable<Report> {
        return from(
            this.reportModel
                .findOne<Report>({_id: reportId}, REPORT_DETAILS_PROJECTION)
                .exec(),
        ) as Observable<Report>;
    }

    update(reportId: string, updateReport: Partial<Report>): Observable<Report> {
        return from(
            this.reportModel
                .findByIdAndUpdate<Report>(reportId, {$set: updateReport}, {new: true})
                .exec(),
        ) as Observable<Report>;
    }

    changeSeverity(reportId: string, severity: Severity): Observable<Report> {
        return from(
            this.reportModel
                .findByIdAndUpdate<Report>(reportId, {$set: {severity}}, {new: true})
                .exec(),
        ) as Observable<Report>;
    }

    changeFixed(reportId: string, fixed: boolean): Observable<Report> {
        return from(
            this.reportModel
                .findByIdAndUpdate<Report>(reportId, {$set: {fixed}}, {new: true})
                .exec(),
        ) as Observable<Report>;
    }

    remove(reportId: string): Observable<Report> {
        return from(this.reportModel.findByIdAndDelete(reportId).exec()).pipe(
            switchMap((deletedReport) => {
                if (!deletedReport) {
                    return of(null);
                }

                // Prepare cleanup operations
                const deleteAttachments$ = forkJoin(
                    ((deletedReport as Report).attachments ?? []).map((attachment) =>
                        from(this.gridFS.delete(attachment.file)),
                    ),
                );
                const deleteComments$ = this.commentModel
                    .deleteMany({_id: {$in: (deletedReport as Report).comments}})
                    .exec();
                const updateEnvironment$ = this.environmentModel
                    .updateOne(
                        {reports: deletedReport._id},
                        {$pull: {reports: deletedReport._id}},
                    )
                    .exec();

                // Run cleanup in parallel and return the original deleted report
                return forkJoin([
                    deleteAttachments$,
                    deleteComments$,
                    updateEnvironment$,
                ]).pipe(map(() => deletedReport));
            }),
        ) as Observable<Report>;
    }
}
