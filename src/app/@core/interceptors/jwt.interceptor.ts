import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private   authService :AuthService,
  ){

  }
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const isLoggedIn = !!this.authService.currentUserValue;
    const token = this.authService.JwtToken;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    console.log('JwtInterceptor:',request.url);
    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      map((response: any) => {
        if (response.status) {
          response.body = {
            status: [200,201,204].includes(response.status),
            data: response.body,
          };
          console.log('datadatadata:',response.body);
        }
        return response;
      }),
    );
  }
}
