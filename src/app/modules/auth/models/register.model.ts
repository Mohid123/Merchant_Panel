export class RegisterModel {
  businessProfile: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number | null;
  companyName: string;
  streetAddress: string;
  zipCode: number | null;
  city: string;
  province: number | null;
  website_socialAppLink: string;
  role: string;
  status: string;
  businessHours: any;

  setModel(_model: unknown) {
    const model = _model as RegisterModel;
    this.businessProfile = model.businessProfile;
    this.firstName = model.firstName || '';
    this.lastName = model.lastName || '';
    this.email = model.email || '';
    this.phoneNumber = model.phoneNumber || null;
    this.companyName = model.companyName || './assets/media/users/default.jpg';
    this.streetAddress = model.streetAddress || '';
    this.zipCode = model.zipCode || null;
    this.city = model.city || '';
    this.province = model.province || null;
    this.website_socialAppLink = model.website_socialAppLink;
    this.role = 'Merchant';
    this.status= 'Pending';
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
