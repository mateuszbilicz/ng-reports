import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UserCreate, UsersService, UserUpdateInformation } from '../../../core/Services/UsersService/UsersService';
import { Role } from '../../../core/Models/Role';
import { Textarea } from "primeng/textarea";

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    PasswordModule,
    ToastModule,
    Textarea,
  ],
  providers: [MessageService],
  templateUrl: './user-details.component.html'
})
export class UserDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  usersService = inject(UsersService);
  messageService = inject(MessageService);
  fb = inject(FormBuilder);

  username = '';
  isEditMode = false;

  roles = [
    { label: 'Analyst', value: Role.Analyst },
    { label: 'Developer', value: Role.Developer },
    { label: 'Project Manager', value: Role.ProjectManager },
    { label: 'Admin', value: Role.Admin }
  ];

  userForm = this.fb.group({
    username: ['', Validators.required],
    name: ['', Validators.required],
    role: [Role.Analyst, Validators.required],
    description: [''],
    password: ['']
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.username = params.get('username') || '';
      this.loadUser(this.username);
    });
  }

  loadUser(username: string) {
    if (!username || username === 'new') {
      this.isEditMode = false;
      this.userForm.controls['password'].setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.controls['password'].updateValueAndValidity();
      return;
    }

    this.isEditMode = true;
    this.userForm.controls['password'].clearValidators();
    this.userForm.controls['password'].updateValueAndValidity();

    this.usersService.getUser(username).subscribe({
      next: (u: any) => {
        this.userForm.patchValue({
          username: u.username,
          name: u.name,
          role: u.role,
          description: u.description
        });
        this.userForm.get('username')?.disable();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user details'
        });
        this.goBack();
      }
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }

  saveUser() {
    if (this.userForm.invalid) return;

    const val = this.userForm.value;

    if (this.isEditMode) {
      const update: UserUpdateInformation = {
        name: val.name!,
        description: val.description || '',
        role: val.role!
      };
      this.usersService.updateUser(this.username, update).subscribe(() => {
        this.router.navigate(['/users']);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated' });
      });
    } else {
      const create: UserCreate = {
        username: val.username!,
        name: val.name!,
        description: val.description || '',
        role: val.role!,
        password: val.password!
      };
      this.usersService.createUser(create).subscribe(() => {
        this.router.navigate(['/users']);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created' });
      });
    }
  }
}
