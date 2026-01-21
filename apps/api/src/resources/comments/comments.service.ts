import {ForbiddenException, Injectable, NotFoundException,} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {from, map, Observable, of, switchMap, tap, throwError} from 'rxjs';
import {AsFilteredListOf} from '../../database/filtered-list';
import {
    Comment,
    COMMENT_LIST_PROJECTION,
    CommentDocument,
    CreateComment, RequestAiSummaryComment,
    UpdateComment,
} from '../../database/schemas/comment.schema';
import {Report, ReportDocument} from '../../database/schemas/report.schema';
import {Role} from '../../database/schemas/roles.schema';
import {User, UserDocument, UserView,} from '../../database/schemas/user.schema';
import {nanoid} from 'nanoid';
import {GridFSBucketReadStream} from "mongodb";
import {ReportFilteredList} from "../reports/reports.service";
import {AiService} from "../ai/ai.service";
import {UsersService} from "../users/users.service";
import {Severity} from "../../database/schemas/severity.schema";

export const CommentFilteredListClass = AsFilteredListOf(Comment);
export type CommentFilteredList = InstanceType<typeof CommentFilteredListClass>;

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name)
        private readonly commentModel: Model<CommentDocument>,
        @InjectModel(Report.name)
        private readonly reportModel: Model<ReportDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly aiService: AiService,
        private readonly usersService: UsersService
    ) {
    }

    findAll(
        reportId: string,
        skip: number,
        limit: number,
        filter: string,
        dateFrom?: Date,
        dateTo?: Date,
    ): Observable<CommentFilteredList> {
        return from(this.reportModel.findOne({_id: reportId}).exec()).pipe(
            switchMap((report) => {
                if (!report) {
                    throw new NotFoundException('Report not found');
                }

                const textFilter = filter
                    ? {content: {$regex: `(.*)${filter}(.*)`, $options: 'i'}}
                    : {};
                const dateFilter =
                    dateFrom && dateTo ? {date: {$gte: dateFrom, $lte: dateTo}} : {};

                const query = {
                    _id: {$in: report.comments},
                    ...textFilter,
                    ...dateFilter,
                };

                return from(
                    this.commentModel
                        .find<Comment>(query, COMMENT_LIST_PROJECTION, {skip, limit})
                        .populate('author')
                        .exec(),
                ).pipe(
                    switchMap((comments) =>
                        from(this.commentModel.countDocuments(query).exec()).pipe(
                            map((count) => ({comments, count})),
                        ),
                    ),
                );
            }),
            map(({comments, count}) => {
                return {
                    items: comments,
                    totalItemsCount: count,
                } as CommentFilteredList;
            }),
        );
    }

    create(createComment: CreateComment, username: string): Observable<Comment> {
        return from(this.userModel.findOne({username}).exec()).pipe(
            switchMap((user) => {
                if (!user) {
                    throw new NotFoundException('Author not found');
                }

                const newComment = new this.commentModel({
                    ...createComment,
                    commentId: nanoid(),
                    author: user._id,
                    date: new Date(),
                });

                return from(newComment.save()).pipe(
                    switchMap((savedComment) =>
                        from(
                            this.reportModel
                                .updateOne(
                                    {_id: createComment.reportId},
                                    {$push: {comments: savedComment._id}},
                                )
                                .exec(),
                        ).pipe(map(() => savedComment)),
                    )
                );
            }),
        );
    }

    generateSummary(req: RequestAiSummaryComment, requester: string): Observable<Comment | undefined> {
        if (!this.usersService._aiAccountId) {
            console.error(new Error('Couldn\'t find default AI account to post comment. Please, restart NG Reports server.'));
            return of(undefined);
        }
        return this.aiService.processReport(req.reportId)
            .pipe(
                switchMap((result) => {
                    let severity = '';
                    switch (+(result.severity ?? 99)) {
                        case Severity.Information:
                            severity = 'Info';
                            break;
                        case Severity.Warning:
                            severity = 'Warning';
                            break;
                        case Severity.Error:
                            severity = 'Error';
                            break;
                        case Severity.CriticalError:
                            severity = 'Critical';
                            break;
                        default:
                            severity = 'Unknown';
                    }

                    const newComment = new this.commentModel({
                        reportId: req.reportId,
                        content: `@${requester}, report severity: ${severity};    ${result.summary}`,
                        commentId: nanoid(),
                        author: this.usersService._aiAccountId,
                        date: new Date(),
                    });

                    return from(newComment.save()).pipe(
                        switchMap((savedComment) =>
                            from(
                                this.reportModel
                                    .updateOne(
                                        {_id: req.reportId},
                                        {$push: {comments: savedComment._id}},
                                    )
                                    .exec(),
                            ).pipe(map(() => savedComment)),
                        )
                    );
                })
            );
    }

    update(
        commentId: string,
        updateComment: UpdateComment,
        user: User,
    ): Observable<Comment> {
        return from(
            this.commentModel
                .findById<Comment>(commentId)
                .populate<{ author: UserView }>('author')
                .exec(),
        ).pipe(
            switchMap((comment) => {
                if (!comment) {
                    throw new NotFoundException('Comment not found');
                }

                const canModify =
                    comment.author.username === user.username ||
                    user.role >= Role.ProjectManager;
                if (!canModify) {
                    throw new ForbiddenException(
                        'You do not have permission to edit this comment.',
                    );
                }

                return from(
                    this.commentModel
                        .findByIdAndUpdate(commentId, {$set: updateComment}, {new: true})
                        .exec(),
                );
            }),
        ) as Observable<Comment>;
    }

    remove(commentId: string, user: User): Observable<Comment> {
        return from(
            this.commentModel
                .findById<Comment>(commentId)
                .populate<{ author: UserView }>('author')
                .exec(),
        ).pipe(
            switchMap((comment) => {
                if (!comment) {
                    throw new NotFoundException('Comment not found');
                }

                const canDelete =
                    comment.author.username === user.username ||
                    user.role >= Role.ProjectManager;
                if (!canDelete) {
                    throw new ForbiddenException(
                        'You do not have permission to delete this comment.',
                    );
                }

                return from(this.commentModel.findByIdAndDelete(commentId).exec()).pipe(
                    switchMap((deletedComment) => {
                        if (!deletedComment) return of(null);
                        // Find the report by checking its comments array for the deleted comment's _id
                        return from(
                            this.reportModel
                                .updateOne(
                                    {comments: deletedComment._id}, // Corrected filter
                                    {$pull: {comments: deletedComment._id}},
                                )
                                .exec(),
                        ).pipe(map(() => deletedComment));
                    }),
                );
            }),
        ) as Observable<Comment>;
    }
}
