import { TestBed } from '@angular/core/testing';

import { AccountPageService } from './account-page.service';

describe('AccountPageService', () => {
  let service: AccountPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
