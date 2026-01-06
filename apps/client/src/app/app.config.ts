import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom, provideAppInitializer, inject } from '@angular/core';
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    AuthService,
    RolesService,
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
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
    importProvidersFrom(ApiModule.forRoot(() => new Configuration({ basePath: environment.apiUrl }))),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      authService.init();
    })
  ]
};
