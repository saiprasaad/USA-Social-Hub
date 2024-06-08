import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {formatDate} from '@angular/common';

interface TimeSlot {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-choose-time-slot',
  templateUrl: './choose-time-slot.component.html',
  styleUrls: ['./choose-time-slot.component.css']
})
export class ChooseTimeSlotComponent implements OnInit {
  selected_time_slot = "1:00:00 - 2:00:00"
  current_date : String = ""
  timeslots: TimeSlot[] = [
    {value: '1:00:00 - 2:00:00', viewValue: '1:00 AM - 2:00 AM'},
    {value: '2:00:00 - 3:00:00', viewValue: '2:00 AM - 3:00 AM'},
    {value: '3:00:00 - 4:00:00', viewValue: '3:00 AM - 4:00 AM'},
    {value: '4:00:00 - 5:00:00', viewValue: '4:00 AM - 5:00 AM'},
    {value: '5:00:00 - 6:00:00', viewValue: '5:00 AM - 6:00 AM'},
    {value: '6:00:00 - 7:00:00', viewValue: '6:00 AM - 7:00 AM'},
    {value: '7:00:00 - 8:00:00', viewValue: '7:00 AM - 8:00 AM'},
    {value: '8:00:00 - 9:00:00', viewValue: '8:00 AM - 9:00 AM'},
    {value: '9:00:00 - 10:00:00', viewValue: '9:00 AM - 10:00 AM'},
    {value: '10:00:00 - 11:00:00', viewValue: '10:00 AM - 11:00 AM'},
    {value: '11:00:00 - 12:00:00', viewValue: '11:00 AM - 12:00 PM'},
    {value: '12:00:00 - 13:00:00', viewValue: '12:00 PM - 1:00 PM'},
    {value: '13:00:00 - 14:00:00', viewValue: '1:00 PM - 2:00 PM'},
    {value: '14:00:00 - 15:00:00', viewValue: '2:00 PM - 3:00 PM'},
    {value: '15:00:00 - 16:00:00', viewValue: '3:00 PM - 4:00 PM'},
    {value: '16:00:00 - 17:00:00', viewValue: '4:00 PM - 5:00 PM'},
    {value: '17:00:00 - 18:00:00', viewValue: '5:00 PM - 6:00 PM'},
    {value: '18:00:00 - 19:00:00', viewValue: '6:00 PM - 7:00 PM'},
    {value: '19:00:00 - 20:00:00', viewValue: '7:00 PM - 8:00 PM'},
    {value: '20:00:00 - 21:00:00', viewValue: '8:00 PM - 9:00 PM'},
    {value: '21:00:00 - 22:00:00', viewValue: '9:00 PM - 10:00 PM'},
    {value: '22:00:00 - 23:00:00', viewValue: '10:00 PM - 11:00 PM'},
    {value: '23:00:00 - 00:00:00', viewValue: '11:00 PM - 12:00 AM'},
  ];
  constructor(private router: Router) { 
    this.current_date = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    console.log(this.current_date)
  }

  ngOnInit(): void {
  }

  viewHeatMapForDefaultTimeSlot() {
    this.router.navigate(['/heat_map']);
  }

  viewHeatMapForSpecifiedTimeSlot() {
    console.log(this.selected_time_slot)
    console.log(this.current_date + ' ' +this.selected_time_slot.split(" - ")[0])
    console.log(this.current_date + ' '+this.selected_time_slot.split(" - ")[1])
    this.router.navigate(['/heat_map',this.current_date + ' ' +this.selected_time_slot.split(" - ")[0],this.current_date + ' ' +this.selected_time_slot.split(" - ")[1]]);
  }
}
