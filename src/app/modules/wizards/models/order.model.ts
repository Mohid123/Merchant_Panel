export interface Orders {
  id: string;
  voucherID: string;
  voucherHeader: string;
  dealHeader: string;
  dealID: string;
  dealName: string;
  merchantID: string;
  customerID: string;
  amount: number;
  fee: number;
  net: number;
  status: string;
  paymentStatus: string;
  boughtDate: number;
  deletedCheck: boolean;
}
