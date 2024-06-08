import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Place } from 'src/app/modals/place';
import { Station } from 'src/app/modals/station';
import { Location } from 'src/app/modals/location';
import { PlacesService } from 'src/app/services/places.service';
import { RealTimeLineChartsComponent } from '../real-time-line-charts/real-time-line-charts.component';
import { RealTimeSmaChartComponent } from '../real-time-sma-chart/real-time-sma-chart.component';


@Component({
  selector: 'app-stations-list',
  templateUrl: './stations-list.component.html',
  styleUrls: ['./stations-list.component.css']
})
export class StationsListComponent implements OnInit {

  constructor(private placesService: PlacesService, private router: Router) { }

  radius: number = 3000;
  stations: Station[] = [];
  markers: Station[] = [];
  placeSelected: Place = {} as Place;
  timeLimit:string = "";
  labelString = 'Your are Here'
  iconUrlString = "{ url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',scaledSize: {width: 40,height: 60}"

  ngOnInit(): void {
    this.retrievePlaceSelected();
    this.retrieveStationsNearBy();
  }

  showHeatMap() {
    this.router.navigate(['/choose_time_slot']);
  }

  getDivvyDailyTripsChart() {
    this.router.navigate(['/divvy_trips_chart']);
  }

  getSMALineChart(stationName:any){

    this.placesService.stationName = stationName;
    console.log(stationName);
    this.timeLimit = "1 HOUR";

    const realTimeLineChart = new RealTimeSmaChartComponent(this.placesService);

    this.router.navigate(['/realtime_sma_chart']);

    realTimeLineChart.create_d3_chart(stationName,this.placesService,this.timeLimit);


  }

  retrievePlaceSelected() {
    this.placesService
      .retrievePlaceSelected()
      .subscribe((data: Place | any) => {
        this.placeSelected = data;

      });
  }

  
  retrieveStationsNearBy() {
    this.placesService
      .retrieveStationsFromElasticSearch()
      .subscribe((data: Station[]) => {
        this.stations = data;
        this.markers = data;
      });
  }

  showLineChart(stationName: String) {
    this.placesService.stationName= stationName;
    this.timeLimit = "1 HOUR";

    const realTimeLineChart = new RealTimeLineChartsComponent(this.placesService);

    this.router.navigate(['/realtime_line_chart']);

    realTimeLineChart.create_d3_chart(stationName,this.placesService,this.timeLimit);
  }

  public location:Location = {
    lat: 41.840629,
    lng: -87.616033,
    label: 'You are Here',
    zoom: 13
  };

  icon :any = {
    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    scaledSize: {
      width: 60,
      height: 60
    }
  }
}



