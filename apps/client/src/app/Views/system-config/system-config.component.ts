import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {ConfigFieldUpdateMany, SystemConfigurationService, SystemConfigView} from '../../core/swagger';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {IForm} from '../../core/Utils/form';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MessageService} from 'primeng/api';
import {InputNumber} from 'primeng/inputnumber';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {Button} from 'primeng/button';
import {Toast} from 'primeng/toast';
import {Message} from 'primeng/message';

@Component({
  selector: 'app-system-config.component',
  imports: [
    ReactiveFormsModule,
    InputNumber,
    ToggleSwitch,
    Button,
    Toast,
    Message
  ],
  providers: [
    MessageService
  ],
  templateUrl: './system-config.component.html',
  styles: '',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemConfigComponent implements AfterViewInit {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly messageService = inject(MessageService);
  protected readonly systemConfigService = inject(SystemConfigurationService);
  configForm = new FormGroup<IForm<SystemConfigView>>({
    reportsRetentionInMonths: new FormControl<number>(0),
    inactiveUsersRetentionInMonths: new FormControl<number>(0),
    allowReportsIncomeFromUnknownSources: new FormControl<boolean>(false),
    enableAISummary: new FormControl<boolean>(false),
    enableAIAutoSeverityAssignation: new FormControl<boolean>(false),
    enableAIAutoSummaryGeneration: new FormControl<boolean>(false),
    summaryGenerationIncludeProjectDescription: new FormControl<boolean>(false),
    summaryGenerationIncludeProjectEnvironment: new FormControl<boolean>(false),
    summaryGenerationIncludeReportDetails: new FormControl<boolean>(false),
    summaryGenerationIncludeReportLogs: new FormControl<boolean>(false),
    summaryGenerationIncludeReportFormData: new FormControl<boolean>(false),
    summaryGenerationIncludeReportEnvironment: new FormControl<boolean>(false),
    summaryGenerationIncludeComments: new FormControl<boolean>(false)
  });
  loading = signal<boolean>(false);

  ngAfterViewInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.systemConfigService.systemConfigurationControllerGetConfig()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: systemConfig => {
          this.configForm.setValue(systemConfig);
        },
        error: () => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load system configuration'});
        },
        complete: () => this.loading.set(false)
      });
  }

  save() {
    if (
      this.configForm.invalid
      || this.loading()
    ) return;
    this.loading.set(true);
    const updateMany = this.configForm.getRawValue() as ConfigFieldUpdateMany;
    this.systemConfigService.systemConfigurationControllerUpdateManyConfigValues(updateMany)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'System configuration updated'});
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update system configuration'
          });
        },
        complete: () => {
          this.loading.set(false);
          this.load();
        }
      })
  }
}
