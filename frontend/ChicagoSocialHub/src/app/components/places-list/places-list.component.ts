

import { Component,Injectable, OnInit,Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';


import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Place } from '../../modals/place'
import { PlacesService } from '../../services/places.service';

interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?:string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};


@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.css']
})
export class PlacesListComponent implements OnInit {

  uri = 'http://localhost:4000';
  // selectedValue;
  // registerView;
  circleRadius:number = 3000; // km

  public location:Location = {
    lat: 41.882607,
    lng: -87.643548,
    label: 'You are Here',
    zoom: 13
  };

  icon = {
      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      scaledSize: {
        width: 60,
        height: 60
      }
    }

  places: Place[]=[];
  

  displayedColumns = ['name', 'display_phone', 'address1', 'is_closed', 'rating','review_count', 'Divvy'];

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) { }


  ngOnInit() {
    this.retrievePlaces();
  }

  retrievePlaces() {
    this.placesService
      .retrievePlacesFromElasticSearch()
      .subscribe((data: Place[]) => {
        this.places = data;
      });
  }

  searchNearByStations(placeName:any) {
    this.placesService.retrieveStations(placeName).subscribe(() => {
      this.router.navigate(['/stations_found']);
    });

  }
}
