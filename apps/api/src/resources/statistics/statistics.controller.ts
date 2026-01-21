import { Get, Query } from '@nestjs/common';
import {ApiExtraModels, ApiOkResponse, ApiQuery} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Role } from '../../database/schemas/roles.schema';
import { Severity } from '../../database/schemas/severity.schema';
import { throwPipe } from '../../global/error-responses';
import { InitializeController } from '../../global/initialize-controller';
import { StatisticsService } from './statistics.service';
import {MinRole} from "../auth/min-role";
import {Statistics, StatisticsSample} from "../../database/schemas/statistics.schema";

@ApiExtraModels(
    Statistics,
    StatisticsSample
)
@InitializeController('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @ApiOkResponse({
    description: 'Statistics generated successfully.',
    type: Object, // The Statistics interface is not a class, so we use Object for Swagger
  })
  @ApiQuery({ name: 'sampling', enum: ['hour', 'day', 'week', 'month'], required: true })
  @ApiQuery({ name: 'dateFrom', type: Date, required: true })
  @ApiQuery({ name: 'dateTo', type: Date, required: true })
  @ApiQuery({ name: 'projectId', type: String, required: false })
  @ApiQuery({ name: 'environmentId', type: String, required: false })
  @ApiQuery({ name: 'textFilter', type: String, required: false })
  @ApiQuery({ name: 'severity', enum: Severity, required: false })
  @ApiQuery({ name: 'fixed', type: Boolean, required: false })
  @MinRole(Role.Analyst) // As per AGENTS.md, analysts can view statistics
  @Get()
  getStatistics(
    @Query('sampling') sampling: 'hour' | 'day' | 'week' | 'month',
    @Query('dateFrom') dateFrom: Date,
    @Query('dateTo') dateTo: Date,
    @Query('projectId') projectId?: string,
    @Query('environmentId') environmentId?: string,
    @Query('textFilter') textFilter?: string,
    @Query('severity') severity?: Severity,
    @Query('fixed') fixed?: boolean,
  ): Observable<Statistics> {
    return this.statisticsService
      .getStatistics(
        sampling,
        dateFrom,
        dateTo,
        projectId,
        environmentId,
        textFilter,
        severity,
        fixed,
      )
      .pipe(
          throwPipe('Failed to generate statistics')
      );
  }
}
