import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';


type PaneType = 'left' | 'right';

@Component({
  selector: 'app-profile-slider',
  templateUrl: './profile-slider.component.html',
  styleUrls: ['./profile-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slide', [
      state('left', style({ transform: 'translateX(0)' })),
      state('right', style({ transform: 'translateX(-50%)', height: 'auto' })),
      transition('* => *', animate(300))
    ])
  ]
})
export class ProfileSliderComponent {

  @Input() activePane: PaneType = 'left';
}
