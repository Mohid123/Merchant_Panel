import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SubDeal } from '../../models/subdeal.model';
import { whitespaceValidator } from '../../whitespace.validator';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
})
export class Step2Component implements OnInit {

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

  constructor(private fb: FormBuilder, private modalService: NgbModal, private connection: ConnectionService) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response
    })
  }

  openVerticallyCentered(content: any) {
    this.modalService.open(content, { centered: true });
  }

  ngOnInit() {
    this.initSubDealForm();
    this.updateParentModel({}, true);
  }

  get f() {
    return this.subDealForm.controls;
  }

  calculateDiscount() {
    const discountPrice = Math.round(100 * (parseInt(this.subDealForm.get('dealPrice')?.value)/parseInt(this.subDealForm.get('originalPrice')?.value)));
    this.subDealForm.get('discount')?.setValue(discountPrice)
    this.subDeals.push(this.subDealForm.value);
    this.subDealForm.reset();
  }

  deleteDeal() {
    this.subDeals = [];
  }

  numberOnly(event:any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
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
            Validators.maxLength(30),
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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
  }
}
