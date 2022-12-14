export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  businessType: string;
  companyName: string;
  streetAddress: string;
  zipCode: number;
  city: string;
  vatNumber: number;
  province: string;
  website_socialAppLink: string;
  googleMapPin: string;
  businessHours: BusinessHours;
  aboutStore: string;
  generalTermsAgreements: string;
  profilePicURL: string;
  profilePicBlurHash: string;
  deletedCheck: boolean;
  status: string;
}

interface BusinessHours {
  day: string;
  firstStartTime: string;
  firstEndTime: string;
  secondStartTime: string;
  secondEndTime: string;
}
