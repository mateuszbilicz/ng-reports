import { TestBed } from '@angular/core/testing';
import { ReportsService } from './ReportsService';
import { ReportsService as ApiReportsService } from '../../swagger/api/reports.service';
import { of } from 'rxjs';
import { Report } from '../../swagger/model/report';

describe('ReportsService', () => {
    let service: ReportsService;
    let apiReportsServiceSpy: jasmine.SpyObj<ApiReportsService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ApiReportsService', ['reportsControllerFindAll', 'reportsControllerFindOne', 'reportsControllerCreateForm', 'reportsControllerUpdate', 'reportsControllerRemove']);
        TestBed.configureTestingModule({
            providers: [
                ReportsService,
                { provide: ApiReportsService, useValue: spy }
            ]
        });
        service = TestBed.inject(ReportsService);
        apiReportsServiceSpy = TestBed.inject(ApiReportsService) as jasmine.SpyObj<ApiReportsService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get reports', (done) => {
        const reports = [{ id: '1' }];
        apiReportsServiceSpy.reportsControllerFindAll.and.returnValue(of(reports as any));

        service.getReports('env1').subscribe(res => {
            expect(res).toEqual(reports);
            expect(apiReportsServiceSpy.reportsControllerFindAll).toHaveBeenCalledWith('env1', undefined, undefined, undefined);
            done();
        });
    });

    it('should get one report', (done) => {
        const report: Report = { id: '1', title: 'test', environmentId: 'env1' } as any;
        apiReportsServiceSpy.reportsControllerFindOne.and.returnValue(of(report));

        service.getReport('1').subscribe(res => {
            expect(res).toEqual(report);
            expect(apiReportsServiceSpy.reportsControllerFindOne).toHaveBeenCalledWith('1');
            done();
        });
    });

    it('should create report with defaults', (done) => {
        const newReport: Partial<Report> = { title: 'New Report' };
        const createdReport: Report = { id: '1', ...newReport } as any;
        apiReportsServiceSpy.reportsControllerCreateForm.and.returnValue(of(createdReport));

        service.createReport('env1', newReport).subscribe(res => {
            expect(res).toEqual(createdReport);
            // Check that it was called with defaults
            expect(apiReportsServiceSpy.reportsControllerCreateForm).toHaveBeenCalledWith(
                false, // dataIsFromAuthService
                jasmine.objectContaining({ username: 'anonymous' }), // defaultUser
                'New Report', // title
                '', // details
                [], // logs
                {}, // formData
                [], // attachments
                jasmine.objectContaining({ appEnvironment: 'dev' }), // defaultEnv
                jasmine.any(Number), // timestamp
                0, // severity
                '', // summary
                false, // fixed
                [], // comments
                'env1' // environmentId
            );
            done();
        });
    });

    it('should update report', (done) => {
        const updates = { title: 'Updated' };
        const updatedReport: Report = { id: '1', title: 'Updated' } as any;
        apiReportsServiceSpy.reportsControllerUpdate.and.returnValue(of(updatedReport));

        service.updateReport('1', updates).subscribe(res => {
            expect(res).toEqual(updatedReport);
            expect(apiReportsServiceSpy.reportsControllerUpdate).toHaveBeenCalledWith(updates as any, '1');
            done();
        });
    });

    it('should delete report', (done) => {
        const report: Report = { id: '1' } as any;
        apiReportsServiceSpy.reportsControllerRemove.and.returnValue(of(report));

        service.deleteReport('1').subscribe(res => {
            expect(res).toEqual(report);
            expect(apiReportsServiceSpy.reportsControllerRemove).toHaveBeenCalledWith('1');
            done();
        });
    });
});
