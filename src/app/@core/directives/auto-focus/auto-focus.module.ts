import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AutoFocus } from './auto-focus.directive';



@NgModule({
  declarations: [
    AutoFocus
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AutoFocus
  ]
})
export class AutoFocusModule { }
