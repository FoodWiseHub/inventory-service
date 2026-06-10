import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { InternalServiceGuard } from '../../../common/guards/internal-service.guard.js';
import { DashboardService } from './dashboard.service.js';

@Controller('internal/inventory/dashboard')
@UseGuards(InternalServiceGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(
    @CurrentUserId()
    userId: string,
  ) {
    return this.dashboardService.getSummary(userId);
  }
}
