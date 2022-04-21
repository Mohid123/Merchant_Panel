import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReusableModalModule } from '@components/reusable-modal/reusable-modal.module';
import { SortModule } from '@core/directives/sort/sort.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InlineSVGModule } from 'ng-inline-svg';
import { ClipboardModule } from 'ngx-clipboard';
import { environment } from 'src/environments/environment';
import { CoreModule } from './@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TableSkeletonComponent } from './components/table-skeleton/table-skeleton/table-skeleton.component';
import { BillingsComponent } from './pages/billings/billings.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';
// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
import { ReviewsComponent } from './pages/reviews/reviews.component';
// #fake-end#

// function appInitializer(authService: AuthService) {
//   return () => {
//     return new Promise((resolve) => {
//       authService.getUserByToken().subscribe().add(resolve);
//     });
//   };
// }

@NgModule({
  declarations: [AppComponent, OrderManagementComponent, BillingsComponent, TableSkeletonComponent, ReviewsComponent],
  imports: [
    CoreModule,
    BrowserModule,
    FormsModule,
    FullCalendarModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    ClipboardModule,
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
    ReusableModalModule
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
