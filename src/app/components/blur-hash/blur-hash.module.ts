import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MainBlurHashComponent } from './blur-hash.component';



@NgModule({
  declarations: [
    MainBlurHashComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MainBlurHashComponent
  ]
})
export class BlurHashModule { }
