import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SwiperModule } from 'swiper/angular';

import { DealCrmHeaderComponent } from '../deal-crm-header/deal-crm-header.component';
import { DealCRMRoutingModule } from './deal-crm-routing.module';
import { DealCRMComponent } from './deal-crm.component';


@NgModule({
  declarations: [
    DealCRMComponent,
    DealCrmHeaderComponent
  ],
  imports: [
    CommonModule,
    DealCRMRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    SwiperModule
  ]
})
export class DealCRMModule { }
