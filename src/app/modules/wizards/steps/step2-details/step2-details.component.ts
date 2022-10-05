import { ViewportScroller } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiResponse } from '@core/models/response.model';
import { User } from '@core/models/user.model';
import { DealService } from '@core/services/deal.service';
import { HotToastService } from '@ngneat/hot-toast';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import { AuthService } from './../../../auth/services/auth.service';
import { ConnectionService } from './../../services/connection.service';

@Component({
  selector: 'app-step2-details',
  templateUrl: './step2-details.component.html',
  styleUrls: ['./step2-details.component.scss']
})
export class Step2DetailsComponent implements OnInit, AfterViewInit, OnDestroy  {

  config: any;
  public Editor = ClassicEditor;
  user: User;

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
    private common: CommonFunctionsService,
    private authService: AuthService,
    private toast: HotToastService,
    viewportScroller: ViewportScroller
  ) {
    viewportScroller.scrollToPosition([0,0]);

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
    });

    this.connection.getData().pipe(take(1), takeUntil(this.destroy$)).subscribe((response: MainDeal) => {
      this.data = response;
      this.connection.sendData(this.data)
    });

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
        if(response.aboutThisDeal) {
          this.dealForm.patchValue({
            aboutThisDeal: response.aboutThisDeal
          })
        }
        if(response.readMore) {
          this.dealForm.patchValue({
            readMore: response.readMore,
          })
        }
        if(response.finePrints) {
          this.dealForm.patchValue({
            finePrints: response.finePrints
          })
        }
        else {
          this.dealForm.patchValue({
            finePrints: this.user?.finePrint
          })
        }
        if(response.subDeals.length > 0) {
          this.data.subDeals = response.subDeals;
          this.connection.sendData(this.data);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.connection.isSavingNext().pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
        if(value == false) {
          this.connection.sendData(this.data)
        }
      })
    })
  }

  get f() {
    return this.dealForm.controls;
  }

  initDealForm() {
    this.dealForm = this.fb.group({
      // highlights: [
      //   this.deal.highlights,
      //   Validators.compose([
      //     Validators.required,
      //     Validators.pattern('^[a-zA-Z0-9.,-:èëéà ]+')
      //   ]),
      // ],
      aboutThisDeal: [
        this.deal.aboutThisDeal,
        Validators.compose([
          Validators.required
        ]),
      ],
      readMore: [
        this.deal.readMore,
        // Validators.compose([
        //   Validators.required
        // ]),
      ],
      finePrints: [
        this.deal.finePrints,
        // Validators.compose([
        //   Validators.required
        // ]),
      ],
    })

    this.dealForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val: MainDeal) => {
      this.cf.detectChanges();
      this.connection.sendData({...this.data, ...val});
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
     || (this.textLength(this.dealForm.get('aboutThisDeal')?.value) > 0 && this.textLength(this.dealForm.get('aboutThisDeal')?.value) < 16)
     || this.textLength(this.dealForm.get('readMore')?.value) > 2000
     || (this.textLength(this.dealForm.get('readMore')?.value) > 0 && this.textLength(this.dealForm.get('readMore')?.value) < 16)
     || this.textLength(this.dealForm.get('finePrints')?.value) > 2000
     || (this.textLength(this.dealForm.get('finePrints')?.value) > 0 && this.textLength(this.dealForm.get('finePrints')?.value) < 16) ) {
      this.dealForm.markAllAsTouched();
      return;
     }
     else {
      this.data.aboutThisDeal = this.dealForm.get('aboutThisDeal')?.value;
      // this.data.highlights = this.dealForm.get('highlights')?.value;
      this.data.finePrints = this.dealForm.get('finePrints')?.value;
      this.data.readMore = this.dealForm.get('readMore')?.value;
      this.connection.sendData(this.data);
      this.connection.sendStep1(this.data);
      this.nextClick.emit('');
      this.connection.isSaving.next(true);
      this.newData.pageNumber = 3;
      this.newData.aboutThisDeal = this.dealForm.get('aboutThisDeal')?.value;
      // this.newData.highlights = this.dealForm.get('highlights')?.value;
      this.newData.finePrints = this.dealForm.get('finePrints')?.value;
      this.newData.readMore = this.dealForm.get('readMore')?.value;
      this.newData.subDeals.forEach((subdeal: any) => {
        subdeal.originalPrice = parseFloat(subdeal.originalPrice.toString().replace(',' , '.'));
        subdeal.dealPrice = parseFloat(subdeal.dealPrice.toString().replace(',' , '.'));
      });
      return new Promise((resolve, reject) => {
        const payload = this.newData;

        const payloadWithoutMedia: any = this.newData;
        delete payloadWithoutMedia.mediaUrl;
        this.dealService.createDeal(payloadWithoutMedia).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.connection.isSavingNextData(false);
            this.connection.sendSaveAndNext(res.data);
            resolve('success');
          }
          else {
            reject('error');
            this.toast.error('Failed to save deal draft');
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
