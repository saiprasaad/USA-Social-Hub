import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FindPlacesComponent } from './components/find-places/find-places.component';
import { PlacesListComponent } from './components/places-list/places-list.component';
import { YelpReviewsChartComponent } from './components/yelp-reviews-chart/yelp-reviews-chart.component';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';
import { PlacesService } from './services/places.service';
import { StationsListComponent } from './components/stations-list/stations-list.component';
import { RealTimeLineChartsComponent } from './components/real-time-line-charts/real-time-line-charts.component';
import { RealTimeSmaChartComponent } from './components/real-time-sma-chart/real-time-sma-chart.component';
import { DivvyTripsChartComponent } from './components/divvy-trips-chart/divvy-trips-chart.component';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { DivvyHeatMapComponent } from './components/divvy-heat-map/divvy-heat-map.component';
import { ChooseTimeSlotComponent } from './components/choose-time-slot/choose-time-slot.component';
import { DatePipe } from '@angular/common';

const routes: Routes = [
  { path: 'findplaces', component: FindPlacesComponent},
  { path: 'places_found', component: PlacesListComponent},
  { path: 'stations_found', component: StationsListComponent},
  { path: 'display_barcharts', component: YelpReviewsChartComponent},
  { path: 'realtime_line_chart', component: RealTimeLineChartsComponent},
  { path: 'realtime_sma_chart', component: RealTimeSmaChartComponent},
  { path: 'heat_map', component: DivvyHeatMapComponent},
  { path: 'heat_map/:start_time_slot/:end_time_slot', component: DivvyHeatMapComponent},
  { path: 'divvy_trips_chart', component: DivvyTripsChartComponent},
  { path: 'choose_time_slot', component: ChooseTimeSlotComponent},
  { path: '', redirectTo: 'findplaces', pathMatch: 'full'}
]
@NgModule({
  declarations: [
    AppComponent,
    FindPlacesComponent,
    PlacesListComponent,
    YelpReviewsChartComponent,
    StationsListComponent,
    RealTimeLineChartsComponent,
    RealTimeSmaChartComponent,
    DivvyTripsChartComponent,
    DivvyHeatMapComponent,
    ChooseTimeSlotComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule,
    FormsModule,
    NgbModule,
    MatCheckboxModule,
    SatDatepickerModule,
    SatNativeDateModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyAfZu5wL6qw-dlSHyG21qnkoB1Oq-mJ5vI'+ '&libraries=visualization'})
  ],
  providers: [PlacesService, GoogleMapsAPIWrapper, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
