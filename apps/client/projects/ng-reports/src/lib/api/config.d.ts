/** NgReports configuration interface */
export interface NgReportsConfig {
  environment: string;
  projectId: string;
  appVersion: string;
  language: string;
  collectHttpErrors: boolean;
  collectConsoleErrors: boolean;
  collectConsoleLogs: boolean;
  collectRouteChanges: boolean;
  collectUserInteractions: boolean;
  allowAttachments: boolean;
  attachmentsLimit: number;
  attachmentMaxSize: number;
  allowDenyReportUpload: boolean;
  logsLimit: number;
  logSpamPrevention: {
    checkForSpamLast: number;
    lastSameOccurrenceSeconds: number;
    sameClickDiffDistance: number;
  }
  localStorage: {
    enabled: boolean;
    key: string;
  }
}

/** Default NgReports Configuration */
export const NG_REPORTS_CONFIG_DEFAULT: NgReportsConfig = {
  environment: 'testing',
  projectId: 'unknown-project',
  appVersion: 'unknown',
  language: 'en',
  collectHttpErrors: true,
  collectConsoleErrors: true,
  collectConsoleLogs: true,
  collectRouteChanges: true,
  collectUserInteractions: false,
  allowAttachments: false,
  attachmentsLimit: 3,
  attachmentMaxSize: 200,
  allowDenyReportUpload: true,
  logsLimit: 100,
  logSpamPrevention: {
    checkForSpamLast: 3,
    lastSameOccurrenceSeconds: 120,
    sameClickDiffDistance: 8
  },
  localStorage: {
    enabled: true,
    key: 'ng-reports-store'
  }
}
