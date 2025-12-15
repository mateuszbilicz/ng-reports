import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import {ErrorResponse, ErrorResponses, OperationSuccessResult} from './error-responses';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../resources/auth/auth.guard';

export function InitializeController(name: string) {
  return applyDecorators(
    ErrorResponses(),
    ApiTags(name),
    ApiExtraModels(ErrorResponse, OperationSuccessResult),
    Controller(name),
    UseGuards(AuthGuard),
  );
}
