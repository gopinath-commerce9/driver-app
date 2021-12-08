import { TestBed } from '@angular/core/testing';

import { DeliveredPageService } from './delivered-page.service';

describe('DeliveredPageService', () => {
  let service: DeliveredPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveredPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
