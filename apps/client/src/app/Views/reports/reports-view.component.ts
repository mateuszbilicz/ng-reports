import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TreeSelectModule } from 'primeng/treeselect';
import { ProjectsService } from '../../core/Services/ProjectsService/ProjectsService';
import { ReportsService } from '../../core/Services/ReportsService/ReportsService';
import { Report } from '../../core/swagger/model/report';
import { Severity } from '../../core/Models/Severity';
import { getSeverityText } from '../../core/Utils/severity-to-text';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TextareaModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    TreeSelectModule,
    Tooltip
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

  getSeverityText = getSeverityText;

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

  projectsService = inject(ProjectsService);
  route = inject(ActivatedRoute);

  nodes = signal<TreeNode[]>([]);
  selectedNode: any;

  ngOnInit() {
    this.loadTreeNodes();
  }

  loadTreeNodes() {
    const projectsObs = this.projectsService.getProjects();
    projectsObs.subscribe({
      next: (projectsRes: any) => {
        const projects = projectsRes.items || [];
        const envObservables = projects.map((p: any) => {
          const envObs = this.projectsService.getEnvironments(p.projectId);
          return envObs.pipe(
            map((envRes: any) => ({
              label: p.name,
              expanded: true,
              children: (envRes.environments || []).map((e: any) => ({
                label: e.name,
                data: { envId: e.environmentId },
                icon: 'pi pi-server'
              }))
            }))
          );
        });

        if (envObservables.length === 0) {
          this.nodes.set([]);
          this.checkQueryParams(this.nodes());
          return;
        }

        forkJoin(envObservables).subscribe(treeNodes => {
          this.nodes.set(treeNodes as TreeNode<any>[]);
          this.checkQueryParams(treeNodes as TreeNode<any>[]);
        });
      },
      error: (err) => console.error('FAILED TO LOAD TREE NODES', err)
    });
  }

  private checkQueryParams(treeNodes: any[]) {
    this.route.queryParams.subscribe(params => {
      const envId = params['envId'];
      if (envId) {
        this.selectNodeByEnvId(treeNodes, envId);
      }
    });
  }

  selectNodeByEnvId(nodes: TreeNode[], envId: string) {
    for (const node of nodes) {
      if (node.children) {
        const child = node.children.find(c => c.data?.envId === envId);
        if (child) {
          this.selectedNode = child;
          node.expanded = true;
          this.loadReports(envId);
          return;
        }
      }
    }
  }

  onNodeSelect(event: any) {
    const node = event.node || event;
    const envId = node.data?.envId;
    if (envId) {
      this.loadReports(envId);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { envId: envId },
        queryParamsHandling: 'merge'
      });
    }
  }

  loadReports(envId: string) {
    if (!envId) return;
    this.currentEnvIdForList = envId;
    this.reportsService.getReports(envId).subscribe(data => {
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
        this.reportsService.deleteReport(id).subscribe({
          next: () => {
            if (this.currentEnvIdForList)
              this.loadReports(this.currentEnvIdForList);
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Report Deleted', life: 3000 });
          },
          error: () => {
            if (this.currentEnvIdForList)
              this.loadReports(this.currentEnvIdForList);
          }
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
      case Severity.Critical:
        return 'danger';
      case Severity.Error:
        return 'danger';
      case Severity.Warning:
        return 'warn';
      case Severity.Info:
        return 'info';
      default:
        return 'info';
    }
  }
}
