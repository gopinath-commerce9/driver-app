import { TestBed } from '@angular/core/testing';

import { OrderDetailsPageService } from './order-details-page.service';

describe('OrderDetailsPageService', () => {
  let service: OrderDetailsPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderDetailsPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
