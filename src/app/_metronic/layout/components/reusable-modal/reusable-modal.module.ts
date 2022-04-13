import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReusableModalComponent } from './reusable-modal.component';



@NgModule({
  declarations: [
    ReusableModalComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ReusableModalComponent
  ]
})
export class ReusableModalModule { }
