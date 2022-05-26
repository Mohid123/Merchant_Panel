import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/modules/auth/components/reset-password/custom-validators';
import { ConfirmedValidator } from 'src/app/modules/auth/components/reset-password/password.validator';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

  passwordHide: boolean = true;

  passForm: FormGroup = this.fb.group({

    oldPass: [
      '',
      Validators.compose([
        Validators.required
      ])
    ],

    password: [
      '',
      Validators.compose([
        CustomValidators.patternValidator(/\d/, {
          hasNumber: true
        }),
        CustomValidators.patternValidator(/[A-Z]/, {
          hasCapitalCase: true
        }),
        CustomValidators.patternValidator(/[a-z]/, {
          hasSmallCase: true
        }),
        CustomValidators.patternValidator(
          /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
          {
            hasSpecialCharacters: true
          }
        ),
        Validators.minLength(8),
        Validators.required
      ])
    ],

    confirmPass: [
      '',
      Validators.compose([
        Validators.required
      ]),
    ],
    }, {
      validator: ConfirmedValidator('password', 'confirmPass')
  })

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  passwordShowHide(): void {
    this.passwordHide = !this.passwordHide;
  }

}
