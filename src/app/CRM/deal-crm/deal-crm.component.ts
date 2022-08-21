import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MediaUpload } from '@core/models/requests/media-upload.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GreaterThanValidator } from 'src/app/modules/wizards/greater-than.validator';
import SwiperCore, { FreeMode, Navigation, Thumbs } from 'swiper';

SwiperCore.use([FreeMode, Navigation, Thumbs]);
@Component({
  selector: 'app-deal-crm',
  templateUrl: './deal-crm.component.html',
  styleUrls: ['./deal-crm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DealCRMComponent implements OnInit {

  crmForm: FormGroup;
  editVouchers: FormGroup;
  signInForm: FormGroup;
  media: any[] = [];
  thumbsSwiper: any;
  imageArray: MediaUpload[] = [
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-1.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-2.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-3.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-4.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: '',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-5.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-6.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-7.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-8.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-9.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    },
    {
      type: 'Image',
      captureFileURL: 'https://swiperjs.com/demos/images/nature-10.jpg',
      path: '',
      thumbnailURL: '',
      thumbnailPath: '',
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      backgroundColorHex: ''
    }
  ];

  config: any;
  public Editor = ClassicEditor;
  title = 'General Spa admission for one';
  passwordHide: boolean = true;
  isLoggedIn: boolean = false;
  @ViewChild('modal') private modal: TemplateRef<any>;
  @ViewChild('modal2') private modal2: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal
    ) { }

  ngOnInit(): void {
    this.initCRMForm();
    this.initEditVocuhers();
    this.initSignInForm();
    this.config = {
      placeholder: 'Type your content here...',
      toolbar: {
        styles: [
          'alignLeft', 'alignCenter', 'alignRight', 'full', 'side'
          ],
        items: [
          'heading',
          'fontSize',
          'bold',
          'italic',
          'underline',
          'highlight',
          'alignment',
          'undo',
          'redo',
          'bulletedList',
        ]
      }
    }
  }

  initCRMForm() {
    this.crmForm = this.fb.group({
      dealTitle: [{value: '', disabled: this.isLoggedIn == false}, Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9., ]+')
        ]),
      ],
      dealSubTitle: [{value: '', disabled: this.isLoggedIn == false}, Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9., ]+')
        ])
      ],
      mediaURL: this.media,
      highlights: [
        {value: '', disabled: this.isLoggedIn == false},
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9., ]+')
        ]),
      ],
      aboutThisDeal: [
        {value: '', disabled: this.isLoggedIn == false},
        Validators.compose([
          Validators.required
        ]),
      ],
      readMore: [
        {value: '', disabled: this.isLoggedIn == false},
        Validators.compose([
          Validators.required
        ]),
      ],
      finePrints: [
        {value: '', disabled: this.isLoggedIn == false},
        Validators.compose([
          Validators.required
        ]),
      ]
    })
  }

  initEditVocuhers() {
    this.editVouchers = this.fb.group({
      originalPrice: [
        '',
        Validators.compose([
        Validators.required,
        ]),
      ],
      dealPrice: [
        ''
      ],
      numberOfVouchers: [
        '0',
        Validators.compose([
        Validators.required,
        Validators.min(1)
        ])
      ],
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9 ]+')
        ])
      ],
      discountPercentage: [
        0
      ]
      }, {
        validator: GreaterThanValidator('originalPrice', 'dealPrice')
    })
  }

  initSignInForm() {
    this.signInForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          Validators.minLength(3),
          Validators.maxLength(320),
        ]),
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
        ]),
      ]
    })
  }

  get f() {
    return this.crmForm.controls;
  }

  textLength (body:string) {
    var regex = /(<([^>]+)>)/ig;
    var result = body?.replace(regex, "");
    return result?.length;
  }

  openModal() {
    return this.modalService.open(this.modal, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.editVouchers.reset();
  }

  openSignInModal() {
    return this.modalService.open(this.modal2, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeSignInModal() {
    this.modalService.dismissAll();
  }

  logInAsAdmin() {
    this.isLoggedIn = true;
    this.crmForm.enable();
    this.closeSignInModal();
  }

  saveChanges() {
    this.isLoggedIn = false;
    this.crmForm.disable();
  }

  editHandlePlus() {
    this.editVouchers.patchValue({
      numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value) + 1
    });
  }

  editHandleMinus() {
    if(this.editVouchers.controls['numberOfVouchers'].value >= 1) {
      this.editVouchers.patchValue({
        numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value) - 1
      });
    }
  }

  passwordShowHide(): void {
    this.passwordHide = !this.passwordHide;
  }


}
