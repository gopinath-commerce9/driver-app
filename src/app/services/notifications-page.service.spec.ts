import { TestBed } from '@angular/core/testing';

import { NotificationsPageService } from './notifications-page.service';

describe('NotificationsPageService', () => {
  let service: NotificationsPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
