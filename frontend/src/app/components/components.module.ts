import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticComponent } from './statistic/statistic.component';
import { MdEditorComponent } from './md-editor/md-editor.component';
import { MarkdownComponent } from './markdown/markdown.component';
import {NzCheckboxModule, NzFormModule, NzInputModule, NzModalModule, NzSelectModule, NzSkeletonModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ActionComponent } from './action/action.component';



@NgModule({
  declarations: [ StatisticComponent, MdEditorComponent, MarkdownComponent, ActionComponent ],
  imports: [
    CommonModule,
    NzSkeletonModule,
    NzFormModule,
    NzSelectModule,
    ReactiveFormsModule,
    NzInputModule,
    NzModalModule,
    NzCheckboxModule,
    FormsModule
  ],
  exports: [
    StatisticComponent,
    MarkdownComponent,
    MdEditorComponent,
    ActionComponent
  ]
})
export class ComponentsModule { }
