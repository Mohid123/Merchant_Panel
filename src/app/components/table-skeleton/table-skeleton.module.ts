import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableSkeletonComponent } from './table-skeleton/table-skeleton.component';

@NgModule({
  declarations: [TableSkeletonComponent],
  imports: [
    CommonModule
  ],
  exports: [TableSkeletonComponent]
})
export class TableSkeletonModule {}
