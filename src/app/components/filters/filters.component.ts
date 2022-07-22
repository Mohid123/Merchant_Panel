import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit  {

  @ViewChild('spanner') spanner: ElementRef;

  isOpen = false;
  allSelected = false;
  formCtrlSub: Subscription;
  @Output() sortHeader = new EventEmitter();
  @Output() sendFilter = new EventEmitter();
  @Output() sendFilterStatus = new EventEmitter();
  @Output() searchItem = new EventEmitter();
  @Output() filterApplied = new EventEmitter(false);
  @Input() isFilterApplied = false;
  @Input() sort = false;
  @Input() search = false;
  @Input() isStatusFilter = false;
  @Input() searchBy = '';
  @Input() filterBy = '';
  @Input() searchControl = new FormControl();
  @Input() options = false;
  @Input() statusFilters = false;
  @Input() optionsList = [
    {
      id: 0,
      value: '',
      checked: false
    },
  ];

  @Input() optionsListStatus = [
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

  filterStatuses() {
    let filters = {
      filterData: this.optionsListStatus.filter(x => x.checked).map(x => x.value),
      sortByAscending: 'Ascending'
    }
    this.sendFilterStatus.emit(filters);
    if(filters.filterData.length > 0) {
      this.filterApplied.emit(true);
    }
  }

  filterData() {
    let filters = {
      filterData : this.optionsList.filter(x => x.checked).map(x => x.value),
      sortByAscending: 'Ascending'
    }
    this.sendFilter.emit(filters);
    if(filters.filterData.length > 0) {
      this.filterApplied.emit(true);
    }
  }

  checkAllCheckBox() {
    this.allSelected = !this.allSelected;
    this.optionsList.forEach(x => x.checked = this.allSelected)
  }

  checkBoxClick(dealID: number, check: any):void {
    this.allSelected = false;
    this.optionsList.find((x: any) => x.id == dealID)!.checked = !check;
  }


  checkAllCheckBoxStatus() {
    this.allSelected = !this.allSelected;
    this.optionsListStatus.forEach(x => x.checked = this.allSelected)
  }

  checkBoxClickStatus(dealID: number, check: any):void {
    this.allSelected = false;
    this.optionsListStatus.find((x: any) => x.id == dealID)!.checked = !check;
  }

  clear() {
    this.allSelected = false;
    this.optionsList.length = 0;
    this.optionsListStatus.find((x: any) => x.checked = false)
    this.searchControl.setValue('');
    this.sendFilter.emit('');
    this.sendFilterStatus.emit('');
    this.filterApplied.emit(false);
  }

  open() {
    this.isOpen = !this.isOpen;
    const allChecked = this.optionsList?.filter(x => x.checked);
    const allCheckedStatus = this.optionsListStatus?.filter(x => x.checked);
    if(this.optionsList?.length > 0) {
      if(allChecked?.length == this.optionsList?.length) {
        this.allSelected = true
      }
      else {
        this.allSelected = false
      }
    }
    if(this.optionsListStatus?.length > 0) {
      if(allCheckedStatus?.length == this.optionsListStatus?.length) {
        this.allSelected = true
      }
    }
    if(!this.isOpen) {
      // this.allSelected = false;
      // this.optionsList.length = 0;
      // this.optionsListStatus.find((x: any) => x.checked = false)
      // this.searchControl.setValue('');
      this.spanner.nativeElement.style.display = 'none';
    }
  }

}
