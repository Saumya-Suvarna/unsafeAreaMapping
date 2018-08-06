queue()
    .defer(d3.json, "/queryByDate")
    .await(makeGraphs);

function makeGraphs(error, recordsJson) {
	var records = recordsJson;
	var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
	
	records.forEach(function(d) {
		d["timestamp"] = d["timestamp"];
		d["longitude"] = +d["longitude"];
		d["latitude"] = +d["latitude"];
	});
	
	var ndx = crossfilter(records);

		var dateDim = ndx.dimension(function(d) { return d["timestamp"]; });
		var dayDim = ndx.dimension(function(d) { return d["day"]; });
		var hourDim = ndx.dimension(function(d) { return d["hour"]; });
		//var cityIdDim = ndx.dimension(function(d) { return d["cityId"]; });
		var alarmTypeSegmentDim = ndx.dimension(function(d) { return d["alarmType"]; });
		var deviceidDim = ndx.dimension(function(d) { return d["deviceid"]; });
		var location_stateDim = ndx.dimension(function(d) { return d["location_state"]; });
		var location_cityDim = ndx.dimension(function(d) { return d["location_city"]; });

		var allDim = ndx.dimension(function(d) {return d;});
	
		var numRecordsByDate = dateDim.group();
		var dayGroup = dayDim.group();
		var hourGroup = hourDim.group();
		//var cityIdGroup = cityIdDim.group();
		var alarmTypeSegmentGroup = alarmTypeSegmentDim.group();
		var deviceidGroup = deviceidDim.group();
		var location_stateGroup = location_stateDim.group();
		var location_cityGroup = location_cityDim.group();

		var all = ndx.groupAll();
	
		var minDate = dateDim.bottom(1)[0]["timestamp"];
		var maxDate = dateDim.top(1)[0]["timestamp"];
	
	    var numberRecordsND = dc.numberDisplay("#number-records-nd");
		//var timeChart = dc.barChart("#time-chart");
		var hourChart = dc.rowChart("#hour-row-chart");
		var dayChart = dc.rowChart("#day-row-chart");
		//var cityIdChart = dc.rowChart("#cityId-row-chart");
		var alarmTypeSegmentChart = dc.rowChart("#alarmType-segment-row-chart");
		var deviceidChart = dc.rowChart("#deviceid-row-chart");
		var location_stateChart = dc.rowChart("#location-state-row-chart");
		var location_cityChart = dc.rowChart("#location-city-row-chart");

	
	numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	// timeChart
	// 	.width(550)
	// 	.height(100)
	// 	.margins({top: 10, right: 50, bottom: 20, left: 20})
	// 	.dimension(dateDim)
	// 	.group(numRecordsByDate)
	// 	.transitionDuration(100)
	// 	.x(d3.time.scale().domain([minDate, maxDate]))
	// 	.y(0,20)
	// 	.elasticY(true)
	// 	.yAxis().ticks(4);
		
	// cityIdChart
    //     .width(300)
    //     .height(100)
    //     .dimension(cityIdDim)
    //     .group(cityIdGroup)
    //     .ordering(function(d) { return -d.value })
    //     .colors(['#0071c5'])
    //     .elasticX(true)
    //     .xAxis().ticks(4);

	alarmTypeSegmentChart
		.width(250)
		.height(150)
        .dimension(alarmTypeSegmentDim)
		.group(alarmTypeSegmentGroup)
		.ordering(function(d) { return -d.value })
        .colors(['#993399'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

	dayChart
        .width(250)
        .height(210)
        .dimension(dayDim)
        .group(dayGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#993399'])
        .elasticX(true)
		.xAxis().ticks(4);
	
	hourChart
        .width(250)
        .height(100)
        .dimension(hourDim)
        .group(hourGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#993399'])
        .elasticX(true)
		.xAxis().ticks(4);

	deviceidChart
		.width(250)
		.height(210)
        .dimension(deviceidDim)
        .group(deviceidGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#993399'])
        .elasticX(true)
        .xAxis().ticks(4);

    location_stateChart
    	.width(200)
		.height(700)
        .dimension(location_stateDim)
        .group(location_stateGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#993399'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

	location_cityChart
    	.width(200)
		.height(700)
        .dimension(location_cityDim)
        .group(location_cityGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#993399'])
        .elasticX(true)
        .labelOffsetY(10)
		.xAxis().ticks(4);
		
    var map = L.map('map', {attributionControl: false});

	var drawMap = function(){

	    map.setView([12.9257, 77.6844], 6);
		mapLink = '<a href="http://openstreetmap.org">Map</a>';
		L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 18,
				minZoom: 4,
			}).addTo(map);

		var geoData = [];
		_.each(allDim.top(Infinity), function (d) {
			geoData.push([d["latitude"], d["longitude"], 1]);
	      });
		var heat = L.heatLayer(geoData,{
			radius: 10,
			blur: 20, 
			maxZoom: 1,
		}).addTo(map);

	};

	drawMap();

	dcCharts = [hourChart,dayChart,deviceidChart,alarmTypeSegmentChart,location_stateChart,location_cityChart];

	_.each(dcCharts, function (dcChart) {
		dcChart.on("filtered", function (chart, filter) {
			map.eachLayer(function (layer) {
				map.removeLayer(layer)
			});
			drawMap();
		});
	});

	dc.renderAll();

};
