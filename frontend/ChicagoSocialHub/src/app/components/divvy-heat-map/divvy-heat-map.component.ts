import { AfterViewInit, Component,Input,ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { google } from 'google-maps';

import { Station } from '../../modals/station';
import { PlacesService } from '../../services/places.service';
import { Location } from 'src/app/modals/location';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common'
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-divvy-heat-map',
  templateUrl: './divvy-heat-map.component.html',
  styleUrls: ['./divvy-heat-map.component.scss']
})
export class DivvyHeatMapComponent implements OnInit {

 
  FRAMES_PER_HOUR = 30;
  FRAMES_PER_DAY = 24;
  FRAMES_PER_WEEK = 7;

  PAST_HOUR =  'Past Hour';
  PAST_24_HOURS =  'Last 24 Hours';
  PAST_7_DAYS =  'Last 7 Days';

  newTimeRangeSelection = true;
  notNewTimeRangeSelection = false;

  timeRangeSelected = this.PAST_HOUR;

  google: google = {} as google;
  gradient : any;
  gradientStep = -1;
  newGradient : any;
  distinct = [];
  stations:Station[] = [];
  heatMapData: any[] = [];
  timeArray:any;
  timeOffset = 0;
  timer:any;

  noOfDivvyDataSamplesRequested: number = 0;
  noOfDivvyDataSamplesProcessed: number = 0;

  currentChicagoTime:any;
  start_time_slot : string | null = ""
  end_time_slot : string | null = ""
  timeStamp:any;
  currentTime:any;

  timeValues = [
    { id : this.PAST_HOUR, value: this.PAST_HOUR},
    { id : this.PAST_24_HOURS, value: this.PAST_24_HOURS},
    { id : this.PAST_7_DAYS, value: this.PAST_7_DAYS}
  ];

  private map: google.maps.Map | null = null
  heatmap: google.maps.visualization.HeatmapLayer | null = null


  constructor(private placesService:PlacesService, private activatedRoute : ActivatedRoute, private datepipe: DatePipe) {
   
  }


  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      console.log(params.get('start_time_slot'))
      console.log(params.get('end_time_slot'))
      if(params.get('start_time_slot') != null && params.get('end_time_slot') != null) {
        console.log("kdnfkdmf")
      this.start_time_slot = params.get('start_time_slot');
      var temp = new Date(String(params.get('start_time_slot')))
      temp.setMinutes(temp.getMinutes() + 2)
      this.end_time_slot = String(temp)
      this.noOfDivvyDataSamplesProcessed=2;
      this.timeRangeSelected = this.PAST_HOUR;
    }
    });
    if(this.start_time_slot == null && this.end_time_slot == null) {
    this.timeRangeSelected = this.PAST_HOUR;
    this.noOfDivvyDataSamplesProcessed=2;
    }
  }

changeTimeRangeSelected(data:any){
  //console.log('this.timeRangeSelected', this.timeRangeSelected);
  this.clearHeatMap();
  this.noOfDivvyDataSamplesProcessed = 0;
  clearTimeout(this.timer);
  this.getDivvyStationsStatus(this.newTimeRangeSelection);
}

checkForSingleDigitAndPrefixZeroIfNeeded(digitValue:any) {

  if (digitValue < 10) 
    digitValue = "0" + digitValue;
  
  return digitValue;
}



///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

