import {Component, Input, OnInit} from '@angular/core';
import {Receipt} from '../../../../../models/receipt.model';
import {ReceiptService} from '../../../../../services/receipt.service';
import {normalizeDateFormat} from '../../../../../utils/date';
import {PrivateKeyService} from '../../../../../services/private-key.service';

@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.less']
})
export class ReceiptListComponent implements OnInit {
  @Input() state: 'in' | 'out';
  @Input() mode: 'view' | 'audit';
  @Input() receipts: Receipt[];
  receipt: Receipt;

  isVisible = false;
  amount: number;

  constructor(private receiptService: ReceiptService,
              private privateKeyService: PrivateKeyService) {
  }

  ngOnInit() {
  }

  returnCredit(receipt: Receipt) {
    this.receipt = receipt;
    this.isVisible = true;
  }

  doReturnCredit() {
    this.privateKeyService.request.next({
      callback: () => {
        this.receiptService.returnCredit(this.receipt.id, this.amount)
          .then(() => {
            this.receipt.audited = true;
            this.isVisible = false;
          });
      }
    });
  }

  acceptReceipt(receipt: Receipt) {
    this.privateKeyService.request.next({
      callback: () => {
        this.receiptService.accept(receipt.id, this.state)
          .then(() => receipt.audited = true);
      }
    });
  }

  declineReceipt(receipt: Receipt) {
    this.privateKeyService.request.next({
      callback: () => {
        this.receiptService.decline(receipt.id, this.state)
          .then(() => receipt.audited = false);
      }
    });
  }

  normalizeDateFormat(date: string) {
    return normalizeDateFormat(date);
  }

}
