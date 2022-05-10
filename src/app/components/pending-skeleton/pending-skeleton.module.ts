import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PendingSkeletonComponent } from './pending-skeleton.component';

@NgModule({
  declarations: [PendingSkeletonComponent],
  imports: [
    CommonModule
  ],
  exports: [PendingSkeletonComponent]
})
export class PendingSkeletonModule {}
