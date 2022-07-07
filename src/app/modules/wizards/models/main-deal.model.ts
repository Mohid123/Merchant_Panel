import { Vouchers } from "./vouchers.model";

export class MainDeal {
  id: string;
  dealID: string;
  subCategory: string;
  dealHeader: string;
  subTitle: string;
  description: string | any;
  categoryType: string;
  mediaUrl: any[];
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
  showDetail: string;
  highlights: string;
  aboutThisDeal: string;
  readMore: string;
  finePrints: string;
  pageNumber: number;
}

export class Deals {
  data: MainDeal[];
  totalDeals?: number;
}

