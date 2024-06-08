import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// @ts-ignore
import {  Subscription } from 'rxjs';

import * as d3Time from 'd3-time-format';

import { Station } from '../../modals/station';
import { Dock } from '../../modals/dock';
import { PlacesService } from '../../services/places.service';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { VERSION } from '@angular/material/core';

@Component({
  selector: 'app-real-time-sma-chart',
  templateUrl: './real-time-sma-chart.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./real-time-sma-chart.component.css']
})
export class RealTimeSmaChartComponent implements OnInit {

  ngOnInit() {
    this.timePeriodSelected ="1 HOUR";
    this.stationNameSelected = this.placesService.stationName;
    this.title = 'Divvy Dock Station:    ' + this.stationNameSelected;
    this.createPriodicTaskToPullStationDataFromServer();
  }

  private margin = {top: 50, right: 20, bottom: 30, left: 150};
  private width: number;
  docksArray: Dock[] = [];

  docksArray2: Dock[] = [];

  docksArray3: Dock[] = [];


  timePeriodSelected: string = "";

  stationSelected:Station = {} as Station;
  value:number = 0;
  SMALineChart:Subscription = {} as Subscription;
  LineChart: Subscription = {} as Subscription;
  stationNameSelected: any ;
  title: string = "";
  padding = 1;


  timePeriods = [
     { id : '1 HOUR', value: 'Past Hour'},
     { id : '24 HOUR', value: 'Last 24 Hours'},
     { id : '7 DAY', value: 'Last 7 Days'}
   ];

   private height: number;
   private x: any;
   private y: any;
   private svg: any;
   private line: d3Shape.Line<[number, number]> = {} as d3Shape.Line<[number, number]>;

   private movingAverageLine1: d3Shape.Line<[number, number]> = {} as d3Shape.Line<[number, number]>
   private movingAverageLine: d3Shape.Line<[number, number]> = {} as d3Shape.Line<[number, number]> 
   version = VERSION;

  constructor(private placesService: PlacesService) {
      this.width = 900 - this.margin.left - this.margin.right;
      this.height = 500 - this.margin.top - this.margin.bottom;
  }




  changeTimePeriodSelected(data:any){
      this.build_d3_chart('green',0,this.timePeriodSelected);
  }

  createPriodicTaskToPullStationDataFromServer(){


   this.placesService.getStationSelected().subscribe((data: any) => {
     this.stationSelected = data;
     this.LineChart = this.placesService.pulledNewStationDocksDataFromServer(this.placesService.stationName, this.timePeriodSelected).subscribe((res: any) => {
       this.create_d3_chart(this.placesService.stationName,this.placesService,this.timePeriodSelected);
     });
   });
}

  build_d3_chart(color:any,value:any,type:any){
      this.placesService.getStationSelected().subscribe((data: any) => {
           this.stationSelected = data;
           this.create_d3_chart(this.stationSelected.stationName,this.placesService,this.timePeriodSelected);
      });

    }

    create_d3_chart(stationName:any,placesService:PlacesService,timeRange:any) {


      this.stationNameSelected = stationName;
      this.title = 'Divvy Dock Station:    ' + this.stationNameSelected;
        
      placesService.getStationDocksLog(stationName,timeRange).subscribe(() => {
         this.fetchDocks(placesService,timeRange);
      });
    }


    fetchDocks(placesService:PlacesService,timeRange:any) {
      console.log("fetching docks")
       placesService
         .retrieveDocks()
            .subscribe((data: any) => {
                  this.docksArray = data;
                  this.docksArray2 = this.movingAverage(this.docksArray, 1);	
                  this.docksArray3 = this.movingAverage(this.docksArray2, 24);
                  console.log(this.docksArray);
                  console.log(this.docksArray2);
                  console.log(this.docksArray3);
                  this.updateChart();
                  this.initSvg();
                  this.initAxis();
                  this.create_d3_chart_legend(timeRange);
                  this.create_d3_chart_X_Y_Axis(timeRange);
                  this.create_d3_line();
            });
  }

  movingAverage = (data:any, hourinterval:any) => {
      var arr:any = []
      data.map((row:any, index:any, total:any) => {
        const end = total.length - index - 1
        var startindex = end
        const endtime = total[end].lastCommunicationTime
        var starttime = new Date(endtime)
        starttime.setHours(starttime.getHours() - hourinterval)
        var timelimit = new Date(total[total.length - 1].lastCommunicationTime)
        timelimit.setHours(timelimit.getHours() - 168);
        var last_communicated_time = total[startindex].lastCommunicationTime.toString();
        var lastCommTime_Date = new Date(last_communicated_time);
        var end_time = total[end].lastCommunicationTime.toString();
        var end_time_Date = new Date(end_time);
        var sum = 0
        var count = 0
        while (total[startindex] != undefined && lastCommTime_Date > starttime) {
          sum += total[startindex].availableDocks
          count++
          startindex--
        }
        if (end_time_Date > timelimit) {
          var avg = sum / count
          if (total[startindex] != undefined) {
            startindex++
          }
          arr.push({ lastCommunicationTime: total[end].lastCommunicationTime, availableDocks: avg })
        }
      });

      return arr;
    }


