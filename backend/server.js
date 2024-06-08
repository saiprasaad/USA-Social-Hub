// Initialize express
const express = require('express');

// Initialize postgres
var pg = require('pg');

// Initialize bodyParser
var bodyParser = require('body-parser');

// Initialize moment
const moment = require('moment');


// Connect to elasticsearch Server using host 127.0.0.1:9200
const elasticsearch = require('elasticsearch');
const elasticSearchClient = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  log: 'error'
});


// Connect to PostgreSQL server
var connectionString_divvy_station_status = "pg://postgres:root@127.0.0.1:5432/chicago_divvy_stations_status";
var connectionString_divvy_trips = "pg://postgres:root@127.0.0.1:5432/chicago_divvy_trips";



var pgClientForDivvyStations = new pg.Client(connectionString_divvy_station_status);
pgClientForDivvyStations.connect();

var pgClientForDivvyTrips = new pg.Client(connectionString_divvy_trips);
pgClientForDivvyTrips.connect();



const app = express();
const router = express.Router();


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

router.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});



var places_retrived = [];
var stations_retrived = [];
var docks_retrived = [];
var all_docks_retrived=[];
var all_docks_retrived_for_time_slot=[];

var place_selected;
var station_selected;
var allRecords = [];
var isBeginningOfTimeRangeSet = false;

var go_back_in_time_var;
var go_forward_in_time_var;
var time_stamp_var_0;
var time_stamp_var_1;
var time_stamp_var_2;
var time_stamp_var_3;
var time_stamp_var_4;

var start_time;
var end_time;
var temp_date_time;



const PAST_HOUR =  'Past Hour';
const PAST_24_HOURS =  'Last 24 Hours';
const PAST_7_DAYS =  'Last 7 Days';


const SUNDAY    = 0;
const MONDAY    = 1;
const TUESDAY   = 2;
const WEDNESDAY = 3;
const THURSDAY  = 4;
const FRIDAY    = 5;
const SATURDAY  = 6;


var dailyTrips = [];  



router.route('/places').get((req, res) => {

    res.json(places_retrived)

});



router.route('/place_selected').get((req, res) => {

    res.json(place_selected)

});

router.route('/station_selected').get((req, res) => {

    res.json(station_selected)

});



router.route('/allPlaces').get((req, res) => {

    res.json(places_retrived)

});



router.route('/stations').get((req, res) => {

    res.json(stations_retrived)

});

router.route('/docks').get((req, res) => {


    res.json(docks_retrived)

});


router.route('/docksSME').get((req, res) => {


  res.json(docks_retrived)

});




router.route('/places/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);


    find_places_from_yelp(req.body.find, req.body.where).then(function (response) {
        var hits = response;
        res.json(places_retrived);
    });

});


router.route('/stations/getdocks').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    for (var i = 0,len = stations_retrived.length; i < len; i++) {

        if ( stations_retrived[i].stationName === req.body.placeName ) { // strict equality test

            station_selected = stations_retrived[i];

            timeRange = req.body.timeRange;

            break;
        }
    }


    get_divvy_station_log(req.body.placeName, req.body.timeRange).then(function (response) {
        var hits = response;
        res.json(docks_retrived);
    });

});


router.route('/stations/fetch_all_divvy_stations_data_by_time_slot').post((req, res) => {
var start = req.body.start_date_time
var end = req.body.end_date_time
  fetch_all_divvy_stations_log_for_specified_time_slot(start, end,req.body.newTimeRangeSelection).then(function (response) {
    var hits = response;

    res.json(all_docks_retrived_for_time_slot);
});

});


router.route('/stations/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    for (var i = 0,len = places_retrived.length; i < len; i++) {

        if ( places_retrived[i].name === req.body.placeName ) {

            place_selected = places_retrived[i];

            break;
        }
    }

    const query = {
        name: 'fetch-divvy',
        text: ' SELECT * FROM divvy_stations_realtime_status ORDER BY (divvy_stations_realtime_status.where_is <-> ST_POINT($1,$2)) LIMIT 3',
        values: [place_selected.latitude, place_selected.longitude]
    }

    find_stations_from_divvy(query).then(function (response) {
        var hits = response;
        res.json({'stations_found': 'Successfully Retrieved'});
    });


});

