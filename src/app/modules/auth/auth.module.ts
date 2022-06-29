import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { NumberOnlyModule } from '@core/directives/number-only/number-only.module';
import { SpaceBetweenModule } from '@core/directives/space-between/space-between.module';
import { NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NgPasswordValidatorModule } from 'ng-password-validator';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { TranslationModule } from '../i18n/translation.module';
import { MaxLengthModule } from './../../@core/directives/max-length/max-length.module';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { CategoryRadioButtonComponent } from './components/category-radio-button/category-radio-button.component';
import { CheckboxComponent } from './components/custom-checkbox/checkbox/checkbox.component';
import { CustomCheckboxComponent } from './components/custom-checkbox/custom-checkbox.component';
import { DropDownComponent } from './components/drop-down/drop-down.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SecurityCodeComponent } from './components/security-code/security-code.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    LogoutComponent,
    AuthComponent,
    CategoryRadioButtonComponent,
    SecurityCodeComponent,
    ResetPasswordComponent,
    DropDownComponent,
    CustomCheckboxComponent,
    CheckboxComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslationModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatIconModule,
    MatStepperModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NumberOnlyModule,
    SpaceBetweenModule,
    NgPasswordValidatorModule,
    Ng2TelInputModule,
    NgbPopoverModule,
    MatSelectModule,
    NgbModule,
    MaxLengthModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: true }
    }
  ],
})
export class AuthModule {}
