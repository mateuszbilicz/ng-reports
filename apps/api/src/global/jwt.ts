import { JwtModule } from '@nestjs/jwt';
import { jwt } from '../../ng-reports.config.json';
import { StringValue } from 'ms';

export const JWT_REGISTER_IMPORT = JwtModule.register({
  global: true,
  secret: jwt.secret,
  signOptions: {
    expiresIn: (jwt.expiresInMinutes + 'm') as StringValue,
  },
});
