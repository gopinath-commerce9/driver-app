import { TestBed } from '@angular/core/testing';

import { DeliveryLocatorService } from './delivery-locator.service';

describe('DeliveryLocatorService', () => {
  let service: DeliveryLocatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryLocatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
