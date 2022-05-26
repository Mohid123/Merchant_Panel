import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UrlValidator } from 'src/app/modules/auth/components/registration/url.validator';
import { Gallery, User } from './../../@core/models/user.model';
import { AuthService } from './../../modules/auth/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  secondLeftVisible: boolean = true;
  isLeftVisible: boolean = true;
  user: User | null;
  destroy$ = new Subject();
  urls: Gallery[] = [];
  url: string = '';
  file: any;
  singleFile: any
  multiples: any[] = [];
  images = [];

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
      '',[
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

    googleMapPin: ['',
      Validators.compose([
        Validators.required,
      ])
    ],

    website_socialAppLink: ['',
      Validators.compose([
        Validators.required,
      ])
    ],

    profilePicURL: '',
    gallery: this.urls,
  }
  , {
    validator: UrlValidator('website_socialAppLink'),
  })

  constructor(public authService: AuthService, private fb: FormBuilder, private toast: HotToastService, private cf: ChangeDetectorRef) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      if(user)
      this.profileForm.patchValue(user);
   });
  }

  ngOnInit(): void {
  }

  onSelectFile(event: any) {
    this.file = event.target.files && event.target.files.length;
    if (this.file > 0 && this.file < 6) {
      // this.images = event.target.files;
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
          if (this.multiples.length > 5) {
            // If multple events are fired by user
            this.multiples.pop();
            this.cf.detectChanges();
            this.urls.pop();
            this.toast.error('Please select upto 5 images', {
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
      this.toast.error('Please select upto 5 images', {
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

  onSelectSingle(event: any) { // called each time file input changes
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      this.cf.detectChanges();
      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.url = event.target.result;
        this.cf.detectChanges();
      }
    }
  }

  onClick(event: any) {
    event.target.value = ''
  }

  clearImage() {
    this.url = '';
  }

  validateZip(): {[key: string]: any} | null  {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value && control.value.toString().length !== 4) {
        return { 'zipInvalid': true };
      }
      return null;
    }
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
