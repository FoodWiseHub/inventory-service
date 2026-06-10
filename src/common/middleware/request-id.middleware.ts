import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Response } from 'express';
import type { RequestWithContext } from '../http/request-context.js';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithContext, response: Response, next: NextFunction) {
    const headerValue = request.header('x-request-id')?.trim();

    request.requestId =
      headerValue && headerValue.length > 0 ? headerValue : randomUUID();

    request.requestStartedAt = Date.now();

    response.setHeader('x-request-id', request.requestId);

    next();
  }
}
