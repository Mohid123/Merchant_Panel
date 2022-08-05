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
    private connection: ConnectionService,
    private dealService: DealService,
    private common: CommonFunctionsService
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
          'redo',
          'bulletedList',
        ]
      }
    }

    this.editDealData();

    this.reciever = this.connection.getSaveAndNext().subscribe((response: MainDeal) => {
      this.newData = response;
      this.id = response?.id;
    })
  }

  editDealData() {
    this.connection.getStep1().subscribe((res: any) => {
      if((res.dealStatus == 'Draft' || res.dealStatus == 'Needs attention') && res.id) {
        this.editID = res.id;
        this.dealForm.patchValue({
          highlights: res.highlights,
          aboutThisDeal: res.aboutThisDeal,
          readMore: res.readMore,
          finePrints: res.finePrints
        })
      }
    })
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
          Validators.pattern('^[a-zA-Z0-9., ]+')
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

    this.connection.getData().pipe(takeUntil(this.destroy$)).subscribe((response: MainDeal) => {
      this.data = response;
    })

    this.dealForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val: MainDeal) => {
      this.cf.detectChanges();
      this.updateParentModel(val, true);
      this.connection.sendData({...this.data,...val})
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
      this.nextClick.emit('');
      this.connection.isSaving.next(true);
      this.newData.pageNumber = 3;
      const payload = {...this.newData, ...this.dealForm.value};
      this.dealService.createDeal(payload).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.connection.isSaving.next(false);
          this.connection.sendSaveAndNext(res.data);
          // this.connection.sendStep1(res.data)
        }
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
    this.reciever.unsubscribe();
  }

}
