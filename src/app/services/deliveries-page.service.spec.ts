import { TestBed } from '@angular/core/testing';

import { DeliveriesPageService } from './deliveries-page.service';

describe('DeliveriesPageService', () => {
  let service: DeliveriesPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveriesPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
