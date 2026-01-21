import {Body, Delete, Get, Param, Post, Put, Query,} from '@nestjs/common';
import {ApiBody, ApiOkResponse, ApiQuery} from '@nestjs/swagger';
import {Observable} from 'rxjs';
import {CreateEnvironment, Environment, UpdateEnvironment,} from '../../database/schemas/environment.schema';
import {Role} from '../../database/schemas/roles.schema';
import {throwPipe} from '../../global/error-responses';
import {InitializeController} from '../../global/initialize-controller';
import {EnvironmentFilteredList, EnvironmentFilteredListClass, EnvironmentsService,} from './environments.service';
import {MinRole} from "../auth/min-role";

@InitializeController('environments')
export class EnvironmentsController {
    constructor(private readonly environmentsService: EnvironmentsService) {
    }

    /**
     * Retrieves a paginated list of environments for a specific project.
     * Accessible to any authenticated user.
     */
    @ApiOkResponse({
        description: 'List of environments returned successfully.',
        type: EnvironmentFilteredListClass,
    })
    @ApiQuery({name: 'projectId', type: String, required: true})
    @ApiQuery({name: 'skip', type: Number, required: false})
    @ApiQuery({name: 'limit', type: Number, required: false})
    @ApiQuery({name: 'filter', type: String, required: false})
    @Get()
    findAll(
        @Query('projectId') projectId: string,
        @Query('skip') skip = 0,
        @Query('limit') limit = 10,
        @Query('filter') filter = '',
    ): Observable<EnvironmentFilteredList> {
        return this.environmentsService
            .findAll(projectId, skip, limit, filter)
            .pipe(throwPipe('Failed to get list of environments'));
    }

    /**
     * Retrieves a single environment by its unique environmentId.
     * Accessible to any authenticated user.
     */
    @ApiOkResponse({
        description: 'Environment details returned successfully.',
        type: Environment,
    })
    @Get(':environmentId')
    findOne(
        @Param('environmentId') environmentId: string,
    ): Observable<Environment> {
        return this.environmentsService
            .findOne(environmentId)
            .pipe(throwPipe('Failed to find environment'));
    }

    /**
     * Creates a new environment.
     * Requires ProjectManager role or higher.
     */
    @ApiOkResponse({
        description: 'Environment created successfully.',
        type: Environment,
    })
    @ApiBody({type: CreateEnvironment})
    @MinRole(Role.ProjectManager)
    @Post()
    create(@Body() createEnvironment: CreateEnvironment): Observable<Environment> {
        return this.environmentsService
            .create(createEnvironment)
            .pipe(throwPipe('Failed to create environment'));
    }

    /**
     * Updates an existing environment.
     * Requires ProjectManager role or higher.
     */
    @ApiOkResponse({
        description: 'Environment updated successfully.',
        type: Environment,
    })
    @ApiBody({type: UpdateEnvironment})
    @MinRole(Role.ProjectManager)
    @Put(':environmentId')
    update(
        @Param('environmentId') environmentId: string,
        @Body() updateEnvironment: UpdateEnvironment,
    ): Observable<Environment> {
        return this.environmentsService
            .update(environmentId, updateEnvironment)
            .pipe(throwPipe('Failed to update environment'));
    }

    /**
     * Deletes an environment.
     * Requires ProjectManager role or higher.
     */
    @ApiOkResponse({
        description: 'Environment deleted successfully.',
        type: Environment,
    })
    @MinRole(Role.ProjectManager)
    @Delete(':environmentId')
    remove(@Param('environmentId') environmentId: string): Observable<Environment> {
        return this.environmentsService
            .remove(environmentId)
            .pipe(throwPipe('Failed to delete environment'));
    }
}
