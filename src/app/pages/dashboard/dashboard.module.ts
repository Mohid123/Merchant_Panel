import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableSkeletonModule } from '@components/table-skeleton/table-skeleton.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgPasswordValidatorModule } from 'ng-password-validator';
import { BarRatingModule } from "ngx-bar-rating";
import { WidgetsModule } from '../../_metronic/partials';
import { ReusableModalModule } from './../../_metronic/layout/components/reusable-modal/reusable-modal.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
  CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    WidgetsModule,
    TableSkeletonModule,
    NgbModule,
    ReusableModalModule,
    ReactiveFormsModule,
    FormsModule,
    NgPasswordValidatorModule,
    BarRatingModule
  ],
})
export class DashboardModule {}
