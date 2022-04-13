import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';
import { CalendarViewComponent } from './components/calendar-view/calendar-view.component';
import { ListViewComponent } from './components/list-view/list-view.component';
import { CreateDealsComponent } from './create-deals/create-deals.component';
import { DealsRoutingModule } from './deals-routing.module';
import { DealsComponent } from './deals/deals.component';
import { ViewDealsComponent } from './view-deals/view-deals.component';



@NgModule({
  declarations: [
    DealsComponent,
    CreateDealsComponent,
    ViewDealsComponent,
    ListViewComponent,
    CalendarViewComponent
  ],
  imports: [
    CommonModule,
    DealsRoutingModule,
    InlineSVGModule,
    FullCalendarModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbTooltipModule,
    FullCalendarModule,
    FormsModule,
    CKEditorModule
  ],
  exports: [
    CalendarViewComponent
  ]
})
export class DealsModule { }
