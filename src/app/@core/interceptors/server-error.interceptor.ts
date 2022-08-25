import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConnectionService } from 'src/app/modules/wizards/services/connection.service';
import { ROUTER_UTILS } from '../utils/router.utils';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private conn: ConnectionService
    ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if([401, 403].includes(error.status) && this.router.url.includes(`editDeal/${this.conn.dealIDServerErrorInterceptor.value}`)) {
          this.router.navigate([`/editDeal/${this.conn.dealIDServerErrorInterceptor.value}`])
          return throwError(error);
        }
        if ([401, 403].includes(error.status) && !request.url.includes('auth/signup') && !request.url.includes('group/addGroup') && error?.error?.message !== "Incorrect credentials") {
          this.router.navigate([ '/', ROUTER_UTILS.config.auth.root,ROUTER_UTILS.config.auth.signIn]);
          return throwError(error);
        } else if (error.status === 500) {
          console.error(error);
          return throwError(error);
        } else {
          return throwError(error);
        }
      }),
    );
  }
}
