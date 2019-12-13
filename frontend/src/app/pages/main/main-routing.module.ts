import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './main.component';

const routes: Routes = [
  {
    path: '', component: MainComponent, children: [
      { path: 'user', loadChildren: () => import('./user/user.module').then(mod => mod.UserModule) },
    ], data: {
      breadcrumb: '主页'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
}
