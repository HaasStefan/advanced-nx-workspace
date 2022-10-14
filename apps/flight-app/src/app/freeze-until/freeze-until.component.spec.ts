import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezeUntilComponent } from './freeze-until.component';

describe('CacheUntilComponent', () => {
  let component: FreezeUntilComponent;
  let fixture: ComponentFixture<FreezeUntilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreezeUntilComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FreezeUntilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
