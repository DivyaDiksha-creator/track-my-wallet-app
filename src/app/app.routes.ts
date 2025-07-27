import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth-guard';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { CategoryListComponent } from './features/categories/category-list/category-list';
import { CategoryFormComponent } from './features/categories/category-form/category-form';
import { ExpenseListComponent } from './features/expenses/expense-list/expense-list';
import { ExpenseFormComponent } from './features/expenses/expense-form/expense-form';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    component: CategoryListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories/add',
    component: CategoryFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories/edit/:id',
    component: CategoryFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'expenses',
    component: ExpenseListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'expenses/add',
    component: ExpenseFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'expenses/edit/:id',
    component: ExpenseFormComponent,
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];