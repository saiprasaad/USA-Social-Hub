import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// @ts-ignore
import { Observable, Observer, of } from 'rxjs';
import {Place} from '../modals/place'
import { Station } from '../modals/station';

const httpHeader = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  stationName : String = 'None';
  Emmiter: any = {};
  time_interval: any = {};
  constructor(private http:HttpClient) { }
  serverUri = 'http://localhost:4000';
  
  retrievePlacesFromElasticSearch() : Observable<Place[]> {
    return this.http.get<Place[]>(`${this.serverUri}/places`);
  }

  retrieveStationsFromElasticSearch() : Observable<Station[]> {
    return this.http.get<Station[]>(`${this.serverUri}/stations`);
  }

  retrievePlaceSelected() {
    return this.http.get(`${this.serverUri}/place_selected`);
  }

  searchPlaces(find:any, where:any) {
    const find_places = {
      find: find,
      where: where
    };
    return this.http.post(`${this.serverUri}/places/find`, find_places, httpHeader);
  }

  retrieveStations(placeName:any) {
    const find_stations_at = {
      placeName: placeName
    };
    var str = JSON.stringify(find_stations_at, null, 2);
    return this.http.post(`${this.serverUri}/stations/find`, find_stations_at, httpHeader);
  }

  getStationSelected() {
    return this.http.get(`${this.serverUri}/station_selected`);
  }


  retreiveStationSelected() {
    return this.http.get(`${this.serverUri}/stations`);
  }

  retrieveDocks() {
    return this.http.get(`${this.serverUri}/docks`);
  }

  getStationDocksLog(placeName:String,timeRange:String) {
    const find_stations_at = {
      placeName: placeName,
      timeRange:timeRange
    };

    var str = JSON.stringify(find_stations_at, null, 2);

    return this.http.post(`${this.serverUri}/stations/getdocks`, find_stations_at, httpHeader);

  }

  
  pulledNewStationDocksDataFromServer = (stationName: String, timeRange: String): Observable<Station[]> => {

    return Observable.create((observer: any) => {
      this.Emmiter = observer;
      this.time_interval = setInterval(() => {
        observer.next({

         getStationDocksLog(placeName:String,timeRange: String) {
           const find_stations_at = {
             placeName: placeName,
             timeRange:timeRange
           };

           var str = JSON.stringify(find_stations_at, null, 2);

           return this.http.post(`${this.uri}/stations/getdocks`, find_stations_at, httpHeader);

         }
         });
    }, 300000);
    });
  }

  get_all_divvy_stations_data(timeRange:any, newTimeRangeSelection:any){
    const find_stations_at = {

      timeRange:timeRange,
      newTimeRangeSelection: newTimeRangeSelection

    };

    var str = JSON.stringify(find_stations_at, null, 2);


    return this.http.post(`${this.serverUri}/stations/fetch_all_divvy_stations_data`, find_stations_at, httpHeader);

  }

  get_all_divvy_stations_data_for_specified_time_slot(start_time_slot:any, end_time_slot:any, newTimeRangeSelection:any) {
    const find_stations_at = {

      start_date_time:start_time_slot,
      end_date_time:end_time_slot,
      newTimeRangeSelection: newTimeRangeSelection

    };

    console.log(find_stations_at)

    var str = JSON.stringify(find_stations_at, null, 2);


    return this.http.post(`${this.serverUri}/stations/fetch_all_divvy_stations_data_by_time_slot`, find_stations_at, httpHeader);

  }


  getDivvyTripsCountsPerDay(day:any,selectedDate:any){
    const find_stations_at = {
      day: day,
      selectedDate:selectedDate
    };

    var str = JSON.stringify(find_stations_at, null, 2);


    return this.http.post(`${this.serverUri}/countDivvyTripsPerDay`, find_stations_at, httpHeader);
  }

  getDivvyTripsCountsForSunday() {
    return this.http.get(`${this.serverUri}/getDivvyTripsCountsSunday`);
  }
  getDivvyTripsCountsForMonday() {
    return this.http.get(`${this.serverUri}/getDivvyTripsCountsForMonday`);
  }
  getDivvyTripsCountsForTuesday() {
    return this.http.get(`${this.serverUri}/getDivvyTripsCountsForTuesday`);
  }
  getDivvyTripsCountsForWednesday() {
    return this.http.get(`${this.serverUri}/getDivvyTripsCountsForWednesday`);
  }
  getDivvyTripsCountsForThursday() {
    return this.http.get(`${this.serverUri}/getDivvyTripsCountsForThursday`);
  }
  getDivvyTripsCountsForFriday() {
    return this.http.get(`${this.serverUri}/getDivvyTripsCountsForFriday`);
  }
  getDivvyTripsCountsForSaturday() {
    return this.http.get(`${this.serverUri}/getDivvyTripsCountsForSaturday`);
  }

}
