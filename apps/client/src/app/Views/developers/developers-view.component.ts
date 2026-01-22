import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-developers-view',
  imports: [
    Button,
  ],
  templateUrl: './developers-view.component.html',
  styleUrl: './developers-view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevelopersViewComponent {
  headers = [
    {name: 'How to use NG Reports', id: 'how-to-use-ng-reports'},
    {name: 'Installation', id: 'installation'},
    {name: 'App configuration', id: 'app-config'},
    {name: 'Adding collectors', id: 'adding-collectors'},
    {name: 'Configuration', id: 'configuration'},
    {name: 'Usage', id: 'usage'},
    {name: 'Display the dialog', id: 'display-dialog'},
  ];

  addingCollectorsCode = `export const appConfig: ApplicationConfig = {
  providers: [
    {provide: ErrorHandler, useClass: NgReportsConsoleService},
    provideHttpClient(withInterceptors([ngReportsHttpInterceptor])),
    NgReportsService,
    provideAppInitializer(() => {
        const ngReportsService = inject(NgReportsService);
        ngReportsService.config.set(NG_REPORTS_CONFIG);
    })
  ]
};`;
  addingCollectorsCodeNG_REPORTS_CONFIG = `const NG_REPORTS_CONFIG = {
  ...NG_REPORTS_CONFIG_DEFAULT, // Default config variables imported from ng-reports
  apiUrl: environment.ngReportsApiUrl, // NG Reports API instance url to send reports to
  appVersion: version, // App version, could be obtained from package.json file
  environment: environment.name, // Your environment name - useful if you want
  //                                to distinct errors between dev / staging / prod / others
  projectId: 'your-project-id', // Project ID - defined in NG Reports
  language: 'EN', // App language - can be changed later, for example when user changes language
  allowAttachments: true, // Allow users add images to reports
  attachmentsLimit: 3, // Images limit
  // Collectors settings
  logsLimit: 100, // Logs limit
  collectConsoleLogs: true, // Enable NgReportsService console log collector
  collectUserInteractions: true, // Enable NgReportsService user interaction collector
  collectRouteChanges: true, // Enable NgReportsService route changes collector
  collectHttpErrors: true, // Enable ngReportsHttpInterceptor collector
  collectConsoleErrors: true, // Enable NgReportsConsoleService collector
  logSpamPrevention: {
    checkForSpamLast: 5, // Check last N logs for same-log spam
    lastSameOccurrenceSeconds: 10, // Last same log can occur in N seconds
    sameClickDiffDistance: 16 // Min distance between mouse interactions
  },
  // Saving report data to local storage (in case of critical error on one route)
  localStorage: {
    enabled: true, // Enable saving
    key: 'ng-reports-self-debug-form' // Local storage key
  }
}`;
  ngLibComponentCode = `<lib-ng-reports/>`;
  ngLibComponentTSCode = `@Component({
  selector: 'your-component',
  imports: [
    NgReportsComponent
  ],
  templateUrl: './your-component.component.html',
  styleUrl: './your-component.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevelopersViewComponent {
  protected readonly ngReportsService = inject(NgReportsService);

  openReportDialog() {
    this.ngReportsService.open();
  }
}`
}
