// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { CommentsService } from './CommentsService';
import { CommentsService as ApiCommentsService } from '../../swagger/api/comments.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CommentsService', () => {
    let service: CommentsService;
    let apiServiceMock: any;

    beforeEach(() => {
        apiServiceMock = {
            commentsControllerFindAll: vi.fn(),
            commentsControllerCreate: vi.fn(),
            commentsControllerUpdate: vi.fn(),
            commentsControllerRemove: vi.fn(),
            commentsControllerRequestAiSummary: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                CommentsService,
                { provide: ApiCommentsService, useValue: apiServiceMock }
            ]
        });

        service = TestBed.inject(CommentsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call commentsControllerFindAll on getComments', () => {
        apiServiceMock.commentsControllerFindAll.mockReturnValue(of({}));
        service.getComments('rep1').subscribe();
        expect(apiServiceMock.commentsControllerFindAll).toHaveBeenCalledWith('rep1', undefined, undefined, undefined, undefined, undefined);
    });
});
