import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-new-reviews',
  templateUrl: './new-reviews.component.html',
  styleUrls: ['./new-reviews.component.scss']
})
export class NewReviewsComponent implements OnInit {

  @ViewChild('modal') private modal: TemplateRef<any>

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openReviewModal() {
    return this.modalService.open(this.modal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      modalDialogClass: 'extra-large'
    });
  }


}
