import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
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
  optionsCheckedStatues = false;
  optionsChecked = false;
  newValue: any;
  page: number = 2;
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

  autoClose: boolean = false;


  constructor(private cf: ChangeDetectorRef, public common: CommonFunctionsService) { }

  ngOnInit(): void {
    this.formCtrlSub = this.searchControl.valueChanges.pipe(debounceTime(600))
    .subscribe((newValue: any) => {
      if(this.newValue != newValue) {
        this.page = 2;
      }
      this.newValue = newValue;
      let valueTosend = {
        value: newValue,
        page: 1
      }
      this.searchItem.emit(valueTosend);
      this.cf.detectChanges();
    });


    this.optionsListStatus?.forEach((x: any) => {
      if(x.checked) {
        this.optionsCheckedStatues = true;
      }
    });

    this.optionsList?.forEach((x: any) => {
      if(x.checked) {
        this.optionsChecked = true;
      }
    })
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
    this.optionsList.forEach(x => x.checked = this.allSelected);
    this.optionsChecked = true;
  }

  checkBoxClick(dealID: number, check: any):void {
    this.allSelected = false;
    this.optionsList.find((x: any) => x.id == dealID)!.checked = !check;
    this.optionsChecked = true;
  }


  checkAllCheckBoxStatus() {
    this.allSelected = !this.allSelected;
    this.optionsListStatus.forEach(x => x.checked = this.allSelected);
    this.optionsCheckedStatues = true;
  }

  checkBoxClickStatus(dealID: number, check: any):void {
    this.allSelected = false;
    this.optionsListStatus.find((x: any) => x.id == dealID)!.checked = !check;
    this.optionsCheckedStatues = true;
  }

  clear() {
    this.allSelected = false;
    this.optionsList.length = 0;
    this.optionsListStatus.find((x: any) => x.checked = false);
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
      this.spanner.nativeElement.style.display = 'none';
    }
  }

  autoCloseOutside(close: boolean) {
    this.autoClose = close;
    if(this.autoClose == false) {
      this.isOpen = false;
    }
  }

  onScrollDown() {
    let valueTosend = {
      value: this.newValue,
      page: this.page++
    }
    this.searchItem.emit(valueTosend);
    this.cf.detectChanges();
  }

}