  private initSvg() {
      this.svg = d3.select('#svg')
          .append('g')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
 }

 private initAxis() {
      this.x = d3Scale.scaleTime().range([0, this.width]);
      this.y = d3Scale.scaleLinear().range([this.height, 0]);

      this.x.domain(d3Array.extent(this.docksArray, (d) => new Date(d.lastCommunicationTime.replace(/-/g,'/').toString() )));
      this.y.domain([0, d3Array.max(this.docksArray, (d) => d.availableDocks)]);

 }

 private setTimeIncrementFor_X_Axis(timeRange : any){
    if(timeRange=="1 HOUR"){
         this.svg.append('g')
         .attr('class', 'axis axis--x')
         .attr('transform', 'translate(0,' + this.height + ')')
         .call(d3Axis.axisBottom(this.x)
         .ticks(d3.timeMinute.every(2)))
         .selectAll("text")
         .attr("y", 0)
         .attr("x", 9)
         .attr("dy", ".35em")
         .attr("transform", "rotate(45)")
         .style("text-anchor", "start")
    }
    else if(timeRange=="24 HOUR"){
             this.svg.append('g')
             .attr('class', 'axis axis--x')
             .attr('transform', 'translate(0,' + this.height + ')')
             .call(d3Axis.axisBottom(this.x)
             .ticks(d3.timeHour.every(1)))
             .selectAll("text")
             .attr("y", 0)
             .attr("x", 9)
             .attr("dy", ".35em")
             .attr("transform", "rotate(45)")
             .style("text-anchor", "start")
         }
         else if(timeRange=="7 DAY"){

                       this.svg.append('g')
                       .attr('class', 'axis axis--x')
                       .attr('transform', 'translate(0,' + this.height + ')')
                       .call(d3Axis.axisBottom(this.x)
                       .ticks(d3.timeHour.every(12)))
                       .selectAll("text")
                       .attr("y", 0)
                       .attr("x", 9)
                       .attr("dy", ".35em")
                       .attr("transform", "rotate(45)")
                       .style("text-anchor", "start")

               }

 }

 private create_d3_chart_X_Y_Axis(timeRange:any) {

     this.svg.append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', 'translate(0,' + this.height + ')')
          .append('text')
          .attr('class', 'axis-title')
          .attr('text-anchor', 'middle')
          .attr('transform', 'translate(420,50)')
          .text('Time');

     this.setTimeIncrementFor_X_Axis(timeRange);

     this.svg.append('g')
          .attr('class', 'axis axis--y')
          .call(d3Axis.axisLeft(this.y))
          .append('text')
          .attr('class', 'axis-title')
          .attr("transform", "translate("+ 1 +","+(this.height/2)+")rotate(90)")  
          .attr('y', 35)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Available Docks');
 }

