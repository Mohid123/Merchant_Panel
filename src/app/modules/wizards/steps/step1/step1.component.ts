import { CdkDragDrop, CdkDragEnter, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MediaService } from '@core/services/media.service';
import { HotToastService } from '@ngneat/hot-toast';
import { Subject, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
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

  @Output() nextClick = new EventEmitter();
  config: any;
  public Editor = ClassicEditor

  categoryList: CategoryDetail[];
  selectedcategory: SubCategory;
  disableCategory: boolean = false;

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
  videos: any[] = [];
  videoUrls: any[] = [];
  private unsubscribe: Subscription[] = [];
  control: FormControl
  images = [];

  constructor(
    private fb: FormBuilder,
    private cf: ChangeDetectorRef,
    private router: Router,
    private connection: ConnectionService,
    private categoryService: CategoryService,
    private toast: HotToastService,
    public breakpointObserver: BreakpointObserver,
    private mediaService: MediaService
  ) {
    this.breakpointObserver.observe(['(min-width: 1600px)']).pipe(map((result) => result.matches)).subscribe(res => {
      if(res) {
        this.boxWidth = 88;
      } else {
        this.boxWidth = 60;
      }
    });
  }

  ngOnInit() {
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
    this.initDealForm();
    this.updateParentModel({}, this.checkForm());
    this.categoryService.getAllCategoriesDetail(0,0).pipe(take(1)).subscribe((res) => {
      if(!res.hasErrors()){
        const categoryList = res.data.data;
        console.log('getAllCategoriesDetail:',categoryList);
        this.categoryList = categoryList;
      }
    })
  }

  get f() {
    return this.dealForm.controls;
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
          Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
        ]),
      ],
      subTitle: [
        this.deal.subTitle,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
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
      let i: number = 0;
      for (const singlefile of files) {
        var reader = new FileReader();
        reader.readAsDataURL(singlefile);
        // if(isImages) {
        //   this.urls.push(singlefile);
        // }
        this.cf.detectChanges();
        i++;
        reader.onload = (fileEvent) => {
          const url = (<FileReader>fileEvent.target).result as string;
          if(isImages){
            this.multiples.push(url);
            this.urls.push(url);
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
      var reader = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onload = (event) => {
        this.url = (<FileReader>event.target).result as string;
        this.urls.unshift(this.url);
        this.cf.detectChanges();
      };
      event.target.value = "";
    }
  }


  // onSelectVideo(event: any) {
  //   const files = event.target? event.target.files : event;
  //   this.file = files && files.length;
  //   if (this.file > 0 && this.file < 2) {
  //     this.loadingVideo = true;
  //     if(+(files[0].size / 1048576).toFixed(2) > 10) {
  //       this.toast.error('You can upload maximum 10mb file.', {
  //         style: {
  //           border: '1px solid #713200',
  //           padding: '16px',
  //           color: '#713200',
  //         },
  //         iconTheme: {
  //           primary: '#713200',
  //           secondary: '#FFFAEE',
  //         }
  //       });
  //       this.loadingVideo = false;
  //       this.cf.detectChanges();
  //       return;
  //     }
  //     this.cf.detectChanges();
  //     let i: number = 0;
  //     for (const singlefile of files) {
  //       var reader = new FileReader();
  //       reader.readAsDataURL(singlefile);
  //       this.videos.push(singlefile);
  //       this.urls.unshift(singlefile);
  //       this.cf.detectChanges();
  //       i++;
  //     }
  //     // if(this.videoUrls.length > 0) {
  //     //   for(let i = 0; i < this.videoUrls.length; i++) {
  //     //     this.mediaService.uploadMedia('video', this.videoUrls[i])
  //     //     .subscribe((res: ApiResponse<any>) => {
  //     //       if(!res.hasErrors()) {
  //     //         this.videos.unshift(res.data?.url);
  //     //         this.urls.unshift(res.data?.url);
  //     //         this.cf.detectChanges();
  //     //         this.videoUrls = [];
  //     //         this.loadingVideo = false;
  //     //         this.cf.detectChanges();
  //     //       }
  //     //     })
  //     //   }
  //     //   if(files.length == i) {
  //     //     this.initTable();
  //     //     this.getItemsTable();
  //     //   }
  //     // }
  //   }
  //   else {
  //     this.loadingVideo = false;
  //     this.cf.detectChanges();
  //     this.toast.error('Please select one video only!', {
  //       style: {
  //         border: '1px solid #713200',
  //         padding: '16px',
  //         color: '#713200',
  //       },
  //       iconTheme: {
  //         primary: '#713200',
  //         secondary: '#FFFAEE',
  //       }
  //     })
  //   }
  // }

  clearImage(j:any,i:any) {
    if(j==0) {
    this.multiples.splice(i, 1);
    this.urls.splice(i, 1);
  } else {
    this.multiples.splice((j*this.columnSize)+i, 1);
    this.urls.splice((j*this.columnSize)+i, 1);
    }
    this.getItemsTable(true);
    this.cf.detectChanges();
  }

  clearVideo() {
    this.url = '';
  }

  onClick(event: any) {
    event.target.value = ''
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    this.dragDropInfo = { dragIndex, dropIndex };
    console.log('dragEntered', { dragIndex, dropIndex });

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
      else {
        console.log('sss:',);
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
        this.resetonDrop();
      }
      else { // if different row
        moveItemInArray(
          this.multiples,
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
}
