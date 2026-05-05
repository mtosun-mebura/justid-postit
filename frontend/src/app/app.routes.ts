import { Routes } from '@angular/router';

/**
 * Routes volgens opdracht (/create, /overview, /overview/:todoId) plus een bord voor slepen.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  {
    path: 'board',
    loadComponent: () => import('./pages/board/board').then((m) => m.Board),
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/create/create').then((m) => m.Create),
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview/overview').then((m) => m.Overview),
  },
  {
    path: 'overview/:todoId',
    loadComponent: () => import('./pages/manage/manage').then((m) => m.Manage),
  },
  { path: '**', redirectTo: 'board' },
];