 private create_d3_line() {

     this.line = d3Shape.line()
          .x( (d: any) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
          .y( (d: any) => this.y(d.availableDocks) );
     this.svg.append('path')
          .datum(this.docksArray)
          .attr('class', 'line_past_hour')
          .attr('d', this.line);

     this.movingAverageLine = d3Shape.line()
          .x( (d: any) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
          .y( (d: any) => this.y(d.availableDocks) );
     this.svg.append('path')
          .datum(this.docksArray2)
          .attr('class', 'line_past_24_hours')
          .attr('d', this.movingAverageLine);


     this.movingAverageLine1 = d3Shape.line()
          .x( (d: any) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
          .y( (d: any) => this.y(d.availableDocks) );
     this.svg.append('path')
          .datum(this.docksArray3)
          .attr('class', 'line_past_7_days')
          .attr('d', this.movingAverageLine1);


 }


 private create_d3_chart_legend(timeRange:any) {

  var legend = this.svg.append('g')
                          .attr("class", "legend")
                          .attr("x", 15)
                          .attr("y", 5)
                          .attr('transform','translate(860,5)')
                          .attr("width", 18)
                          .attr("height", 10)

  var legend_2 = this.svg.append('g')
                          .attr("class", "legend")
                          .attr("x", 15)
                          .attr("y", 5)
                          .attr('transform','translate(860,5)')
                          .attr("width", 18)
                          .attr("height", 10)
  
  
  var legend_3 = this.svg.append('g')
                          .attr("class", "legend")
                          .attr("x", 15)
                          .attr("y", 5)
                          .attr('transform','translate(860,5)')
                          .attr("width", 18)
                          .attr("height", 10)
  
  

  if(timeRange == "1 HOUR") {
          legend.append("rect")
                    .attr("class", "legend")
                    .attr("x", 1)
                    .attr("y", 5)
                    .attr("width", 15)
                    .attr("height", 7)
                    .style("fill", 'green');

          legend.append("text")
                    .attr("class", "legendTxt")
                    .style("font-size", "13px")
                    .attr("x", 20)
                    .attr("y", 5)
                    .attr("dy", "10px")
                    .style("text-anchor", "start")
                    .text("Real-Time Data" );


                    legend_2.append("rect")
                    .attr("class", "legend")
                    .attr("x", 1)
                    .attr("y", 20)
                    .attr("width", 15)
                    .attr("height", 7)
                    .style("fill", 'red');

                    legend_2.append("text")
                    .attr("class", "legendTxt")
                    .style("font-size", "13px")
                    .attr("x", 20)
                    .attr("y", 20)
                    .attr("dy", "10px")
                    .style("text-anchor", "start")
                    .text("1 Hour SMA" );


                    legend_3.append("rect")
                    .attr("class", "legend")
                    .attr("x", 1)
                    .attr("y", 35)
                    .attr("width", 15)
                    .attr("height", 7)
                    .style("fill", 'blue');

                    legend_3.append("text")
                    .attr("class", "legendTxt")
                    .style("font-size", "13px")
                    .attr("x", 20)
                    .attr("y", 35)
                    .attr("dy", "10px")
                    .style("text-anchor", "start")
                    .text("24 Hour SMA");


                    
  }
  else if(timeRange == "24 HOUR") {
              legend.append("rect")
                        .attr("class", "legend")
                        .attr("x", 1)
                        .attr("y", 5)
                        .attr("width", 15)
                        .attr("height", 7)
                        .style("fill", 'green');

              legend.append("text")
                        .attr("class", "legendTxt")
                        .style("font-size", "13px")
                        .attr("x", 20)
                        .attr("y", 5)
                        .attr("dy", "10px")
                        .style("text-anchor", "start")
                        .text("Real-Time Data");
                        
                        legend_2.append("rect")
                        .attr("class", "legend")
                        .attr("x", 1)
                        .attr("y", 20)
                        .attr("width", 15)
                        .attr("height", 7)
                        .style("fill", 'red');

                        legend_2.append("text")
                        .attr("class", "legendTxt")
                        .style("font-size", "13px")
                        .attr("x", 20)
                        .attr("y", 20)
                        .attr("dy", "10px")
                        .style("text-anchor", "start")
                        .text("1 Hour SMA");

                        
                        legend_3.append("rect")
                        .attr("class", "legend")
                        .attr("x", 1)
                        .attr("y", 35)
                        .attr("width", 15)
                        .attr("height", 7)
                        .style("fill", 'blue');

                        legend_3.append("text")
                        .attr("class", "legendTxt")
                        .style("font-size", "13px")
                        .attr("x", 20)
                        .attr("y", 35)
                        .attr("dy", "10px")
                        .style("text-anchor", "start")
                        .text("24 Hour SMA");

                        
        }
        else if(timeRange == "7 DAY") {
                      legend.append("rect")
                                .attr("class", "legend")
                                .attr("x", 1)
                                .attr("y", 5)
                                .attr("width", 15)
                                .attr("height", 7)
                                .style("fill", 'green');

                      legend.append("text")
                                .attr("class", "legendTxt")
                                .style("font-size", "13px")
                                .attr("x", 20)
                                .attr("y", 5)
                                .attr("dy", "10px")
                                .style("text-anchor", "start")
                                .text("Real-Time Data");

                      
                       legend_2.append("rect")
                                .attr("class", "legend")
                                .attr("x", 1)
                                .attr("y", 20)
                                .attr("width", 15)
                                .attr("height", 7)
                                .style("fill", 'red');

                      legend_2.append("text")
                                .attr("class", "legendTxt")
                                .style("font-size", "13px")
                                .attr("x", 20)
                                .attr("y", 20)
                                .attr("dy", "10px")
                                .style("text-anchor", "start")
                                .text("1 Hour SMA");

                      legend_3.append("rect")
                                .attr("class", "legend")
                                .attr("x", 1)
                                .attr("y", 35)
                                .attr("width", 15)
                                .attr("height", 7)
                                .style("fill", 'blue');

                      legend_3.append("text")
                                .attr("class", "legendTxt")
                                .style("font-size", "13px")
                                .attr("x", 20)
                                .attr("y", 35)
                                .attr("dy", "10px")
                                .style("text-anchor", "start")
                                .text("24 Hour SMA");
              }

}

 private updateChart(){

  var chart = d3.select('#svg').select("g").remove().exit();


}





}