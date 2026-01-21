import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Report} from '../../swagger/model/report';
// import { ReportFilteredList } from '../../Models/Report';
// Use any for ReportFilteredList or find anonymous model
import {ReportsService as ApiReportsService} from '../../swagger/api/reports.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  protected readonly apiReportsService = inject(ApiReportsService);

  getReports(environmentId: string, filter?: string, limit?: number, skip?: number): Observable<any> {
    return this.apiReportsService.reportsControllerFindAll(environmentId, filter, limit, skip);
  }

  getReport(id: string): Observable<Report> {
    return this.apiReportsService.reportsControllerFindOne(id);
  }

  createReport(environmentId: string, report: Partial<Report>): Observable<Report> {
    // Provide defaults for all required fields of reportsControllerCreateForm
    const defaultUser = {username: 'anonymous', email: '', name: 'Anonymous', avatar: ''}; // Mock
    const defaultEnv = {
      userAgent: 'Mock',
      browserAppName: 'Mock',
      extensions: [],
      appEnvironment: 'dev',
      appVersion: '1.0',
      appLanguage: 'en',
      panelUrl: '',
      route: '/',
      connectionType: 'wifi',
      ram: 0,
      windowSize: {width: 1920, height: 1080}
    };

    return this.apiReportsService.reportsControllerCreateForm(
      report.dataIsFromAuthService ?? false,
      report.user ?? defaultUser as any,
      report.title || 'Untitled',
      report.details || '',
      report.logs || [],
      report.formData || {},
      report.attachments || [],
      report.environment ?? defaultEnv as any,
      report.timestamp || Date.now(),
      report.severity || 0,
      report.summary || '',
      report.fixed || false,
      report.comments || [],
      environmentId
    );
  }

  updateReport(id: string, updates: Partial<Report>): Observable<Report> {
    return this.apiReportsService.reportsControllerUpdate(updates as any, id);
  }

  deleteReport(id: string): Observable<Report> {
    return this.apiReportsService.reportsControllerRemove(id);
  }
}
