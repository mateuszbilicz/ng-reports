import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  mixin,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../database/schemas/roles.schema';
import { UserView } from '../../database/schemas/user.schema';

export const MinRole = (role: Role) => {
  class PermissionsGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest(),
        userRaw = request['user'],
        user = userRaw?.hasOwnProperty('_doc') ? userRaw._doc : userRaw;
      return (user as UserView)?.role >= role;
    }
  }

  return applyDecorators(UseGuards(mixin(PermissionsGuard)));
};
