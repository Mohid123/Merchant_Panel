import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
// import { SpaceBetweenDirective } from './directives/space-between.directive';
import { JwtInterceptor } from './interceptors';
import { ServerErrorInterceptor } from './interceptors/server-error.interceptor';

// import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
  declarations: [
    // TruncatePipe

    // SpaceBetweenDirective
  ],
  imports: [CommonModule, HttpClientModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