getDivvyStationsStatus(timeRangeSelection:any){

  var simulatedClockTime;
  var currentTime= new Date();

  var startTimeForDataCollection:any ;
  var currentTimeForDataCollection ;

  if (this.timeRangeSelected == this.PAST_HOUR){
    this.noOfDivvyDataSamplesRequested = this.FRAMES_PER_HOUR;
    startTimeForDataCollection = new Date(currentTime.getTime()-60 * 60 * 1000);
    currentTimeForDataCollection = new Date(startTimeForDataCollection.getTime()+this.timeOffset);
  } 


  if (this.timeRangeSelected == this.PAST_24_HOURS){
    this.noOfDivvyDataSamplesRequested = this.FRAMES_PER_DAY;
    startTimeForDataCollection = new Date(currentTime.getTime()-60 * 60 * 1000*24);
    currentTimeForDataCollection = new Date(startTimeForDataCollection.getTime()+this.timeOffset);
  } 

  if (this.timeRangeSelected == this.PAST_7_DAYS){
    this.noOfDivvyDataSamplesRequested = this.FRAMES_PER_WEEK;
    startTimeForDataCollection = new Date(currentTime.getTime()-60 * 60 * 1000*24*7);
    currentTimeForDataCollection = new Date(startTimeForDataCollection.getTime()+this.timeOffset);
  } 




  if(this.noOfDivvyDataSamplesProcessed < this.noOfDivvyDataSamplesRequested){

    this.placesService.get_all_divvy_stations_data(this.timeRangeSelected, timeRangeSelection).subscribe((data: any) => {
      //console.log('getDivvyStationsStatus -- noOfDivvyDataSamplesProcessed=', this.noOfDivvyDataSamplesProcessed);
      this.noOfDivvyDataSamplesProcessed = this.noOfDivvyDataSamplesProcessed + 1;


      // Adjust time Offset for the next cycle by 2 minutes
      // for example: 2, 4, 6, 8, 10, ...
      // So, current time is 
      if (this.timeRangeSelected == this.PAST_HOUR){
        this.timeOffset = (this.noOfDivvyDataSamplesProcessed) * (60 * 1000 * 2);
      } else 
              if (this.timeRangeSelected == this.PAST_24_HOURS){
                this.timeOffset = (this.noOfDivvyDataSamplesProcessed) * (60 * 60 * 1000);
              } else 
                      if (this.timeRangeSelected == this.PAST_7_DAYS){
                        this.timeOffset = (this.noOfDivvyDataSamplesProcessed) * (24 * 60 * 60 * 1000);
                      }

      currentTimeForDataCollection = new Date(startTimeForDataCollection.getTime()+this.timeOffset);
      let monthNumber = this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getMonth()+ 1) ;
      simulatedClockTime = currentTimeForDataCollection.getFullYear() +'-'+ 
                            monthNumber + '-' +
                            this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getDate()) + '\t' +
                            this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getHours()) + ':' +
                            this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getMinutes()) + ':' +
                            this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getSeconds());

      this.timeStamp = simulatedClockTime;



      // Now clear the HeatMap and then plot the data on the heatmap
      this.clearHeatMap();
      this.plot_availableDocksInDivvyStations_on_heatMap(data);
      

      // Not a new time-range selection, so continue calling the same method but 
      // with new time offset increment
      this.timer = setTimeout(() =>  this.getDivvyStationsStatus(this.notNewTimeRangeSelection) , 300);
    });
  }
}


  getDivvyStationsStatusForTimeSlot(start_time_slot:any, end_time_slot:any, timeRangeSelection:any){

    var simulatedClockTime;
    var currentTime= new Date();
  
    var startTimeForDataCollection:any ;
    var currentTimeForDataCollection ;
  
      this.noOfDivvyDataSamplesRequested = this.FRAMES_PER_HOUR + 1;

      startTimeForDataCollection = new Date(new Date(start_time_slot));
      currentTimeForDataCollection = new Date(end_time_slot);
  
      console.log(startTimeForDataCollection)
      console.log(currentTimeForDataCollection)
  
  
  
    if(this.noOfDivvyDataSamplesProcessed < this.noOfDivvyDataSamplesRequested){
      this.placesService.get_all_divvy_stations_data_for_specified_time_slot(start_time_slot, end_time_slot, timeRangeSelection).subscribe((data: any) => {
        //console.log('getDivvyStationsStatus -- noOfDivvyDataSamplesProcessed=', this.noOfDivvyDataSamplesProcessed);
        this.noOfDivvyDataSamplesProcessed = this.noOfDivvyDataSamplesProcessed + 1;
  
  

          this.timeOffset = (this.noOfDivvyDataSamplesProcessed) * (60 * 1000 * 2);

        currentTimeForDataCollection = new Date(startTimeForDataCollection.getTime()+this.timeOffset);
        let monthNumber = this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getMonth()+ 1) ;
        simulatedClockTime = currentTimeForDataCollection.getFullYear() +'-'+ 
                              monthNumber + '-' +
                              this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getDate()) + '\t' +
                              this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getHours()) + ':' +
                              this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getMinutes()) + ':' +
                              this.checkForSingleDigitAndPrefixZeroIfNeeded(currentTimeForDataCollection.getSeconds());
  
        
  
  
  
        // Now clear the HeatMap and then plot the data on the heatmap
        this.clearHeatMap();
        this.plot_availableDocksInDivvyStations_on_heatMap(data);


        
  
        // Not a new time-range selection, so continue calling the same method but 
        // with new time offset increment
        this.timer = setTimeout(() =>  this.getDivvyStationsStatusForTimeSlot(start_time_slot, formatDate(end_time_slot, 'yyyy-MM-dd HH:mm:ss', 'en'), this.notNewTimeRangeSelection) , 300);
      });
      start_time_slot = end_time_slot
      var temp_time_slot = new Date(end_time_slot)
      temp_time_slot.setMinutes(temp_time_slot.getMinutes() + 2);
      end_time_slot = temp_time_slot
      this.timeStamp = formatDate(end_time_slot, 'yyyy-MM-dd HH:mm:ss', 'en');
      console.log(this.timeStamp)
    }
  
  // we are done ... reset time offset to zero
  this.timeOffset = 0;
}

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

plot_availableDocksInDivvyStations_on_heatMap(availableDocksInDivvyStations:any){
  let locationsOfAvailableDocksInDivvyStations=[];

  this.stations = availableDocksInDivvyStations;
  //console.log("data",this.stations.length);

  for (let i = 0; i < this.stations.length; i++) {
    let divvy_dock_station_location = {
      location: new google.maps.LatLng(this.stations[i].latitude, this.stations[i].longitude),
      weight: this.stations[i].availableDocks
    }
    locationsOfAvailableDocksInDivvyStations.push(divvy_dock_station_location);
  }

  this.heatMapData = locationsOfAvailableDocksInDivvyStations;

  this.heatmap = new google.maps.visualization.HeatmapLayer({
    data: this.heatMapData
  });

  this.heatmap.setMap(this.map);
}





////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

public location:Location = {
  lat: 41.882607,
  lng: -87.643548,
  label: 'You are Here',
  zoom: 10
};


onMapLoad(mapInstance: google.maps.Map) {

  if(this.start_time_slot?.length==0 && this.end_time_slot?.length == 0) {
  // default display is Past Hour data
  this.timeRangeSelected = this.PAST_HOUR;

  this.map = mapInstance;

  this.getDivvyStationsStatus(true);
  } else {
    console.log(this.start_time_slot)
    console.log(this.end_time_slot)
    this.getDivvyStationsStatusForTimeSlot(this.start_time_slot, formatDate(String(this.end_time_slot), 'yyyy-MM-dd HH:mm:ss', 'en'), true)
    this.timeRangeSelected = this.PAST_HOUR;

  this.map = mapInstance;

  }
}


clearHeatMap(){
  if(this.heatmap){
    this.heatmap.setMap(null);
    this.heatMapData =[];
  }

}


ngOnDestroy() {

  this.map = {} as google.maps.Map;
  this.heatmap = {} as google.maps.visualization.HeatmapLayer;
       
}

}
