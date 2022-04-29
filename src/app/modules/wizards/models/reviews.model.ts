import { SingleReview } from './single-review.model';
export class Reviews {
  _id: string;
  title: string;
  ratingsAverage: number;
  totalReviews: number;
  maxRating: number;
  minRating: number;
  Reviews: SingleReview[];
}
