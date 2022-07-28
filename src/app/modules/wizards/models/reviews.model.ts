export class Reviews {
  id?: string | any;
  dealMongoID?: string;
  dealId?: string;
  dealHeader?: string;
  subDealHeader?: string;
  voucherMongoID?: string;
  voucherID?: string | any;
  customerID?: string;
  merchantID?: string;
  text?: string;
  totalRating: number;
  multipleRating?: multipleRatings[];
  customerEmail?: string;
  customerName?: string;
  profilePicURL?: string;
  voucherRedeemedDate?: number;
  updatedAt?: string
}

class multipleRatings {
  ratingName?: string;
  ratingScore?: number;
}
