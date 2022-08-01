import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateGuard } from 'src/app/modules/auth/services/can-activate.guard';
import { ConnectionService } from './../../modules/wizards/services/connection.service';

@Component({
  selector: 'app-popup-modal',
  templateUrl: './popup-modal.component.html',
  styleUrls: ['./popup-modal.component.scss']
})
export class PopupModalComponent implements OnInit {

  constructor(public conn: ConnectionService, private router: Router, public guard: CanActivateGuard) { }

  ngOnInit(): void {
  }

  discard() {
    const URL = this.conn.getStateURL;
    this.conn.getRoutePopup = true;
    this.router.navigate([URL]);
    this.conn.getSPopupState = 'Discard';
    setTimeout(() => {
      this.conn.getRoutePopup = false;
      this.conn.getSPopupState = '';
    }, 3000)
  }

  cancel() {
    this.conn.getRoutePopup = false;
    this.guard.modal.dismissAll();
  }

}
