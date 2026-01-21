import {Body, Delete, Get, Param, Post, Put, Query, Req,} from '@nestjs/common';
import {ApiBody, ApiOkResponse, ApiQuery} from '@nestjs/swagger';
import {Observable} from 'rxjs';
import {Comment, CreateComment, RequestAiSummaryComment, UpdateComment,} from '../../database/schemas/comment.schema';
import {User} from '../../database/schemas/user.schema';
import {throwPipe} from '../../global/error-responses';
import {InitializeController} from '../../global/initialize-controller';
import {CommentFilteredList, CommentFilteredListClass, CommentsService,} from './comments.service';
import {MinRole} from "../auth/min-role";
import {Role} from "../../database/schemas/roles.schema";

@InitializeController('comments')
@MinRole(Role.Analyst)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {
    }

    /**
     * Retrieves a paginated list of comments for a specific report.
     */
    @ApiOkResponse({
        description: 'List of comments returned successfully.',
        type: CommentFilteredListClass,
    })
    @ApiQuery({name: 'reportId', type: String, required: true})
    @ApiQuery({name: 'skip', type: Number, required: false})
    @ApiQuery({name: 'limit', type: Number, required: false})
    @ApiQuery({name: 'filter', type: String, required: false})
    @ApiQuery({name: 'dateFrom', type: Date, required: false})
    @ApiQuery({name: 'dateTo', type: Date, required: false})
    @Get()
    findAll(
        @Query('reportId') reportId: string,
        @Query('skip') skip = 0,
        @Query('limit') limit = 10,
        @Query('filter') filter = '',
        @Query('dateFrom') dateFrom?: Date,
        @Query('dateTo') dateTo?: Date,
    ): Observable<CommentFilteredList> {
        return this.commentsService
            .findAll(reportId, skip, limit, filter, dateFrom, dateTo)
            .pipe(throwPipe('Failed to get list of comments'));
    }

    /**
     * Creates a new comment for a specific report.
     */
    @ApiOkResponse({
        description: 'Comment created successfully.',
        type: Comment,
    })
    @ApiBody({type: CreateComment})
    @Post()
    create(
        @Body() createComment: CreateComment,
        @Req() req: { user: User },
    ): Observable<Comment> {
        return this.commentsService
            .create(createComment, req.user.username)
            .pipe(throwPipe('Failed to create comment'));
    }

    /**
     * Requests AI summary comment for a specific report.
     */
    @ApiOkResponse({
        description: 'AI writed comment successfully.',
        type: Comment,
    })
    @ApiBody({type: RequestAiSummaryComment})
    @Post('/request-ai')
    requestAiSummary(
        @Body() reqAi: RequestAiSummaryComment,
        @Req() req: { user: User },
    ): Observable<Comment | undefined> {
        return this.commentsService
            .generateSummary(reqAi, req.user.username)
            .pipe(throwPipe('Failed to create comment'));
    }

    /**
     * Updates an existing comment.
     */
    @ApiOkResponse({
        description: 'Comment updated successfully.',
        type: Comment,
    })
    @ApiBody({type: UpdateComment})
    @Put(':commentId')
    update(
        @Param('commentId') commentId: string,
        @Body() updateComment: UpdateComment,
        @Req() req: { user: User },
    ): Observable<Comment> {
        return this.commentsService
            .update(commentId, updateComment, req.user)
            .pipe(throwPipe('Failed to update comment'));
    }

    /**
     * Deletes a comment.
     */
    @ApiOkResponse({
        description: 'Comment deleted successfully.',
        type: Comment,
    })
    @Delete(':commentId')
    remove(
        @Param('commentId') commentId: string,
        @Req() req: { user: User },
    ): Observable<Comment> {
        return this.commentsService
            .remove(commentId, req.user)
            .pipe(throwPipe('Failed to delete comment'));
    }
}
