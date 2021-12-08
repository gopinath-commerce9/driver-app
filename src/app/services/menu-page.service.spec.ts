import { TestBed } from '@angular/core/testing';

import { MenuPageService } from './menu-page.service';

describe('MenuPageService', () => {
  let service: MenuPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
