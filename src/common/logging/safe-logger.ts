import { Logger } from '@nestjs/common';

type SafeErrorLog = {
  service: 'inventory-service';
  requestId?: string;
  route?: string;
  method?: string;
  statusCode: number;
  errorCode: string;
  validationFields?: Array<{
    field: string;
    constraints: string[];
  }>;
  durationMs?: number;
  userId?: string;
  occurredAt: string;
};

const logger = new Logger('inventory-service');

export function logSafeError(payload: SafeErrorLog) {
  logger.error(JSON.stringify(payload));
}
