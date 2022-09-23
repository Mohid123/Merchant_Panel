import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MaxLengthModule } from './../../@core/directives/max-length/max-length.module';
import { Step2DetailsComponent } from './steps/step2-details/step2-details.component';
// import { SortModule } from '@core/directives/sort/sort.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FiltersModule } from '@components/filters/filters.module';
import { NumberOnlyModule } from '@core/directives/number-only/number-only.module';
import { TimeformatePipe } from '@core/pipes/timeformate.pipe';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { NgbDateParserFormatter, NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';
import { SwiperModule } from 'swiper/angular';
import { DragAnDropUploadModule } from '../../@core/directives/drag-an-drop-upload/drag-an-drop-upload.module';
import { TrimModule } from '../../@core/directives/trim/trim.module';
import { TruncatePipe } from '../../@core/pipes/truncate.pipe';
import { TableSkeletonModule } from '../../components/table-skeleton/table-skeleton.module';
import { ReusableModalModule } from '../../_metronic/layout/components/reusable-modal/reusable-modal.module';
import { LayoutModule } from '../../_metronic/layout/layout.module';
import { CreateDealComponent } from './create-deal/create-deal.component';
import { DateParserFormatter } from './date-parser-formatter';
import { DealPreviewComponent } from './deal-preview/deal-preview.component';
import { DealsRoutingModule } from './deals-routing.module';
import { SideDrawerComponent } from './side-drawer/side-drawer.component';
import { Step1Component } from './steps/step1/step1.component';
import { Step2Component } from './steps/step2/step2.component';
import { Step3Component } from './steps/step3/step3.component';
import { Step4Component } from './steps/step4/step4.component';
import { VerticalComponent } from './vertical/vertical.component';
import { ViewDealComponent } from './view-deal/view-deal.component';
// import { ViewDealComponent } from './view-deal/view-deal.component';
import { BlurHashModule } from '@components/blur-hash/blur-hash.module';
// import { PreviewDealComponent } from './preview-deal/preview-deal.component';
import { MediaProgressModule } from '@components/media-progress/media-progress/media-progress.module';
import { WizardsComponent } from './wizards.component';



FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin
]);

@NgModule({
  declarations: [
    CreateDealComponent,
    VerticalComponent,
    WizardsComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    // Step5Component,
    Step2DetailsComponent,
    ViewDealComponent,
    TruncatePipe,
    TimeformatePipe,
    // PopoverWrapperComponent,
    SideDrawerComponent,
    DealPreviewComponent,
    // PreviewDealComponent,
  ],
  imports: [
  CommonModule,
    DealsRoutingModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbPopoverModule,
    FullCalendarModule,
    MatProgressSpinnerModule,
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
    TableSkeletonModule,
    CKEditorModule,
    DragDropModule,
    SwiperModule,
    LayoutModule,
    DragAnDropUploadModule,
    MaxLengthModule,
    FiltersModule,
    BlurHashModule,
    MediaProgressModule
  ],
  // entryComponents: [PopoverWrapperComponent],
  providers: [
    { provide: NgbDateParserFormatter, useClass: DateParserFormatter },
  ],
})
export class DealsModule {}
