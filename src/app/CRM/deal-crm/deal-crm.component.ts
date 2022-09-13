import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiResponse } from '@core/models/response.model';
import { MediaService } from '@core/services/media.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { GreaterThanValidator } from 'src/app/modules/wizards/greater-than.validator';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import { ConnectionService } from 'src/app/modules/wizards/services/connection.service';
import SwiperCore, { FreeMode, Navigation, Thumbs } from 'swiper';
import { AuthCredentials } from './../../@core/models/auth-credentials.model';
import { DealService } from './../../@core/services/deal.service';
import { AuthService } from './../../modules/auth/services/auth.service';

SwiperCore.use([FreeMode, Navigation, Thumbs]);
@Component({
  selector: 'app-deal-crm',
  templateUrl: './deal-crm.component.html',
  styleUrls: ['./deal-crm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DealCRMComponent implements OnInit, OnDestroy {

  crmForm: FormGroup;
  editVouchers: FormGroup;
  signInForm: FormGroup;
  media: any[] = [];
  thumbsSwiper: any;
  urls: any[] = [];
  imageArray: any[] = [];
  subDeals: any[] = [];
  uploaded: boolean = true;

  config: any;
  public Editor = ClassicEditor;
  title = 'General Spa admission for one';
  passwordHide: boolean = true;
  isLoggedIn: boolean;
  file: any;
  @ViewChild('modal') private modal: TemplateRef<any>;
  @ViewChild('modal2') private modal2: TemplateRef<any>;
  dealID: string;
  voucherID: string;
  voucherIndex: number;
  dealData: MainDeal;
  destroy$ = new Subject();
  userData: BehaviorSubject<any> = new BehaviorSubject({});
  userData$ = this.userData.asObservable();

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private cf: ChangeDetectorRef,
    private mediaService: MediaService,
    private toast: HotToastService,
    private activatedRoute : ActivatedRoute,
    private dealService: DealService,
    private authService: AuthService,
    private conn: ConnectionService
    ) {
      this.dealID = this.activatedRoute.snapshot.params['dealId'];
      this.conn.dealIDServerErrorInterceptor.next(this.dealID);

    }

  ngOnInit(): void {
    if(this.authService.CrmToken) {
      if(this.authService.crmUserSubject.value?.role == 'Admin') {
        this.isLoggedIn = true;
        this.userData.next(this.authService.crmUserSubject.value)
      }
      else {
        this.isLoggedIn = false;
        this.userData.next({});
      }
    }
    else {
      this.isLoggedIn = false;
      this.userData.next({});
    }
    this.initCRMForm();
    this.initEditVocuhers();
    this.initSignInForm();
    this.getDealByID();
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
  }

  getDealByID() {
    if(this.dealID) {
      this.dealService.getDealByID(this.dealID).subscribe((res: ApiResponse<MainDeal>) => {
        if(!res.hasErrors()) {
          this.dealData = res.data;
          this.imageArray = [];
          this.imageArray.push(...this.dealData.mediaUrl);
          if(this.imageArray.length > 10) {
            this.imageArray.pop();
            this.cf.detectChanges();
          }
          this.crmForm.patchValue({
            dealTitle: this.dealData.dealHeader,
            dealSubTitle: this.dealData.subTitle,
            highlights: this.dealData.highlights,
            aboutThisDeal: this.dealData.aboutThisDeal,
            readMore: this.dealData.readMore,
            finePrints: this.dealData.finePrints
          });
          this.subDeals = this.dealData.subDeals;
          this.cf.detectChanges();
        }
      })
    }
  }

  initCRMForm() {
    this.crmForm = this.fb.group({
      dealTitle: [{value: '', disabled: this.isLoggedIn == false}, Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9., ]+')
        ]),
      ],
      dealSubTitle: [{value: '', disabled: this.isLoggedIn == false}, Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9., ]+')
        ])
      ],
      mediaURL: this.imageArray,
      // highlights: [
      //   {value: '', disabled: this.isLoggedIn == false},
      //   Validators.compose([
      //     Validators.required,
      //     Validators.pattern('^[a-zA-Z0-9., ]+')
      //   ]),
      // ],
      aboutThisDeal: [
        {value: '', disabled: this.isLoggedIn == false},
        Validators.compose([
          Validators.required
        ]),
      ],
      readMore: [
        {value: '', disabled: this.isLoggedIn == false},
        // Validators.compose([
        //   Validators.required
        // ]),
      ],
      finePrints: [
        {value: '', disabled: this.isLoggedIn == false},
        // Validators.compose([
        //   Validators.required
        // ]),
      ]
    })
  }

  initEditVocuhers() {
    this.editVouchers = this.fb.group({
      originalPrice: [
        '',
        Validators.compose([
        Validators.required,
        ]),
      ],
      dealPrice: [
        ''
      ],
      numberOfVouchers: [
        '0',
        Validators.compose([
        Validators.required,
        Validators.min(1)
        ])
      ],
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9,-: ]+')
        ])
      ],
      discountPercentage: [
        0
      ]
      }, {
        validator: GreaterThanValidator('originalPrice', 'dealPrice')
    })
  }

  initSignInForm() {
    this.signInForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          Validators.minLength(3),
          Validators.maxLength(320),
        ]),
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
        ]),
      ]
    })
  }

  get f() {
    return this.crmForm.controls;
  }

  textLength (body:string) {
    var regex = /(<([^>]+)>)/ig;
    var result = body?.replace(regex, "");
    return result?.length;
  }

  openModal(index: number) {
    this.voucherIndex = index;
    this.voucherID = this.subDeals[index]?._id;
    this.editVouchers.patchValue({
      originalPrice: this.subDeals[index]?.originalPrice,
      dealPrice: this.subDeals[index]?.dealPrice,
      numberOfVouchers: this.subDeals[index]?.numberOfVouchers,
      title: this.subDeals[index]?.title,
      discountPercentage: this.subDeals[index]?.discountPercentage
    })
    return this.modalService.open(this.modal, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  updateVouchers() {
    if(this.editVouchers.invalid) {
      this.editVouchers.markAllAsTouched();
      return;
    }
    else {
      if (parseInt(this.editVouchers.controls['dealPrice']?.value) >= 0) {
        if(parseInt(this.editVouchers.controls['dealPrice']?.value) == 0 && parseInt(this.editVouchers.controls['originalPrice']?.value) == 0) {
          this.editVouchers.controls['discountPercentage']?.setValue('0');
        }
        else {
          const dealPrice = Math.round(parseInt(this.editVouchers.controls['originalPrice']?.value) - parseInt(this.editVouchers.controls['dealPrice']?.value));
          const discountPrice = Math.floor(100 * dealPrice/parseInt(this.editVouchers.controls['originalPrice']?.value));
          this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
        }
      }
      else if(!parseInt(this.editVouchers.controls['dealPrice']?.value)) {
        const discountPrice = 100;
        this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
      }
      else {
        this.editVouchers.controls['dealPrice']?.setValue('0');
        const dealPrice = Math.round(parseInt(this.editVouchers.controls['originalPrice']?.value) - parseInt(this.editVouchers.controls['dealPrice']?.value));
        const discountPrice = Math.floor(100 * dealPrice/parseInt(this.editVouchers.controls['originalPrice']?.value));
        this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
      }
    }

    const payload : any = {
      _id: this.voucherID,

      originalPrice: this.editVouchers.get('originalPrice')?.value,
      dealPrice: this.editVouchers.get('dealPrice')?.value,
      numberOfVouchers: this.editVouchers.get('numberOfVouchers')?.value,
      title: this.editVouchers.get('title')?.value,
      discountPercentage: this.editVouchers.get('discountPercentage')?.value
    }
    this.subDeals[this.voucherIndex] = payload;
    this.closeModal()
    // if(payload) {
    //   this.dealService.updateVoucher(this.voucherID, payload).subscribe((res: ApiResponse<any>) => {
    //     if(!res.hasErrors()) {
    //       console.log(res);
    //       this.closeModal()
    //     }
    //   })
    // }
  }

  closeModal() {
    this.modalService.dismissAll();
    this.editVouchers.reset();
  }

  openSignInModal() {
    return this.modalService.open(this.modal2, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeSignInModal() {
    this.signInForm.reset();
    this.modalService.dismissAll();
  }

  logInAsAdmin() {
    this.authService.loginAsAdmin((<AuthCredentials>this.signInForm.value))
    .pipe(first(), takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res != null) {
        this.isLoggedIn = true;
        this.userData.next(res.data);
        this.crmForm.enable();
        this.closeSignInModal();
      }
      else {
        this.toast.error('This user is not an admin');
        this.closeSignInModal();
      }
    })
  }

  saveChanges() {
    if(this.crmForm.invalid) {
      this.crmForm.markAllAsTouched();
      return
    }
    else {
      // this.isLoggedIn = false;
      this.uploaded = false;
      this.dealData.dealHeader = this.crmForm.get('dealTitle')?.value;
      this.dealData.subTitle = this.crmForm.get('dealSubTitle')?.value;
      this.dealData.highlights = this.crmForm.get('highlights')?.value;
      this.dealData.aboutThisDeal = this.crmForm.get('aboutThisDeal')?.value;
      this.dealData.finePrints = this.crmForm.get('finePrints')?.value;
      this.dealData.readMore = this.crmForm.get('readMore')?.value;
      this.dealData.mediaUrl = this.imageArray;
      this.dealData.subDeals = this.subDeals;
      this.dealService.createDealCrm(this.dealData).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.getDealByID();
          this.uploaded = true;
          this.toast.success('Deal updated successfully');
        }
      })
      // this.crmForm.disable();
    }
  }

  editHandlePlus() {
    this.editVouchers.patchValue({
      numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value) + 1
    });
  }

  editHandleMinus() {
    if(this.editVouchers.controls['numberOfVouchers'].value >= 1) {
      this.editVouchers.patchValue({
        numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value) - 1
      });
    }
  }

  passwordShowHide(): void {
    this.passwordHide = !this.passwordHide;
  }

  clearImage(index: number) {
    this.imageArray.splice(index, 1);
  }

  onClick(event: any) {
    event.target.value = ''
  }

  onSelectFile(event: any) {
    const files = event.target? event.target.files : event;
    this.file = files && files.length;
    if(this.file > 0 && this.file < 11) {

      let i: number = 0;
      for (const singlefile of files) {
        var reader = new FileReader();
        reader.readAsDataURL(singlefile);
        this.urls.push(singlefile);
        this.cf.detectChanges();
        i++;
      }
      if(this.urls.length > 0) {
        for (let index = 0; index < this.urls.length; index++) {

          this.mediaService.uploadMedia('profile-images', this.urls[index])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: ApiResponse<any>) => {

            if(!res.hasErrors()) {
              const result = [res.data];
              let images: Array<any> = [];

              images = result.map((image: any) => {
                return {
                  type: 'Image',
                  captureFileURL: image.url,
                  path: image.path,
                  thumbnailURL: '',
                  thumbnailPath: '',
                  blurHash: '',
                  backgroundColorHex: ''
                }
              });

              this.imageArray.push(...images);

              this.cf.detectChanges();
              this.urls = [];
              this.cf.detectChanges();
              if(this.imageArray.length > 10) {
                this.imageArray.pop();
                this.cf.detectChanges();
                this.toast.error('Upto 10 images are allowed', {
                  style: {
                    border: '1px solid #713200',
                    padding: '16px',
                    color: '#713200',
                  },
                  iconTheme: {
                    primary: '#713200',
                    secondary: '#FFFAEE',
                  }
                })
              }
            }
          });
        }
      }
    }
    else {
      this.toast.error('Please select upto 10 images', {
        style: {
          border: '1px solid #713200',
          padding: '16px',
          color: '#713200',
        },
        iconTheme: {
          primary: '#713200',
          secondary: '#FFFAEE',
        }
      })
    }
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
