import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NumbersOnlyDirective } from './number-only.directive';



@NgModule({
  declarations: [
    NumbersOnlyDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NumbersOnlyDirective
  ]
})
export class NumberOnlyModule { }
