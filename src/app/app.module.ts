import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FiltersModule } from '@components/filters/filters.module';
import { PendingSkeletonModule } from '@components/pending-skeleton/pending-skeleton.module';
import { ReusableModalModule } from '@components/reusable-modal/reusable-modal.module';
import { TableSkeletonModule } from '@components/table-skeleton/table-skeleton.module';
import { NumberOnlyModule } from '@core/directives/number-only/number-only.module';
import { SortModule } from '@core/directives/sort/sort.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HotToastModule } from '@ngneat/hot-toast';
import { TranslateModule } from '@ngx-translate/core';
import { TruncationPipe } from '@pages/pipe/truncation.pipe';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgPasswordValidatorModule } from 'ng-password-validator';
import { ClipboardModule } from 'ngx-clipboard';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CoreModule } from './@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PopupModalComponent } from './components/popup-modal/popup-modal.component';
import { ProfileSliderComponent } from './components/profile-slider/profile-slider.component';
import { SliderComponent } from './components/slider/slider.component';
import { BillingsComponent } from './pages/billings/billings.component';
import { BusinessComponent } from './pages/business/business.component';
import { NewReviewsComponent } from './pages/new-reviews/new-reviews.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { SecurityComponent } from './pages/security/security.component';
import { SingleReviewComponent } from './pages/single-review/single-review.component';
import { TestComponent } from './pages/test/test.component';
// import { DealCrmHeaderComponent } from './CRM/deal-crm-header/deal-crm-header.component';

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
    InfiniteScrollModule
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
