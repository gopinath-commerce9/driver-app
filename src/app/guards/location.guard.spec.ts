import { TestBed } from '@angular/core/testing';

import { LocationGuard } from './location.guard';

describe('LocationGuard', () => {
  let guard: LocationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LocationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