router.route('/stations/fetch_all_divvy_stations_data').post((req, res) => {

    fetch_all_divvy_stations_log(req.body.timeRange,req.body.newTimeRangeSelection).then(function (response) {
        var hits = response;

        res.json(all_docks_retrived);
    });




});



router.route('/getDivvyTripsCountsSunday').get((req, res) => {

  res.json(dailyTrips[SUNDAY])

});

router.route('/getDivvyTripsCountsForMonday').get((req, res) => {

  res.json(dailyTrips[MONDAY])

});

router.route('/getDivvyTripsCountsForTuesday').get((req, res) => {

  res.json(dailyTrips[TUESDAY])

});

router.route('/getDivvyTripsCountsForWednesday').get((req, res) => {

  res.json(dailyTrips[WEDNESDAY])

});

router.route('/getDivvyTripsCountsForThursday').get((req, res) => {

  res.json(dailyTrips[THURSDAY])

});

router.route('/getDivvyTripsCountsForFriday').get((req, res) => {

  res.json(dailyTrips[FRIDAY])

});

router.route('/getDivvyTripsCountsForSaturday').get((req, res) => {

  res.json(dailyTrips[SATURDAY])

});


router.route('/countDivvyTripsPerDay').post((req, res) => {
  var day = req.body.day;
  var selectedDate = req.body.selectedDate;
  selectedDate = selectedDate.replace('T', " ");
  selectedDate = selectedDate.replace('.000Z', " ");
  
  const query = {
      // give the query a unique name
      name: 'fetch-count-'+day,
      text:' SELECT * FROM (SELECT COUNT (DISTINCT bikeid) AS total_trips, EXTRACT(DOW FROM start_time) as day ,date_trunc($2, start_time) as hour_timestamp,max(date_trunc($3, start_time)) as daydt FROM divvy_trips group by day,hour_timestamp) as tb WHERE day= $1 and daydt = $4::timestamp',
      values: [day,'hour','day',selectedDate]
  }

  if(day == SUNDAY){
    dailyTrips[SUNDAY]=[];
    getDailyTrips(SUNDAY, query).then(function (response) {
        var hits = response;
        res.json({'SUNDAY': 'Successfully Retrieved'});
    });
  }
  else if(day == MONDAY){
        dailyTrips[MONDAY]=[];
        getDailyTrips(MONDAY, query).then(function (response) {
          var hits = response;
          res.json({'MONDAY': 'Successfully Retrieved'});
        });
  }
  else if(day == TUESDAY){
        dailyTrips[TUESDAY]=[];
        getDailyTrips(TUESDAY, query).then(function (response) {
          var hits = response;
          res.json({'TUESDAY': 'Successfully Retrieved'});
      });
  }
  else if(day == WEDNESDAY){
      dailyTrips[WEDNESDAY]=[];
      getDailyTrips(WEDNESDAY, query).then(function (response) {
        var hits = response;
        res.json({'WEDNESDAY': 'Successfully Retrieved'});
    });
  }
  else if(day == THURSDAY){
      dailyTrips[THURSDAY]=[];
      getDailyTrips(THURSDAY, query).then(function (response) {
        var hits = response;
        res.json({'THURSDAY': 'Successfully Retrieved'});
    });
  }
  else if(day == FRIDAY){
      dailyTrips[FRIDAY]=[];
      getDailyTrips(FRIDAY, query).then(function (response) {
        var hits = response;
        res.json({'FRIDAY': 'Successfully Retrieved'});
    });
  }
  else if(day == SATURDAY){
      dailyTrips[SATURDAY]=[];
      getDailyTrips(SATURDAY, query).then(function (response) {
        var hits = response;
        res.json({'SATURDAY': 'Successfully Retrieved'});
    });
  }



});


async function getDailyTrips(dayIndex, query) {
	const response = await pgClientForDivvyTrips.query(query);


    for (i = 0; i < response.rows.length; i++) {

         plainTextDateTime =  moment(response.rows[i].hour_timestamp).format('YYYY-MM-DD, h:mm:ss a');


        var countofdept = {

                    "total_trips": response.rows[i].total_trips,
                    "hour_timestamp": plainTextDateTime,
                    "day": response.rows[i].day

        };

        dailyTrips[dayIndex].push(countofdept);

    }
}


