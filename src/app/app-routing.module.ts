import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedeemCrmVoucherComponent } from './CRM/redeem-crm-voucher/redeem-crm-voucher.component';
import { AuthGuard } from './modules/auth/services/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    // canActivate: [CanActivateGuard],
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./modules/errors/errors.module').then((m) => m.ErrorsModule),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./_metronic/layout/layout.module').then((m) => m.LayoutModule),
  },
  { path: 'editDeal/:dealId',
    loadChildren: () => import('./CRM/deal-crm/deal-crm.module').then(m => m.DealCRMModule)
  },
  { path: 'redeemVoucher/:voucherId',
    component: RedeemCrmVoucherComponent
  },
  { path: '**', redirectTo: 'error/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
