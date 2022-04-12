import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import { AccountComponent } from '../account/account.component';
import { ReusableModalModule } from './../../components/reusable-modal/reusable-modal.module';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { AccountRoutingModule } from './account-routing.module';
import { BussinessDetailsComponent } from './bussiness-details/bussiness-details.component';
import { OverviewComponent } from './overview/overview.component';
import { ConnectedAccountsComponent } from './settings/forms/connected-accounts/connected-accounts.component';
import { DeactivateAccountComponent } from './settings/forms/deactivate-account/deactivate-account.component';
import { EmailPreferencesComponent } from './settings/forms/email-preferences/email-preferences.component';
import { NotificationsComponent } from './settings/forms/notifications/notifications.component';
import { ProfileDetailsComponent } from './settings/forms/profile-details/profile-details.component';
import { SignInMethodComponent } from './settings/forms/sign-in-method/sign-in-method.component';
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [
    AccountComponent,
    OverviewComponent,
    SettingsComponent,
    ProfileDetailsComponent,
    ConnectedAccountsComponent,
    DeactivateAccountComponent,
    EmailPreferencesComponent,
    NotificationsComponent,
    SignInMethodComponent,
    AccountDetailsComponent,
    BussinessDetailsComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    InlineSVGModule,
    DropdownMenusModule,
    WidgetsModule,
    ReusableModalModule
  ],
})
export class AccountModule {}
