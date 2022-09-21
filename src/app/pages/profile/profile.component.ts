import { CdkDragDrop, CdkDragEnter, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiResponse } from '@core/models/response.model';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, exhaustMap, takeUntil } from 'rxjs/operators';
import { UrlValidator } from 'src/app/modules/auth/components/registration/url.validator';
import { BusinessHours, initalBusinessHours } from 'src/app/modules/auth/models/business-hours.modal';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { MediaUpload } from './../../@core/models/requests/media-upload.model';
import { PersonalDetail, User } from './../../@core/models/user.model';
import { MediaService } from './../../@core/services/media.service';
import { AuthService } from './../../modules/auth/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  isEditBusinessHours: boolean;
  businessHoursForm: FormGroup;
  businessForm: FormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;

  secondLeftVisible: boolean = true;
  isLeftVisible: boolean = true;
  user: User;
  destroy$ = new Subject();
  urls: any[] = [];
  url: any;
  image: string = '';
  imageBlurHash: string = '';
  file: any;
  singleFile: any
  multiples: any[] = [];
  images: MediaUpload[] = [];
  galleries: any[] = [];
  imagesEditable: boolean = false;
  profileImage: any;
  private unsubscribe: Subscription[] = [];
  uploadingSingleImage: boolean = false;
  uploadingMultipleImages: boolean = false;
  previousValueAboutUs: string;
  previousValueFinePrint: string;

  termsForm: FormGroup = this.fb.group({
    aboutUs: ['',Validators.minLength(40)],
    finePrint: ['',Validators.minLength(40)]
  })

  config: any;
  public Editor = ClassicEditor;
  uploaded: boolean = true;
  aboutUsIsEdited: BehaviorSubject<any> = new BehaviorSubject(false);
  aboutUsIsEdited$: Observable<boolean> = this.aboutUsIsEdited.asObservable();
  finePrintIsEdited: BehaviorSubject<any> = new BehaviorSubject(false);
  finePrintIsEdited$: Observable<boolean> = this.finePrintIsEdited.asObservable();

  change: boolean = false;
  dragIndex: number;
  itemIndex: number;
  boxWidth = 60;
  columnSize: number;
  itemsTable: any;
  dragStarted: boolean = false;
  @ViewChild('dropListContainer') dropListContainer?: ElementRef;
  @ViewChild('rowLayout') rowLayout?: HTMLElement;
  dropListReceiverElement?: HTMLElement;
  dragDropInfo?: {
    dragIndex: number;
    dropIndex: number;
  };

  profileForm: FormGroup = this.fb.group({
    tradeName: ['',
      Validators.compose([
        Validators.required,
      ])
    ],

    streetAddress: ['',
      Validators.compose([
        Validators.required
      ])
    ],

    zipCode: [
      '',
      [
        Validators.compose([
        Validators.required]),
        this.validateZip()
      ]
    ],

    city: ['',
      Validators.compose([
        Validators.required,
      ])
    ],

    googleMapPin: [
      '',
      // [
      //   Validators.compose([
      //   Validators.required]),
      //   this.validateGooglePin()
      // ]
    ],

    website_socialAppLink: ['',
      Validators.compose([
        Validators.required,
      ])
    ],

    profilePicURL: this.image,
    gallery: this.urls
  }
  , {
    validator: UrlValidator('website_socialAppLink'),
  })

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private cf: ChangeDetectorRef,
    private userService: UserService,
    private mediaService: MediaService) {

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
            'indent',
            'outdent',
            'undo',
            'redo'
          ]
        }
      }

      const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
      this.unsubscribe.push(loadingSubscr);

      this.userService.getUser().pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      this.setbusinessHours();
      if(user)
      this.profileForm.patchValue({
        tradeName: user?.personalDetail?.tradeName,
        streetAddress: user?.personalDetail?.streetAddress,
        zipCode: user?.personalDetail?.zipCode,
        city: user?.personalDetail?.city,
        googleMapPin: user?.personalDetail?.googleMapPin,
        website_socialAppLink: user?.website_socialAppLink,
        profilePicURL: user?.profilePicURL
      });
      this.termsForm.patchValue(user);
      this.previousValueAboutUs = this.termsForm.controls['aboutUs']?.value;
      this.previousValueFinePrint = this.termsForm.controls['finePrint']?.value;
      this.urls = [];
      this.urls.push(...user.gallery);
      this.initTable();
      if(this.urls.length > 5) {
        this.urls.pop();
        this.cf.detectChanges();
        this.initTable();
      }

      this.image = user?.profilePicURL;
      this.imageBlurHash = user?.profilePicBlurHash;
   });

   this.termsForm.controls['aboutUs']?.valueChanges
   .pipe(
    debounceTime(600),
    takeUntil(this.destroy$))
   .subscribe((value: string) => {
    if(this.previousValueAboutUs !== value) {
      this.aboutUsIsEdited.next(true);
    }
    else {
      this.aboutUsIsEdited.next(false);
    }
   });

   this.termsForm.controls['finePrint']?.valueChanges
   .pipe(
    debounceTime(600),
    takeUntil(this.destroy$))
   .subscribe((value: string) => {
    if(this.previousValueFinePrint !== value) {
      this.finePrintIsEdited.next(true);
    }
    else {
      this.finePrintIsEdited.next(false);
    }
   })

  }

  discardChanges() {
    this.userService.getUser().pipe(takeUntil(this.destroy$)).subscribe();
    this.isLeftVisible = true;
    this.imagesEditable = false;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      this.setbusinessHours();
      if(user)
      this.profileForm.patchValue({
        tradeName: user?.personalDetail?.tradeName,
        streetAddress: user?.personalDetail?.streetAddress,
        zipCode: user?.personalDetail?.zipCode,
        city: user?.personalDetail?.city,
        googleMapPin: user?.personalDetail?.googleMapPin,
        website_socialAppLink: user?.website_socialAppLink,
        profilePicURL: user?.profilePicURL
      });
      this.image = user?.profilePicURL;
      this.urls = [];
      this.urls.push(...user?.gallery);
      this.initTable();
      if(this.urls.length > 5) {
        this.urls.pop();
        this.cf.detectChanges();
        this.initTable();
      }
      this.termsForm.patchValue(user);
    })
  }

  submitImages() {
    this.uploaded = false;
    const param: any = {
      gallery: this.urls,
      profilePicURL: this.image,
      website_socialAppLink: this.profileForm.value.website_socialAppLink
    }
    this.imagesEditable = false;
    this.userService.updateMerchantprofile(param)
      .pipe(exhaustMap((res: any) => {
        if(!res.hasErrors()) {
          return this.userService.getUser();
        }
        else {
          return (res);
        }
      })).subscribe()
  }

  submitImagesForImageCase() {
    this.uploaded = false;
    const param = {
      gallery: this.urls,
      profilePicURL: this.image
    }
    this.userService.updateMerchantprofile(param).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.toast.success('Profile updated', {
          style: {
            border: '1px solid #65a30d',
            padding: '16px',
            color: '#3f6212',
          },
          iconTheme: {
            primary: '#84cc16',
            secondary: '#064e3b',
          },
        });
        this.uploaded = true;
        this.cf.detectChanges();
        this.isLeftVisible = true;
        this.cf.detectChanges();
        this.imagesEditable = false;
        this.cf.detectChanges();
      }
    })
  }

  submitProfileChanges() {
    const payload: PersonalDetail = {
      tradeName: this.profileForm.value.tradeName,
      streetAddress: this.profileForm.value.streetAddress,
      zipCode: this.profileForm.value.zipCode,
      city: this.profileForm.value.city,
      googleMapPin: this.profileForm.value.googleMapPin
    }
    this.userService.updateLocation(payload)
    .pipe(exhaustMap((res: any) => {
      if(!res.hasErrors()) {
        this.setbusinessHours();
        return this.userService.getUser();
        } else {
          return (res);
        }
    })).subscribe((res: any) => {
      this.profileForm.patchValue({
        tradeName: res?.data?.personalDetail?.tradeName,
        streetAddress: res?.data?.personalDetail?.streetAddress,
        zipCode: res?.data?.personalDetail?.zipCode,
        city: res?.data?.personalDetail?.city,
        googleMapPin: res?.data?.personalDetail?.googleMapPin,
        website_socialAppLink: res?.data?.website_socialAppLink,
        profilePicURL: res?.data?.profilePicURL
      });
      this.toast.success('Profile updated', {
        style: {
          border: '1px solid #65a30d',
          padding: '16px',
          color: '#3f6212',
        },
        iconTheme: {
          primary: '#84cc16',
          secondary: '#064e3b',
        },
      });
      this.isLeftVisible = true;
      this.cf.detectChanges();
      this.uploaded = true;
      this.cf.detectChanges();
    })
  }

  initBusinessForm() {
    this.businessForm = this.fb.group({
      finePrint: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
      validity: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
      purchase: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
      cancellation: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
      extraInfo: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
    })
  }

  onSelectFile(event: any, isImages: boolean) {
    this.file = event.target.files && event.target.files.length;
    const files = event.target? event.target.files : event;
    if(this.urls.length == 5) {
      this.file = 0;
    }
    if (this.file > 0 && this.file < 6) {
      this.imagesEditable = true;
      this.uploadingMultipleImages = true;
      let i: number = 0;
      for (const singlefile of event.target.files) {
        var reader = new FileReader();
        reader.readAsDataURL(singlefile);
        this.images.push(singlefile);
        this.cf.detectChanges();
        i++;
      }
      if(this.images.length > 0) {
        for (let index = 0; index < this.images.length; index++) {
          this.mediaService.uploadMediaOtherThanDeal('profile-images', this.images[index])
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
              this.uploadingMultipleImages = false;
              this.urls.push(...images);
              this.cf.detectChanges();
              this.images = [];
              this.cf.detectChanges();
              if(this.urls.length > 5) {
                this.urls.pop();
                this.cf.detectChanges();
              }
              if(files.length == i) {
                this.initTable();
                this.getItemsTable();
              }
              this.cf.detectChanges();
            }
          });
        }
      }
    }
    else {
      this.toast.error('Upto 5 images are allowed', {
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

  onSelectSingle(event: any) {
    this.uploadingSingleImage = true;
    this.imagesEditable = true;
      this.url = event.target.files && event.target.files.length;
      if (this.url > 0) {
        let i: number = 0;
        for (const singlefile of event.target.files) {
          var reader = new FileReader();
          reader.readAsDataURL(singlefile);
          this.multiples.push(singlefile);
          this.cf.detectChanges();
          i++;
        }
      }
      for (let index = 0; index < this.multiples.length; index++) {
        this.mediaService.uploadMediaOtherThanDeal('profile-image', this.multiples[index]).subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            const result = [res.data];
            const image = result.map((image: any) => {
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

            this.image = image[0].captureFileURL;
            this.authService.UserImage = image[0].captureFileURL;
            this.imageBlurHash = image[0]?.blurHash;
            this.cf.detectChanges();
            this.multiples = [];
            this.uploadingSingleImage = false;
          }
        })
      }
    // }
  }

  onClick(event: any) {
    event.target.value = ''
  }

  clearImage() {
    this.image = '';
    this.imageBlurHash = '';
    this.profileImage = '';
    this.authService.UserImage = '';
    this.imagesEditable = true;
  }

  get businessHoursFromControl() {
    // console.log('this.businessHoursForm:',this.businessHoursForm);
    return this.businessHoursForm.controls["businessHours"] as FormArray;
  }

  editBusinessHours(){
    this.isEditBusinessHours = true;
    for (let i = 0; i < 7; i++) {
      this.businessHoursFromControl.controls.forEach(control => {
        control.enable();
      })
    }
  }

  discardBusinessHours() {
    this.isEditBusinessHours = false;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      this.setbusinessHours();
      if(user)
      this.profileForm.patchValue(user);
      this.termsForm.patchValue(user);
    })
  }

  setbusinessHours() {
    this.businessHoursForm = this.fb.group({
      id: [''],
      businessHours: this.fb.array( [])
    });
   const businessHours = !!this.user?.businessHours?.length ? this.user?.businessHours : initalBusinessHours;
   this.businessHoursForm.controls['id'].setValue(this.user?.id);

    businessHours?.forEach(businessHour => {
     this.addBusinessHour(businessHour)
    })
  }

  addBusinessHour(businessHour:BusinessHours) {
    const businessHoursGroup = this.fb.group({
      day: [''],
      firstStartTime: [''],
      firstEndTime: [''],
      secondStartTime: [''],
      secondEndTime: [''],
      isWorkingDay: true,
    });
    businessHoursGroup.disable();
    businessHoursGroup.patchValue(businessHour)
    this.businessHoursFromControl.push(businessHoursGroup);
    // console.log('this.businessHoursFromControl:',this.businessHoursFromControl);
  }

  saveBusinessHours() {
    // if(!this.validateBusinessHours()) {

    //   return;
    // }
    // if(this.validateBusinessHours()) {

      this.isLoading$.next(true);
      this.userService.updateBusinessHours(this.businessHoursForm.value).pipe(exhaustMap((res:any) => {

        if(!res.hasErrors()) {
          return this.userService.getUser();
        } else {
          return (res);
        }
      })).subscribe((res:any) => {
        this.isLoading$.next(false);
        this.isEditBusinessHours = false;
        this.toast.success('Business hours saved');
      },(error => {
        this.isLoading$.next(false);
        this.toast.error(error);
        this.isEditBusinessHours = false;
      }));
  // } else {
  //   this.toast.warning('Enter business hours')
    // }
  }

  saveAboutUs() {
    // if(!this.validateBusinessHours()) {
    //   this.toast.warning('Please fill in all open fields');
    //   return;
    // }
    // else {
      this.userService.updateMerchantprofile({aboutUs: this.termsForm.get('aboutUs')?.value})
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.previousValueAboutUs = '';
          this.isLoading$.next(false);
          this.aboutUsIsEdited.next(false);
          this.toast.success('Data saved')
        }
      },(error=> {
        this.isLoading$.next(false);
        this.toast.error(error);
        this.aboutUsIsEdited.next(false);
      }));
    // }

  }

  saveFinePrint() {
    // if(!this.validateBusinessHours()) {
    //   this.toast.warning('Please fill in all open fields');
    //   return;
    // }
    // else {
      this.userService.updateMerchantprofile({finePrint: this.termsForm.get('finePrint')?.value})
      .pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.previousValueFinePrint = this.termsForm.get('finePrint')?.value;
          this.isLoading$.next(false);
          this.finePrintIsEdited.next(false);
          this.toast.success('Data saved')
        }
      },(error=> {
        this.isLoading$.next(false);
        this.toast.error(error);
        this.finePrintIsEdited.next(false);
      }));
    // }

  }

  validateBusinessHours() {
    let valid = true;
    this.businessHoursForm.value?.businessHours?.forEach((businessHours:BusinessHours) => {
      if(valid && !businessHours.isWorkingDay || (
          businessHours.firstStartTime.length &&
          businessHours.firstEndTime.length &&
          businessHours.secondStartTime.length &&
          businessHours.secondEndTime.length)){
          }
          else {
            valid = false;
          }
    })
    return valid;
  }

  validateZip(): {[key: string]: any} | null  {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value && control.value.toString().length !== 4) {
        return { 'zipInvalid': true };
      }
      return null;
    }
  }

  validateGooglePin(): {[key: string]: any} | null {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const http = 'http';
      const https = 'https';
      const www = 'www';
      const pattern = '[a-z]+\\.[a-z]{2,4}$';
      if(!control.value.startsWith(http) && !control.value.startsWith(https) && !control.value.startsWith(www) || !control.value.match(pattern)) {
        return { 'invalidPin': true}
      }
      return null;
    }
  }

  dragEntered(event: CdkDragEnter<any>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    this.dragDropInfo = { dragIndex, dropIndex };

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');

    if (phElement) {
      phContainer.removeChild(phElement);
      phContainer.parentElement?.insertBefore(phElement, phContainer);

      moveItemInArray(this.urls, dragIndex, dropIndex);
    }
  }

  dragMoved(event: CdkDragMove<any>) {
    if (!this.dropListContainer || !this.dragDropInfo) return;

    const placeholderElement =
      this.dropListContainer.nativeElement.querySelector(
        '.cdk-drag-placeholder'
      );

    const receiverElement =
      this.dragDropInfo.dragIndex > this.dragDropInfo.dropIndex
        ? placeholderElement?.nextElementSibling
        : placeholderElement?.previousElementSibling;

    if (!receiverElement) {
      return;
    }

    receiverElement.style.display = 'none';
    this.dropListReceiverElement = receiverElement;
  }

  dragDropped(event: CdkDragDrop<any>) {
    if (!this.dropListReceiverElement) {
      return;
    }

    this.dropListReceiverElement.style.removeProperty('display');
    this.dropListReceiverElement = undefined;
    this.dragDropInfo = undefined;
  }

  onDragStarted(index: number): void {
    this.dragStarted = true;
  }

  initTable() {
    this.itemsTable = this.urls
      .filter((_, outerIndex) => outerIndex % this.columnSize == 0) // create outter list of rows
      .map((
        _,
        rowIndex
      ) =>
        this.urls.slice(
          rowIndex * this.columnSize,
          rowIndex * this.columnSize + this.columnSize
        )
      );
      this.cf.detectChanges();
  }

  getItemsTable(forceReset?:any): any[][] {
    document.getElementById('drop-list-main');
    const width  = document.getElementById('drop-list-main')?.clientWidth || 400;
    if(width) {
      const columnSize = Math.floor(width / this.boxWidth);
      if (forceReset || columnSize != this.columnSize) {
        this.columnSize = columnSize;
        this.initTable();
      }
    }
    return this.itemsTable;
  }

  reorderDroppedItem(event: CdkDragDrop<any[]>, index: number) {
    this.dragStarted = false;

    this.change = true;
    if (event.previousContainer.id.includes('DropZone') && event.container.id.includes('DropZone')) {
      if (index == this.dragIndex) { // if same row
        moveItemInArray(
          this.urls,
          (this.columnSize * index) + this.itemIndex,
          (this.columnSize * index) + event.currentIndex
        );
        this.resetonDrop();
      }
      else { // if different row
        moveItemInArray(
          this.urls,
          (this.columnSize * this.dragIndex) + this.itemIndex,
          (this.columnSize * index) + event.currentIndex
        );
      }
      this.resetonDrop();
    }
  }

  drop() {
    this.resetonDrop();
  }

  resetonDrop() {
    this.dragStarted = false;
    this.initTable();
  }

  onDragStartedDropZone(index: number, itemIndex:number) {
    this.dragStarted = true;
    this.dragIndex = index;
    this.itemIndex = itemIndex;
  }

  hasRecivingClass(div:HTMLDivElement) {
    return div.classList.contains('cdk-drop-list-receiving')
  }

  clearImageDrag(j: any, i: any) {
    this.imagesEditable = true;
    if(j == 0) {
    this.urls.splice(i, 1);
  } else {
    this.urls.splice((j * this.columnSize)+i, 1);
    }
    this.getItemsTable(true);
    this.cf.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
