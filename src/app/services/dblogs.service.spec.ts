import { TestBed } from '@angular/core/testing';

import { DblogsService } from './dblogs.service';

describe('DblogsService', () => {
  let service: DblogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DblogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
