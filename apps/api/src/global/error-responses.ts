import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { catchError, map, OperatorFunction, tap, throwError } from 'rxjs';

export class ErrorResponse {
  @ApiProperty({ example: 'Example message' })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export const throwPipe = <T>(message: string): OperatorFunction<T, T> => {
  return catchError(() => {
    return throwError(() => new ErrorResponse(message));
  });
};

export const throwIfNoValuePipe = <T>(
  message: string,
): OperatorFunction<T, T> => {
  return map((v: T): T => {
    if (v && v !== undefined && v !== null) return v as T;
    throw new Error(message);
  });
};

export function ErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad request',
      schema: {
        allOf: [{ $ref: getSchemaPath(ErrorResponse) }],
      },
    }),
    ApiNotFoundResponse({
      description: 'Not found response',
      schema: {
        allOf: [{ $ref: getSchemaPath(ErrorResponse) }],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Server error',
      schema: {
        allOf: [{ $ref: getSchemaPath(ErrorResponse) }],
      },
    }),
  );
}
