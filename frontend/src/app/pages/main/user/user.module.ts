import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ComponentsModule} from '../../../components/components.module';
import {
  NzButtonModule, NzDatePickerModule, NzDescriptionsModule,
  NzFormModule, NzGridModule, NzIconModule,
  NzInputModule,
  NzModalModule,
  NzSelectModule,
  NzTableModule,
  NzTabsModule,
  NzToolTipModule
} from 'ng-zorro-antd';
import { ReceiptListComponent } from './dashboard/receipt-list/receipt-list.component';
import {ForgetComponent} from './forget/forget.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TransferComponent } from './transfer/transfer.component';
import { AuditListComponent } from './dashboard/audit-list/audit-list.component';
import {AuditedListComponent} from './dashboard/audited-list/audited-list.component';


@NgModule({
  declarations: [
    DashboardComponent,
    ReceiptListComponent,
    ForgetComponent, LoginComponent, RegisterComponent, TransferComponent, AuditListComponent, AuditedListComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    ComponentsModule,
    NzTabsModule,
    NzTableModule,
    NzToolTipModule,
    NzModalModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzInputModule,
    NzButtonModule,
    NzGridModule,
    NzDatePickerModule,
    NzIconModule,
    FormsModule,
    NzDescriptionsModule
  ]
})
export class UserModule { }
