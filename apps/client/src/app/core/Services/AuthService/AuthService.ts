import {computed, inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, finalize, map, Observable, of, shareReplay, switchMap, tap} from 'rxjs';
import {Login, UserView} from '../../swagger';
import {AuthService as ApiAuthService} from '../../swagger/api/auth.service';

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

  readonly isLoggedIn = computed(() => !!this._tkn());

  private refreshTokenRequest$: Observable<boolean> | null = null;

  init() {
    this.refreshToken().subscribe();
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
    if (this.refreshTokenRequest$) {
      return this.refreshTokenRequest$;
    }

    if (!this._rtkn()) {
      return of(false).pipe(tap(() => this.logout()));
    }

    this.refreshTokenRequest$ = this.apiAuthService.authControllerRefreshToken({string: this._rtkn()!}).pipe(
      tap(response => {
        this.setSession(response.accessToken, response.refreshToken);
      }),
      switchMap(() => this.fetchSelf()),
      map((user) => !!user),
      catchError(() => {
        this.logout();
        return of(false);
      }),
      finalize(() => {
        this.refreshTokenRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.refreshTokenRequest$;
  }

  logout() {
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
