import { TestBed } from '@angular/core/testing';

import { TextOverlayService } from './text-overlay.service';

describe('TextOverlayService', () => {
  let service: TextOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
