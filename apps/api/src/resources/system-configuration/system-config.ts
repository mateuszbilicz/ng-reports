export interface SystemConfig {
  /** delete reports after */
  reportsRetentionInMonths: number;
  /** delete inactive users after */
  inactiveUsersRetentionInMonths: number;
  /** enable CORS any */
  allowReportsIncomeFromUnknownSources: boolean;
  /** enables AI summary generation */
  enableAISummary: boolean;
  /** enabled AI auto severity assignation */
  enableAIAutoSeverityAssignation: boolean;
  /** enabled AI auto summary generation */
  enableAIAutoSummaryGeneration: boolean;
  /** enables including project description to the summary generation context for AI */
  summaryGenerationIncludeProjectDescription: boolean;
  /** enables including project environment to the summary generation context for AI */
  summaryGenerationIncludeProjectEnvironment: boolean;
  /** enables including report details to the summary generation context for AI */
  summaryGenerationIncludeReportDetails: boolean;
  /** enables including report logs to the summary generation context for AI */
  summaryGenerationIncludeReportLogs: boolean;
  /** enables including report form data to the summary generation context for AI */
  summaryGenerationIncludeReportFormData: boolean;
  /** enables including report environment to the summary generation context for AI */
  summaryGenerationIncludeReportEnvironment: boolean;
  /** enables including comments to the summary generation context for AI */
  summaryGenerationIncludeComments: boolean;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  reportsRetentionInMonths: 3,
  inactiveUsersRetentionInMonths: 3,
  allowReportsIncomeFromUnknownSources: false,
  enableAISummary: true,
  enableAIAutoSeverityAssignation: true,
  enableAIAutoSummaryGeneration: true,
  summaryGenerationIncludeProjectDescription: true,
  summaryGenerationIncludeProjectEnvironment: true,
  summaryGenerationIncludeReportDetails: true,
  summaryGenerationIncludeReportLogs: true,
  summaryGenerationIncludeReportFormData: true,
  summaryGenerationIncludeReportEnvironment: true,
  summaryGenerationIncludeComments: true,
};

export const CONFIG_FIELD_DESCRIPTIONS: { [k: string]: string } = {
  reportsRetentionInMonths: 'Delete reports after',
  inactiveUsersRetentionInMonths: 'Delete inactive users after',
  allowReportsIncomeFromUnknownSources: 'Enable CORS any',
  enableAISummary: 'Enables AI summary generation',
  enableAIAutoSeverityAssignation: 'Enabled AI auto summary generation',
  enableAIAutoSummaryGeneration: 'Enabled AU auto summary generation',
  summaryGenerationIncludeProjectDescription:
    'Enables including project description to the summary generation context for AI',
  summaryGenerationIncludeProjectEnvironment:
    'Enables including project environment to the summary generation context for AI',
  summaryGenerationIncludeReportDetails:
    'Enables including report details to the summary generation context for AI',
  summaryGenerationIncludeReportLogs:
    'Enables including report logs to the summary generation context for AI',
  summaryGenerationIncludeReportFormData:
    'Enables including report form data to the summary generation context for AI',
  summaryGenerationIncludeReportEnvironment:
    'Enables including report environment to the summary generation context for AI',
  summaryGenerationIncludeComments:
    'Enables including comments to the summary generation context for AI',
};
