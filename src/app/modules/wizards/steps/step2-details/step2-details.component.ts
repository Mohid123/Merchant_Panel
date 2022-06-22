import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';

@Component({
  selector: 'app-step2-details',
  templateUrl: './step2-details.component.html',
  styleUrls: ['./step2-details.component.scss']
})
export class Step2DetailsComponent implements OnInit, OnDestroy  {

  config: any;
  public Editor = ClassicEditor

  data: MainDeal;
  destroy$ = new Subject();
  @Output() nextClick = new EventEmitter();
  @Output() prevClick = new EventEmitter();
  @Input() deal: Partial<MainDeal>
  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;

  dealForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private connection: ConnectionService,
  ) { }

  ngOnInit(): void {
    this.initDealForm();
    this.config = {
      placeholder: 'Type your content here...',
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
          'undo',
          'redo'
        ]
      }
    }
  }

  get f() {
    return this.dealForm.controls;
  }

  checkForm() {
    return !(this.dealForm.get('dealHeader')?.hasError('required') ||
    this.dealForm.get('subTitle')?.hasError('required'))
  }

  initDealForm() {
    this.dealForm = this.fb.group({
      highlights: [
        this.deal.highlights,
        Validators.compose([
          Validators.required,
        ]),
      ],
      aboutThisDeal: [
        this.deal.aboutThisDeal,
        Validators.compose([
          Validators.required,
          Validators.minLength(16)
        ]),
      ],
      readMore: [
        this.deal.readMore,
        Validators.compose([
          Validators.required,
          Validators.minLength(16),
        ]),
      ],
      finePrints: [
        this.deal.finePrints,
        Validators.compose([
          Validators.required,
          Validators.minLength(16),
        ]),
      ],
    })

    this.connection.getData().pipe(takeUntil(this.destroy$)).subscribe((response: MainDeal) => {
      this.data = response;
    })

    this.dealForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val: MainDeal) => {

      this.updateParentModel(val, this.checkForm());
      this.connection.sendData({...this.data,...val})
    });
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
