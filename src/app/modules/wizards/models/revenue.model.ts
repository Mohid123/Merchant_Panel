export class NetRevenue {
  totalDeals: number;
  maxRevenueForMonth: number;
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
  counts: soldVouchers[];
  maxCount: number;
}

export class soldVouchers {
  createdAt: string;
  count: number;
}

export class Activities {
  activityType: string;
  activityTime: number;
  merchantID: string;
  merchantMongoID: string;
  message: string;
  deletedCheck: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export class ActivityData {
  totalActivities: number;
  data: Activities[];
}

export function getMonths(months: string[]) {
  const monthMap = months.map((value: string) => {
    switch(value) {
      case "01":
        return "Jan";
      case "02":
        return "Feb";
      case "03":
        return "Mar";
      case "04":
        return "Apr";
      case "05":
        return "May";
      case "06":
        return "Jun";
      case "07":
        return "Jul";
      case "08":
        return "Aug";
      case "09":
        return "Sep";
      case "10":
        return "Oct";
      case "11":
        return "Nov";
      case "12":
        return "Dec";
    }
  });
  return monthMap
}
