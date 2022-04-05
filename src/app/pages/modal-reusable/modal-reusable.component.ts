import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfig } from './../../@core/models/modal.config';

@Component({
  selector: 'app-modal-reusable',
  templateUrl: './modal-reusable.component.html',
  styleUrls: ['./modal-reusable.component.scss']
})
export class ModalReusableComponent implements OnInit {

  @Input() public modalConfig: ModalConfig;

  @ViewChild('modal') private modalContent: TemplateRef<ModalReusableComponent>

  private modalRef: NgbModalRef

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  open(content?:any): Promise<boolean> {
    const config: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      centered: true
    };
    return new Promise<boolean>(resolve => {
      this.modalRef = this.modalService.open(this.modalContent, config)
      this.modalRef.result.then(resolve, resolve)
    })
  }

  async close(): Promise<void> {
    if (this.modalConfig.shouldClose === undefined || (await this.modalConfig.shouldClose())) {
      const result = this.modalConfig.onClose === undefined || (await this.modalConfig.onClose())
      this.modalRef.close(result)
    }
  }

  async dismiss(): Promise<void> {
    if (this.modalConfig.shouldDismiss === undefined || (await this.modalConfig.shouldDismiss())) {
      const result = this.modalConfig.onDismiss === undefined || (await this.modalConfig.onDismiss())
      this.modalRef.dismiss(result)
    }
  }

}
