import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  categoryList: SubCategoryList;
  selectedcategory: SubCategory;

  ChangeSelectedCategory(newSelectedcategory: SubCategory) {
    this.selectedcategory = newSelectedcategory;
    this.dealForm.controls['subCategory'].setValue(newSelectedcategory.subCategoryName);
  }

  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;

  dealForm: FormGroup;

  @Input() deal: Partial<MainDeal> = {
    subCategory:'',
    title: '',
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

  // @Input('valueFromStep1') valueFromStep1: Partial<MainDeal>

  constructor(
    private fb: FormBuilder,
    private cf: ChangeDetectorRef,
    private router: Router,
    private connection: ConnectionService,
    private categoryService: CategoryService,
    private toast: HotToastService
  ) {}

  ngOnInit() {
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
        this.deal.title,
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
    return !(
      this.dealForm.valid
    )
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
}
