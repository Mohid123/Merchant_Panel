import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../services/connection.service';

@Component({
  selector: 'app-vertical',
  templateUrl: './vertical.component.html',
})
export class VerticalComponent implements OnInit {


  constructor(public conn: ConnectionService) {}

  ngOnInit(): void {}

}
