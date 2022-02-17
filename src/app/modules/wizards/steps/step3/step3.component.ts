import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { MainDeal } from './../../models/main-deal.model';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
})
export class Step3Component implements OnInit {
  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;
  form: FormGroup;
  @Input() deal: Partial<MainDeal>;

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, private modalService: NgbModal) {}

  openVerticallyCentered(content: any) {
    this.modalService.open(content, { centered: true });
  }

  ngOnInit() {
    // this.initForm();
    // this.updateParentModel({}, this.checkForm());
  }



  // initForm() {
  //   this.form = this.fb.group({
  //     businessName: [this.defaultValues.businessName, [Validators.required]],
  //     businessDescriptor: [
  //       this.defaultValues.businessDescriptor,
  //       [Validators.required],
  //     ],
  //     businessType: [this.defaultValues.businessType, [Validators.required]],
  //     businessDescription: [this.defaultValues.businessDescription],
  //     businessEmail: [
  //       this.defaultValues.businessEmail,
  //       [Validators.required, Validators.email],
  //     ],
  //   });

  //   const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
  //     this.updateParentModel(val, this.checkForm());
  //   });
  //   this.unsubscribe.push(formChangesSubscr);
  // }

  // checkForm() {
  //   return !(
  //     this.form.get('businessName')?.hasError('required') ||
  //     this.form.get('businessDescriptor')?.hasError('required') ||
  //     this.form.get('businessType')?.hasError('required') ||
  //     this.form.get('businessEmail')?.hasError('required') ||
  //     this.form.get('businessEmail')?.hasError('email')
  //   );
  // }

  // ngOnDestroy() {
  //   this.unsubscribe.forEach((sb) => sb.unsubscribe());
  // }
}
