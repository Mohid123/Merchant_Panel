export class NetRevenue {
  totalDeals: number;
  totalVouchersSold: number;
  overallRating: number;
  netRevenue: number;
  from: string;
  to:string;
  yearlyRevenue: number;
  vouchers: revenueVouchers[];
}

export class revenueVouchers {
  netRevenue: number;
  month: string;
}

export class SoldVouchers {
  soldVouchers: soldVouchers[];
}

export class soldVouchers {
  createdAt: string;
  count: number;
}
