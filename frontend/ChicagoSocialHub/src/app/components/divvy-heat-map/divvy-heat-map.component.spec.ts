import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivvyHeatMapComponent } from './divvy-heat-map.component';

describe('DivvyHeatMapComponent', () => {
  let component: DivvyHeatMapComponent;
  let fixture: ComponentFixture<DivvyHeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DivvyHeatMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivvyHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
