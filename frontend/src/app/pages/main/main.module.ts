import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainComponent} from './main.component';
import {
  NzLayoutModule,
  NzPageHeaderModule,
  NzBreadCrumbModule,
  NzMenuModule,
  NzGridModule,
  NzAlertModule,
  NzTableModule,
  NzMessageModule, NzPopconfirmModule, NzModalModule, NzButtonModule, NzIconModule, NzInputModule
} from 'ng-zorro-antd';
import {MainRoutingModule} from './main-routing.module';
import {ChartsModule} from 'ng2-charts';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    ChartsModule,
    NzMessageModule,
    NzLayoutModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzMenuModule,
    NzGridModule,
    NzAlertModule,
    NzTableModule,
    NzPopconfirmModule,
    NzModalModule,
    MainRoutingModule,
    NzButtonModule,
    NzIconModule,
    FormsModule,
    NzInputModule
  ]
})
export class MainModule {
}
