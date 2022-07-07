import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit  {

  isOpen = false;

  sort = true;
  search = true;
  searchBy = 'status';
  searchControl = new FormControl();
  options = true;
  optionsList = [
    {
      id: 1,
      value: 'option 1'
    },
    {
      id: 2,
      value: 'option 2'
    },
    {
      id: 3,
      value: 'option 3'
    },
    {
      id: 4,
      value: 'option 4'
    },
  ];


  constructor() { }

  ngOnInit(): void {
  }

  filterBySort() {

  }

  open() {
    this.isOpen = !this.isOpen;;
  }



}
