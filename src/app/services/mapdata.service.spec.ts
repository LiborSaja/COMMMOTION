import { TestBed } from '@angular/core/testing';

import { MapdataService } from './mapdata.service';

describe('MapdataService', () => {
  let service: MapdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
