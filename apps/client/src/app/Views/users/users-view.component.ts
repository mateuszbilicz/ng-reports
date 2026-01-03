import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UsersService, User, UserFilteredList } from '../../core/Services/UsersService/UsersService';
import { UserMini } from '../../core/swagger/model/userMini';
import { Role } from '../../core/Models/Role';

@Component({
    selector: 'app-users-view',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './users-view.component.html'
})
export class UsersViewComponent implements OnInit {
    router = inject(Router);
    usersService = inject(UsersService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    users = signal<UserMini[]>([]);

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.usersService.getUsers().subscribe(data => {
            // Handle UserFilteredList (which has items property)
            this.users.set(data.items || []);
        });
    }

    createNewUser() {
        this.router.navigate(['/users/new']);
    }

    editUser(user: UserMini) {
        this.router.navigate(['/users', user.username]);
    }

    deleteUser(user: UserMini) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + user.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.usersService.deleteUser(user.username).subscribe(() => {
                    this.loadUsers();
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
                });
            }
        });
    }

    getRoleName(role: number): string {
        return Role[role];
    }

    getRoleSeverity(role: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (role) {
            case Role.Admin: return 'danger';
            case Role.ProjectManager: return 'warn';
            case Role.Developer: return 'info';
            case Role.Analyst: return 'success';
            default: return 'info';
        }
    }
}
