
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FiltersComponent } from './filters.component';



@NgModule({
  declarations: [
    FiltersComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    InfiniteScrollModule
  ],
  exports: [
    FiltersComponent
  ]
})
export class FiltersModule { }
