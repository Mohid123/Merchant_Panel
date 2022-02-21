import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { AccountComponent } from './account.component';
import { BillingFormComponent } from './billing-form/billing-form.component';
import { BussinessDetailsComponent } from './bussiness-details/bussiness-details.component';
import { ProfileFormDetailsComponent } from './profile-form-details/profile-form-details.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: 'account-details',
        component: AccountDetailsComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'billing-form',
        component: BillingFormComponent,
      },
      {
        path: 'bussiness-details',
        component: BussinessDetailsComponent,
      },
      {
        path: 'profile-details',
        component: ProfileFormDetailsComponent,
      },
      { path: '', redirectTo: 'account-details', pathMatch: 'full' },
      { path: '**', redirectTo: 'account-details', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
