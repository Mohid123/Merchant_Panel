import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { BlurHashModule } from '@components/blur-hash/blur-hash.module';
import { FiltersModule } from '@components/filters/filters.module';
import { MediaProgressModule } from '@components/media-progress/media-progress/media-progress.module';
import { PendingSkeletonModule } from '@components/pending-skeleton/pending-skeleton.module';
import { ReusableModalModule } from '@components/reusable-modal/reusable-modal.module';
import { TableSkeletonModule } from '@components/table-skeleton/table-skeleton.module';
import { AutoFocusModule } from '@core/directives/auto-focus/auto-focus.module';
import { NumberOnlyModule } from '@core/directives/number-only/number-only.module';
import { SortModule } from '@core/directives/sort/sort.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HotToastModule } from '@ngneat/hot-toast';
import { TranslateModule } from '@ngx-translate/core';
import { TruncationPipe } from '@pages/pipe/truncation.pipe';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgPasswordValidatorModule } from 'ng-password-validator';
import { BarRatingModule } from 'ngx-bar-rating';
import { ClipboardModule } from 'ngx-clipboard';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CoreModule } from './@core/core.module';
import { DragAnDropUploadModule } from './@core/directives/drag-an-drop-upload/drag-an-drop-upload.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PopupModalComponent } from './components/popup-modal/popup-modal.component';
import { ProfileSliderComponent } from './components/profile-slider/profile-slider.component';
import { SliderComponent } from './components/slider/slider.component';
import { RedeemCrmVoucherComponent } from './CRM/redeem-crm-voucher/redeem-crm-voucher.component';
import { BillingsComponent } from './pages/billings/billings.component';
import { BusinessComponent } from './pages/business/business.component';
import { NewReviewsComponent } from './pages/new-reviews/new-reviews.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { SecurityComponent } from './pages/security/security.component';
import { SingleReviewComponent } from './pages/single-review/single-review.component';
import { TestComponent } from './pages/test/test.component';

@NgModule({
  declarations: [
    AppComponent,
    OrderManagementComponent,
    BillingsComponent,
    ReviewsComponent,
    SingleReviewComponent,
    SliderComponent,
    TestComponent,
    BusinessComponent,
    ProfileComponent,
    SecurityComponent,
    ProfileSliderComponent,
    NewReviewsComponent,
    TruncationPipe,
    PopupModalComponent,
    RedeemCrmVoucherComponent
    // DealCrmHeaderComponent
  ],
  imports: [
  CoreModule,
    FiltersModule,
    BrowserModule,
    FormsModule,
    FullCalendarModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    ClipboardModule,
    CKEditorModule,
    TableSkeletonModule,
    NgxMaterialTimepickerModule,
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
    SortModule,
    ReusableModalModule,
    ReactiveFormsModule,
    FormsModule,
    NumberOnlyModule,
    PendingSkeletonModule,
    HotToastModule.forRoot(),
    NgPasswordValidatorModule,
    InfiniteScrollModule,
    AutoFocusModule,
    BlurHashModule,
    BarRatingModule,
    MediaProgressModule,
    DragDropModule,
    DragAnDropUploadModule
  ],
  providers: [
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: appInitializer,
    //   multi: true,
    //   deps: [AuthService],
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
