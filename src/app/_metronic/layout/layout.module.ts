import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  NgbDropdownModule,
  NgbProgressbarModule,
  NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { TranslationModule } from '../../modules/i18n';
import { Routing } from '../../pages/routing';
import { DrawersModule, DropdownMenusModule, EngagesModule, ModalsModule } from '../partials';
import { EngagesComponent } from "../partials/layout/engages/engages.component";
import { ExtrasModule } from '../partials/layout/extras/extras.module';
import { AsideMenuComponent } from './components/aside/aside-menu/aside-menu.component';
import { AsideComponent } from './components/aside/aside.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderMenuComponent } from './components/header/header-menu/header-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { PageTitleComponent } from './components/header/page-title/page-title.component';
import { ScriptsInitComponent } from './components/scripts-init/scripts-init.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: Routing,
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    AsideComponent,
    HeaderComponent,
    ContentComponent,
    FooterComponent,
    ScriptsInitComponent,
    ToolbarComponent,
    AsideMenuComponent,
    TopbarComponent,
    PageTitleComponent,
    HeaderMenuComponent,
    EngagesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslationModule,
    InlineSVGModule,
    NgbDropdownModule,
    NgbProgressbarModule,
    ExtrasModule,
    ModalsModule,
    DrawersModule,
    EngagesModule,
    DropdownMenusModule,
    NgbTooltipModule,
    TranslateModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule {}
