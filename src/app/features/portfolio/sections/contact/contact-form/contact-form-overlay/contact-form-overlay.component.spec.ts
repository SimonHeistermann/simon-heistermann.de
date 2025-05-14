import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactFormOverlayComponent } from './contact-form-overlay.component';

describe('ContactFormOverlayComponent', () => {
  let component: ContactFormOverlayComponent;
  let fixture: ComponentFixture<ContactFormOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFormOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactFormOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
