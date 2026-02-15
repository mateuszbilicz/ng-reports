import { TestBed } from '@angular/core/testing';
import { ReportsService } from './ReportsService';
import { ReportsService as ApiReportsService } from '../../swagger/api/reports.service';
import { of } from 'rxjs';
import { Report } from '../../swagger/model/report';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('ReportsService', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let service: ReportsService;
    let apiReportsServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(() => {
        const spy = createSpyObj(['reportsControllerFindAll', 'reportsControllerFindOne', 'reportsControllerCreateForm', 'reportsControllerUpdate', 'reportsControllerRemove']);
        apiReportsServiceSpy = spy;

        TestBed.configureTestingModule({
            providers: [
                ReportsService,
                { provide: ApiReportsService, useValue: apiReportsServiceSpy }
            ]
        });
        service = TestBed.inject(ReportsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get reports', () => new Promise<void>((done) => {
        const reports = [{ id: '1' }];
        apiReportsServiceSpy.reportsControllerFindAll.mockReturnValue(of(reports as any));

        service.getReports('env1').subscribe(res => {
            expect(res).toEqual(reports);
            expect(apiReportsServiceSpy.reportsControllerFindAll).toHaveBeenCalledWith('env1', undefined, undefined, undefined);
            done();
        });
    }));

    it('should get one report', () => new Promise<void>((done) => {
        const report: Report = { id: '1', title: 'test', environmentId: 'env1' } as any;
        apiReportsServiceSpy.reportsControllerFindOne.mockReturnValue(of(report));

        service.getReport('1').subscribe(res => {
            expect(res).toEqual(report);
            expect(apiReportsServiceSpy.reportsControllerFindOne).toHaveBeenCalledWith('1');
            done();
        });
    }));

    it('should create report with defaults', () => new Promise<void>((done) => {
        const newReport: Partial<Report> = { title: 'New Report' };
        const createdReport: Report = { id: '1', ...newReport } as any;
        apiReportsServiceSpy.reportsControllerCreateForm.mockReturnValue(of(createdReport));

        service.createReport('env1', newReport).subscribe(res => {
            expect(res).toEqual(createdReport);
            // Check that it was called with defaults
            expect(apiReportsServiceSpy.reportsControllerCreateForm).toHaveBeenCalledWith(
                false, // dataIsFromAuthService
                expect.objectContaining({ username: 'anonymous' }), // defaultUser
                'New Report', // title
                '', // details
                [], // logs
                {}, // formData
                [], // attachments
                expect.objectContaining({ appEnvironment: 'dev' }), // defaultEnv
                expect.any(Number), // timestamp
                0, // severity
                '', // summary
                false, // fixed
                [], // comments
                'env1' // environmentId
            );
            done();
        });
    }));

    it('should update report', () => new Promise<void>((done) => {
        const updates = { title: 'Updated' };
        const updatedReport: Report = { id: '1', title: 'Updated' } as any;
        apiReportsServiceSpy.reportsControllerUpdate.mockReturnValue(of(updatedReport));

        service.updateReport('1', updates).subscribe(res => {
            expect(res).toEqual(updatedReport);
            expect(apiReportsServiceSpy.reportsControllerUpdate).toHaveBeenCalledWith(updates as any, '1');
            done();
        });
    }));

    it('should delete report', () => new Promise<void>((done) => {
        const report: Report = { id: '1' } as any;
        apiReportsServiceSpy.reportsControllerRemove.mockReturnValue(of(report));

        service.deleteReport('1').subscribe(res => {
            expect(res).toEqual(report);
            expect(apiReportsServiceSpy.reportsControllerRemove).toHaveBeenCalledWith('1');
            done();
        });
    }));
});
