import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from './../../@core/models/user.model';
import { AuthService } from './../../modules/auth/services/auth.service';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit {

  isLeftVisible: boolean = true;
  user: User | null;
  destroy$ = new Subject();
  businessForm: FormGroup = this.fb.group({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  constructor(public authService: AuthService, private fb: FormBuilder, private toast: HotToastService) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user=> {
      this.user = user;
      if(user)
      this.businessForm.patchValue(user);
   });
  }

  ngOnInit(): void {
  }

  editForm() {
    if(this.businessForm.get('firstName')?.value == '' || this.businessForm.get('lastName')?.value == '' || this.businessForm.get('phoneNumber')?.value == '') {
      this.toast.warning('Please fill in all fields');
      return;
    }
    else {
      this.isLeftVisible = true;
      this.toast.success('Contact details updated', {
        style: {
          border: '1px solid #65a30d',
          padding: '16px',
          color: '#3f6212',
        },
        iconTheme: {
          primary: '#84cc16',
          secondary: '#064e3b',
        },
      })
    }
  }

}
