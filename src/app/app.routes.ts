import { Routes } from '@angular/router'
import { SignComponent } from './sign/sign.component'
import { VerifyComponent } from './verify/verify.component'

export const routes: Routes = [
  { 
    path: 'sign', 
    component: SignComponent,
    title: 'Создание ЭЦП' 
  },
  { 
    path: 'verify', 
    component: VerifyComponent,
    title: 'Проверка ЭЦП' 
  },
  { path: '', redirectTo: 'sign', pathMatch: 'full' },
  { path: '**', redirectTo: 'sign' }
];