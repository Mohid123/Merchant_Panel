import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfig } from '@core/models/modal.config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ConnectionService } from './../../modules/wizards/services/connection.service';

@Component({
  selector: 'app-popup-modal',
  templateUrl: './popup-modal.component.html',
  styleUrls: ['./popup-modal.component.scss']
})
export class PopupModalComponent implements OnInit {

  @ViewChild('modal') private modal: ReusableModalComponent;

  public modalConfig: ModalConfig = {
    onDismiss: () => {
      return true
    },
    dismissButtonLabel: "Dismiss",
    onClose: () => {
      return true
    },
    closeButtonLabel: "Close"
  }

  constructor(public conn: ConnectionService) { }

  ngOnInit(): void {
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    debugger
    if(this.conn.currentStep$.value == 2 || this.conn.currentStep$.value == 3 || this.conn.currentStep$.value == 4 || this.conn.currentStep$.value == 5) {
      this.modal.open();
      return this.conn.getRoutePopup().pipe(tap((res: any) => {
        return res
      }))
    }
    else
    {
      return true;
    }
  }

  discardPopup() {
    this.conn.sendRoutePopup(false)
  }

}