async function find_stations_from_divvy(query) {
	const response = await pgClientForDivvyStations.query(query);

  stations_retrived = [];

    for (i = 0; i < 3; i++) {

         plainTextDateTime =  moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');


        var station = {
                    "id": response.rows[i].id,
                    "stationName": response.rows[i].stationname,
                    "availableBikes": response.rows[i].availablebikes,
                    "availableDocks": response.rows[i].availabledocks,
                    "is_renting": response.rows[i].is_renting,
                    "lastCommunicationTime": plainTextDateTime,
                    "latitude": response.rows[i].latitude,
                    "longitude": response.rows[i].longitude,
                    "status": response.rows[i].status,
                    "totalDocks": response.rows[i].totaldocks
        };

        stations_retrived.push(station);

    }
}




async function find_places_from_yelp(place, where) {

    places_retrived = [];
    let body = {
        size: 1000,
        from: 0,
        "query": {
          "bool" : {
            "must" : {
               "term" : { "categories.alias" : place }
            },


            "filter": {
              "bool": {
                "should": [
                  {
                    "term": {
                      "location.address1": where
                    }
                  },
                  {
                    "term": {
                      "location.zip_code": where
                    }
                  }
                ],
                "minimum_should_match":1
              }
            },


            "must_not" : {
              "range" : {
                "rating" : { "lte" : 3 }
              }
            },

            "must_not" : {
              "range" : {
                "review_count" : { "lte" : 500 }
              }
            },

            "should" : [
              { "term" : { "is_closed" : "false" } }
            ],
          }
        }
    }


    results = await elasticSearchClient.search({index: 'chicago_yelp_reviews', body: body});
    results.hits.hits.forEach((hit, index) => {


        var place = {
                "name": hit._source.name,
                "display_phone": hit._source.display_phone,
                "address1": hit._source.location.address1,
                "is_closed": hit._source.is_closed,
                "rating": hit._source.rating,
                "review_count": hit._source.review_count,
                "latitude": hit._source.coordinates.latitude,
                "longitude": hit._source.coordinates.longitude
        };

        places_retrived.push(place);

    });


}




