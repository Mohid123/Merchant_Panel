import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getItem, setItem, StorageItem } from '@core/utils';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RegisterModel } from '../models/register.model';
import { AuthCredentials } from './../../../@core/models/auth-credentials.model';
import { ApiResponse } from './../../../@core/models/response.model';
import { SignInResponse } from './../../../@core/models/sign-in-response';
import { User } from './../../../@core/models/user.model';
import { ApiService } from './../../../@core/services/api.service';
import { AuthHTTPService } from './auth-http';

type AuthApiData = SignInResponse;

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
  merchantID: string;
  newUserCheck: any;
  userPolicy: Partial<User>

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
    private authHttpService: AuthHTTPService,
    private router: Router
  ) {
    super(http);
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<User | null>(<User>getItem(StorageItem.User));
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // public methods
  login(params: AuthCredentials) {
    this.isLoadingSubject.next(true);
    return this.post('/auth/login', params).pipe(
      map((result: ApiResponse<SignInResponse>) => {
        console.log('result',result);
        if (!result.hasErrors()) {
          setItem(StorageItem.User, result?.data?.user || null);
          setItem(StorageItem.JwtToken, result?.data?.token || null);
          if(result?.data?.user)
          this.currentUserSubject.next(result?.data?.user);
          return result
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

  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  get user(): User| null {
    return this.currentUserSubject.getValue();
  }

  retreiveUserValue() {
    this.currentUser$.subscribe((res: User | any) => {
      this.merchantID = res.id;
    })
  }

  retreiveUserPolicy() {
    this.currentUser$.subscribe((res: User | any) => {
      this.userPolicy = res;
    })
  }

  retreiveNewUserCheck() {
    this.currentUser$.subscribe((res: User | any) => {
      this.newUserCheck = res.newUser;
    })
  }

  fetchCityByZipCode(zipCode: string): Observable<ApiResponse<ZipCode | any>> {
    return this.get(`/utils/getCity/${zipCode}`);
  }

  setUserPassword(merchantID: string, payload: any): Observable<ApiResponse<any>> {
    return this.post(`/users/changePassword/${merchantID}`, payload);
  }

  updateUser(user:User) {
    this.currentUserSubject.next(user);
    setItem(StorageItem.User, user);
  }
}
