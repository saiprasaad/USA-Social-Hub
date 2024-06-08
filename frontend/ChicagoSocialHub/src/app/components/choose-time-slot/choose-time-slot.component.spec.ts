import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTimeSlotComponent } from './choose-time-slot.component';

describe('ChooseTimeSlotComponent', () => {
  let component: ChooseTimeSlotComponent;
  let fixture: ComponentFixture<ChooseTimeSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseTimeSlotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseTimeSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
