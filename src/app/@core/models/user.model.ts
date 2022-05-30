export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  businessType: string;
  legalName: string;
  tradeName: string;
  streetAddress: string;
  zipCode: number;
  city: string;
  vatNumber: number;
  iban: string;
  bankName: string;
  province: string;
  website_socialAppLink: string;
  googleMapPin: string;
  businessHours: BusinessHours[];
  finePrint: string;
  aboutUs: string;
  profilePicURL: string;
  profilePicBlurHash: string;
  deletedCheck: boolean;
  status: string;
  newUser: boolean;
  voucherPinCode: number;
  gallery: Gallery[];
}

interface BusinessHours {
  day: string;
  firstStartTime: string;
  firstEndTime: string;
  secondStartTime: string;
  secondEndTime: string;
  isWorkingDay: boolean;
}

export interface Gallery {
  pictureUrl: string,
  pictureBlurHash: string
}

