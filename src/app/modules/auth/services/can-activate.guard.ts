
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot
} from '@angular/router';
import { PopupModalComponent } from '@components/popup-modal/popup-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConnectionService } from '../../wizards/services/connection.service';

@Injectable({ providedIn: 'root' })
export class CanActivateGuard implements CanActivate {
  constructor(private conn: ConnectionService, public modal: NgbModal) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const routePop = this.conn.currentStep$.value;
    if (routePop == 2 || routePop == 3 || routePop == 4 || (routePop == 5 && !this.conn.saveAndNextData.value?.startDate) || (routePop == 1 && this.conn.isEditTrue?.value == true)) {
      debugger
      this.modal.open(PopupModalComponent,  {
        centered: true,
        keyboard: false,
        backdrop:'static'
      })
      this.conn.getStateURL = state.url;
      if(this.conn.getSPopupState == 'Discard') {
        this.modal.dismissAll();
        this.conn.currentStep$.next(1);
        this.conn.isEditMode = false;
        this.conn.sendSaveAndNext({});
        this.conn.sendData({});
        this.conn.sendStep1({});
      }
      return this.conn.getRoutePopup;
    }
    else {
      return true;
    }

  }
}
