import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YelpReviewsChartComponent } from './yelp-reviews-chart.component';

describe('YelpReviewsChartComponent', () => {
  let component: YelpReviewsChartComponent;
  let fixture: ComponentFixture<YelpReviewsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YelpReviewsChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YelpReviewsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
