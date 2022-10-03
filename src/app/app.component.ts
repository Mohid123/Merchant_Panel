import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslationService } from './modules/i18n';
// language list
import { HotToastService } from '@ngneat/hot-toast';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { locale as chLang } from './modules/i18n/vocabs/ch';
import { locale as deLang } from './modules/i18n/vocabs/de';
import { locale as enLang } from './modules/i18n/vocabs/en';
import { locale as esLang } from './modules/i18n/vocabs/es';
import { locale as frLang } from './modules/i18n/vocabs/fr';
import { locale as jpLang } from './modules/i18n/vocabs/jp';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {

  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;
  subscriptions: Subscription[] = [];

  constructor(private translationService: TranslationService, private toast: HotToastService) {

    this.translationService.loadTranslations(
      enLang,
      chLang,
      esLang,
      jpLang,
      deLang,
      frLang
    );
  }

  ngOnInit() {
    // OFFLINE/ONLINE CHECK
    this.onlineEvent = fromEvent(window, "online");
    this.offlineEvent = fromEvent(window, "offline");

    //ONLINE CHECK

    this.subscriptions.push(
      this.onlineEvent.subscribe((e) => {
        this.toast.success("You are now back online");
      })
    );

    //OFFLINE CHECK

    this.subscriptions.push(
      this.offlineEvent.subscribe((e) => {
        this.toast.error(
          "You are offline. Please Check your Internet Connection",{
            style: {
              border: '1px solid #713200',
              padding: '10px',
              color: '#713200'
            },
            iconTheme: {
              primary: '#713200',
              secondary: '#FFFAEE',
            }
          }
        );
      })
    );
  }

  ngOnDestroy() {
    // UNSUBSCRIBE FROM OBSERVABLE
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
