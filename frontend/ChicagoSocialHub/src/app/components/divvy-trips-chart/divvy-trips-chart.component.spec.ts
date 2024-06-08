import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivvyTripsChartComponent } from './divvy-trips-chart.component';

describe('DivvyTripsChartComponent', () => {
  let component: DivvyTripsChartComponent;
  let fixture: ComponentFixture<DivvyTripsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DivvyTripsChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivvyTripsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
