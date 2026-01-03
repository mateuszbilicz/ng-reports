import { Routes } from '@angular/router';
import { AuthGuard } from './core/Guards/AuthGuard';
import { MainLayout } from './core/Elements/Layout/MainLayout';

export const routes: Routes = [
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./Views/auth/auth-view.component').then((m) => m.AuthViewComponent),
            },
        ],
    },
    {
        path: '',
        component: MainLayout,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'projects',
                pathMatch: 'full',
            },
            {
                path: 'projects',
                loadComponent: () => import('./Views/projects/projects-view.component').then((m) => m.ProjectsViewComponent),
            },
            {
                path: 'projects/:id',
                loadComponent: () => import('./Views/projects/project-details/project-details.component').then((m) => m.ProjectDetailsComponent),
            },
            {
                path: 'reports',
                loadComponent: () => import('./Views/reports/reports-view.component').then((m) => m.ReportsViewComponent),
            },
            {
                path: 'reports/:id',
                loadComponent: () => import('./Views/reports/report-details/report-details.component').then((m) => m.ReportDetailsComponent),
            },
            {
                path: 'users',
                loadComponent: () => import('./Views/users/users-view.component').then((m) => m.UsersViewComponent),
            },
            {
                path: 'users/:username',
                loadComponent: () => import('./Views/users/user-details/user-details.component').then((m) => m.UserDetailsComponent),
            },
            {
                path: 'statistics',
                loadComponent: () => import('./Views/statistics/statistics-view.component').then((m) => m.StatisticsViewComponent),
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
