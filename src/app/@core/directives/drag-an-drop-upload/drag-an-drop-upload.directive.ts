import {
  Directive, EventEmitter, HostBinding,
  HostListener,
  Output
} from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[appDragAnDropUpload]'
})
export class DragAnDropUploadDirective {
  @Output() files: EventEmitter<any[]> = new EventEmitter();

  @HostBinding("style.background") private background = "";

  constructor(private sanitizer: DomSanitizer) { }

  @HostListener("dragover", ["$event"]) public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = "#eee";
  }

  @HostListener("dragleave", ["$event"]) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = "";
  }

  @HostListener('drop', ['$event']) public onDrop(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '';

    let files:any = [];
    for (let i = 0; i < evt.dataTransfer.files.length; i++) {
      const file = evt.dataTransfer.files[i];
      const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      files.push(file);
    }
    if (files.length > 0) {
      this.files.emit(files);
    }
  }
}
