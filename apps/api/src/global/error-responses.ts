import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import {catchError, map, OperatorFunction, throwError} from 'rxjs';
import {randomUUID} from "node:crypto";

export class ErrorResponse {
  @ApiProperty({ example: 'Example message' })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class OperationSuccessResult {
    @ApiProperty({ example: 'Success status' })
    success: boolean;

    @ApiProperty({ example: 'Operation name', required: false })
    name?: string;

    @ApiProperty({ example: 'Error ID', required: false })
    errorId?: string;
}

export const operationSuccessPipe = <T>(name: string): OperatorFunction<T, OperationSuccessResult> => {
    return map((v: T) => {
        if (!!v) {
            return {
                success: true,
                result: v
            };
        } else {
            const id = randomUUID(),
                errText = `Operation ${name} failed. ID:${id}`,
                err = new Error(errText);
            console.error(err);
            return {
                success: false,
                name,
                errorId: id
            }
        }
    })
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
