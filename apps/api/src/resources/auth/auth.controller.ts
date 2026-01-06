import { Body, Get, Post, Request } from '@nestjs/common';
import { Login, UserView } from '../../database/schemas/user.schema';
import { InitializeController } from '../../global/initialize-controller';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import { ObjStr } from '../../database/schemas/universal';

@InitializeController('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('self')
  getUser(@Request() req) {
    return req.user as UserView;
  }

  @Public()
  @Post('login')
  login(@Body() loginData: Login) {
    return this.authService.login(loginData.username, loginData.password);
  }

  @Public()
  @Post('refreshToken')
  refreshToken(@Body() refreshToken: ObjStr) {
    return this.authService.refresh(refreshToken.string);
  }
}
