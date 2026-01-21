import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, Types} from 'mongoose';
import {ApiProperty, PartialType} from '@nestjs/swagger';
import {User, UserView} from './user.schema';

// --- DTO Classes ---

/**
 * Class used for creating a new comment.
 */
export class CreateComment {
    @ApiProperty({
        description: 'The ID of the report to which this comment belongs.',
    })
    reportId: string;

    @ApiProperty({description: 'The content of the comment.'})
    content: string;
}

/**
 * Class used for requesting AI summary comment.
 */
export class RequestAiSummaryComment {
    @ApiProperty({
        description: 'The ID of the report to which this comment belongs.',
    })
    reportId: string;
}

/**
 * Class used for updating an existing comment.
 */
export class UpdateComment extends PartialType(CreateComment) {
    @ApiProperty({description: 'The new content of the comment.'})
    content: string;
}

// --- Mongoose Schema Class ---

@Schema()
export class Comment {
    @ApiProperty()
    @Prop({unique: true})
    commentId: string;

    @ApiProperty({type: () => UserView})
    @Prop({type: Types.ObjectId, ref: 'User'})
    author: UserView;

    @ApiProperty()
    @Prop()
    content: string;

    @ApiProperty()
    @Prop()
    date: Date;
}

export type CommentDocument = HydratedDocument<Comment>;
export const CommentSchema = SchemaFactory.createForClass(Comment);
export const CommentFeature = {
    name: Comment.name,
    schema: CommentSchema,
};
// --- Projections ---

export const COMMENT_LIST_PROJECTION = {__v: 0};
export const COMMENT_DETAILS_PROJECTION = {__v: 0};
