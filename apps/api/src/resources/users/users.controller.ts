import { InitializeController } from '../../global/initialize-controller';
import { Body, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { UserFilteredList, UserFilteredListClass, UsersService, } from './users.service';
import { ApiBody, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { UserCreate, UserUpdateInformation, UserView } from '../../database/schemas/user.schema';
import { Role } from '../../database/schemas/roles.schema';
import { map, Observable } from 'rxjs';
import { operationSuccessPipe, throwPipe } from '../../global/error-responses';
import { MinRole } from "../auth/min-role";

@InitializeController('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {
    }

    @Get('/self')
    getSelf(@Req() req) {
        const username = req.user.username;
        return this.userService.get(username);
    }

    @Get('/:username')
    @ApiOkResponse({
        type: () => UserView,
    })
    findOne(@Param('username') username: string) {
        return this.userService.get(username).pipe(
            throwPipe('Failed to get user'),
        );
    }

    @Post()
    @ApiBody({
        type: () => UserCreate,
    })
    @MinRole(Role.Admin)
    createUser(@Body() userCreate: UserCreate) {
        return this.userService.create(userCreate).pipe(
            throwPipe('Failed to update user information'),
            map((res) => res && res.isActive === true),
            operationSuccessPipe('USER_CREATE')
        );
    }


    @Put('/update/:username')
    @ApiBody({
        type: () => UserUpdateInformation,
    })
    @MinRole(Role.Admin)
    updateUser(
        @Param('username') username: string,
        @Body() update: UserUpdateInformation,
    ) {
        return this.userService.updateInformation(username, update).pipe(
            throwPipe('Failed to update user information'),
            map((res) => res && res.modifiedCount === 1),
            operationSuccessPipe('USER_UPDATE_INFO')
        );
    }

    @Put('/updatePassword')
    @ApiBody({
        type: () => String,
    })
    updatePassword(@Req() req, @Body() newPassword: string) {
        const username = req.user.username;
        return this.userService.updatePassword(username, newPassword).pipe(
            throwPipe('Failed to update user password'),
            map((res) => res && res.modifiedCount === 1),
            operationSuccessPipe('USER_UPDATE_PASSWORD')
        );
    }

    @Delete('/:username')
    @MinRole(Role.Admin)
    deleteUser(@Param('username') username: string) {
        return this.userService.deleteUser(username).pipe(
            throwPipe('Failed to delete user'),
            map((res) => res && res.deletedCount === 1),
        );
    }

    @Put('/setActive/:username/:isActive')
    @MinRole(Role.Admin)
    setActive(
        @Param('username') username: string,
        @Param('isActive') isActive: boolean,
    ) {
        return this.userService.setActive(username, isActive).pipe(
            throwPipe('Failed to update user active state'),
            map((res) => res && res.modifiedCount === 1),
            operationSuccessPipe('USER_ACTIVATION')
        );
    }

    @Get('/list')
    @ApiQuery({
        name: 'filter',
        required: false,
        type: () => String,
    })
    @ApiQuery({
        name: 'skip',
        required: false,
        type: () => Number,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: () => Number,
    })
    @ApiOkResponse({
        type: () => UserFilteredListClass,
    })
    getList(
        @Query('filter') filter?: string,
        @Query('skip') skip?: number,
        @Query('limit') limit?: number,
    ): Observable<UserFilteredList> {
        return this.userService
            .listUsers(filter ?? '', skip ?? 0, limit ?? 1000)
            .pipe(throwPipe('Cannot get list of users'));
    }
}
