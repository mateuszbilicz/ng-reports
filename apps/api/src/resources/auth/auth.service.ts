import {Injectable} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {forkJoin, from, Observable, of, switchMap} from 'rxjs';
import {JwtService} from '@nestjs/jwt';
import {UserView} from '../../database/schemas/user.schema';
import {addMinutes} from 'date-fns/addMinutes';
import {Tokens} from "./token";
import {jwt} from '../../../ng-reports.config.json';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {
    }

    login(username: string, password: string) {
        return this.usersService.getAuth(username, password).pipe(
            switchMap((user: UserView) => {
                const expiresAt = addMinutes(new Date(), jwt.expiresInMinutes);
                return forkJoin({
                    accessToken: from(this.jwtService.signAsync({
                        ...(user.hasOwnProperty('_doc') ? (user as any)._doc : user),
                        expiresAt
                    })),
                    refreshToken: from(
                        this.jwtService.signAsync(
                            {username: user.username, expiresAt},
                            {expiresIn: '31d'},
                        ),
                    ),
                    expiresAt: of(expiresAt),
                });
            }),
        );
    }

    refresh(refreshToken: string): Observable<Tokens> {
        return of(this.jwtService.verify(refreshToken)).pipe(
            switchMap((tokenInfo: any) => {
                const verified = new Date(tokenInfo.expiresAt).getTime() >= Date.now();
                if (!verified) {
                    throw new Error('Refresh token expired');
                }
                return of(tokenInfo);
            }),
            switchMap((decoded: { username: string } | undefined) => {
                if (!decoded || !decoded.username) {
                    throw new Error('Invalid refresh token');
                }
                return this.usersService.get(decoded.username);
            }),
            switchMap((user) => {
                if (!user || !user.isActive) {
                    throw new Error('User not found or not active');
                }
                const expiresAt = addMinutes(new Date(), jwt.expiresInMinutes);
                return forkJoin({
                    accessToken: from(this.jwtService.signAsync({
                        ...(user.hasOwnProperty('_doc') ? (user as any)._doc : user),
                        expiresAt
                    })),
                    refreshToken: from(
                        this.jwtService.signAsync(
                            {username: user.username, expiresAt},
                            {expiresIn: '31d'},
                        ),
                    ),
                    expiresAt: of(expiresAt),
                });
            }),
        );
    }
}
