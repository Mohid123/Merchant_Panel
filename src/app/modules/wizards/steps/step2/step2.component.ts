import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { MainDeal } from './../../models/main-deal.model';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
})
export class Step2Component implements OnInit {
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
    this.initForm();
    this.updateParentModel({}, true);
  }

  initForm() {
    // this.form = this.fb.group({
    //   accountTeamSize: [
    //     this.defaultValues.accountTeamSize,
    //     [Validators.required],
    //   ],
    //   accountName: [this.defaultValues.accountName, [Validators.required]],
    //   accountPlan: [this.defaultValues.accountPlan, [Validators.required]],
    // });

    // const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
    //   this.updateParentModel(val, this.checkForm());
    // });
    // this.unsubscribe.push(formChangesSubscr);
  }

  // checkForm() {
  //   return !this.form.get('title')?.hasError('required');
  // }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
