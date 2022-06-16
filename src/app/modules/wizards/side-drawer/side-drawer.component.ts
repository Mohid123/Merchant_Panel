import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import { ConnectionService } from './../services/connection.service';

@Component({
  selector: 'app-side-drawer',
  templateUrl: './side-drawer.component.html',
  styleUrls: ['./side-drawer.component.scss']
})
export class SideDrawerComponent implements OnInit {

  data: MainDeal
  subDeals: any[] = [];
  images: any[] = [];

  constructor(private conn: ConnectionService, private cf: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.conn.getData().subscribe((res: any) => {
      this.data = res;
      this.subDeals = this.data.vouchers ? this.data.vouchers: [];
      this.images = this.data.mediaUrl ? this.data.mediaUrl: [];
    })
  }

}
