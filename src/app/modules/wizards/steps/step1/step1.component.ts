import { CdkDragDrop, CdkDragEnter, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { HotToastService } from '@ngneat/hot-toast';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SubCategory, SubCategoryList } from 'src/app/modules/auth/models/subCategory.model';
import { CategoryService } from './../../../auth/services/category.service';
import { Image } from './../../models/images.model';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
})
export class Step1Component implements OnInit, OnDestroy {

  @ViewChild('dropListContainer') dropListContainer?: ElementRef;
  dropListReceiverElement?: HTMLElement;
  dragDropInfo?: {
    dragIndex: number;
    dropIndex: number;
  };

  @Output() nextClick = new EventEmitter();
  config: any;
  public Editor = ClassicEditor

  categoryList: SubCategoryList;
  selectedcategory: SubCategory;
  disableCategory: boolean = false;

  ChangeSelectedCategory(newSelectedcategory: SubCategory) {
    if(newSelectedcategory) {
      this.selectedcategory = newSelectedcategory;
      this.dealForm.controls['subCategory'].setValue(newSelectedcategory.subCategoryName);
      this.disableCategory = true;
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
    description: '',
    deletedCheck: false
  };

  file: any;
  multiples: any[] = [];
  urls: Image[] = [];
  private unsubscribe: Subscription[] = [];
  control: FormControl
  images = [];

  constructor(
    private fb: FormBuilder,
    private cf: ChangeDetectorRef,
    private router: Router,
    private connection: ConnectionService,
    private categoryService: CategoryService,
    private toast: HotToastService
  ) {}

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
    this.categoryService.getSubCategories(0,0).pipe(take(1)).subscribe(categoryList => {
      if(!categoryList.hasErrors()){
        this.categoryList = categoryList.data;
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
      title: [
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
      description: [
        this.deal.description,
        Validators.compose([
          Validators.required,
          Validators.minLength(16)
        ]),
      ],
      mediaUrl: [
        this.urls,
        Validators.compose([
          Validators.required
        ])
      ],
      deletedCheck: false
    })
    const formChangesSubscr = this.dealForm.valueChanges.subscribe((val: MainDeal) => {
      this.updateParentModel(val, this.checkForm());
      this.connection.sendData(val)
      // console.log(val);
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(this.dealForm.get('title')?.hasError('required') ||
    this.dealForm.get('subTitle')?.hasError('required') ||
    this.dealForm.get('description')?.hasError('required') ||
    this.dealForm.get('description')?.hasError('minlength'))
  }

  onSelectFile(event: any) {
    this.file = event.target.files && event.target.files.length;
    if (this.file > 0 && this.file < 11) {
      this.images = event.target.files;
      let i: number = 0;
      for (const singlefile of event.target.files) {
        var reader = new FileReader();
        reader.readAsDataURL(singlefile);
        this.urls.push(singlefile);
        this.cf.detectChanges();
        i++;
        reader.onload = (event) => {
          const url = (<FileReader>event.target).result as string;
          this.multiples.push(url);
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

  clearImage(i:any) {
    this.multiples.splice(i, 1);
    this.urls.splice(i, 1);
    this.cf.detectChanges();
  }

  onClick(event: any) {
    event.target.value = ''
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
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
}
