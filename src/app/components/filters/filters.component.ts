import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DealService } from '@core/services/deal.service';
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


  constructor(private cf: ChangeDetectorRef, private dealService: DealService) { }

  ngOnInit(): void {
    this.formCtrlSub = this.searchControl.valueChanges.pipe(debounceTime(600))
    .subscribe((newValue: any) => {
      this.searchItem.emit(newValue);
      this.cf.detectChanges();
    });
  }

  filterBySort() {

  }

  filterData() {
    this.searchControl = new FormControl();
    this.optionsList.forEach((x: any) => {
      if(x.checked) {
        this.sendFilter.emit(x.value);
      }
    })
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
    this.searchControl = new FormControl()
  }

  open() {
    this.isOpen = !this.isOpen;
  }



}
