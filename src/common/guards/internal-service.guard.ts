import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { AppException } from '../errors/app.exception.js';
import { ErrorCode } from '../errors/error-codes.js';
import type { RequestWithContext } from '../http/request-context.js';
import { uuidPattern } from '../http/request-context.js';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithContext>();

    const currentToken = process.env.ALLOWED_GATEWAY_TOKEN_CURRENT;
    const previousToken = process.env.ALLOWED_GATEWAY_TOKEN_PREVIOUS;
    const receivedToken = request.headers['x-internal-service-token'];
    const userId = request.headers['x-user-id'];

    if (
      !currentToken ||
      typeof receivedToken !== 'string' ||
      !this.matchesAnyAllowedToken(receivedToken, currentToken, previousToken)
    ) {
      throw new AppException(
        ErrorCode.INTERNAL_AUTH_FAILED,
        'Chamada interna nao autorizada',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (typeof userId !== 'string' || !uuidPattern.test(userId)) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'x-user-id deve ser um UUID valido',
        HttpStatus.BAD_REQUEST,
      );
    }

    request.userId = userId;

    return true;
  }

  private matchesAnyAllowedToken(
    received: string,
    current: string,
    previous?: string,
  ) {
    return (
      this.safeEquals(received, current) ||
      (previous !== undefined &&
        previous.length > 0 &&
        this.safeEquals(received, previous))
    );
  }

  private safeEquals(received: string, expected: string): boolean {
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);

    return (
      receivedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(receivedBuffer, expectedBuffer)
    );
  }
}
