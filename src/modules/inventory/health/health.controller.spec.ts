import { describe, expect, it, jest } from '@jest/globals';
import {
  AppException,
  InventoryDatabaseUnavailableException,
} from '../../../common/errors/app.exception.js';
import { ErrorCode } from '../../../common/errors/error-codes.js';
import type { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  function createController() {
    const prisma = {
      $queryRaw: jest.fn<PrismaService['$queryRaw']>(),
    };

    return {
      controller: new HealthController(prisma as unknown as PrismaService),
      prisma,
    };
  }

  it('returns liveness without checking the database', () => {
    const { controller, prisma } = createController();

    const result = controller.liveness();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('inventory-service');
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('returns readiness when SELECT 1 succeeds', async () => {
    const { controller, prisma } = createController();

    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    await expect(controller.readiness()).resolves.toMatchObject({
      status: 'ready',
      service: 'inventory-service',
      checks: {
        database: 'up',
      },
    });
  });

  it('throws database unavailable when SELECT 1 fails', async () => {
    const { controller, prisma } = createController();

    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

    await expect(controller.readiness()).rejects.toBeInstanceOf(
      InventoryDatabaseUnavailableException,
    );

    await expect(controller.readiness()).rejects.toMatchObject<
      Partial<AppException>
    >({
      code: ErrorCode.INVENTORY_DATABASE_UNAVAILABLE,
    });
  });
});
