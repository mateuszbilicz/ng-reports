import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../../swagger/model/comment';
import { CreateComment } from '../../swagger/model/createComment';
import { UpdateComment } from '../../swagger/model/updateComment';
import { CommentsService as ApiCommentsService } from '../../swagger/api/comments.service';

@Injectable({
    providedIn: 'root'
})
export class CommentsService {
    protected readonly apiCommentsService = inject(ApiCommentsService);

    getComments(reportId: string, dateFrom?: Date, dateTo?: Date, filter?: string, limit?: number, skip?: number): Observable<any> {
        return this.apiCommentsService.commentsControllerFindAll(reportId, dateFrom, dateTo, filter, limit, skip);
    }

    createComment(comment: CreateComment): Observable<Comment> {
        return this.apiCommentsService.commentsControllerCreate(comment);
    }

    updateComment(commentId: string, updates: UpdateComment): Observable<Comment> {
        return this.apiCommentsService.commentsControllerUpdate(updates, commentId);
    }

    deleteComment(commentId: string): Observable<Comment> {
        return this.apiCommentsService.commentsControllerRemove(commentId);
    }
}
