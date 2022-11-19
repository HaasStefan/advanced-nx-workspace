import { TestBed } from '@angular/core/testing';

import { FlightStoreService } from './flight-store.service';

describe('FlightStoreService', () => {
  let service: FlightStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
