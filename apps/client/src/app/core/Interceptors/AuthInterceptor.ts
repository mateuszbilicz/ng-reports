import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../Services/AuthService/AuthService';
import { iif, map, of, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned)
            .pipe(
                switchMap((event) =>
                    iif(
                        () => event.type === HttpEventType.Response && event.status === 401 && !event.url?.includes('/auth/refreshToken'),
                        authService.refreshToken().pipe(
                            switchMap((succeeded) =>
                                iif(
                                    () => succeeded,
                                    next(
                                        req.clone({
                                            setHeaders: {
                                                Authorization: `Bearer ${token}`
                                            }
                                        })
                                    ),
                                    of(event)
                                )
                            ),
                            map(() => event)
                        ),
                        of(event)
                    )
                )
            )
    }

    return next(req);
};
