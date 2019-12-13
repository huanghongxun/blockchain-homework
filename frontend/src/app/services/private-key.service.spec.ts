import { TestBed } from '@angular/core/testing';

import { PrivateKeyService } from './private-key.service';

describe('PrivateKeyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrivateKeyService = TestBed.get(PrivateKeyService);
    expect(service).toBeTruthy();
  });
});
