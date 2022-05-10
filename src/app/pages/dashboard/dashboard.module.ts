import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableSkeletonModule } from '@components/table-skeleton/table-skeleton.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WidgetsModule } from '../../_metronic/partials';
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
    NgbModule
  ],
})
export class DashboardModule {}
