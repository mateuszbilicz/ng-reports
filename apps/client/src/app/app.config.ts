import {
  ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom, provideAppInitializer, inject,
  ErrorHandler
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/Interceptors/AuthInterceptor';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ApiModule } from './core/swagger/api.module';
import { Configuration } from './core/swagger/configuration';
import { environment } from '../environments/environment';
import { AuthService } from './core/Services/AuthService/AuthService';
import { RolesService } from './core/Services/roles-service/roles-service';
import { NgReportsService, NG_REPORTS_CONFIG_DEFAULT, NgReportsConsoleService, ngReportsHttpInterceptor } from 'ng-reports-form';
import {version} from '../../package.json';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {provide: ErrorHandler, useClass: NgReportsConsoleService},
    AuthService,
    RolesService,
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, ngReportsHttpInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.my-app-dark',
          cssLayer: false
        }
      }
    }),
    NgReportsService,
    importProvidersFrom(ApiModule.forRoot(() => new Configuration({ basePath: environment.apiUrl }))),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const ngReportsService = inject(NgReportsService);
      authService.init();
      ngReportsService.config.set({
        ...NG_REPORTS_CONFIG_DEFAULT,
        apiUrl: environment.apiUrl,
        appVersion: version,
        environment: environment.production ? 'ng-reports-prod' : 'ng-reports-dev',
        projectId: 'ng-reports',
        language: 'EN',
        allowAttachments: true,
        attachmentsLimit: 3,
        logsLimit: 100,
        collectConsoleLogs: true,
        collectUserInteractions: true,
        collectRouteChanges: true,
        collectHttpErrors: true,
        collectConsoleErrors: true,
        logSpamPrevention: {
          checkForSpamLast: 5,
          lastSameOccurrenceSeconds: 10,
          sameClickDiffDistance: 16
        },
        localStorage: {
          enabled: true,
          key: 'ng-reports-self-debug-form'
        }
      })
    })
  ]
};
