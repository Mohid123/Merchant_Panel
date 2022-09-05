import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
import { Subject, Subscription } from 'rxjs';
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
  public Editor = ClassicEditor;

  data: MainDeal;
  newData: MainDeal;
  reciever: Subscription;
  secondReciever: Subscription;
  destroy$ = new Subject();
  @Output() nextClick = new EventEmitter();
  @Output() prevClick = new EventEmitter();
  @Input() deal: Partial<MainDeal>
  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;

  dealForm: FormGroup;
  id: string;
  editID: string;

  constructor(
    private cf: ChangeDetectorRef,
    private fb: FormBuilder,
    public connection: ConnectionService,
    private dealService: DealService,
    private common: CommonFunctionsService
  ) {
    this.connection.getData().pipe(takeUntil(this.destroy$)).subscribe((response: MainDeal) => {
      this.data = response;
      console.log(this.data)
    })
  }

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
          'redo',
          'bulletedList',
        ]
      }
    }


    this.connection.getSaveAndNext().subscribe((response: MainDeal) => {
      this.newData = response;
      this.id = response?.id;
      if((response.dealStatus == 'Draft' || response.dealStatus == 'Needs attention') && response.id) {
        if(response.highlights) {
          this.dealForm.patchValue({
            highlights: response.highlights,
            aboutThisDeal: response.aboutThisDeal,
            readMore: response.readMore,
            finePrints: response.finePrints
          })
        }
        if(response.subDeals.length > 0) {
          this.data.subDeals = response.subDeals;
          this.connection.sendData(this.data);
        }
      }
    });
  }

  get f() {
    return this.dealForm.controls;
  }

  initDealForm() {
    this.dealForm = this.fb.group({
      highlights: [
        this.deal.highlights,
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9.,-:éë ]+')
        ]),
      ],
      aboutThisDeal: [
        this.deal.aboutThisDeal,
        Validators.compose([
          Validators.required
        ]),
      ],
      readMore: [
        this.deal.readMore,
        Validators.compose([
          Validators.required
        ]),
      ],
      finePrints: [
        this.deal.finePrints,
        Validators.compose([
          Validators.required
        ]),
      ],
    })

    this.dealForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val: MainDeal) => {
      this.cf.detectChanges();
      this.connection.sendData({...this.data, ...val})
      this.updateParentModel(val, true);
    });
  }

  next() {
    if(this.dealForm.invalid) {
     this.dealForm.markAllAsTouched();
    } else {
      this.nextClick.emit('');
    }
  }

  textLength (body:string) {
    var regex = /(<([^>]+)>)/ig;
    var result = body?.replace(regex, "");
    return result?.length;
  }

  sendDraftData() {
    if(this.dealForm.invalid
     || this.textLength(this.dealForm.get('aboutThisDeal')?.value) > 2000
     || this.textLength(this.dealForm.get('aboutThisDeal')?.value) < 16
     || this.textLength(this.dealForm.get('readMore')?.value) > 2000
     || this.textLength(this.dealForm.get('readMore')?.value) < 16
     || this.textLength(this.dealForm.get('finePrints')?.value) > 2000
     || this.textLength(this.dealForm.get('finePrints')?.value) < 16 ) {
      this.dealForm.markAllAsTouched();
      return;
     }
     else {
      this.data.aboutThisDeal = this.dealForm.get('aboutThisDeal')?.value;
      this.data.highlights = this.dealForm.get('highlights')?.value;
      this.data.finePrints = this.dealForm.get('finePrints')?.value;
      this.data.readMore = this.dealForm.get('readMore')?.value;
      this.connection.sendData(this.data);
      this.connection.sendStep1(this.data);
      this.nextClick.emit('');
      this.connection.isSaving.next(true);
      this.newData.pageNumber = 3;
      this.newData.aboutThisDeal = this.dealForm.get('aboutThisDeal')?.value;
      this.newData.highlights = this.dealForm.get('highlights')?.value;
      this.newData.finePrints = this.dealForm.get('finePrints')?.value;
      this.newData.readMore = this.dealForm.get('readMore')?.value;
      return new Promise((resolve, reject) => {
        const payload = this.newData;
        this.dealService.createDeal(payload).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.connection.isSaving.next(false);
            this.connection.sendSaveAndNext(res.data);
            resolve('success')
          }
        })
      })
    }
  }

  returnToPrevious() {
    this.prevClick.emit('');
    // this.common.deleteDealByID(this.id);
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    // this.reciever.unsubscribe();
  }

}
