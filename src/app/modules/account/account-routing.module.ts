import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { AccountComponent } from './account.component';
import { BussinessDetailsComponent } from './bussiness-details/bussiness-details.component';
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
        path: 'bussiness-details',
        component: BussinessDetailsComponent,
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
