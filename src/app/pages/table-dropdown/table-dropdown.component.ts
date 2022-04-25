import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-dropdown',
  templateUrl: './table-dropdown.component.html',
  styleUrls: ['./table-dropdown.component.scss']
})
export class TableDropdownComponent implements OnInit {

  dealItems = [
    {
      subtitle: 'Heavenly Massage with cupping',
      price: 150,
      sold: 456,
      available: 23,
      vaidity: 10
    },
    {
      subtitle: 'Second Massage with cupping',
      price: 150,
      sold: 456,
      available: 23,
      vaidity: 10
    },
    {
      subtitle: 'Third Massage with cupping',
      price: 150,
      sold: 456,
      available: 23,
      vaidity: 10
    }
  ]

  newData : any[] = [];

  checkHeight: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.newData = this.dealItems.slice(0,0);
  }

  showAll() {
    if (!this.checkHeight) {
      this.newData = this.dealItems;
    }
    else {
      this.newData = this.dealItems.slice(0,0);
    }
    this.checkHeight = !this.checkHeight;
  }

}
