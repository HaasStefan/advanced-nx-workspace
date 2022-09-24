import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerComponent } from './passenger.component';

describe('PassengerComponent', () => {
  let component: PassengerComponent;
  let fixture: ComponentFixture<PassengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PassengerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PassengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