async function fetch_all_divvy_stations_log(timeRange, newTimeRangeSelection) {
  var start_datetime_var = new Date();
  var scrollVal;


  all_docks_retrived = [];

  if(timeRange.includes(PAST_HOUR)){
    if(newTimeRangeSelection){
      isBeginningOfTimeRangeSet = false;

    }

    if(!isBeginningOfTimeRangeSet){

      all_docks_retrived = [];

      isBeginningOfTimeRangeSet = true;

      var start_datetime_var = new Date();
      var start_datetime_var_2 = new Date();
      var targetTime = new Date(start_datetime_var);
      var tzDifference = targetTime.getTimezoneOffset();

      //convert the offset to milliseconds, add to targetTime, and make a new Date
      start_datetime_var = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
      start_datetime_var_2 = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
      go_back_in_time_var = start_datetime_var.getHours() - 1;

      start_datetime_var_2.setHours(go_back_in_time_var);
      time_stamp_var_2 = start_datetime_var_2.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');

      time_stamp_var_1 = start_datetime_var.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');
      time_stamp_var_4  = new Date(new Date(time_stamp_var_2).getTime() - new Date(time_stamp_var_2).getTimezoneOffset() * 60 * 1000);

      var go_forward_in_time_var_2 = time_stamp_var_4 .getMinutes() + 2 ;
      time_stamp_var_4 .setMinutes(go_forward_in_time_var_2);

      time_stamp_var_3 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);

      time_stamp_var_1 = start_datetime_var.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');


      sizeVal = 1000000;
      scrollVal='1s';
    }

  }



  else if(timeRange  == PAST_24_HOURS ){

        if(newTimeRangeSelection){
          isBeginningOfTimeRangeSet = false;
        }

        if(! isBeginningOfTimeRangeSet){

          isBeginningOfTimeRangeSet = true;
          var start_datetime_var = new Date();
          var start_datetime_var_2 = new Date();
          var targetTime = new Date(start_datetime_var);
          var tzDifference = targetTime.getTimezoneOffset();
          start_datetime_var = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
          start_datetime_var_2 = new Date(targetTime.getTime() - tzDifference * 60 * 1000);

          go_back_in_time_var = start_datetime_var.getHours() - 24;

          start_datetime_var_2.setHours(go_back_in_time_var);
          time_stamp_var_2 = start_datetime_var_2.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');
          time_stamp_var_4  = new Date(new Date(time_stamp_var_2).getTime() - new Date(time_stamp_var_2).getTimezoneOffset() * 60 * 1000);

          var go_forward_in_time_var_2 = time_stamp_var_4 .getHours() + 1 ;
          time_stamp_var_4 .setHours(go_forward_in_time_var_2);

          time_stamp_var_3 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);

          time_stamp_var_1 = start_datetime_var.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');

          // Recalculate lower bound for the time-window
          // Take 2 minutes sample on the top of every hour for the past 24 hours
          // This is NOT the best we could do..
          // We can calculate the average for every hour and use that 
          // as the average sample for the heatmap to display 
          time_stamp_var_4  = new Date(new Date(time_stamp_var_3).getTime() - new Date(time_stamp_var_3).getTimezoneOffset() * 60 * 1000);

          diffMinutes = time_stamp_var_4 .getMinutes() - 2 ;
          time_stamp_var_4 .setMinutes(diffMinutes);

          time_stamp_var_2 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
          

          sizeVal = 300;
          scrollsize = 10000;
          scrollVal='15s';
        }
  }



  else if(timeRange.includes(PAST_7_DAYS)){
  
          if(newTimeRangeSelection){  
            isBeginningOfTimeRangeSet = false;
  
          }

          if(! isBeginningOfTimeRangeSet){

            isBeginningOfTimeRangeSet = true;
            var start_datetime_var = new Date();
            var start_datetime_var_2 = new Date();
            var targetTime = new Date(start_datetime_var);
            var tzDifference = targetTime.getTimezoneOffset();



            //convert the offset to milliseconds, add to targetTime, and make a new Date
            start_datetime_var = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
            start_datetime_var_2 = new Date(targetTime.getTime() - tzDifference * 60 * 1000);

            go_back_in_time_var = start_datetime_var.getHours() - 168;

            start_datetime_var_2.setHours(go_back_in_time_var);
            time_stamp_var_2 = start_datetime_var_2.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');

            time_stamp_var_1 = start_datetime_var.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');
            time_stamp_var_4  = new Date(new Date(time_stamp_var_2).getTime() - new Date(time_stamp_var_2).getTimezoneOffset() * 60 * 1000);

            var go_forward_in_time_var_2 = time_stamp_var_4 .getHours() + 24 ;
            time_stamp_var_4 .setHours(go_forward_in_time_var_2);

            time_stamp_var_3 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);

            time_stamp_var_1 = start_datetime_var.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');


            // Recalculate lower bound fo the time-window
            // Take 2 minutes sample on the top of every hour of every day for the past 7 days
            // This is NOT the best we could do...
            // We can calculate the average for every hour and use that 
            // as the average sample for the heatmap to display 
            time_stamp_var_4  = new Date(new Date(time_stamp_var_3).getTime() - new Date(time_stamp_var_3).getTimezoneOffset() * 60 * 1000);

            diffMinutes = time_stamp_var_4 .getMinutes() - 2 ;
            time_stamp_var_4 .setMinutes(diffMinutes);

            time_stamp_var_2 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);

            sizeVal = 1000000;
            scrollVal='15s';
          }
  }



    
    results = await elasticSearchClient.search({
      index: 'divvy_station_logs',
      type: 'log',
      scroll: scrollVal,
      //  search_type : 'scan',
      size: 1000000,
      from: 0,
      body: {

         query: {
           "bool":{
          "filter":
            {
          "bool" : {
            "must" :[
              {
              "range" : {
                "lastCommunicationTime.keyword" : {
                  "gte": time_stamp_var_2,
                  "lt": time_stamp_var_3
                  }
              }
              }
            ]
          }
          }
      }
    }, "sort": [
                { "lastCommunicationTime.keyword":   { "order": "desc" }},

            ]
      }
    });

  results.hits.hits.forEach(function (hit) {
    allRecords.push(hit);
    var docks = {
                "availableDocks": hit._source.availableDocks,
                "latitude": hit._source.latitude,
                "longitude": hit._source.longitude
        };
      all_docks_retrived.push(docks);
  });


            
  // Adjust lower bound and upper bound for the time-window
  // for data collection for the next round from ElasticSearch

    if(timeRange.includes(PAST_HOUR)){
        time_stamp_var_2 = time_stamp_var_3;

        time_stamp_var_4  = new Date(new Date(time_stamp_var_2).getTime() - new Date(time_stamp_var_2).getTimezoneOffset() * 60 * 1000);

        diffMinutes = time_stamp_var_4 .getMinutes() + 2 ;
        time_stamp_var_4 .setMinutes(diffMinutes);

        time_stamp_var_3 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
        
    }


  else if(timeRange == PAST_24_HOURS){

    time_stamp_var_2 = time_stamp_var_3;

    time_stamp_var_4  = new Date(new Date(time_stamp_var_2).getTime() - new Date(time_stamp_var_2).getTimezoneOffset() * 60 * 1000);

    go_forward_in_time_var = time_stamp_var_4 .getHours() + 1 ;
    time_stamp_var_4 .setHours(go_forward_in_time_var);

    time_stamp_var_3 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);

    // Recalculate lower bound fo the time-window
    // Take 2 minutes sample on the top of every hour for the past 24 hours
    // This is NOT the best we could do..
    // We can calculate the average for every hour and use that 
    // as the average sample for the heatmap to display 
    time_stamp_var_4  = new Date(new Date(time_stamp_var_3).getTime() - new Date(time_stamp_var_3).getTimezoneOffset() * 60 * 1000);

    diffMinutes = time_stamp_var_4 .getMinutes() - 2 ;
    time_stamp_var_4 .setMinutes(diffMinutes);

    time_stamp_var_2 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);


  }


  else if(timeRange == PAST_7_DAYS){


    time_stamp_var_2 = time_stamp_var_3;

    time_stamp_var_4  = new Date(new Date(time_stamp_var_2).getTime() - new Date(time_stamp_var_2).getTimezoneOffset() * 60 * 1000);

    go_forward_in_time_var = time_stamp_var_4 .getHours() + 24 ;
    time_stamp_var_4 .setHours(go_forward_in_time_var);

    time_stamp_var_3 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);



    // Recalculate lower bound fo the time-window
    // Take 2 minutes sample on the top of every hour of every day for the past 7 days
    // This is NOT the best we could do...
    // We can calculate the average for every hour and use that 
    // as the average sample for the heatmap to display 
    time_stamp_var_4  = new Date(new Date(time_stamp_var_3).getTime() - new Date(time_stamp_var_3).getTimezoneOffset() * 60 * 1000);

    diffMinutes = time_stamp_var_4 .getMinutes() - 2 ;
    time_stamp_var_4 .setMinutes(diffMinutes);

    time_stamp_var_2 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
    console.log(time_stamp_var_2)
    console.log(time_stamp_var_3)
  }
  


}


