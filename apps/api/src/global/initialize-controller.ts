import {applyDecorators, Controller, UseGuards} from '@nestjs/common';
import {ErrorResponse, ErrorResponses, OperationSuccessResult} from './error-responses';
import {ApiExtraModels, ApiTags} from '@nestjs/swagger';
import {AuthGuard} from '../resources/auth/auth.guard';
import {ObjBool, ObjDate, ObjNum, ObjStr} from '../database/schemas/universal';

export function InitializeController(name: string) {
    return applyDecorators(
        ErrorResponses(),
        ApiTags(name),
        ApiExtraModels(ErrorResponse, OperationSuccessResult, ObjStr, ObjNum, ObjBool, ObjDate),
        Controller(name),
        UseGuards(AuthGuard),
    );
}
