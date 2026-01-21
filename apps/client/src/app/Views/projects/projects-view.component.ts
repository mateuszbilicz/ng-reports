import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormArray, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TextareaModule} from 'primeng/textarea';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {forkJoin, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ProjectsService} from '../../core/Services/ProjectsService/ProjectsService';
import {Project} from '../../core/swagger/model/project';
import {CreateProject} from '../../core/swagger/model/createProject';
import {UpdateProject} from '../../core/swagger/model/updateProject';
import {CreateEnvironment} from '../../core/swagger/model/createEnvironment';

@Component({
  selector: 'app-projects-view',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TextareaModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './projects-view.component.html'
})
export class ProjectsViewComponent implements OnInit {
  router = inject(Router);
  projectsService = inject(ProjectsService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  fb = inject(FormBuilder);

  projects = signal<Project[]>([]);
  projectDialog = false;
  isEditMode = false;
  currentProjectId = '';

  projectForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    environments: this.fb.array([])
  });

  get environments() {
    return this.projectForm.get('environments') as FormArray;
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectsService.getProjects().subscribe(data => {
      // Assuming data.projects or similar structure based on API
      const projects = (data as any).projects || (data as any).items || (Array.isArray(data) ? data : []);
      this.projects.set(projects);
    });
  }

  createEnvironmentGroup(name = '', url = '') {
    return this.fb.group({
      name: [name, Validators.required],
      url: [url, Validators.required]
    });
  }

  addEnvironment() {
    this.environments.push(this.createEnvironmentGroup());
  }

  removeEnvironment(index: number) {
    this.environments.removeAt(index);
  }

  openNew() {
    this.projectForm.reset();
    this.environments.clear();
    this.addEnvironment();
    this.isEditMode = false;
    this.projectDialog = true;
  }

  editProject(project: Project) {
    this.router.navigate(['/projects', project.projectId]);
  }

  deleteProject(project: Project) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + project.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.projectsService.deleteProject(project.projectId).subscribe(() => {
          this.loadProjects();
          this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Project Deleted', life: 3000});
        });
      }
    });
  }

  hideDialog() {
    this.projectDialog = false;
  }

  saveProject() {
    if (this.projectForm.invalid) return;

    const val = this.projectForm.value;
    const envs = (val.environments as { name: string, url: string }[]) || [];

    // Simple ID generation for demo purposes
    const projectId = val.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (this.isEditMode) {
      const update: UpdateProject = {
        name: val.name!,
        description: val.description || '',
      };

      this.projectsService.updateProject(this.currentProjectId, update).subscribe(() => {
        this.loadProjects();
        this.hideDialog();
        this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Project Updated', life: 3000});
      });
    } else {
      const create: CreateProject = {
        projectId: projectId,
        name: val.name!,
        description: val.description || '',
      };

      this.projectsService.createProject(create).pipe(
        switchMap(project => {
          if (envs.length === 0) return of(project);

          const envObservables = envs.map(env => {
            const envId = env.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const createEnv: CreateEnvironment = {
              projectId: project.projectId,
              environmentId: envId,
              name: env.name,
              description: '',
              urls: [{name: 'Default', url: env.url}]
            };
            return this.projectsService.createEnvironment(createEnv);
          });

          return forkJoin(envObservables);
        })
      ).subscribe(() => {
        this.loadProjects();
        this.hideDialog();
        this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Project Created', life: 3000});
      });
    }
  }
}
