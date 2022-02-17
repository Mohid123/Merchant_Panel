import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarOptions } from '@fullcalendar/angular';
import { Subscription } from 'rxjs';
import { MainDeal } from './../../models/main-deal.model';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
})
export class Step4Component implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth'
  };
  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;
  form: FormGroup;
  @Input() deal: Partial<MainDeal>;

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    this.updateParentModel({}, true);
  }

  initForm() {
    // this.form = this.fb.group({
    //   nameOnCard: [this.defaultValues.nameOnCard, [Validators.required]],
    //   cardNumber: [this.defaultValues.cardNumber, [Validators.required]],
    //   cardExpiryMonth: [
    //     this.defaultValues.cardExpiryMonth,
    //     [Validators.required],
    //   ],
    //   cardExpiryYear: [
    //     this.defaultValues.cardExpiryYear,
    //     [Validators.required],
    //   ],
    //   cardCvv: [this.defaultValues.cardCvv, [Validators.required]],
    //   saveCard: ['1'],
    // });

    // const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
    //   this.updateParentModel(val, this.checkForm());
    // });
    // this.unsubscribe.push(formChangesSubscr);
  }

  // checkForm() {
  //   return !(
  //     this.form.get('nameOnCard')?.hasError('required') ||
  //     this.form.get('cardNumber')?.hasError('required') ||
  //     this.form.get('cardExpiryMonth')?.hasError('required') ||
  //     this.form.get('cardExpiryYear')?.hasError('required') ||
  //     this.form.get('cardCvv')?.hasError('required')
  //   );
  // }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