async function fetch_all_divvy_stations_log_for_specified_time_slot(start_date_time, end_date_time, newTimeRangeSelection) {
  var scrollVal;


  all_docks_retrived_for_time_slot = [];

  if(newTimeRangeSelection){  
    isBeginningOfTimeRangeSet = false;

  }

  console.log(isBeginningOfTimeRangeSet)
  if(! isBeginningOfTimeRangeSet){

    isBeginningOfTimeRangeSet = true;
    // var start_datetime_var = new Date();
    // var start_datetime_var_2 = new Date();
    // var targetTime = new Date(start_datetime_var);
    // var tzDifference = targetTime.getTimezoneOffset();



    // //convert the offset to milliseconds, add to targetTime, and make a new Date
    // start_datetime_var = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
    // start_datetime_var_2 = new Date(targetTime.getTime() - tzDifference * 60 * 1000);

    // go_back_in_time_var = start_datetime_var.getHours() - 168;

    // start_datetime_var_2.setHours(go_back_in_time_var);
    // time_stamp_var_2 = start_datetime_var_2.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');

    // time_stamp_var_1 = start_datetime_var.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');
    // time_stamp_var_4  = new Date(new Date(time_stamp_var_2).getTime() - new Date(time_stamp_var_2).getTimezoneOffset() * 60 * 1000);

    // var go_forward_in_time_var_2 = time_stamp_var_4 .getHours() + 24 ;
    // time_stamp_var_4 .setHours(go_forward_in_time_var_2);

    // time_stamp_var_3 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);

    // time_stamp_var_1 = start_datetime_var.toISOString().slice(0,-5).replace('Z', ' ').replace('T', ' ');


    // // Recalculate lower bound fo the time-window
    // // Take 2 minutes sample on the top of every hour of every day for the past 7 days
    // // This is NOT the best we could do...
    // // We can calculate the average for every hour and use that 
    // // as the average sample for the heatmap to display 
    // time_stamp_var_4  = new Date(new Date(time_stamp_var_3).getTime() - new Date(time_stamp_var_3).getTimezoneOffset() * 60 * 1000);

    // diffMinutes = time_stamp_var_4 .getMinutes() - 2 ;
    // time_stamp_var_4 .setMinutes(diffMinutes);

    // time_stamp_var_2 = time_stamp_var_4 .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);

    start_time = start_date_time
    end_time = end_date_time
    sizeVal = 1000000;
    scrollVal='15s';
  }



    
    results = await elasticSearchClient.search({
      index: 'divvy_station_logs',
      type: 'log',
      scroll: scrollVal,
      size: 1000000,
      from: 0,
      body: {

         query: {
           "bool":{
          "filter":
            {
          "bool" : {
            "must" :[
              {
              "range" : {
                "lastCommunicationTime.keyword" : {
                  "gte": start_date_time,
                  "lt": end_date_time
                  }
              }
              }
            ]
          }
          }
      }
    }, "sort": [
                { "lastCommunicationTime.keyword":   { "order": "desc" }},

            ]
      }
    });

  results.hits.hits.forEach(function (hit) {
    allRecords.push(hit);
        if((((hit._source.totalDocks - hit._source.availableDocks)/(hit._source.totalDocks))*100) > 90) {
          var docks = {
            "availableDocks": hit._source.availableDocks,
            "latitude": hit._source.latitude,
            "longitude": hit._source.longitude
          };
          all_docks_retrived_for_time_slot.push(docks);
        }
  });
  start_date_time = end_date_time;

  temp_date_time  = new Date(new Date(start_date_time).getTime() - new Date(start_date_time).getTimezoneOffset() * 60 * 1000);

  diffMinutes = temp_date_time .getMinutes() + 2 ;
  temp_date_time .setMinutes(diffMinutes);

  end_date_time = temp_date_time .toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);

}

