import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableDropdownComponent } from './table-dropdown.component';

@NgModule({
  declarations: [TableDropdownComponent],
  imports: [
  CommonModule
  ],
  exports: [TableDropdownComponent]
})
export class TableDropModule {}
