import {Injectable} from '@nestjs/common';
import {Content, GoogleGenerativeAI} from '@google/generative-ai';
import {googleAPI} from '../../../ng-reports.config.json';
import {parseAiPrompt} from "../../ai/prompt-parser";
import {SystemConfigurationService} from "../system-configuration/system-configuration.service";
import {SystemConfig} from "../system-configuration/system-config";
import {NgReportsLog, Report, ReportDocument} from "../../database/schemas/report.schema";
import {Project, ProjectDocument} from "../../database/schemas/project.schema";
import {Comment, CommentDocument} from "../../database/schemas/comment.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {filter, forkJoin, from, iif, map, of, switchMap, take} from "rxjs";
import {AIProcessResponse} from "../../database/schemas/ai.schema";
import {RxQueue} from "../../global/rx-queue";

@Injectable()
export class AiService {
    private genAI = new GoogleGenerativeAI(googleAPI.generativeAiKey);
    private model = this.genAI.getGenerativeModel({
        model: googleAPI.model,
    });
    private systemConfig: SystemConfig;
    queue = new RxQueue<AIProcessResponse>(250, 3);

    constructor(
        private systemConfigurationService: SystemConfigurationService,
        @InjectModel(Project.name)
        private projectModel: Model<ProjectDocument>,
        @InjectModel(Report.name)
        private readonly reportModel: Model<ReportDocument>,
        @InjectModel(Comment.name)
        private readonly commentModel: Model<CommentDocument>,
    ) {
        this.systemConfig = systemConfigurationService.config.getValue();
        this.systemConfigurationService.config.subscribe((config) => {
            this.systemConfig = config;
        });
    }

    addProcessReportToQueue(reportId: string) {
        if (!this.systemConfig.enableAISummary) return of({
            reportId,
            severity: undefined,
            summary: undefined
        } as AIProcessResponse);
        this.queue.addTask(reportId, this.processReport(reportId));
        return this.queue.queueResult.pipe(
            filter(([taskId]) => taskId === reportId),
            take(1),
            map(result => result[1])
        );
    }

    processReport(reportId: string) {
        if (!this.systemConfig.enableAISummary) return of({
            reportId,
            severity: undefined,
            summary: undefined
        } as AIProcessResponse);
        return this.loadReportAndParseForPrompt(reportId)
            .pipe(
                map(promptMessages => promptMessages.map(message => ({text: message}))),
                map(promptMessages => [
                        {
                            role: 'model',
                            parts: promptMessages.slice(0, 1)
                        },
                        {
                            role: 'user',
                            parts: promptMessages.slice(1)
                        }
                    ]
                ),
                switchMap(contents =>
                    from(this.model.generateContent({
                        contents
                    }))
                ),
                map(response => (
                    response.response.candidates?.[0]?.content
                    || {parts: [response.response.text]}
                    || {}
                ) as Content),
                map(content => content.parts[0]),
                map(part => ({...JSON.parse(part.text!), reportId}) as AIProcessResponse)
            );
    }

    private loadReportAndParseForPrompt(reportId: string) {
        return from(
            this.reportModel.findOne<Report>({_id: reportId})
        )
            .pipe(
                switchMap(report =>
                    iif(
                        () => this.systemConfig.summaryGenerationIncludeProjectDescription,
                        of({description: 'Project description not available yet. Will be available in the future. Keep working on other available data.'} as unknown as Project), // attach project
                        of({} as unknown as Project),
                    )
                        .pipe(
                            map((project) => ({report, project})),
                        )
                ),
                switchMap(({project, report}) =>
                    forkJoin(
                        report!.comments.map(commentId =>
                            this.commentModel.findOne<Comment>({_id: commentId})
                        )
                    )
                        .pipe(
                            map(comments => ({project, report, comments: comments.filter(c => !!c)}))
                        )
                ),
                map(data =>
                    this.parsePrompt(data.project!, data.report!, data.comments ?? [])
                )
            );
    }

    private parsePrompt(project: Project, report: Report, comments: Comment[]) {
        return parseAiPrompt({
            ...(this.systemConfig.summaryGenerationIncludeProjectDescription
                ? {projectDescription: project?.description} : {}),
            ...(this.systemConfig.summaryGenerationIncludeProjectEnvironment
                ? {projectEnvironmentName: report.environment.appEnvironment} : {}),
            ...(this.systemConfig.summaryGenerationIncludeReportDetails
                ? {
                    reportDetails: {
                        title: report.title,
                        details: report.details
                    }
                } : {}),
            ...(this.systemConfig.summaryGenerationIncludeReportLogs
                ? {reportLogs: JSON.parse((report as any).logs?.[0] ?? '[]') as NgReportsLog[]} : {}),
            ...(this.systemConfig.summaryGenerationIncludeReportFormData
                ? {reportFormData: report.formData} : {}),
            ...(this.systemConfig.summaryGenerationIncludeReportEnvironment
                ? {reportEnvironment: report.environment} : {}),
            ...(this.systemConfig.summaryGenerationIncludeComments
                ? {comments: comments} : {})
        });
    }
}
