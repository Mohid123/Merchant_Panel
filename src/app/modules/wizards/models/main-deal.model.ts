import { MediaUpload } from './../../../@core/models/requests/media-upload.model';
import { Vouchers } from "./vouchers.model";

export class MainDeal {
  id: string;
  dealID: string;
  subCategory: string;
  dealHeader: string;
  subTitle: string;
  description: string | any;
  categoryType: string;
  mediaUrl: MediaUpload[] | any[];
  startDate: string;
  endDate: string;
  vouchers: Vouchers[];
  termsAndCondition: string;
  merchantID: string;
  dealStatus: string;
  deletedCheck?: boolean;
  minRating?: number;
  maxRating?: number;
  ratingsAverage?: number;
  soldVouchers?: number;
  isCollapsed: boolean;
  highlights: string;
  aboutThisDeal: string;
  readMore: string;
  finePrints: string;
  pageNumber: number;
  netEarnings: number;
  isDuplicate: boolean;
  minOriginalPrice: number;
  minDealPrice: number;
  minDiscountPercentage: number;
}

export class Deals {
  data: MainDeal[];
  totalDeals?: number;
}


