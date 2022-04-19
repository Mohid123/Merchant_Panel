export interface MainDeal {
  id?: string;
  title?: string;
  subTitle?: string;
  description?: string | any;
  categoryType?: string;
  mediaUrl?: [string];
  startDate?: string;
  endDate?: string;
  vouchers?: [
    {
      subTitle?: string;
      originalPrice?: string;
      dealPrice?: string;
      discountPercentage?: number;
      details?: string;
      numberOfVouchers?: string;
      voucherValidity?: number;
      voucherStartDate?: Date | string;
      voucherEndDate?: Date | string;
    }
  ];
  termsAndCondition?: string;
  merchantID?: string;
  dealStatus?: string;
  deletedCheck?: boolean;
}
