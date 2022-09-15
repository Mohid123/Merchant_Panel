import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MediaProgressComponent } from './media-progress.component';




@NgModule({
  declarations: [
    MediaProgressComponent,
  ],
  imports: [
    CommonModule,
    MatExpansionModule
  ],
  exports: [
    MediaProgressComponent
  ]
})
export class MediaProgressModule { }
