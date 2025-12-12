import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {forkJoin, from, map, Observable, of, switchMap} from 'rxjs';
import {Environment, EnvironmentDocument} from '../../database/schemas/environment.schema';
import {Project, ProjectDocument} from '../../database/schemas/project.schema';
import {Report, ReportDocument} from '../../database/schemas/report.schema';
import {Severity} from '../../database/schemas/severity.schema';

// Define the structure of the final statistics object as per AGENTS.md
export interface Statistics {
    sampling: 'hour' | 'day' | 'week' | 'month';
    samples: { label: string; value: number }[];
    totalReports: number;
    avgReportsPerSample: number;
}

@Injectable()
export class StatisticsService {
    constructor(
        @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
        @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
        @InjectModel(Environment.name) private readonly environmentModel: Model<EnvironmentDocument>,
    ) {
    }

    getStatistics(
        sampling: 'hour' | 'day' | 'week' | 'month',
        dateFrom: Date,
        dateTo: Date,
        projectId?: string,
        environmentId?: string,
        textFilter?: string,
        severity?: Severity,
        fixed?: boolean,
    ): Observable<Statistics> {
        // Helper to get report IDs from project/environment
        const getReportIds = projectId
            ? from(this.projectModel.findOne({projectId}).exec()).pipe(
                switchMap(project => {
                    if (!project) return of([]);
                    return from(this.environmentModel.find({_id: {$in: project.environments}} as any).exec());
                }),
                map(environments => environments.flatMap(env => env.reports))
            )
            : environmentId
                ? from(this.environmentModel.findOne({environmentId}).exec()).pipe(
                    map(environment => environment ? environment.reports : [])
                )
                : of([]);

        return getReportIds.pipe(
            switchMap((reportIds: Types.ObjectId[]) => {
                if (
                    (!reportIds && !Array.isArray(reportIds))
                    || reportIds.length === 0
                ) {
                    return of({
                        aggregation: [],
                        count: 0
                    });
                }
                // Build the dynamic $match stage
                const matchStage: any = {
                    timestamp: {$gte: dateFrom.getTime() / 1000, $lte: dateTo.getTime() / 1000},
                };

                if (reportIds) {
                    matchStage._id = {$in: reportIds};
                }
                if (textFilter) {
                    matchStage.$or = [
                        {title: {$regex: `(.*)${textFilter}(.*)`, $options: 'i'}},
                        {details: {$regex: `(.*)${textFilter}(.*)`, $options: 'i'}},
                    ];
                }
                if (severity !== undefined) matchStage.severity = severity;
                if (fixed !== undefined) matchStage.fixed = fixed;

                // Define date format based on sampling period
                const dateFormat = {
                    hour: '%Y-%m-%d %H:00',
                    day: '%Y-%m-%d',
                    week: '%Y-W%U',
                    month: '%Y-%m',
                }[sampling];

                const aggregation$ = this.reportModel.aggregate([
                    {$match: matchStage},
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: dateFormat,
                                    date: {$toDate: {$multiply: ['$timestamp', 1000]}}
                                }
                            },
                            value: {$sum: 1},
                        },
                    },
                    {$sort: {_id: 1}},
                    {$project: {_id: 0, label: '$_id', value: '$value'}},
                ]);

                const count$ = this.reportModel.countDocuments(matchStage).exec();

                return forkJoin({aggregation: from(aggregation$), count: from(count$)});
            }),
            map(({aggregation, count}) => {
                const totalReports = Number(count);
                const samples = aggregation as { label: string; value: number }[];
                const avgReportsPerSample = samples.length > 0 ? totalReports / samples.length : 0;

                return {
                    sampling,
                    samples,
                    totalReports,
                    avgReportsPerSample: parseFloat(avgReportsPerSample.toFixed(2)),
                } as Statistics;
            }),
        );
    }
}
