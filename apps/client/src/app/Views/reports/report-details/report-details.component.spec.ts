import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportDetailsComponent } from './report-details.component';
import { ReportsService } from '../../../core/Services/ReportsService/ReportsService';
import { CommentsService } from '../../../core/Services/CommentsService/CommentsService';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Report } from '../../../core/swagger/model/report';
import { Comment } from '../../../core/swagger/model/comment';
import { vi } from 'vitest';

describe('ReportDetailsComponent', () => {
    let component: ReportDetailsComponent;
    let fixture: ComponentFixture<ReportDetailsComponent>;
    let reportsServiceSpy: any;
    let commentsServiceSpy: any;
    let routerSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;

    beforeEach(async () => {
        const repSpy = {
            getReport: vi.fn(),
            updateReport: vi.fn()
        };
        const comSpy = {
            getComments: vi.fn(),
            createComment: vi.fn(),
            deleteComment: vi.fn(),
            updateComment: vi.fn(),
            requestAiSummary: vi.fn()
        };
        const routerSpyObj = {
            navigate: vi.fn()
        };
        const messageSpy = {
            add: vi.fn()
        };
        const confirmSpy = {
            confirm: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ReportDetailsComponent, NoopAnimationsModule],
            providers: [
                { provide: ReportsService, useValue: repSpy },
                { provide: CommentsService, useValue: comSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'r1' }) } }
            ]
        })
            .overrideComponent(ReportDetailsComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy },
                        { provide: ConfirmationService, useValue: confirmSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(ReportDetailsComponent);
        component = fixture.componentInstance;
        reportsServiceSpy = TestBed.inject(ReportsService);
        commentsServiceSpy = TestBed.inject(CommentsService);
        routerSpy = TestBed.inject(Router);
        messageServiceSpy = messageSpy;
        confirmationServiceSpy = confirmSpy;

        const mockReport: Partial<Report> = {
            id: 'r1',
            title: 'Report 1',
            environment: '{"name": "env1"}',
            logs: ['[{"type": "log", "timestamp": 123}]'],
            user: '{"username": "user1"}',
            timestamp: 123
        };

        reportsServiceSpy.getReport.mockReturnValue(of(mockReport as Report));
        commentsServiceSpy.getComments.mockReturnValue(of([]));
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load data on init', () => {
        fixture.detectChanges();
        expect(reportsServiceSpy.getReport).toHaveBeenCalledWith('r1');
        expect(commentsServiceSpy.getComments).toHaveBeenCalledWith('r1');
        expect(component.report()).toBeTruthy();

        // Test computed values
        expect(component.environment().name).toBe('env1');
        expect(component.user().username).toBe('user1');
        expect(component.logs().length).toBe(1);
    });

    it('should edit report', () => {
        fixture.detectChanges();
        component.editReport();
        expect(component.reportDialog).toBe(true);
        expect(component.reportForm.value.title).toBe('Report 1');
    });

    it('should save report updates', () => {
        fixture.detectChanges();
        component.editReport();
        component.reportForm.patchValue({ title: 'Updated Report' });

        reportsServiceSpy.updateReport.mockReturnValue(of({} as Report));

        component.saveReport();

        expect(reportsServiceSpy.updateReport).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(component.reportDialog).toBe(false);
    });

    it('should post comment', () => {
        fixture.detectChanges();
        component.newCommentText = 'Test Comment';
        commentsServiceSpy.createComment.mockReturnValue(of({} as Comment));

        component.postComment();

        expect(commentsServiceSpy.createComment).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(component.newCommentText).toBe('');
        expect(commentsServiceSpy.getComments).toHaveBeenCalled(); // Reloads comments
    });

    it('should request AI summary', () => {
        fixture.detectChanges();
        commentsServiceSpy.requestAiSummary.mockReturnValue(of({} as Comment));

        component.requestAiSummary();

        expect(component.isGeneratingAiSummary()).toBe(true);
        expect(commentsServiceSpy.requestAiSummary).toHaveBeenCalledWith('r1');
    });

    it('should delete comment', () => {
        fixture.detectChanges();
        const comment = { commentId: 'c1' } as Comment;
        confirmationServiceSpy.confirm.mockImplementation((config: any) => config.accept());
        commentsServiceSpy.deleteComment.mockReturnValue(of(comment));

        component.deleteComment(comment);

        expect(commentsServiceSpy.deleteComment).toHaveBeenCalledWith('c1');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
});

