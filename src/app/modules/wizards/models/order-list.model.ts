import { Orders } from "./order.model";

export interface OrdersList {
  totalCount?: number;
  data: Orders[];
}
