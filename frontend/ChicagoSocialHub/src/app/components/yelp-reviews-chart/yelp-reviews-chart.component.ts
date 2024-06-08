import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Place } from '../../modals/place';
import { PlacesService } from '../../services/places.service';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';




@Component({
  selector: 'app-yelp-reviews-chart',
  templateUrl: './yelp-reviews-chart.component.html',
  styleUrls: ['./yelp-reviews-chart.component.css']
})
export class YelpReviewsChartComponent implements OnInit {
  
  title = "Yelp Business Reviews Chart";
  private places_list: Place[] = [];
  private width: number = 0;
  private height: number = 0;
  private margin = {top: 20, right: 20, bottom: 150, left: 80};

  private x: any;
  private y: any;
  private svg: any;
  private g: any;

  constructor(private placesService: PlacesService) {}

  ngOnInit() {
    // Places are retrieved from elasticsearch when the component is loaded.
      this.retrievePlaces();
  }
 
  retrievePlaces() {
    this.placesService
      .retrievePlacesFromElasticSearch()
      .subscribe((data: Place[]) => {
        this.places_list = data;
        let names:any = [];
        let places:any = [];
        for(let i=0; i<this.places_list.length;i++){
            let name = this.places_list[i].name;
            let review_count = this.places_list[i].review_count;
            if (names.includes(name)){
                name = ' '+name;
            }
            names.push(name);
            places.push({name:name,review_count:review_count});
        }
        this.places_list = places;
        console.log(this.places_list);
        this.initSvg();
        this.init_X_Y_Axis();
        this.create_X_Y_Axis();
        this.createBarChart(this.places_list);
      });
  }

  private initSvg() {

      this.svg = d3.select('svg');
      this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
      this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
      this.g = this.svg.append('g')
                          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private init_X_Y_Axis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(.800);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, .099]);
    this.x.domain(this.places_list.map((d) => d.name));
    this.y.domain([0, d3Array.max(this.places_list, (d) => Number(d.review_count))]);
  }

  private create_X_Y_Axis() {

    this.g.append('g')
                .attr('class', 'axis axis--x')
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(d3Axis.axisBottom(this.x))
                .selectAll("text")
                .attr("y", 0)
                .attr("x", 9)
                .attr("dy", ".35em")
                .attr("transform", "rotate(60)")
                .style("text-anchor", "start");

    this.g.append('g')
                .attr('class', 'axis axis--y')
                .call(d3Axis.axisLeft(this.y))
                .append("text")
                .attr("transform", "rotate(90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Frequency");

    this.svg.append("text")
                .attr("x", this.width / 2 + 90)
                .attr("y", this.height + 170)
                .style("text-anchor", "middle")
                .text("Business Name");

    this.svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 15)
                .attr("x", 0 - (this.height / 2))
                .style("text-anchor", "middle")
                .text("Number of Reviews");

  }

  private createBarChart(data:any){
    var bars = this.g.selectAll(".bar")
                          .remove()
                          .exit()
                          .data(data)

    bars.enter().append('rect')
                    .attr('class', 'bar')
                    .attr('x', (d:any) => this.x(d.name) )
                    .attr('y', (d:any) => this.y(d.review_count) )
                    .attr('width', this.x.bandwidth())
                    .attr('height', (d:any) => this.height - this.y(d.review_count) );
  }

}

