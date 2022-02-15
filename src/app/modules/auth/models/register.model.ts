export class RegisterModel {
  category: number | null;
  firstName: string;
  lastName: string;
  email: string;
  mobile: number | null;
  companyName: string;
  streetAddress: string;
  zip: number | null;
  city: string;
  province: number | null;
  website: string;

  setModel(_model: unknown) {
    const model = _model as RegisterModel;
    this.category = model.category;
    this.firstName = model.firstName || '';
    this.lastName = model.lastName || '';
    this.email = model.email || '';
    this.mobile = model.mobile || null;
    this.companyName = model.companyName || './assets/media/users/default.jpg';
    this.streetAddress = model.streetAddress || '';
    this.zip = model.zip || null;
    this.city = model.city || '';
    this.province = model.province || null;
    this.website = model.website;
  }
}
