import { CdkDragDrop, CdkDragEnter, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { MediaService } from '@core/services/media.service';
import { HotToastService } from '@ngneat/hot-toast';
import { forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { VideoProcessingService } from '../../services/video-to-img.service';
import { MediaUpload } from './../../../../@core/models/requests/media-upload.model';
import { CategoryDetail, SubCategory } from './../../../auth/models/categories-detail.model';
import { CategoryService } from './../../../auth/services/category.service';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
})
export class Step1Component implements OnInit, OnDestroy {
  destroy$ = new Subject();

  @ViewChild('dropListContainer') dropListContainer?: ElementRef;
  @ViewChild('rowLayout') rowLayout?: HTMLElement;

  dropListReceiverElement?: HTMLElement;
  dragDropInfo?: {
    dragIndex: number;
    dropIndex: number;
  };

  data: MainDeal;

  @Output() nextClick = new EventEmitter();
  config: any;
  public Editor = ClassicEditor

  categoryList: Observable<CategoryDetail[]>;
  categoryEdit: any;
  selectedcategory: SubCategory;
  disableCategory: boolean = false;
  metaDisable: boolean = false;
  submitClick: boolean = false;

  ChangeSelectedCategory(newSelectedcategory: SubCategory) {
    if(newSelectedcategory) {
      this.selectedcategory = newSelectedcategory;
      this.dealForm.controls['subCategory'].setValue(newSelectedcategory.subCategoryName);
    }
    else {
      this.disableCategory = false;
    }
  }

  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;

  dealForm: FormGroup;

  @Input() deal: Partial<MainDeal> = {
    subCategory:'',
    dealHeader: '',
    subTitle: '',
    mediaUrl: [''],
    deletedCheck: false
  };

