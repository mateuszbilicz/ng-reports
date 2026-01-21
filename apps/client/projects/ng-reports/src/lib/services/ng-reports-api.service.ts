import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgReportsConfig} from '../api/config';
import {NgReportsReport} from '../api/api';
import {Observable} from 'rxjs';
import {NgReportsService} from './ng-reports.service';

@Injectable({
  providedIn: 'root'
})
export class NgReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly ngReportsService = inject(NgReportsService);

  private get config(): NgReportsConfig {
    return this.ngReportsService.config();
  }

  /**
   * Sends the report to the API.
   * Uses configuration from NgReportsService for endpoint construction if needed,
   * but for now assuming relative path or base URL is handled by interceptors or proxy,
   * or we construct full URL here.
   * Given the requirements, we'll try to deduce the API URL or use a relative path if not configured.
   * However, usually reports are sent to a specific endpoint.
   * Let's assume the API URL is accessible via '/api/reports' relative to the base,
   * OR we might need to add apiUrl to config.
   * For now, I'll assume standard '/api/reports' or similar.
   * WAITING: I need to know the base URL.
   * Looking at `app.config.ts`, `apiUrl` comes from environment.
   * But this library might be used elsewhere.
   * I will add `apiUrl` to NgReportsConfig ideally, but for now I'll standardise on a path
   * and assume the consumer sets up the proxy or base URL.
   * Actually, looking at `reports.controller.ts` in API, the endpoint is `@Post()`.
   * The path is defined by controller `@Controller('reports')`.
   * So it is `/reports`.
   */
  sendReport(report: NgReportsReport): Observable<any> {
    // The controller requires 'environmentId' query param.
    // @Query('environmentId') environmentId: string
    const params = {
      environmentId: this.config.environment
    };

    const formData = new FormData();
    // Append simple fields
    formData.append('title', report.title);
    formData.append('details', report.details);
    formData.append('timestamp', report.timestamp.toString());
    formData.append('environment', JSON.stringify(report.environment));

    if (report.user) {
      formData.append('user', JSON.stringify(report.user));
    }
    if (report.dataIsFromAuthService !== undefined) {
      formData.append('dataIsFromAuthService', String(report.dataIsFromAuthService));
    }
    if (report.logs) {
      formData.append('logs', JSON.stringify(report.logs));
    }
    if (report.formData) {
      formData.append('formData', JSON.stringify(report.formData));
    }
    // Attachments
    if (report.attachments && report.attachments.length > 0) {
      report.attachments.forEach((att, index) => {
        // defined in implementation of NgReportsFormService, attachment is { file: Blob, ... }
        // We need to check exact structure used there.
        // In NgReportsFormService:
        // fg.reset({ uid, name, file: blob });
        // So report.attachments items have 'file' property which is a Blob.
        // The API controller expects: @UseInterceptors(FilesInterceptor('attachments[].file'))
        // This suggests it expects an array field named 'attachments[].file' ??
        // distinct file fields?
        // Usually FilesInterceptor('files') means it looks for fields named 'files'.
        // 'attachments[].file' looks like a specific object path structure mapping.
        // Let's try appending with name 'attachments[].file' as the key.
        // Or if it's nested object structure in body... no, it's multipart.
        // NestJS FilesInterceptor on 'attachments[].file' is tricky.
        // It might mean it expects the field name to be literally "attachments[].file".
        // Let's try that.
        // AND we also need the metadata for attachments (uid, name).
        // The api controller `create(@Body() report: Report)` implies it parses the body.
        // But files are separate.
        // The report schema has `attachments?: Array<NgReportsAttachmentImage>;`
        // Validation will happen on parsing.
        // If we send files as separate multipart fields, how does it map?
        // NestJS/Express: files are separated.
        // The `report` body part should contain the array of metadata?
        // But `NgReportsAttachmentImage` usually refers to the uploaded file details (id, url) AFTER upload?
        // Checking `Report` schema/interface might be useful, but let's stick to sending what we can.
        // If `attachments` in JSON body is expected, we send the array of metadata there?
        // But we are uploading NEW files.
        // Typically: we send files, and maybe an index map?
        // Or the `FilesInterceptor` just grabs files from that field name.
        if ((att as any).file) {
          formData.append('attachments[].file', (att as any).file, (att as any).name);
        }
      });
    }

    // Use configured apiUrl.
    // Ensure no double slashes if apiUrl ends with /
    const baseUrl = this.config.apiUrl.endsWith('/') ? this.config.apiUrl.slice(0, -1) : this.config.apiUrl;
    const url = `${baseUrl}/reports`;

    return this.http.post(url, formData, {params});
  }
}
