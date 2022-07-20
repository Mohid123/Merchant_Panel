export class SingleReview {
  _id?: string;
  dealID?: string;
  dealHeader?: string;
  ratingsAverage?: number;
  totalReviews?: number;
  maxRating?: number;
  minRating?: number;
  Reviews?: Reviews[];
}

class Reviews {
  _id: string;
  dealMongoID: string;
  dealId: string;
  dealHeader: string;
  subDealHeader: string;
  voucherMongoID: string;
  voucherID: string;
  customerID: string;
  merchantID: string;
  text: string;
  totalRating: number;
  multipleRating?: multipleRatings[];
  customerEmail: string;
  customerName: string;
  profilePicURL: string;
  voucherRedeemedDate: number;
}


export class multipleRatings {
  ratingName?: string;
  ratingScore?: number;
}

export class ReplySchema {
  reviewID?: string;
  merchantID?: string;
  voucherID?: string;
  merchantName?: string;
  legalName?: string;
  profilePicURL?: string;
  merchantReplyText?: string;
  deletedCheck: boolean;
}
