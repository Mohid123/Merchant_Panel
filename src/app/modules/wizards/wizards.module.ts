import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NumberOnlyModule } from '@core/directives/number-only/number-only.module';
import { TimeformatePipe } from '@core/pipes/timeformate.pipe';
// import { SortModule } from '@core/directives/sort/sort.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';
import { TrimModule } from './../../@core/directives/trim/trim.module';
import { TruncatePipe } from './../../@core/pipes/truncate.pipe';
import { TableSkeletonModule } from './../../components/table-skeleton/table-skeleton.module';
import { ReusableModalModule } from './../../_metronic/layout/components/reusable-modal/reusable-modal.module';
import { HorizontalComponent } from './horizontal/horizontal.component';
import { Step1Component } from './steps/step1/step1.component';
import { Step2Component } from './steps/step2/step2.component';
import { Step3Component } from './steps/step3/step3.component';
import { Step4Component } from './steps/step4/step4.component';
import { Step5Component } from './steps/step5/step5.component';
import { VerticalComponent } from './vertical/vertical.component';
import { PopoverWrapperComponent, ViewDealComponent } from './view-deal/view-deal.component';
import { WizardsRoutingModule } from './wizards-routing.module';
import { WizardsComponent } from './wizards.component';


FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin
]);

@NgModule({
  declarations: [
    HorizontalComponent,
    VerticalComponent,
    WizardsComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    ViewDealComponent,
    TruncatePipe,
    TimeformatePipe,
    PopoverWrapperComponent
  ],
  imports: [
    CommonModule,
    WizardsRoutingModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbPopoverModule,
    FullCalendarModule,
    FormsModule,
    CKEditorModule,
    TrimModule,
    NumberOnlyModule,
    // SortModule,
    MatTabsModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    NgbModule,
    ReusableModalModule,
    TableSkeletonModule
  ],
  entryComponents: [PopoverWrapperComponent],
})
export class WizardsModule {}
