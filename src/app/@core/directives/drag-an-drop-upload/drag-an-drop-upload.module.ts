import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DragAnDropUploadDirective } from './drag-an-drop-upload.directive';



@NgModule({
  declarations: [
    DragAnDropUploadDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DragAnDropUploadDirective
  ]
})
export class DragAnDropUploadModule { }
