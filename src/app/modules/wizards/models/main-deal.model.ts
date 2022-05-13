import { Vouchers } from "./vouchers.model";

export class MainDeal {
  id: string;
  subCategory: string;
  title: string;
  subTitle: string;
  description: string | any;
  categoryType: string;
  mediaUrl: string[];
  startDate: string;
  endDate: string;
  vouchers?: Vouchers[];
  termsAndCondition: string;
  merchantID: string;
  dealStatus: string;
  deletedCheck?: boolean;
  minRating?: number;
  maxRating?: number;
  ratingsAverage?: number;
  soldVouchers?: number;
  showDetail: string;

}

export class Deals {
  data: MainDeal[];
}

