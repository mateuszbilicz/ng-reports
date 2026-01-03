import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap, catchError, of, Observable } from 'rxjs';
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
    readonly token = this._tkn.asReadonly();

    readonly isLoggedIn = computed(() => !!this._tkn());

    constructor() {
        if (this._tkn()) {
            this.fetchSelf().subscribe();
        }
    }

    login(credentials: Login): Observable<any> {
        return this.apiAuthService.authControllerLogin(credentials).pipe(
            tap(response => {
                this.setSession(response.accessToken);
                this.fetchSelf().subscribe();
            })
        );
    }

    logout() {
        localStorage.removeItem('access_token');
        this._tkn.set(null);
        this._currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return this._tkn();
    }

    private setSession(token: string) {
        localStorage.setItem('access_token', token);
        this._tkn.set(token);
    }

    private fetchSelf(): Observable<UserView | null> {
        return this.apiAuthService.authControllerGetUser().pipe(
            tap(user => this._currentUser.set(user)),
            catchError(() => {
                this.logout();
                return of(null);
            })
        );
    }
}
