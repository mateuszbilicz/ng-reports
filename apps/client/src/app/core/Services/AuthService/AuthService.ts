import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap, catchError, of, Observable, map, switchMap, filter } from 'rxjs';
import { Login } from '../../swagger/model/login';
import { UserView } from '../../swagger/model/userView';
import { AuthService as ApiAuthService } from '../../swagger/api/auth.service';

export interface AuthState {
    user: UserView | null;
    token: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiAuthService = inject(ApiAuthService);
    private router = inject(Router);

    private _currentUser = signal<UserView | null>(null);
    readonly currentUser = this._currentUser.asReadonly();

    private _tkn = signal<string | null>(localStorage.getItem('access_token'));
    private _rtkn = signal<string | null>(localStorage.getItem('refresh_token'));
    readonly token = this._tkn.asReadonly();

    readonly isLoggedIn = computed(() => !!this._tkn());

    init() {
        this.refreshToken()
            .pipe(
                filter((succeeded) => succeeded),
                switchMap(() => this.fetchSelf()),
                // tap(() => this.router.navigate(['/'])),
                catchError(() => of(void 0))
            )
            .subscribe();
    }

    login(credentials: Login): Observable<void> {
        return this.apiAuthService.authControllerLogin(credentials).pipe(
            tap(response => {
                this.setSession(response.accessToken, response.refreshToken);
            }),
            switchMap(() => this.fetchSelf()),
            map(() => void 0)
        );
    }

    refreshToken(): Observable<boolean> {
        if (!this._rtkn()) {
            return of(false)
                .pipe(
                    tap(() => this.logout())
                );
        }
        return this.apiAuthService.authControllerRefreshToken({ string: this._rtkn()! }).pipe(
            tap(response => {
                this.setSession(response.accessToken, response.refreshToken);
            }),
            switchMap(() => this.fetchSelf()),
            map(() => true),
            catchError(() => of(false))
        );
    }

    logout() {
      console.log('LOGOUT')
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this._tkn.set(null);
        this._currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return this._tkn();
    }

    private setSession(token: string, refreshToken: string) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        this._tkn.set(token);
        this._rtkn.set(refreshToken);
    }

    private fetchSelf(): Observable<any | null> {
        return this.apiAuthService.authControllerGetUser().pipe(
            tap(user => this._currentUser.set(user.hasOwnProperty('_doc') ? user._doc : user)),
            catchError(() => {
                this.logout();
                return of(null);
            })
        );
    }
}
