export class RegisterModel {
  businessType: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  legalName: string;
  streetAddress: string;
  zipCode: number | null;
  city: string;
  province: number | null;
  website_socialAppLink: string;
  role: string;
  status: string;
  businessHours: any;
  vatNumber: string;

  setModel(_model: unknown) {
    const model = _model as RegisterModel;
    this.businessType = model.businessType;
    this.firstName = model.firstName || '';
    this.lastName = model.lastName || '';
    this.email = model.email || '';
    this.phoneNumber = model.phoneNumber || null;
    this.legalName = model.legalName || './assets/media/users/default.jpg';
    this.streetAddress = model.streetAddress || '';
    this.zipCode = model.zipCode || null;
    this.city = model.city || '';
    this.province = model.province || null;
    this.vatNumber = model.vatNumber || '';
    this.website_socialAppLink = model.website_socialAppLink;
    this.role = 'Merchant';
    this.status= 'New';
    this.businessHours = [
      {
        "day": "MN",
        "firstStartTime": "",
        "firstEndTime": "",
        "secondStartTime": "",
        "secondEndTime": ""
      },
      {
        "day": "TU",
        "firstStartTime": "",
        "firstEndTime": "",
        "secondStartTime": "",
        "secondEndTime": ""
      },
      {
        "day": "WD",
        "firstStartTime": "",
        "firstEndTime": "",
        "secondStartTime": "",
        "secondEndTime": ""
      },
      {
        "day": "TH",
        "firstStartTime": "",
        "firstEndTime": "",
        "secondStartTime": "",
        "secondEndTime": ""
      },
      {
        "day": "FR",
        "firstStartTime": "",
        "firstEndTime": "",
        "secondStartTime": "",
        "secondEndTime": ""
      },
      {
        "day": "SA",
        "firstStartTime": "",
        "firstEndTime": "",
        "secondStartTime": "",
        "secondEndTime": ""
      },
      {
        "day": "SU",
        "firstStartTime": "",
        "firstEndTime": "",
        "secondStartTime": "",
        "secondEndTime": ""
      }
    ]
  }
}
