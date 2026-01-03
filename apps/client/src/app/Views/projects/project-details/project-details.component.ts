import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProjectsService } from '../../../core/Services/ProjectsService/ProjectsService';
import { Project } from '../../../core/swagger/model/project';
import { Environment } from '../../../core/swagger/model/environment';
import { UpdateProject } from '../../../core/swagger/model/updateProject';
import { CreateEnvironment } from '../../../core/swagger/model/createEnvironment';
import { UpdateEnvironment } from '../../../core/swagger/model/updateEnvironment';

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
    projectDialog = false;
    projectForm = this.fb.group({
        name: ['', Validators.required],
        description: ['']
    });

    // Environment Edit
    envDialog = false;
    isEnvEditMode = false;
    currentEnvId = '';
    envForm = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        environmentId: ['']
    });

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
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load project' })
        });

        this.projectsService.getEnvironments(this.projectId).subscribe({
            next: (data) => {
                const envs = data.environments || data.items || (Array.isArray(data) ? data : []);
                this.environments.set(envs);
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load environments' })
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
        this.projectDialog = true;
    }

    saveProject() {
        if (this.projectForm.invalid) return;
        const val = this.projectForm.value;
        const update: UpdateProject = {
            name: val.name!,
            description: val.description || ''
        };

        this.projectsService.updateProject(this.projectId, update).subscribe(() => {
            this.loadData(); // Reload to get updates
            this.projectDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated' });
        });
    }

    // Environment Actions
    openNewEnv() {
        this.envForm.reset();
        this.isEnvEditMode = false;
        this.envDialog = true;
    }

    editEnv(env: Environment) {
        this.envForm.patchValue({
            name: env.name,
            description: env.description,
            environmentId: env.environmentId
        });
        this.currentEnvId = env.environmentId!;
        this.isEnvEditMode = true;
        this.envDialog = true;
    }

    deleteEnv(env: Environment) {
        this.confirmationService.confirm({
            message: `Delete environment ${env.name}?`,
            accept: () => {
                this.projectsService.deleteEnvironment(env.environmentId!).subscribe(() => {
                    this.loadData();
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Environment deleted' });
                });
            }
        });
    }

    saveEnv() {
        if (this.envForm.invalid) return;
        const val = this.envForm.value;

        if (this.isEnvEditMode) {
            const update: UpdateEnvironment = {
                name: val.name!,
                description: val.description || ''
            };
            this.projectsService.updateEnvironment(this.currentEnvId, update).subscribe(() => {
                this.loadData();
                this.envDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Environment updated' });
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
                urls: [] // Optional
            };
            this.projectsService.createEnvironment(create).subscribe(() => {
                this.loadData();
                this.envDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Environment created' });
            });
        }
    }
}
