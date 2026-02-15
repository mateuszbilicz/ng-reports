import { vi } from 'vitest';
import {getTestBed, TestBed} from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import {Comment, CommentsService as ApiCommentsService, CreateComment, UpdateComment} from '../../swagger';
import {CommentsService} from './CommentsService';
import {of} from 'rxjs';

describe('CommentsService', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let service: CommentsService;
    let apiCommentsServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(() => {
        const spy = createSpyObj(['commentsControllerFindAll', 'commentsControllerCreate', 'commentsControllerUpdate', 'commentsControllerRemove', 'commentsControllerRequestAiSummary']);
        TestBed.configureTestingModule({
            providers: [
                CommentsService,
                { provide: ApiCommentsService, useValue: spy }
            ]
        });
        service = TestBed.inject(CommentsService);
        apiCommentsServiceSpy = TestBed.inject(ApiCommentsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get comments', () => new Promise<void>((done) => {
        const expectedComments = [{ id: '1', content: 'test', type: 'text' }];
        apiCommentsServiceSpy.commentsControllerFindAll.mockReturnValue(of(expectedComments));

        service.getComments('report1').subscribe(comments => {
            expect(comments).toEqual(expectedComments);
            expect(apiCommentsServiceSpy.commentsControllerFindAll).toHaveBeenCalledWith('report1', undefined, undefined, undefined, undefined, undefined);
            done();
        });
    }));

    it('should create comment', () => new Promise<void>((done) => {
        const newComment: CreateComment = {
            content: 'new comment',
            reportId: 'report1',
        };
        const createdComment: Comment = {
          // @ts-ignore
          author: {}, commentId: '',
          date: new Date(),
          ...newComment
        };
        apiCommentsServiceSpy.commentsControllerCreate.mockReturnValue(of(createdComment));

        service.createComment(newComment).subscribe(comment => {
            expect(comment).toEqual(createdComment);
            expect(apiCommentsServiceSpy.commentsControllerCreate).toHaveBeenCalledWith(newComment);
            done();
        });
    }));

    it('should update comment', () => new Promise<void>((done) => {
        const update: UpdateComment = { content: 'updated' };
        // @ts-ignore
        const updatedComment: Comment = {author: {}, commentId: "1", content: "updated", date: new Date()};
        apiCommentsServiceSpy.commentsControllerUpdate.mockReturnValue(of(updatedComment));

        service.updateComment('1', update).subscribe(comment => {
            expect(comment).toEqual(updatedComment);
            expect(apiCommentsServiceSpy.commentsControllerUpdate).toHaveBeenCalledWith(update, '1');
            done();
        });
    }));

    it('should delete comment', () => new Promise<void>((done) => {
      // @ts-ignore
        const deletedComment: Comment = {author: {}, commentId: '1', content: 'delete me', date: new Date()};
        apiCommentsServiceSpy.commentsControllerRemove.mockReturnValue(of(deletedComment));

        service.deleteComment('1').subscribe(comment => {
            expect(comment).toEqual(deletedComment);
            expect(apiCommentsServiceSpy.commentsControllerRemove).toHaveBeenCalledWith('1');
            done();
        });
    }));

    it('should request AI summary', () => new Promise<void>((done) => {
      // @ts-ignore
        const summaryComment: Comment = {author: {}, commentId: '1', content: 'Summary...', date: new Date()};
        apiCommentsServiceSpy.commentsControllerRequestAiSummary.mockReturnValue(of(summaryComment));

        service.requestAiSummary('r1').subscribe(comment => {
            expect(comment).toEqual(summaryComment);
            expect(apiCommentsServiceSpy.commentsControllerRequestAiSummary).toHaveBeenCalledWith({ reportId: 'r1' });
            done();
        });
    }));
});
