import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {TextareaModule} from 'primeng/textarea';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ProjectsService} from '../../../core/Services/ProjectsService/ProjectsService';
import {Project} from '../../../core/swagger/model/project';
import {Environment} from '../../../core/swagger/model/environment';
import {UpdateProject} from '../../../core/swagger/model/updateProject';
import {CreateEnvironment} from '../../../core/swagger/model/createEnvironment';
import {UpdateEnvironment} from '../../../core/swagger/model/updateEnvironment';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './project-details.component.html'
})
export class ProjectDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  projectsService = inject(ProjectsService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  fb = inject(FormBuilder);

  projectId = '';
  project = signal<Project | null>(null);
  environments = signal<Environment[]>([]);

  // Project Edit
  isProjectEditMode = signal(false);
  loadingProject = signal(false);

  projectForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  // Environment Inline Edit
  editingEnvId = signal<string | null>(null);
  loadingEnvId = signal<string | null>(null);

  envForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    environmentId: [''],
    urls: this.fb.array([])
  });

  get urls() {
    return this.envForm.get('urls') as any; // Typed as FormArray in template usage
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id') || '';
      if (this.projectId) {
        this.loadData();
      }
    });
  }

  loadData() {
    this.projectsService.getProject(this.projectId).subscribe({
      next: (p) => this.project.set(p),
      error: () => this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load project'})
    });

    this.projectsService.getEnvironments(this.projectId).subscribe({
      next: (data) => {
        const envs = data.environments || data.items || (Array.isArray(data) ? data : []);
        this.environments.set(envs);
      },
      error: () => this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load environments'})
    });
  }

  goBack() {
    this.router.navigate(['/projects']);
  }

  // Project Actions
  editProject() {
    const p = this.project();
    if (!p) return;
    this.projectForm.patchValue({
      name: p.name,
      description: p.description
    });
    this.isProjectEditMode.set(true);
  }

  cancelEditProject() {
    this.isProjectEditMode.set(false);
    this.projectForm.reset();
  }

  saveProject() {
    if (this.projectForm.invalid) return;

    this.loadingProject.set(true);
    const val = this.projectForm.value;
    const update: UpdateProject = {
      name: val.name!,
      description: val.description || ''
    };

    this.projectsService.updateProject(this.projectId, update).subscribe({
      next: () => {
        this.loadData();
        this.isProjectEditMode.set(false);
        this.loadingProject.set(false);
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Project updated'});
      },
      error: () => {
        this.loadingProject.set(false);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to update project'});
      }
    });
  }

  // Environment Actions

  // Helper to generic URL form group
  createUrlGroup(data?: { name: string, url: string }) {
    return this.fb.group({
      name: [data?.name || '', Validators.required],
      url: [data?.url || '', [Validators.required]] // Could add URL validator pattern
    });
  }

  addUrl() {
    this.urls.push(this.createUrlGroup());
  }

  removeUrl(index: number) {
    this.urls.removeAt(index);
  }

  startNewEnv() {
    this.cancelEditEnv(); // Close any other edit
    this.editingEnvId.set('new'); // Special ID for new env
    this.envForm.reset();
    this.urls.clear();
  }

  editEnv(env: Environment) {
    this.cancelEditEnv();
    this.editingEnvId.set(env.environmentId);
    this.envForm.patchValue({
      name: env.name,
      description: env.description,
      environmentId: env.environmentId
    });

    this.urls.clear();
    if (env.urls) {
      env.urls.forEach(u => this.urls.push(this.createUrlGroup(u)));
    }
  }

  cancelEditEnv() {
    this.editingEnvId.set(null);
    this.envForm.reset();
    this.urls.clear();
  }

  deleteEnv(env: Environment) {
    this.confirmationService.confirm({
      message: `Delete environment ${env.name}?`,
      accept: () => {
        this.projectsService.deleteEnvironment(env.environmentId!).subscribe(() => {
          this.loadData();
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Environment deleted'});
        });
      }
    });
  }

  saveEnv() {
    if (this.envForm.invalid) return;
    const val = this.envForm.value;
    const isNew = this.editingEnvId() === 'new';

    this.loadingEnvId.set(this.editingEnvId());

    if (!isNew) {
      const update: UpdateEnvironment = {
        name: val.name!,
        description: val.description || '',
        urls: val.urls as any[]
      };
      this.projectsService.updateEnvironment(this.editingEnvId()!, update).subscribe({
        next: () => {
          this.loadData();
          this.cancelEditEnv();
          this.loadingEnvId.set(null);
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Environment updated'});
        },
        error: () => this.loadingEnvId.set(null)
      });
    } else {
      // Generate ID if empty
      let envId = val.environmentId;
      if (!envId) {
        envId = val.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      const create: CreateEnvironment = {
        projectId: this.projectId,
        environmentId: envId as string,
        name: val.name!,
        description: val.description || '',
        urls: val.urls as any[]
      };
      this.projectsService.createEnvironment(create).subscribe({
        next: () => {
          this.loadData();
          this.cancelEditEnv();
          this.loadingEnvId.set(null);
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Environment created'});
        },
        error: () => this.loadingEnvId.set(null)
      });
    }
  }

  viewReports(env: Environment) {
    this.router.navigate(['/reports'], {queryParams: {envId: env.environmentId}});
  }
}
