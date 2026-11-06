import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/auth.guards';

import { pendingFaqChanges } from './features/faq/pending-changes.guard';
import { workspaceGuard } from './core/auth/preview.guard';
export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Sign in | Innofinity Worldwide',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canMatch: [workspaceGuard],
    loadComponent: () => import('./layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard | Innofinity Worldwide',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      { path: 'faq', pathMatch: 'full', redirectTo: 'faq/list' },
      { path: 'faq/setting', pathMatch: 'full', redirectTo: 'faq/list' },
      {
        path: 'faq/list',
        title: 'FAQ library | Innofinity Worldwide',
        canDeactivate: [pendingFaqChanges],
        loadComponent: () => import('./features/faq/faq-list').then((m) => m.FaqList),
      },
      {
        path: 'faq/add',
        title: 'Add FAQ | Innofinity Worldwide',
        canDeactivate: [pendingFaqChanges],
        loadComponent: () => import('./features/faq/faq-add').then((m) => m.FaqAdd),
      },
      {
        path: 'faq/categories',
        title: 'FAQ categories | Innofinity Worldwide',
        canDeactivate: [pendingFaqChanges],
        loadComponent: () => import('./features/faq/faq-categories').then((m) => m.FaqCategories),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/module-preview/module-preview').then((m) => m.ModulePreview),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
