import { TestBed } from '@angular/core/testing';

import { ReceiptService } from './receipt.service';

describe('ReceiptService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReceiptService = TestBed.get(ReceiptService);
    expect(service).toBeTruthy();
  });
});
