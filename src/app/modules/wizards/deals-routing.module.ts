import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanActivateGuard } from '../auth/services/can-activate.guard';
import { CreateDealComponent } from './create-deal/create-deal.component';
import { VerticalComponent } from './vertical/vertical.component';
import { ViewDealComponent } from './view-deal/view-deal.component';
import { WizardsComponent } from './wizards.component';

const routes: Routes = [
  {
    path: '',
    component: WizardsComponent,
    children: [
      {
        path: 'create-deal',
        component: CreateDealComponent,
      },
      {
        path: 'vertical',
        component: VerticalComponent,
      },
      {
        path: 'view-deal',
        component: ViewDealComponent,
        canActivate: [CanActivateGuard]
      },
      // {
      //   path: 'preview-deal/:dealId',
      //   component: PreviewDealComponent,
      //   canActivate: [CanActivateGuard]
      // },
      { path: '', redirectTo: 'horizontal', pathMatch: 'full' },
      { path: '**', redirectTo: 'horizontal', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DealsRoutingModule {}
