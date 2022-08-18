import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DealCRMRoutingModule } from './deal-crm-routing.module';
import { DealCRMComponent } from './deal-crm.component';


@NgModule({
  declarations: [
    DealCRMComponent
  ],
  imports: [
    CommonModule,
    DealCRMRoutingModule
  ]
})
export class DealCRMModule { }
