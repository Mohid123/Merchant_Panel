import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfig } from './../../../@core/models/modal.config';

@Component({
  selector: 'app-reusable-modal',
  templateUrl: './reusable-modal.component.html',
  styleUrls: ['./reusable-modal.component.scss']
})
export class ReusableModalComponent implements OnInit {

  @Input() public modalConfig: ModalConfig;
  @Input() public cssClass: any;

  @ViewChild('modal') private modalContent: TemplateRef<ReusableModalComponent>

  private modalRef: NgbModalRef

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  open(content?:any): Promise<boolean> {
    const config: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      // modalDialogClass: this.cssClass.modalDialogClass,
    };
    return new Promise<boolean>(resolve => {
      this.modalRef = this.modalService.open(this.modalContent, config)
      this.modalRef.result.then(resolve, resolve)
    })
  }

  async close(): Promise<void> {
    if (this.modalConfig.shouldClose === undefined || (await this.modalConfig.shouldClose())) {
      const result = this.modalConfig.onClose === undefined || (await this.modalConfig.onClose())
      this.modalRef?.close(result)
    }
  }

  async dismiss(): Promise<void> {
    if (this.modalConfig.shouldDismiss === undefined || (await this.modalConfig.shouldDismiss())) {
      const result = this.modalConfig.onDismiss === undefined || (await this.modalConfig.onDismiss())
      this.modalRef.dismiss(result)
    }
  }

}
