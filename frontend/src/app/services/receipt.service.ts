import { Injectable } from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor(private api: ApiService) { }

  public transferCredit(debteeAddress: string, amount: number, deadline: Date) {
    return this.api.post(`/user/transfer/${debteeAddress}`, {
      amount,
      deadline
    });
  }

  public returnCredit(receiptId: number, amount: number) {
    return this.api.post(`/user/return/${receiptId}`, {
      amount
    });
  }

  public acceptTransfer(receiptId: number) {
    return this.api.put(`/receipt/${receiptId}`, {});
  }

  public declineTransfer(receiptId: number) {
    return this.api.delete(`/receipt/${receiptId}`, {});
  }

  public acceptReturn(receiptId: number) {
    return this.api.put(`/return/${receiptId}`, {});
  }

  public declineReturn(receiptId: number) {
    return this.api.delete(`/user/return/${receiptId}`, {});
  }

  public accept(receiptId: number, action: 'in' | 'out') {
    if (action === 'in') {
      return this.acceptTransfer(receiptId);
    } else {
      return this.acceptReturn(receiptId);
    }
  }

  public decline(receiptId: number, action: 'in' | 'out') {
    if (action === 'in') {
      return this.declineTransfer(receiptId);
    } else {
      return this.declineReturn(receiptId);
    }
  }

}