  file: any;
  loadingVideo: boolean = false;
  multiples: any[] = [];
  urls: any[] = [];
  url: any;
  editUrl: any;
  videoFromEdit: any;
  videos: any[] = [];
  videoUrls: any[] = [];
  private unsubscribe: Subscription[] = [];
  control: FormControl
  images: any[] = [];
  media: any[] = [];
  temporaryVideo: any;
  thumbnail: any;
  id: string;
  responseID: string;
  responseVouchers: any[] = [];
  editDealCheck: boolean = false;
  convertedImage: any;
  saveEditDeal: boolean;
  firstSaveData: MainDeal;
  filteredMedia: any;
  showImageSkeleton: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cf: ChangeDetectorRef,
    private router: Router,
    private connection: ConnectionService,
    private categoryService: CategoryService,
    private toast: HotToastService,
    public breakpointObserver: BreakpointObserver,
    private mediaService: MediaService,
    private dealService: DealService,
    private videoService: VideoProcessingService
  ) {
    this.breakpointObserver.observe(['(min-width: 1600px)']).pipe(map((result) => result.matches)).subscribe(res => {
      if(res) {
        this.boxWidth = 88;
      } else {
        this.boxWidth = 60;
      }
    });

    this.saveEditDeal = false;
    this.showImageSkeleton = false;
  }

  ngOnInit() {
    this.initDealForm();
    this.updateParentModel({}, this.checkForm());

    this.editDealData();
    this.categoryService.getAllCategoriesDetail(0,0).pipe(take(1)).subscribe((res) => {
      if(!res.hasErrors()){
        const categoryList = res.data.data;
        this.categoryList = of(categoryList);
        this.cf.detectChanges();
      }
    });

    this.connection.getSaveAndNext().subscribe((response: any) => {
      if(response) {
        this.responseID = response?.id;
        this.responseVouchers = response.vouchers;
      }
    })

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
  }

  editDealData() {
    this.connection.getStep1()
    .subscribe((res: any) => {
      if((res.dealStatus == 'Draft' || res.dealStatus == 'Needs attention') && res.id) {
        this.showImageSkeleton = true;
        this.id = res.id;
        this.editDealCheck = true;
        this.saveEditDeal = true;
        this.connection.isEditMode = true;
        this.dealForm.patchValue({
          dealHeader: res.dealHeader,
          subTitle: res.subTitle,
          subCategory: res.subCategory,
          deletedCheck: false
        });
        this.cf.detectChanges();
        res.mediaUrl.filter((image: MediaUpload) => {
          if(image.captureFileURL.endsWith('.mp4')) {
            this.videoFromEdit = image;
            this.editUrl = image.captureFileURL;
            // console.log(this.videoFromEdit)
            this.cf.detectChanges();
            // this.videoService.convertUrlToFile(this.editUrl).then((result) => {
            //   this.media.push(result);
            // })
            // .catch(err => console.log(err));
          }
          else {
            this.videoService.getBase64ImageFromUrl(image.captureFileURL)
            .then((result: any) => {
              this.multiples.push(result);
              this.cf.detectChanges();
              this.initTable();
              this.urls.push(result);
              this.cf.detectChanges();
              this.dealForm.updateValueAndValidity({emitEvent: true});
              this.showImageSkeleton = false;
            })
            .catch(err => console.log(err));

            this.videoService.convertUrlToFile(image.captureFileURL).then((result) => {
              this.media.push(result);
            })
            .catch(err => console.log(err));
          }
        });
        this.categoryEdit = res.subCategory;
        // must remove video before uploading and also convert date timestamps to ngbDateStruct objects
        this.cf.detectChanges();
      }
    })
  }

  openDropDown() {
    this.editDealCheck = false;
  }

  get f() {
    return this.dealForm.controls;
  }

  firstSave() {
    if(this.saveEditDeal == false) {
      const payload: any = {
        subCategory: this.dealForm.get('subCategory')?.value,
        dealHeader: this.dealForm.get('dealHeader')?.value,
        subTitle: this.dealForm.get('subTitle')?.value,
        mediaUrl: [],
        id: this.responseID ? this.responseID : '',
        vouchers: this.responseVouchers ? this.responseVouchers : [],
        deletedCheck: false,
        pageNumber: 1
      }
      debugger
      this.dealService.createDeal(payload).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.firstSaveData = res.data;
          this.connection.sendSaveAndNext(this.firstSaveData)
        }
      })
    }
    else {
      const payload: any = {
        subCategory: this.dealForm.get('subCategory')?.value,
        dealHeader: this.dealForm.get('dealHeader')?.value,
        subTitle: this.dealForm.get('subTitle')?.value,
        mediaUrl: [],
        id: this.id ? this.id : '',
        vouchers: this.responseVouchers ? this.responseVouchers : [],
        deletedCheck: false,
        pageNumber: 1
      }
      this.dealService.createDeal(payload).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.firstSaveData = res.data;
          this.connection.sendSaveAndNext(this.firstSaveData)
        }
      })
    }
  }

  async saveDraftOne() {
    if(this.dealForm.invalid || this.urls.length == 0) {
      this.dealForm.markAllAsTouched();
      this.submitClick = true;
      return
    }
    else {
      switch (this.saveEditDeal) {
        case true:
          this.nextClick.emit('');
          this.connection.isSaving.next(true);
          this.firstSave();
          return new Promise((resolve, reject) => {
            const mediaUpload: Array<Observable<any>> = [];
            if(this.media.length > 0) {
              this.media.forEach((file: any) => {
                mediaUpload.push(this.mediaService.uploadMedia('deal', file));
              });
            }
            forkJoin(mediaUpload)
              .pipe(
                mergeMap((mainResponse:any) => {
                const images = mainResponse.filter((res: any) => {
                  if(!res.data.url.endsWith('mp4')) {
                    return res.data
                  }
                });
                // const videos = mainResponse.filter((res: any) => {
                //   if(res.data.url.endsWith('mp4')) {
                //     return res.data
                //   }
                // });
                if(images.length > 0) {
                  this.firstSaveData.mediaUrl = images.map((image: any) => {
                    return {
                      type: 'Image',
                      captureFileURL: image.data.url,
                      path: image.data.path,
                      thumbnailURL: '',
                      thumbnailPath: '',
                      blurHash: '',
                      backgroundColorHex: ''
                    }
                  });
                  if(this.videoUrls.length > 0) {
                    this.firstSaveData.mediaUrl.push(...this.videoUrls)
                  }
                  else if(this.videoFromEdit) {
                    this.firstSaveData.mediaUrl.push(this.videoFromEdit)
                  }
                }
                // if(videos.length > 0) {
                //   videos.forEach((video: any) => {
                //     this.videoService.convertUrlToFile(video.data.url).then((result) => {
                //       this.videoService.generateThumbnail(result, 'any-image').then(result => {
                //         forkJoin(
                //           this.mediaService.uploadMedia('deal', result)
                //         ).subscribe(response => {
                //
                //           this.firstSaveData.mediaUrl.push(...videos.map((video: any) => {
                //             return {
                //               type: 'Video',
                //               captureFileURL: video.data.url,
                //               path: video.data.path,
                //               thumbnailURL: response[0].data.url,
                //               thumbnailPath: response[0].data.path,
                //               blurHash: '',
                //               backgroundColorHex: ''
                //             }
                //           }));
                //
                //           this.dealService.createDeal(this.firstSaveData).subscribe((res: any) => {
                //
                //             console.log('After Subscription: ', res)
                //           })
                //         })
                //       })
                //     })
                //   })
                // }
                return this.dealService.createDeal(this.firstSaveData);
                })).subscribe((res: any) => {
                if(!res.hasErrors()) {
                  this.connection.isSavingNextData(false);
                  this.cf.detectChanges();
                  this.connection.sendSaveAndNext(res.data);
                  resolve('success')
                }
            })
          });
        case false:
          this.nextClick.emit('');
          this.connection.isSaving.next(true);
          this.firstSave();
          return new Promise((resolve, reject) => {
            const mediaUpload: Array<Observable<any>> = [];
            if(this.media.length > 0) {
              this.media.forEach((file: any) => {
                mediaUpload.push(this.mediaService.uploadMedia('deal', file));
              });
            }
            forkJoin(mediaUpload)
              .pipe(
                mergeMap((mainResponse:any) => {
                const images = mainResponse.filter((res: any) => {
                  if(!res.data.url.endsWith('mp4')) {
                    return res.data
                  }
                });
                // const videos = mainResponse.filter((res: any) => {
                //   if(res.data.url.endsWith('mp4')) {
                //     return res.data
                //   }
                // });
                if(images.length > 0) {
                  this.firstSaveData.mediaUrl = images.map((image: any) => {
                    return {
                      type: 'Image',
                      captureFileURL: image.data.url,
                      path: image.data.path,
                      thumbnailURL: '',
                      thumbnailPath: '',
                      blurHash: '',
                      backgroundColorHex: ''
                    }
                  });
                  if(this.videoUrls.length > 0) {
                    this.firstSaveData.mediaUrl.push(...this.videoUrls)
                  }
                  else if(this.videoFromEdit) {
                    this.firstSaveData.mediaUrl.push(this.videoFromEdit)
                  }
                }
                // if(videos.length > 0) {
                //   videos.forEach((video: any) => {
                //     this.videoService.convertUrlToFile(video.data.url).then((result) => {
                //       this.videoService.generateThumbnail(result, 'any-image').then(result => {
                //         forkJoin(
                //           this.mediaService.uploadMedia('deal', result)
                //         ).subscribe(response => {
                //
                //           this.firstSaveData.mediaUrl.push(...videos.map((video: any) => {
                //             return {
                //               type: 'Video',
                //               captureFileURL: video.data.url,
                //               path: video.data.path,
                //               thumbnailURL: response[0].data.url,
                //               thumbnailPath: response[0].data.path,
                //               blurHash: '',
                //               backgroundColorHex: ''
                //             }
                //           }));
                //           this.dealService.createDeal(this.firstSaveData).subscribe((res: any) => {
                //
                //             console.log('After Subscription: ', res)
                //           })
                //         })
                //       })
                //     })
                //   })
                // }
                return this.dealService.createDeal(this.firstSaveData);
                })).subscribe((res: any) => {
                if(!res.hasErrors()) {
                  this.connection.isSavingNextData(false);
                  this.cf.detectChanges();
                  debugger
                  this.connection.sendSaveAndNext(res.data);
                  resolve('success')
                }
            })
          });
      }
    }
  }

  initDealForm() {
    this.dealForm = this.fb.group({
      subCategory: [
        this.deal.subCategory,
        Validators.compose([
          Validators.required,
        ]),
      ],
      dealHeader: [
        this.deal.dealHeader,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z0-9., ]+')
        ]),
      ],
      subTitle: [
        this.deal.subTitle,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z0-9., ]+')
        ]),
      ],
      mediaUrl: [
        this.urls,
      ],
      deletedCheck: false
    })

    const formChangesSubscr = this.dealForm.valueChanges.subscribe((val: MainDeal) => {
      this.updateParentModel(val, this.checkForm());
      this.connection.sendData(val)
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(this.dealForm.get('dealHeader')?.hasError('required') ||
    this.dealForm.get('subTitle')?.hasError('required'))
  }

  onSelectFile(event: any,isImages:boolean) {
    const files = event.target? event.target.files : event;
    this.file = files && files.length;
    if (!isImages || (this.file > 0 && this.file < 11)) {
      this.images = files;
      this.media.push(...this.images);
      console.log(this.media)
      let i: number = 0;
      for (const singlefile of files) {
        var reader = new FileReader();
        reader.readAsDataURL(singlefile);
        this.cf.detectChanges();
        i++;
        reader.onload = (fileEvent) => {
          const url = (<FileReader>fileEvent.target).result as string;
          if(isImages){
            this.multiples.push(url);
            this.urls.push(url);
            this.cf.detectChanges();
          }
          this.cf.detectChanges();
          // If multple events are fired by user
          if (this.multiples.length > 10) {
            // If multple events are fired by user
            this.multiples.pop();
            this.cf.detectChanges();
            this.urls.pop();
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
          // console.log('this.selectedPlayList.media:',this.multiples);
          if(files.length == i) {
            this.initTable();
            this.getItemsTable();
          }
          this.dealForm.controls['mediaUrl'].setValue(this.urls);
          this.cf.detectChanges();
        };
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

  onSelectVideo(event: any) {
    this.file = event.target.files && event.target.files[0];
    if(+(this.file.size / 1048576).toFixed(2) > 10) {
      this.toast.error('You can upload maximum 10mb file.', {
        style: {
          border: '1px solid #713200',
          padding: '16px',
          color: '#713200',
        },
        iconTheme: {
          primary: '#713200',
          secondary: '#FFFAEE',
        }
      });
      this.loadingVideo = false;
      this.cf.detectChanges();
      return;
    }
    if (this.file) {
      this.temporaryVideo = this.file;
      this.loadingVideo = true;
      this.cf.detectChanges();
      this.mediaService.uploadMedia('deal', this.temporaryVideo).subscribe((res: any) => {
        if(!res.hasErrors()) {
          this.videoService.convertUrlToFile(res.data.url).then((result) => {
            this.videoService.generateThumbnail(result, 'any-image').then((result) => {
              this.thumbnail = result;
            }).finally(() => {
              this.mediaService.uploadMedia('deal', this.thumbnail).subscribe((thumbnailResponse: any) => {
                this.url = thumbnailResponse.data.url
                this.loadingVideo = false;
                this.cf.detectChanges();
                const thumbsArray = [res];
                this.videoUrls = thumbsArray.map((video: any) => {
                  return {
                    type: 'Video',
                    captureFileURL: video.data.url,
                    path: video.data.path,
                    thumbnailURL: thumbnailResponse.data.url,
                    thumbnailPath: thumbnailResponse.data.path,
                    blurHash: '',
                    backgroundColorHex: ''
                  }
                })
                console.log(this.videoUrls)
              })
            })
          })
        }
      });
      // this.media.push(this.temporaryVideo)
      this.cf.detectChanges();
      var reader = new FileReader();
      reader.readAsDataURL(this.file);
      // reader.onload = (event) => {
      //   this.url = (<FileReader>event.target).result as string;
      //   this.cf.detectChanges();
      // };
      event.target.value = "";
    }
  }

  clearImage(j:any,i:any) {
    if(j==0) {
    this.multiples.splice(i, 1);
    this.urls.splice(i, 1);
    this.dealForm.controls['mediaUrl'].setValue(this.urls);
  } else {
    this.multiples.splice((j*this.columnSize)+i, 1);
    this.urls.splice((j*this.columnSize)+i, 1);
    this.dealForm.controls['mediaUrl'].setValue(this.urls);
    }
    this.getItemsTable(true);
    this.dealForm.controls['mediaUrl'].setValue(this.urls);
    this.cf.detectChanges();
  }

  clearVideo() {
    this.url = '';
    this.editUrl = '';
    this.urls.splice(0, 1);
    this.loadingVideo = false;
    this.cf.detectChanges();
    this.dealForm.controls['mediaUrl'].setValue(this.urls);
  }

  onClick(event: any) {
    event.target.value = ''
  }

  dragEntered(event: CdkDragEnter<number>) {
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

      moveItemInArray(this.multiples, dragIndex, dropIndex);
    }
  }

  dragMoved(event: CdkDragMove<number>) {
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

  dragDropped(event: CdkDragDrop<number>) {
    if (!this.dropListReceiverElement) {
      return;
    }

    this.dropListReceiverElement.style.removeProperty('display');
    this.dropListReceiverElement = undefined;
    this.dragDropInfo = undefined;
  }

  change: boolean = false;
  dragIndex: number;
  itemIndex: number;
  boxWidth = 60;
  columnSize: number;
  itemsTable: any;
  dragStarted: boolean = false;


  onDragStarted(index: number): void {
    this.dragStarted = true;
  }

  initTable() {
    this.itemsTable = this.multiples
      .filter((_, outerIndex) => outerIndex % this.columnSize == 0) // create outter list of rows
      .map((
        _,
        rowIndex
      ) =>
        this.multiples.slice(
          rowIndex * this.columnSize,
          rowIndex * this.columnSize + this.columnSize
        )
      );
      this.cf.detectChanges();
  }

  getItemsTable(forceReset?:any): number[][] {
    document.getElementById('drop-list-main')
    const width  = document.getElementById('drop-list-main')?.clientWidth || 300;
    // console.log('cons:',width);
    if(width) {
      const columnSize = Math.floor(width / this.boxWidth);
      if (forceReset || columnSize != this.columnSize) {
        this.columnSize = columnSize;
        this.initTable();
      }
    }
    return this.itemsTable;
  }


  reorderDroppedItem(event: CdkDragDrop<number[]>, index:number) {
    this.dragStarted = false;

    this.change = true;
    if (event.previousContainer.id.includes('DropZone') && event.container.id.includes('DropZone')) {
      if (index == this.dragIndex) { // if same row
        moveItemInArray(
          this.multiples,
          (this.columnSize * index) + this.itemIndex,
          (this.columnSize * index) + event.currentIndex
        );
        moveItemInArray(
          this.urls,
          (this.columnSize * index) + this.itemIndex,
          (this.columnSize * index) + event.currentIndex
        );
        this.resetonDrop();
      }
      else { // if different row
        moveItemInArray(
          this.multiples,
          (this.columnSize * this.dragIndex) + this.itemIndex,
          (this.columnSize * index) + event.currentIndex
        );
        moveItemInArray(
          this.urls,
          (this.columnSize * this.dragIndex) + this.itemIndex,
          (this.columnSize * index) + event.currentIndex
        );
      }
      this.dealForm.controls['mediaUrl'].setValue(this.urls);
      this.resetonDrop();
    }
  }


  drop() {
    this.resetonDrop();
  }

  resetonDrop() {
    this.dragStarted = false;
    this.initTable();
    this.dealForm.valueChanges.subscribe((val: MainDeal) => {
      this.updateParentModel(val, this.checkForm());
      debugger
      this.connection.sendData(val)
    });
  }

  onDragStartedDropZone(index: number, itemIndex:number) {
    this.dragStarted = true;
    this.dragIndex = index;
    this.itemIndex = itemIndex;
  }

  hasRecivingClass(div:HTMLDivElement) {
    return div.classList.contains('cdk-drop-list-receiving')
  }

  next() {
    if(this.dealForm.invalid || this.urls.length == 0) {
     this.dealForm.markAllAsTouched();
     this.submitClick = true;
    }else {
      this.nextClick.emit('');
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
