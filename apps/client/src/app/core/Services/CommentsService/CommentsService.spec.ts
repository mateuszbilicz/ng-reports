import { TestBed } from '@angular/core/testing';
import { CommentsService } from './CommentsService';
import { CommentsService as ApiCommentsService } from '../../swagger/api/comments.service';
import { of } from 'rxjs';
import { CreateComment } from '../../swagger/model/createComment';
import { UpdateComment } from '../../swagger/model/updateComment';
import { Comment } from '../../swagger/model/comment';

describe('CommentsService', () => {
    let service: CommentsService;
    let apiCommentsServiceSpy: jasmine.SpyObj<ApiCommentsService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ApiCommentsService', ['commentsControllerFindAll', 'commentsControllerCreate', 'commentsControllerUpdate', 'commentsControllerRemove', 'commentsControllerRequestAiSummary']);
        TestBed.configureTestingModule({
            providers: [
                CommentsService,
                { provide: ApiCommentsService, useValue: spy }
            ]
        });
        service = TestBed.inject(CommentsService);
        apiCommentsServiceSpy = TestBed.inject(ApiCommentsService) as jasmine.SpyObj<ApiCommentsService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get comments', (done) => {
        const expectedComments = [{ id: '1', content: 'test', type: 'text' }];
        apiCommentsServiceSpy.commentsControllerFindAll.and.returnValue(of(expectedComments));

        service.getComments('report1').subscribe(comments => {
            expect(comments).toEqual(expectedComments);
            expect(apiCommentsServiceSpy.commentsControllerFindAll).toHaveBeenCalledWith('report1', undefined, undefined, undefined, undefined, undefined);
            done();
        });
    });

    it('should create comment', (done) => {
        const newComment: CreateComment = {
            content: 'new comment',
            type: 'text',
            reportId: 'report1',
            authorId: 'user1'
        };
        const createdComment: Comment = {
            id: '1',
            ...newComment,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        apiCommentsServiceSpy.commentsControllerCreate.and.returnValue(of(createdComment));

        service.createComment(newComment).subscribe(comment => {
            expect(comment).toEqual(createdComment);
            expect(apiCommentsServiceSpy.commentsControllerCreate).toHaveBeenCalledWith(newComment);
            done();
        });
    });

    it('should update comment', (done) => {
        const update: UpdateComment = { content: 'updated' };
        const updatedComment: Comment = { id: '1', content: 'updated', type: 'text', reportId: 'r1', authorId: 'u1', createdAt: new Date(), updatedAt: new Date() };
        apiCommentsServiceSpy.commentsControllerUpdate.and.returnValue(of(updatedComment));

        service.updateComment('1', update).subscribe(comment => {
            expect(comment).toEqual(updatedComment);
            expect(apiCommentsServiceSpy.commentsControllerUpdate).toHaveBeenCalledWith(update, '1');
            done();
        });
    });

    it('should delete comment', (done) => {
        const deletedComment: Comment = { id: '1', content: 'deleted', type: 'text', reportId: 'r1', authorId: 'u1', createdAt: new Date(), updatedAt: new Date() };
        apiCommentsServiceSpy.commentsControllerRemove.and.returnValue(of(deletedComment));

        service.deleteComment('1').subscribe(comment => {
            expect(comment).toEqual(deletedComment);
            expect(apiCommentsServiceSpy.commentsControllerRemove).toHaveBeenCalledWith('1');
            done();
        });
    });

    it('should request AI summary', (done) => {
        const summaryComment: Comment = { id: '2', content: 'summary', type: 'summary', reportId: 'r1', authorId: 'ai', createdAt: new Date(), updatedAt: new Date() };
        apiCommentsServiceSpy.commentsControllerRequestAiSummary.and.returnValue(of(summaryComment));

        service.requestAiSummary('r1').subscribe(comment => {
            expect(comment).toEqual(summaryComment);
            expect(apiCommentsServiceSpy.commentsControllerRequestAiSummary).toHaveBeenCalledWith({ reportId: 'r1' });
            done();
        });
    });
});
