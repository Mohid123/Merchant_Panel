import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SubDeal } from '../../models/subdeal.model';
import { whitespaceValidator } from '../../whitespace.validator';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { ModalReusableComponent } from './../../../../pages/modal-reusable/modal-reusable.component';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
})
export class Step2Component implements OnInit {

  @ViewChild('modal') private modal: ModalReusableComponent;

  public modalConfig: ModalConfig = {
    onDismiss: () => {
      return true
    },
    dismissButtonLabel: "Dismiss",
    onClose: () => {
      return true
    },
    closeButtonLabel: "Close"
  }

  @Input('updateParentModel') updateParentModel: (
    part: Partial<SubDeal>,
    isFormValid: boolean
  ) => void;
  subDealForm: FormGroup;

  reciever: Subscription;
  data: MainDeal

  @Input() deal: Partial<SubDeal> = {
    originalPrice: '',
    dealPrice: '',
    description: '',
    numberOfVouchers: '',
    subtitle: '',
    discount: 0
  };

  subDeals: SubDeal[] = [];

  @Input() mainDeal: Partial<MainDeal>

  public discount: number;

  private unsubscribe: Subscription[] = [];

  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(private fb: FormBuilder, private connection: ConnectionService) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response
    })
  }

  ngOnInit() {
    this.initSubDealForm();
    this.updateParentModel({}, true);
  }

  get f() {
    return this.subDealForm.controls;
  }

  calculateDiscount() {
    const dealPrice = Math.round(parseInt(this.subDealForm.get('originalPrice')?.value) - parseInt(this.subDealForm.get('dealPrice')?.value));
    const discountPrice = Math.round(100 * dealPrice/parseInt(this.subDealForm.get('originalPrice')?.value));
    this.subDealForm.get('discount')?.setValue(discountPrice)
    this.subDeals.push(this.subDealForm.value);
    this.subDealForm.reset();
  }

  deleteDeal() {
    this.subDeals = [];
  }

  initSubDealForm() {
    this.subDealForm = this.fb.group({
      originalPrice: [
        this.deal.originalPrice,
        Validators.compose([
          Validators.required,
          Validators.maxLength(5)
        ]),
      ],
      dealPrice: [
        this.deal.dealPrice,
        Validators.compose([
          Validators.required,
          Validators.maxLength(5)
        ]),
      ],
      description: [
        this.deal.description,
        Validators.compose([
          Validators.required,
          Validators.minLength(14),
          Validators.maxLength(200),
          Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
        ]),
        [whitespaceValidator]
      ],
      numberOfVouchers: [
        this.deal.numberOfVouchers,
        Validators.compose([
          Validators.required,
          Validators.maxLength(5)
        ])
      ],
      subtitle: [
        this.deal.subtitle,
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(60),
            Validators.pattern('^[a-zA-Z \-\']+')
          ]),
          [whitespaceValidator]
        ],
        discount: [
          this.deal.discount
        ]
    });

    const formChangesSubscr = this.subDealForm.valueChanges.subscribe((val) => {
      this.updateParentModel(val, true);
      this.isCurrentFormValid$.next(this.checkForm());
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(
      this.subDealForm.get('originalPrice')?.hasError('required') ||
      this.subDealForm.get('dealPrice')?.hasError('required') ||
      this.subDealForm.get('description')?.hasError('required') ||
      this.subDealForm.get('description')?.hasError('minlength') ||
      this.subDealForm.get('subtitle')?.hasError('required')
    );
  }

  handleMinus() {
    if(this.subDealForm.controls['numberOfVouchers'].value >= 1) {
      this.subDealForm.patchValue({
        numberOfVouchers: this.subDealForm.controls['numberOfVouchers'].value - 1
      });
    }
  }

  handlePlus() {
    this.subDealForm.patchValue({
      numberOfVouchers: this.subDealForm.controls['numberOfVouchers'].value + 1
    });
  }

  async openNew() {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
  }
}
