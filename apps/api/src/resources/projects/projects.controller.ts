import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  CreateProject,
  Project,
  UpdateProject,
} from '../../database/schemas/project.schema';
import { Role } from '../../database/schemas/roles.schema';
import { throwPipe } from '../../global/error-responses';
import { InitializeController } from '../../global/initialize-controller';
import {
  ProjectFilteredList,
  ProjectFilteredListClass,
  ProjectsService,
} from './projects.service';
import {MinRole} from "../auth/min-role";

@InitializeController('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Retrieves a paginated list of projects.
   * Accessible to any authenticated user.
   */
  @ApiOkResponse({
    description: 'List of projects returned successfully.',
    type: ProjectFilteredListClass,
  })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'filter', type: String, required: false })
  @Get()
  findAll(
    @Query('skip') skip = 0,
    @Query('limit') limit = 10,
    @Query('filter') filter = '',
  ): Observable<ProjectFilteredList> {
    return this.projectsService
      .findAll(skip, limit, filter)
      .pipe(throwPipe('Failed to get list of projects'));
  }

  /**
   * Retrieves a single project by its unique projectId, including its environments.
   * Accessible to any authenticated user.
   */
  @ApiOkResponse({
    description: 'Project details returned successfully.',
    type: Project,
  })
  @Get(':projectId')
  findOne(@Param('projectId') projectId: string): Observable<Project> {
    return this.projectsService
      .findOne(projectId)
      .pipe(throwPipe('Failed to find project'));
  }

  /**
   * Creates a new project.
   * Requires ProjectManager role or higher.
   */
  @ApiOkResponse({
    description: 'Project created successfully.',
    type: Project,
  })
  @ApiBody({ type: CreateProject })
  @MinRole(Role.ProjectManager)
  @Post()
  create(@Body() createProject: CreateProject): Observable<Project> {
    return this.projectsService
      .create(createProject)
      .pipe(throwPipe('Failed to create project'));
  }

  /**
   * Updates an existing project.
   * Requires ProjectManager role or higher.
   */
  @ApiOkResponse({
    description: 'Project updated successfully.',
    type: Project,
  })
  @ApiBody({ type: UpdateProject })
  @MinRole(Role.ProjectManager)
  @Put(':projectId')
  update(
    @Param('projectId') projectId: string,
    @Body() updateProject: UpdateProject,
  ): Observable<Project> {
    return this.projectsService
      .update(projectId, updateProject)
      .pipe(throwPipe('Failed to update project'));
  }

  /**
   * Deletes a project.
   * Requires ProjectManager role or higher.
   */
  @ApiOkResponse({
    description: 'Project deleted successfully.',
    type: Project,
  })
  @MinRole(Role.ProjectManager)
  @Delete(':projectId')
  remove(@Param('projectId') projectId: string): Observable<Project> {
    return this.projectsService
      .remove(projectId)
      .pipe(throwPipe('Failed to delete project'));
  }
}
