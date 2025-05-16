import { TestBed } from '@angular/core/testing';

import { MenuOverlayService } from './menu-overlay.service';

describe('MenuOverlayService', () => {
  let service: MenuOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
