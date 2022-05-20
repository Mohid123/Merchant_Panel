import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getItem, setItem, StorageItem } from '@core/utils';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, exhaustMap, finalize, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RegisterModel } from '../models/register.model';
import { ZipCode } from '../models/zip-code.model';
import { AuthCredentials } from './../../../@core/models/auth-credentials.model';
import { ApiResponse } from './../../../@core/models/response.model';
import { SignInResponse } from './../../../@core/models/sign-in-response';
import { User } from './../../../@core/models/user.model';
import { ApiService } from './../../../@core/services/api.service';

type AuthApiData = SignInResponse | any;

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService<AuthApiData> {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  currentUser$: Observable<User | null>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<User | null>;
  isLoadingSubject: BehaviorSubject<boolean>;
  userPolicy: Partial<User>;
  tokenSubject$: BehaviorSubject<string>;
  emailSubject$: BehaviorSubject<string>;

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: User | null) {
    this.currentUserSubject.next(user);
  }

  get JwtToken(): string {
    return getItem(StorageItem.JwtToken)?.toString() || '';
  }

  constructor(
    protected override http: HttpClient,
    private router: Router
  ) {
    super(http);
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<User | null>(<User>getItem(StorageItem.User));
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    this.tokenSubject$ = new BehaviorSubject<string>('');
    this.emailSubject$ = new BehaviorSubject<string>('');

  }

  // public methods
  login(params: AuthCredentials) {
    this.isLoadingSubject.next(true);
    return this.post('/auth/login', params).pipe(
      map((result: ApiResponse<any>) => {
        console.log('result',result);
        if (!result.hasErrors()) {
          setItem(StorageItem.User, result?.data?.user || null);
          setItem(StorageItem.JwtToken, result?.data?.token || null);
          if(result?.data?.user)
          this.currentUserSubject.next(result?.data?.user);
          return result
        }
      }),
      exhaustMap((res)=>{
        if (res?.data?.user) {
          return this.get('/users/getUserById/'+ res.data.user.id)
        } else {
          return of(null);
        }
      }),
      tap((res)=> {
        if(res && !res?.hasErrors()) {
          this.updateUser(res.data)
        }
      }),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    setItem(StorageItem.User, null);
    setItem(StorageItem.JwtToken, null);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  registration(user: RegisterModel) {
    console.log('registration api in auth:',);
    this.isLoadingSubject.next(true);
    return this.post('/auth/signup',user).pipe(
      map((user:ApiResponse<SignInResponse>) => {
        this.isLoadingSubject.next(false);
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    this.emailSubject$.next(email);
    return this.post(`/auth/sendOtp`, email).pipe(tap((res: any) => {
      console.log(res)
    }))
  }

  verifyOtp(otp: number): Observable<ApiResponse<any>> {
    return this.post(`/auth/verifyOtp/${otp}`).pipe(tap((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.tokenSubject$.next(res?.data?.token);
      }
    }));
  }

  checkEmailAlreadyExists(email: string): Observable<ApiResponse<any>> {
    return this.post(`/auth/isEmailExists`, {email});
  }

  get user(): User| null {
    return this.currentUserSubject.getValue();
  }

  retreiveUserPolicy() {
    this.currentUser$.subscribe((res: User | any) => {
      this.userPolicy = res;
    })
  }

  fetchCityByZipCode(zipCode: string): Observable<ApiResponse<ZipCode | any>> {
    return this.get(`/utils/getCity/${zipCode}`);
  }

  setUserPassword(merchantID: string | any, payload: any): Observable<ApiResponse<any>> {
    return this.post(`/users/changePassword/${merchantID}`, payload);
  }

  resetPassword(password: string): Observable<ApiResponse<any>> {
    return this.post(`/users/resetPassword`, { password });
  }

  updateUser(user:User) {
    if (user) {
      this.currentUserSubject.next(user);
      setItem(StorageItem.User, user);
    }
  }
}
