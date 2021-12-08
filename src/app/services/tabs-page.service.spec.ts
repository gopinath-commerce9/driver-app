import { TestBed } from '@angular/core/testing';

import { TabsPageService } from './tabs-page.service';

describe('TabsPageService', () => {
  let service: TabsPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabsPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
