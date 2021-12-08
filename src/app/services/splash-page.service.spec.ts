import { TestBed } from '@angular/core/testing';

import { SplashPageService } from './splash-page.service';

describe('SplashPageService', () => {
  let service: SplashPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SplashPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
