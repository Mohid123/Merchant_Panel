import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';
import { TrimModule } from './../../@core/directives/trim/trim.module';
import { HorizontalComponent } from './horizontal/horizontal.component';
import { Step1Component } from './steps/step1/step1.component';
import { Step2Component } from './steps/step2/step2.component';
import { Step3Component } from './steps/step3/step3.component';
import { Step4Component } from './steps/step4/step4.component';
import { Step5Component } from './steps/step5/step5.component';
import { VerticalComponent } from './vertical/vertical.component';
import { ViewDealComponent } from './view-deal/view-deal.component';
import { WizardsRoutingModule } from './wizards-routing.module';
import { WizardsComponent } from './wizards.component';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin
]);

@NgModule({
  declarations: [
    HorizontalComponent,
    VerticalComponent,
    WizardsComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    ViewDealComponent,
  ],
  imports: [
  CommonModule,
    WizardsRoutingModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbTooltipModule,
    FullCalendarModule,
    FormsModule,
    CKEditorModule,
    TrimModule,
    MatTabsModule,
    MatMenuModule,
    NgbModule
  ],
})
export class WizardsModule {}
