import { TestBed } from '@angular/core/testing';

import { LogsdataService } from './logsdata.service';

describe('LogsdataService', () => {
  let service: LogsdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogsdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
