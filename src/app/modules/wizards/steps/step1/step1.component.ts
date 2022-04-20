import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Image } from './../../models/images.model';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';

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

  // @Input('valueFromStep1') valueFromStep1: Partial<MainDeal>

  constructor(private fb: FormBuilder, private cf: ChangeDetectorRef, private router: Router, private connection: ConnectionService) {}

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
          Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
        ]),
      ],
      subTitle: [
        this.deal.subTitle,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
          Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
        ]),
      ],
      description: [
        this.deal.description,
        Validators.compose([
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(400),
          Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
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
      console.log(val);
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(
      this.dealForm.get('title')?.hasError('required') ||
      this.dealForm.get('subTitle')?.hasError('required') ||
      this.dealForm.get('subTitle')?.hasError('whitespace') ||
      this.dealForm.get('description')?.hasError('required') ||
      this.dealForm.get('description')?.hasError('minlength') ||
      this.dealForm.get('description')?.hasError('whitespace') ||
      this.dealForm.get('title')?.hasError('whitespace') ||
      this.dealForm.get('title')?.hasError('pattern') ||
      this.dealForm.get('description')?.hasError('pattern') ||
      this.dealForm.get('subTitle')?.hasError('pattern')
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
            window.alert('Maximum number of files reached') //temporary alert. will replace with toast
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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
