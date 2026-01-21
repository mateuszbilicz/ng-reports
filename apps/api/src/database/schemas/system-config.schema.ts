import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from 'mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {SystemConfig} from "../../resources/system-configuration/system-config";

export type ConfigFieldDocument = HydratedDocument<ConfigField>;

@Schema()
export class ConfigField {
    @ApiProperty({
        type: () => String,
    })
    @Prop({
        unique: true,
    })
    fieldName: string;

    @ApiProperty({
        type: () => String,
    })
    @Prop({
        type: MongooseSchema.Types.Mixed,
    })
    value: any;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    description: string;

    @ApiProperty({
        type: () => Date,
    })
    @Prop()
    lastUpdate: Date;
}

export const ConfigFieldSchema = SchemaFactory.createForClass(ConfigField);

export const ConfigFieldFeature = {
    name: ConfigField.name,
    schema: ConfigFieldSchema,
};

export class ConfigFieldUpdate {
    @ApiProperty()
    fieldName: string;

    @ApiProperty()
    value: any;
}

export class ConfigFieldUpdateMany implements Partial<SystemConfig> {
    @ApiProperty({
        description: 'delete reports after',
        required: false
    })
    reportsRetentionInMonths?: number;

    @ApiProperty({
        description: 'delete inactive users after',
        required: false
    })
    inactiveUsersRetentionInMonths?: number;

    @ApiProperty({
        description: 'enable CORS any',
        required: false
    })
    allowReportsIncomeFromUnknownSources?: boolean;

    @ApiProperty({
        description: 'enables AI summary generation',
        required: false
    })
    enableAISummary?: boolean;

    @ApiProperty({
        description: 'enabled AI auto summary generation',
        required: false
    })
    enableAIAutoSeverityAssignation?: boolean;

    @ApiProperty({
        description: 'enabled AU auto summary generation',
        required: false
    })
    enableAIAutoSummaryGeneration?: boolean;

    @ApiProperty({
        description: 'enables including project description to the summary generation context for AI',
        required: false
    })
    summaryGenerationIncludeProjectDescription?: boolean;

    @ApiProperty({
        description: 'enables including project environment to the summary generation context for AI',
        required: false
    })
    summaryGenerationIncludeProjectEnvironment?: boolean;

    @ApiProperty({
        description: 'enables including report details to the summary generation context for AI',
        required: false
    })
    summaryGenerationIncludeReportDetails?: boolean;

    @ApiProperty({
        description: 'enables including report logs to the summary generation context for AI',
        required: false
    })
    summaryGenerationIncludeReportLogs?: boolean;

    @ApiProperty({
        description: 'enables including report form data to the summary generation context for AI',
        required: false
    })
    summaryGenerationIncludeReportFormData?: boolean;

    @ApiProperty({
        description: 'enables including report environment to the summary generation context for AI',
        required: false
    })
    summaryGenerationIncludeReportEnvironment?: boolean;

    @ApiProperty({
        description: 'enables including comments to the summary generation context for AI',
        required: false
    })
    summaryGenerationIncludeComments?: boolean;
}

export class SystemConfigView implements SystemConfig {
    @ApiProperty({
        description: 'delete reports after'
    })
    reportsRetentionInMonths: number;

    @ApiProperty({
        description: 'delete inactive users after'
    })
    inactiveUsersRetentionInMonths: number;

    @ApiProperty({
        description: 'enable CORS any'
    })
    allowReportsIncomeFromUnknownSources: boolean;

    @ApiProperty({
        description: 'enables AI summary generation'
    })
    enableAISummary: boolean;

    @ApiProperty({
        description: 'enabled AI auto summary generation'
    })
    enableAIAutoSeverityAssignation: boolean;

    @ApiProperty({
        description: 'enabled AU auto summary generation'
    })
    enableAIAutoSummaryGeneration: boolean;

    @ApiProperty({
        description: 'enables including project description to the summary generation context for AI'
    })
    summaryGenerationIncludeProjectDescription: boolean;

    @ApiProperty({
        description: 'enables including project environment to the summary generation context for AI'
    })
    summaryGenerationIncludeProjectEnvironment: boolean;

    @ApiProperty({
        description: 'enables including report details to the summary generation context for AI'
    })
    summaryGenerationIncludeReportDetails: boolean;

    @ApiProperty({
        description: 'enables including report logs to the summary generation context for AI'
    })
    summaryGenerationIncludeReportLogs: boolean;

    @ApiProperty({
        description: 'enables including report form data to the summary generation context for AI'
    })
    summaryGenerationIncludeReportFormData: boolean;

    @ApiProperty({
        description: 'enables including report environment to the summary generation context for AI'
    })
    summaryGenerationIncludeReportEnvironment: boolean;

    @ApiProperty({
        description: 'enables including comments to the summary generation context for AI'
    })
    summaryGenerationIncludeComments: boolean;
}