import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PendingSkeletonModule } from '@components/pending-skeleton/pending-skeleton.module';
import { ReusableModalModule } from '@components/reusable-modal/reusable-modal.module';
import { TableSkeletonModule } from '@components/table-skeleton/table-skeleton.module';
import { NumberOnlyModule } from '@core/directives/number-only/number-only.module';
import { SortModule } from '@core/directives/sort/sort.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HotToastModule } from '@ngneat/hot-toast';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgPasswordValidatorModule } from 'ng-password-validator';
import { ClipboardModule } from 'ngx-clipboard';
import { environment } from 'src/environments/environment';
import { CoreModule } from './@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BillingsComponent } from './pages/billings/billings.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { SingleReviewComponent } from './pages/single-review/single-review.component';
// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
import { SliderComponent } from './components/slider/slider.component';
import { TestComponent } from './pages/test/test.component';
import { BusinessComponent } from './pages/business/business.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SecurityComponent } from './pages/security/security.component';
// #fake-end#

// function appInitializer(authService: AuthService) {
//   return () => {
//     return new Promise((resolve) => {
//       authService.getUserByToken().subscribe().add(resolve);
//     });
//   };
// }

@NgModule({
  declarations: [AppComponent, OrderManagementComponent, BillingsComponent, ReviewsComponent, SingleReviewComponent, SliderComponent, TestComponent, BusinessComponent, ProfileComponent, SecurityComponent],
  imports: [
CoreModule,
    BrowserModule,
    FormsModule,
    FullCalendarModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    ClipboardModule,
    TableSkeletonModule,
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
          passThruUnknownUrl: true,
          dataEncapsulation: false,
        })
      : [],
    // #fake-end#
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
    NgPasswordValidatorModule
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
