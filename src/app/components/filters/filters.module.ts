
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FiltersComponent } from './filters.component';



@NgModule({
  declarations: [
    FiltersComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  exports: [
    FiltersComponent
  ]
})
export class FiltersModule { }
