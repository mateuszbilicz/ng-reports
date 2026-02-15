// @vitest-environment jsdom
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReportDetailsComponent } from './report-details.component';
import { ReportsService } from '../../../core/Services/ReportsService/ReportsService';
import { CommentsService } from '../../../core/Services/CommentsService/CommentsService';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('ReportDetailsComponent', () => {
    let component: ReportDetailsComponent;
    let fixture: ComponentFixture<ReportDetailsComponent>;
    let reportsServiceMock: any;
    let commentsServiceMock: any;
    let routerMock: any;
    let messageServiceMock: any;
    let confirmationServiceMock: any;
    let activatedRouteMock: any;

    beforeEach(async () => {
        reportsServiceMock = {
            getReport: vi.fn().mockReturnValue(of({
                id: 'r1',
                title: 'Report 1',
                environment: '{}',
                user: '{}',
                logs: [JSON.stringify([])]
            })),
            updateReport: vi.fn(),
        };

        commentsServiceMock = {
            getComments: vi.fn().mockReturnValue(of({ items: [] })),
            createComment: vi.fn(),
            updateComment: vi.fn(),
            deleteComment: vi.fn(),
            requestAiSummary: vi.fn().mockReturnValue(of({})),
        };

        routerMock = {
            navigate: vi.fn(),
        };

        activatedRouteMock = {
            paramMap: of(convertToParamMap({ id: 'r1' })),
        };

        await TestBed.configureTestingModule({
            imports: [
                ReportDetailsComponent,
                NoopAnimationsModule,
                ReactiveFormsModule,
                FormsModule
            ],
            providers: [
                { provide: ReportsService, useValue: reportsServiceMock },
                { provide: CommentsService, useValue: commentsServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                MessageService,
                ConfirmationService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReportDetailsComponent);
        component = fixture.componentInstance;

        messageServiceMock = fixture.debugElement.injector.get(MessageService);
        confirmationServiceMock = fixture.debugElement.injector.get(ConfirmationService);

        vi.spyOn(messageServiceMock, 'add');
        vi.spyOn(confirmationServiceMock, 'confirm');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load report and comments on init', () => {
        expect(reportsServiceMock.getReport).toHaveBeenCalledWith('r1');
        expect(commentsServiceMock.getComments).toHaveBeenCalledWith('r1');
        expect(component.report().title).toBe('Report 1');
    });

    it('should post a comment', () => {
        commentsServiceMock.createComment.mockReturnValue(of({}));
        component.newCommentText = 'Test Comment';
        component.postComment();

        expect(commentsServiceMock.createComment).toHaveBeenCalled();
        expect(component.newCommentText).toBe('');
    });

    it('should request AI summary', () => {
        component.requestAiSummary();
        expect(commentsServiceMock.requestAiSummary).toHaveBeenCalledWith('r1');
    });
});
