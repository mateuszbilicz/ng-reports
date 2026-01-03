import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ReportsService } from '../../core/Services/ReportsService/ReportsService';
import { Report } from '../../core/swagger/model/report';
import { Severity } from '../../core/Models/Severity';

@Component({
    selector: 'app-reports-view',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        DialogModule,
        ReactiveFormsModule,
        InputTextModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule,
        TextareaModule,
        SelectModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './reports-view.component.html'
})
export class ReportsViewComponent implements OnInit {
    router = inject(Router);
    reportsService = inject(ReportsService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);
    fb = inject(FormBuilder);

    reports = signal<Report[]>([]);
    reportDialog = false;
    isEditMode = false;
    currentReportId = '';

    severities = [
        { label: 'Info', value: Severity.Info },
        { label: 'Warning', value: Severity.Warning },
        { label: 'Error', value: Severity.Error },
        { label: 'Critical', value: Severity.Critical }
    ];

    reportForm = this.fb.group({
        title: ['', Validators.required],
        description: [''],
        severity: [Severity.Info, Validators.required],
        environmentId: ['', Validators.required]
    });

    currentEnvIdForList = '';

    ngOnInit() {
    }

    loadReports(envId: string) {
        if (!envId) return;
        this.currentEnvIdForList = envId;
        this.reportsService.getReports(envId).subscribe(data => {
            // Handle various response shapes
            const items = (data as any).reports || (data as any).items || (Array.isArray(data) ? data : []);
            this.reports.set(items);
        });
    }

    openNew() {
        this.reportForm.reset({ severity: Severity.Info });
        this.isEditMode = false;
        this.reportForm.controls.environmentId.enable();
        this.reportDialog = true;
    }

    editReport(report: Report) {
        // Navigate to details page
        const id = (report as any)._id || (report as any).id;
        this.router.navigate(['/reports', id]);
    }

    deleteReport(report: Report) {
        const id = (report as any)._id || (report as any).id;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + report.title + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.reportsService.deleteReport(id).subscribe(() => {
                    if (this.currentEnvIdForList) {
                        this.loadReports(this.currentEnvIdForList);
                    }
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Report Deleted', life: 3000 });
                });
            }
        });
    }

    hideDialog() {
        this.reportDialog = false;
    }

    saveReport() {
        if (this.reportForm.invalid && !this.isEditMode) return;
        const val = this.reportForm.getRawValue();

        if (this.isEditMode) {
            const update: Partial<Report> = {
                title: val.title!,
                details: val.description || '',
                severity: val.severity!
            };
            this.reportsService.updateReport(this.currentReportId, update).subscribe(() => {
                if (this.currentEnvIdForList) this.loadReports(this.currentEnvIdForList);
                this.hideDialog();
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Report Updated', life: 3000 });
            });
        } else {
            const reportData: any = {
                title: val.title!,
                details: val.description || '',
                severity: val.severity!,
                environmentId: val.environmentId!,
                fixed: false,
                comments: []
            };

            this.reportsService.createReport(val.environmentId!, reportData as Report).subscribe(() => {
                if (this.currentEnvIdForList) this.loadReports(this.currentEnvIdForList);
                this.hideDialog();
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Report Created', life: 3000 });
            });
        }
    }

    getSeverityColor(severity: Severity | Report.SeverityEnum): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        const sev = Number(severity);
        switch (sev) {
            case Severity.Critical: return 'danger';
            case Severity.Error: return 'danger';
            case Severity.Warning: return 'warn';
            case Severity.Info: return 'info';
            default: return 'info';
        }
    }
}
