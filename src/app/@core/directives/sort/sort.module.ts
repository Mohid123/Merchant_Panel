import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SortDirective } from './sort.directive';



@NgModule({
  declarations: [
    SortDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SortDirective
  ]
})
export class SortModule { }
