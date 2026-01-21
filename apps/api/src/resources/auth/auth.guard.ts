import {CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException,} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {jwt} from '../../../ng-reports.config.json';
import {APP_GUARD, Reflector} from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private reflector: Reflector,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwt.secret,
            });
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return type === 'Bearer' ? token : undefined;
    }
}

export const AUTH_GUARD_PROVIDER = {
    provide: APP_GUARD,
    useClass: AuthGuard,
};
