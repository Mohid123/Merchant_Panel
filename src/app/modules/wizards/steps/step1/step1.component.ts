import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { MainDeal } from './../../models/main-deal.model';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
})
export class Step1Component implements OnInit, OnDestroy {
  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;
  dealForm: FormGroup;
  @Input() deal: Partial<MainDeal> = {
    title: '',
    subtitle: '',
    images: [],
    description: '',
    deletedCheck: false
  };
  file: any;
  multiples: any[] = [];
  urls: any[] = [];
  private unsubscribe: Subscription[] = [];

  private dealSubject$ = new BehaviorSubject<MainDeal>({});
  public deal$: Observable<MainDeal> = this.dealSubject$.asObservable();

  constructor(private fb: FormBuilder, private cf: ChangeDetectorRef, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.initDealForm();
    this.updateParentModel({}, this.checkForm());
  }

  get f() {
    return this.dealForm.controls;
  }

  initDealForm() {
    this.dealForm = this.fb.group({
      title: [
        this.deal.title,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ])
      ],
      subtitle: [
        this.deal.subtitle,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ])
      ],
      description: [
        this.deal.description,
        Validators.compose([
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(300),
        ])
      ],
      images: [
        this.deal.images,
        Validators.compose([
          Validators.required
        ])
      ]
    })
    const formChangesSubscr = this.dealForm.valueChanges.subscribe((val: MainDeal) => {
      if(val.images) {
        val.images = this.urls
      }
      this.updateParentModel(val, this.checkForm());
    });
    this.unsubscribe.push(formChangesSubscr);
  }

   checkForm() {
    return !(
      this.dealForm.get('title')?.hasError('required') ||
      this.dealForm.get('subtitle')?.hasError('required') ||
      this.dealForm.get('description')?.hasError('required')
      )
  }

  onSelectFile(event: any) {
    this.file = event.target.files && event.target.files.length;
    if (this.file > 0 && this.file < 11) {
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
            this.urls.pop();
            window.alert('Maximum number of files reached') //temporary will replace with toast
          }
        };
      }
    }
    else {
      window.alert('Please Select upto 10 files')
    }
  }

  clearImage(i:any) {
    this.multiples.splice(i, 1);
    this.cf.detectChanges();
  }

  onClick(event: any) {
    event.target.value = ''
  }


  // initForm() {
  //   this.form = this.fb.group({
  //     accountType: [this.defaultValues.accountType, [Validators.required]],
  //   });

  //   const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
  //     this.updateParentModel(val, true);
  //   });
  //   this.unsubscribe.push(formChangesSubscr);
  // }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
