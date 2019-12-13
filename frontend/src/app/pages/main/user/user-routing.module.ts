import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {ForgetComponent} from './forget/forget.component';
import {RegisterComponent} from './register/register.component';
import {TransferComponent} from './transfer/transfer.component';


const routes: Routes = [
  {
    path: 'login', component: LoginComponent, data: {
      breadcrumb: '登录'
    }
  },
  {
    path: 'forget', component: ForgetComponent, data: {
      breadcrumb: '忘记密码'
    }
  },
  {
    path: 'register', component: RegisterComponent, data: {
      breadcrumb: '忘记密码'
    }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: {breadcrumb: '管理面板'}
  },
  {
    path: 'transfer',
    component: TransferComponent,
    children: [
      {
        path: ':address',
        data: {breadcrumb: null}
      }
    ],
    data: {breadcrumb: '转移凭证'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
