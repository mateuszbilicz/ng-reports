import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {NgReportsService} from '../services/ng-reports.service';
import {catchError, throwError} from 'rxjs';

export const ngReportsHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const ngReportsService = inject(NgReportsService);
  const cloned = req.clone({});
  return next(cloned)
    .pipe(
      catchError(err => {
        ngReportsService.addHttpError(
          req.url,
          err.status,
          req.body ? JSON.stringify(req.body) : undefined,
          err.error ? JSON.stringify(err.error) : undefined
        );
        return throwError(err);
      })
    );
};
