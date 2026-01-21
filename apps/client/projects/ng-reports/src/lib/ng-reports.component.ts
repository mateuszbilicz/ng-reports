import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {NgReportsService} from './services/ng-reports.service';
import {NgReportsFormService} from './services/ng-reports-form.service';
import {NgReportsApiService} from './services/ng-reports-api.service';
import {finalize} from 'rxjs';

@Component({
  selector: 'lib-ng-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ng-reports.component.html',
  styleUrl: './ng-reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgReportsComponent {
  protected readonly ngReportsService = inject(NgReportsService);
  protected readonly formService = inject(NgReportsFormService);
  protected readonly apiService = inject(NgReportsApiService);

  isOpen = this.ngReportsService.isOpen;
  config = this.ngReportsService.config;

  isSending = signal(false);
  isSent = signal(false);

  constructor() {
    this.formService.loadData();
  }

  close() {
    this.ngReportsService.close();
    // Reset internal state after transition
    setTimeout(() => {
      this.isSent.set(false);
      this.isSending.set(false);
    }, 300);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.formService.attachImage(input.files[0].name, input.files[0]).subscribe();
      input.value = ''; // reset
    }
  }

  submit() {
    if (this.formService.formGroup.invalid) return;

    this.isSending.set(true);
    // Refresh form data snapshots (like logs)
    // The service handles reactive fields, but logs/snapshots need to be current
    // `loadData` resets everything, we might not want that if user typed things.
    // The `getUploadValue` getter in service uses current config logic to attach/detach logs.
    const reportData = this.formService.getUploadValue();

    this.apiService.sendReport(reportData)
      .pipe(
        finalize(() => this.isSending.set(false))
      )
      .subscribe({
        next: () => {
          this.isSent.set(true);
          setTimeout(() => {
            this.close();
          }, 2000);
        },
        error: (err) => {
          console.error('Failed to send report', err);
          alert('Failed to send report. Please try again.');
        }
      });
  }
}