async function get_divvy_station_log(stationName, timeRange) {
  var validTime = false;
  if(timeRange==='1 HOUR'){
    var deduction = 60 * 60 * 1000; /* ms */
  }
  else if(timeRange==='24 HOUR'){
    var deduction = 24 * 60 * 60 * 1000; /* ms */
  }
  else if(timeRange==='7 DAY'||'7 Day'){
    var deduction = 7*24 * 60 * 60 * 1000; /* ms */
  }
  else{
    console.log("Not a valid time limit");
  }


  var date =new Date();
  var newDate = new Date(date - date.getTimezoneOffset() * 6e4);
  var one = new Date(newDate.getTime()-deduction);

  time_stamp_var_1 = newDate.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
  time_stamp_var_0 = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);


    docks_retrived = [];
    let body = {
        size: 100000,
        from: 0,
        "query": {

           "bool":{
          "filter":
            {
          "bool" : {
            "must" :[ {
               "match" : { "stationName.keyword" : stationName }

            },
            {
              "range" : {
                "lastCommunicationTime.keyword" : {
                  "gte": time_stamp_var_0,
                  "lt": time_stamp_var_1
                }
              }
            }
          ]
        }
      }

    }
  },
  "sort": [
       { "lastCommunicationTime.keyword":   { "order": "desc" }},

   ]
  }


    results = await elasticSearchClient.search({index: 'divvy_station_logs', body: body});

    results.hits.hits.forEach((hit, index) => {

      var docks = {
                  "stationName": hit._source.stationName,
                  "availableDocks": hit._source.availableDocks,
                  "lastCommunicationTime": hit._source.lastCommunicationTime,

      };
      docks_retrived.push(docks);

    });


}


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

app.use('/', router);

app.listen(4000, () => {

            for (var i=0;i<7;i++) {
              dailyTrips[i] = [];
            }

            console.log('Make sure you execute following command before you start the Angular client');

            console.log('');            
            console.log('--------------------------------------------------------');

            console.log('curl -H "Content-Type: application/json" -XPUT "http://localhost:9200/divvy_station_logs/_settings"  -d "{\"index\":{\"max_result_window\":10000000}}"');

            console.log('--------------------------------------------------------');
            console.log('');

            console.log('Express server running on port 4000')
});
