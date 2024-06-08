import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindPlacesComponent } from './find-places.component';

describe('FindPlacesComponent', () => {
  let component: FindPlacesComponent;
  let fixture: ComponentFixture<FindPlacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindPlacesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindPlacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
