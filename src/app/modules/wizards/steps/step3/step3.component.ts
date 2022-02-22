import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
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

  config: any;

  public Editor = ClassicEditor
  public isDisabled: boolean = true;

  form: FormGroup;

  @Input() deal: Partial<MainDeal> = {
    startDate: Date.toString(),
    endDate: Date.toString(),
    policy: '',
    publishDateStart: Date.toString()
  };

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, private modalService: NgbModal) {}

  openVerticallyCentered(content: any) {
    this.modalService.open(content, { centered: true });
  }

  ngOnInit() {
    this.initDateForm();
    this.updateParentModel({}, this.checkForm());

    this.config = {
      toolbar: {
        styles: [
            'alignLeft', 'alignCenter', 'alignRight', 'full', 'side'
            ],
        items: [
          'heading',
          'fontSize',
          'bold',
          'italic',
          'underline',
          'highlight',
          'alignment',
          'numberedList',
          'bulletedList',
          'indent',
          'outdent',
          'todoList',
          'link',
          'blockQuote',
          'insertTable',
          'undo',
          'redo'
        ]
      }
    }
  }

  disableCheckBox(data: any) {
    if(data == true) {
      this.form.controls['publishDateStart'].enable();
    }
    else {
      this.form.controls['publishDateStart'].disable();
    }
  }

  disableCheckBoxA(data: any) {
    if(data == true) {
      this.form.controls['startDate'].enable();
      this.form.controls['endDate'].enable();
    }
    else {
      this.form.controls['startDate'].disable();
      this.form.controls['endDate'].disable();
    }
  }


  toggleDisabled() {
    this.isDisabled = !this.isDisabled
  }

  initDateForm() {
    this.form = this.fb.group({
      startDate: [
        this.deal.startDate,
        Validators.compose([
          Validators.required
        ])
      ],
      endDate: [
        this.deal.endDate,
        Validators.compose([
          Validators.required
        ])
      ],
      policy: [
        this.deal.policy,
        Validators.compose([
          Validators.required
        ])
      ],
      publishDateStart: [
        this.deal.publishDateStart
      ]
    });

    const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
      this.updateParentModel(val, this.checkForm());
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(
      this.form.get('startDate')?.hasError('required') ||
      this.form.get('endDate')?.hasError('required') ||
      this.form.get('policy')?.hasError('required')
    );
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
