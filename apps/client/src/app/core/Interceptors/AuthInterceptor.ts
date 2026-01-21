import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../Services/AuthService/AuthService';
import {catchError, switchMap, throwError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
    return next(req);
  }

  const reqWithToken = addToken(req, token);

  return next(reqWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

const addToken = (req: HttpRequest<any>, token: string | null): HttpRequest<any> => {
  if (!token) {
    return req;
  }
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};

const handle401Error = (req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) => {
  return authService.refreshToken().pipe(
    switchMap((succeeded: boolean) => {
      if (succeeded) {
        const newToken = authService.getToken();
        return next(addToken(req, newToken));
      } else {
        authService.logout();
        return throwError(() => new Error('Session expired'));
      }
    }),
    catchError((err) => {
      authService.logout();
      return throwError(() => err);
    })
  );
};
