import { Reviews } from './reviews.model';
export class ReviewList {
  data: Reviews[];
  filteredDealCount: number;
  overallRating: number;
  totalDeals: number;
  totalMerchantReviews: number;
}
