import { Image } from "./images.model";
import { SubDeal } from "./subdeal.model";

export class MainDeal {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  images?: Image[];
  status?: string;
  startDate?: string;
  endDate?: string;
  policy?: string;
  validDays?: number;
  deletedCheck?: boolean;
  subDeals?: SubDeal[];
}
