export enum ReceiptState {
  SUBMITTED = 0,
  ACCEPTED = 1,
  DECLINED = 2,
  RETURN = 3
}

export interface Receipt {
  debtorAddress: string;
  debtorName: string;
  debteeAddress: string;
  debteeName: string;

  id: number;
  amount: number;
  deadline: string;
  valid: ReceiptState;

  audited?: boolean; // 仅供本地使用
}
