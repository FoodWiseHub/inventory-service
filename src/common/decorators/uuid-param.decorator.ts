import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { AppException } from '../errors/app.exception.js';
import { ErrorCode } from '../errors/error-codes.js';
import type { RequestWithContext } from '../http/request-context.js';
import { uuidPattern } from '../http/request-context.js';

export const UuidParam = createParamDecorator(
  (paramName: string, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<RequestWithContext>();

    const value = request.params[paramName];

    if (typeof value !== 'string' || !uuidPattern.test(value)) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        `${paramName} deve ser um UUID valido`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  },
);
