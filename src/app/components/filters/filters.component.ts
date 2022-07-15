import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit  {

  isOpen = false;
  allSelected = false;
  formCtrlSub: Subscription;
  @Output() sortHeader = new EventEmitter();
  @Output() sendFilter = new EventEmitter();
  @Output() searchItem = new EventEmitter();
  @Input() sort = false;
  @Input() search = false;
  @Input() searchBy = '';
  @Input() searchControl = new FormControl();
  @Input() options = false;
  @Input() optionsList = [
    {
      id: 0,
      value: '',
      checked: false
    },
  ];


  constructor(private cf: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.formCtrlSub = this.searchControl.valueChanges.pipe(debounceTime(600))
    .subscribe((newValue: any) => {
      this.searchItem.emit(newValue);
      this.cf.detectChanges();
    });
  }

  filterBySort(sortHeader: string) {
    this.sortHeader.emit(sortHeader);
  }

  filterData() {
    let filters = {
      filterData : this.optionsList.filter(x => x.checked).map(x => x.value),
      sortByAscending: 'Ascending'
    }
    this.sendFilter.emit(filters);
  }

  checkAllCheckBox() {
    this.allSelected = !this.allSelected;
    this.optionsList.forEach(x => x.checked = this.allSelected)
  }

  checkBoxClick(dealID: number, check: any):void {
    this.allSelected = false;
    this.optionsList.find((x: any) => x.id == dealID)!.checked = !check;
  }

  clear() {
    this.optionsList = [];
    this.allSelected = false;
  }

  open() {
    this.isOpen = !this.isOpen;
  }

}
