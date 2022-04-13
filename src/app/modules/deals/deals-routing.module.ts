import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealsComponent } from './deals/deals.component';
import { ViewDealsComponent } from './view-deals/view-deals.component';

const routes: Routes = [
  {
    path: '',
    component: DealsComponent,
    children: [
      // {
      //   path: 'create-new-deal',
      //   component: DealsComponent,
      // },
      {
        path: 'view-deal',
        component: ViewDealsComponent,
      },
      { path: '', redirectTo: 'deals', pathMatch: 'full' },
      { path: '**', redirectTo: 'deals', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DealsRoutingModule { }
