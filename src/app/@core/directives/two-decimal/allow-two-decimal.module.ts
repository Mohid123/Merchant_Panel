import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AllowTwoDecimalDirective } from './allow-two-decimal.directive';



@NgModule({
  declarations: [
    AllowTwoDecimalDirective,
  ],
  imports: [
  CommonModule
  ],
  exports: [
    AllowTwoDecimalDirective,
  ],
})
export class AllowTwoDecimalModule { }
