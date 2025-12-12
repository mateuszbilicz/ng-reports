import {ErrorHandler, inject, Injectable} from '@angular/core';
import {NgReportsService} from '../services/ng-reports.service';

@Injectable({
  providedIn: 'root'
})
export class NgReportsConsoleService
  extends ErrorHandler {
  protected readonly ngReportsService = inject(NgReportsService);

  override handleError(error: any) {
    let stack = error.stack;
    if (stack) {
      stack = stack.split('\n').slice(0, 10).join('\n');
    }
    this.ngReportsService.addConsoleError(
      error.name,
      error.message,
      stack
    );
    super.handleError(error);
  }
}
