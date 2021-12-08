import { TestBed } from '@angular/core/testing';

import { OrderSelectorPageService } from './order-selector-page.service';

describe('OrderSelectorPageService', () => {
  let service: OrderSelectorPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderSelectorPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
