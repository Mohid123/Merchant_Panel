import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MediaService } from '@core/services/media.service';


@Component({
  selector: 'app-media-progress',
  templateUrl: './media-progress.component.html',
  styleUrls: ['./media-progress.component.scss']
})
export class MediaProgressComponent implements OnInit {

  public updateProgress: number;
  public progressCount: number;
  public startedUpload: boolean = false;
  public afterUpload: boolean = true;
  isExpanded: boolean = true;

  @ViewChild('accordion') accordion: MatAccordion;

  constructor(private media: MediaService, private cf: ChangeDetectorRef) {
    this.media.uploadInProgress$.subscribe((value: boolean) => {
      this.startedUpload = value;
    });

    this.media.afterUpload$.subscribe((value: boolean) => {
      this.afterUpload = value
      if(value == false) {
        this.afterUpload = false;
        setTimeout(() => {
          this.afterUpload = true;
          this.cf.detectChanges();
          this.media.afterUpload.next(true);
        }, 2000)
      }
    })

    this.media.totalCount$.subscribe((count: number) => {
      this.progressCount = count;
    });

    this.media.subscribeToProgressEvents((count: number) => {
      this.updateProgress = count;
      this.cf.detectChanges();
    })
  }

  ngOnInit(): void {
  }

  openPanel() {
    this.isExpanded = true;
    this.cf.detectChanges();
  }

  closePanel() {
    this.isExpanded = false;
    this.cf.detectChanges();
  }

}
