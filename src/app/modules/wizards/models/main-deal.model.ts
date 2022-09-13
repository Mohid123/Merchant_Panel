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
  subDeals: Vouchers[];
  termsAndCondition: string;
  merchantDetails?: Merchant;
  merchantID: string;
  dealStatus: string;
  deletedCheck?: boolean;
  minRating?: number;
  maxRating?: number;
  ratingsAverage?: number;
  soldVouchers?: number;
  isCollapsed: boolean;
  isSpecialOffer?: boolean;
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
  reviewMediaUrl: MediaUpload[];
  dealPreviewURL?: string;
  editDealURL?: string;
}

export class Deals {
  data: MainDeal[];
  totalDeals?: number;
}

export interface Merchant {
  id: string | any;
  ratingsAverage: number | any;
  totalReviews: number | any;
  legalName: string | any;
  city: string | any;
}


