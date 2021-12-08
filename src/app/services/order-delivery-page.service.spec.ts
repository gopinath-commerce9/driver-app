import { TestBed } from '@angular/core/testing';

import { OrderDeliveryPageService } from './order-delivery-page.service';

describe('OrderDeliveryPageService', () => {
  let service: OrderDeliveryPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderDeliveryPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
