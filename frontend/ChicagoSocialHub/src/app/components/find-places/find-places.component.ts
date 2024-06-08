import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router';
import { PlacesService } from 'src/app/services/places.service';

@Component({
  selector: 'app-find-places',
  templateUrl: './find-places.component.html',
  styleUrls: ['./find-places.component.css']
})
export class FindPlacesComponent implements OnInit {
  form: FormGroup ;
  constructor(private fb: FormBuilder, private router: Router, private placeService: PlacesService) {
    
    this.form = this.fb.group ({
      
      category: [null, [Validators.required]],
      
      place: [null, [Validators.required]]
      
      });
  }
  
    ngOnInit (): void {
  }

  retrievePlaces(category:any, place:any) {
    console.log(category)
    console.log(place)
    this.placeService.searchPlaces(category,place).subscribe(() => {
      this.router.navigate(['/places_found']) 
    })
  }
}

