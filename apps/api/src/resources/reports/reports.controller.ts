import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Report } from '../../database/schemas/report.schema';
import { Role } from '../../database/schemas/roles.schema';
import { Severity } from '../../database/schemas/severity.schema';
import { AuthGuard } from '../auth/auth.guard';
import {
  ErrorResponse,
  ErrorResponses,
  throwPipe,
} from '../../global/error-responses';
import {
  ReportFilteredList,
  ReportFilteredListClass,
  ReportsService,
} from './reports.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GridFSBucketReadStream } from 'mongodb';
import {MinRole} from "../auth/min-role";

@ApiTags('reports')
@Controller('reports')
@ErrorResponses()
@ApiExtraModels(ErrorResponse)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // --- Public Endpoint ---

  @ApiOkResponse({ description: 'Report created successfully.', type: Report })
  @ApiQuery({ name: 'environmentId', type: String, required: true })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('attachments[].file'))
  @ApiBody({ type: Report })
  @Post()
  create(
    @Query('environmentId') environmentId: string,
    @Body() report: Report,
  ): Observable<Report> {
    return this.reportsService
      .create(report, environmentId)
      .pipe(throwPipe('Failed to create report'));
  }

  // --- Protected Endpoints ---

  @ApiOkResponse({
    description: 'Attachment image.',
    type: GridFSBucketReadStream,
  })
  @UseGuards(AuthGuard)
  @Get('attachments/:attachmentId')
  readStream(
    @Param('attachmentId') attachmentId: string,
  ): Observable<GridFSBucketReadStream> {
    return this.reportsService.readStream(attachmentId);
  }

  @ApiOkResponse({
    description: 'List of reports',
    type: ReportFilteredListClass,
  })
  @ApiQuery({ name: 'environmentId', type: String, required: true })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'filter', type: String, required: false })
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('environmentId') environmentId: string,
    @Query('skip') skip = 0,
    @Query('limit') limit = 10,
    @Query('filter') filter = '',
  ): Observable<ReportFilteredList> {
    return this.reportsService
      .findAll(environmentId, skip, limit, filter)
      .pipe(throwPipe('Failed to get list of reports'));
  }

  @ApiOkResponse({ description: 'Report details', type: Report })
  @UseGuards(AuthGuard)
  @Get(':reportId')
  findOne(@Param('reportId') reportId: string): Observable<Report> {
    return this.reportsService
      .findOne(reportId)
      .pipe(throwPipe('Failed to find report'));
  }

  @ApiOkResponse({ description: 'Report updated successfully', type: Report })
  @ApiBody({ type: Report })
  @MinRole(Role.ProjectManager)
  @UseGuards(AuthGuard)
  @Put(':reportId')
  update(
    @Param('reportId') reportId: string,
    @Body() updateReport: Partial<Report>,
  ): Observable<Report> {
    return this.reportsService
      .update(reportId, updateReport)
      .pipe(throwPipe('Failed to update report'));
  }

  @ApiOkResponse({ description: 'Report severity changed', type: Report })
  @ApiBody({ type: String, enum: Severity })
  @MinRole(Role.Developer)
  @UseGuards(AuthGuard)
  @Put('severity/:reportId')
  changeSeverity(
    @Param('reportId') reportId: string,
    @Body('severity') severity: Severity,
  ): Observable<Report> {
    return this.reportsService
      .changeSeverity(reportId, severity)
      .pipe(throwPipe('Failed to change severity'));
  }

  @ApiOkResponse({ description: 'Report fixed flag changed', type: Report })
  @ApiBody({ type: Boolean })
  @MinRole(Role.Developer)
  @UseGuards(AuthGuard)
  @Put('fixed/:reportId')
  changeFixed(
    @Param('reportId') reportId: string,
    @Body('fixed') fixed: boolean,
  ): Observable<Report> {
    return this.reportsService
      .changeFixed(reportId, fixed)
      .pipe(throwPipe('Failed to change fixed flag'));
  }

  @ApiOkResponse({ description: 'Report deleted successfully', type: Report })
  @MinRole(Role.ProjectManager)
  @UseGuards(AuthGuard)
  @Delete(':reportId')
  remove(@Param('reportId') reportId: string): Observable<Report> {
    return this.reportsService
      .remove(reportId)
      .pipe(throwPipe('Failed to delete report'));
  }
}
