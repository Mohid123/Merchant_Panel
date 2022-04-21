import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-skeleton',
  templateUrl: './table-skeleton.component.html',
  styleUrls: ['./table-skeleton.component.scss']
})
export class TableSkeletonComponent implements OnInit {

  Arr = Array;
  num: number = 10;

  constructor() { }

  ngOnInit(): void {
  }

}
