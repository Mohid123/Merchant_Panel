import { Component, Host, Input } from '@angular/core';
import { CustomCheckboxComponent } from '../custom-checkbox.component';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent  {

  @Input() value: string;
  @Input() customClass: string;
  @Input() name: string;

  constructor(@Host() public customCheckbox: CustomCheckboxComponent) { }

  categories = [
    { id:2, img: '../../../../../assets/media/icons/accommodation.svg', name:'Accomodation' },
    { id:3, img: '../../../../../assets/media/icons/Dining.svg', name:'Dining' },
    { id:4, img: '../../../../../assets/media/icons/athletics.svg', name:'Sports, Adventures & Experiences' },
    { id:5, img: '../../../../../assets/media/icons/experiences-at-home.svg', name:'Experiences at Home' },
    { id:1, img: '../../../../../assets/media/icons/spaAndWellness.svg', name:'Spa & Holistic Wellness' },
    { id:6, img: '../../../../../assets/media/icons/personal-dev.svg', name:'Personal Development' },
    { id:7, img: '../../../../../assets/media/icons/concert-event-tickets.svg', name:'Concerts & Event Tickets' },
    { id:8, img: '../../../../../assets/media/icons/pets-care.svg', name:'Pet Treatments' },
    { id:9, img: '../../../../../assets/media/icons/pets-care.svg', name:'Metaverse' },
  ]

}
