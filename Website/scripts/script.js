//Main Function
function init() {
  
  geomap();
  areachart();
  scatterplot();
}

// Creating Cloropleth
function geomap() {

  //Creating Variables for Geomap
  
  var svg = d3.select("svg"),
  width = 1500,
  height = 800;


//Creating the layout of the map
var projection = d3.geoMercator()
  .scale(120)
  .center([0, 0])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([0, 20000, 40000, 80000, 100000, 1000000])
  .range(["#FFFFCC", "#c7e9b4", "#7fcdbb", "#41b7c4", "#2c80b8", "#253494"]);

// Loading CSV and Json File
d3.queue()
  //Courtesy of D3-Graph-Gallery for allowing us to use their GeoJson File
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "dataset/plastic-waste-littered.csv", function(d) { data.set(d.Code, +d.Littered, d.Country); })
  .await(ready);

  //Main function to create map
function ready(error, topo) {

  //On MouseOver, Highlight Country and Establish Country Name and Amount of Plastic Waste Littered
  let mouseOver = function(d, i) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black")
      .text("Hello");
  }

  //On MouseLeave, Remove all added attributes of MouseOver
  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent");
  }

  // Draw the map
  svg.append("svg")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
    }
  
  //Creating Legend
  //Courtesy of D3.js graph gallery
  //https://www.d3-graph-gallery.com/graph/custom_legend.html


  //Creating Legend Name
  var keys = ["0 tonnes", "20,000 tonnes", "40,000 tonnes", "80,000 tonnes", "100,000 tonnes", ">200,000 tonnes"]
  
  //Creating a color scale 
  var color = d3.scaleOrdinal()
  .domain(keys)
  .range(["#FFFFCC", "#c7e9b4", "#7fcdbb", "#41b7c4", "#2c80b8", "#253494"]);

  //Creating Squares in legend for each name
    svg.selectAll("mySquares")
      .data(keys)
      .enter()
      .append("rect")
      .attr("x", 95)
      .attr("y", function(d, i) {return 110 + i*25})
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", function(d) {return color(d)})

  //Creating Text in legend for each Dot
    svg.selectAll("myLabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 120)
    .attr("y", function(d ,i) {return 121 + i*25}) 
    .style("fill", function(d) {return color(d)})
    .text(function(d) { return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
}
  
// Creating Area Chart
function areachart() {

//Creating variables
var margin = {top: 60, right: 230, bottom: 50, left: 50};
var width = 1500 - margin.left - margin.right;
var height = 800 - margin.top - margin.bottom;

// Appening the graph and setting up the width and height
var svg = d3.select("#chart2")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Loading th edata
d3.csv("dataset/Plastic-G-R-L.csv", function(data) {

// Creating a variable that shows the name of the values
var keys = data.columns.slice(1)

// Creating a color scale
var color = d3.scaleOrdinal()
  .domain(keys)
  .range(["#edd609", "#ed7809", "#eb4034"]);

//Stacking the values of the dataset to give it a cleaner look
var stackedData = d3.stack()
  .keys(keys)
  (data)

// Creating xAxis
var x = d3.scaleLinear()
  .domain(d3.extent(data, function(d) { return d.year; }))
  .range([ 0, width ]);
var xAxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(5))

// Applying X axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height+40 )
    .text("Time (year)");

// Creating yAxis
var y = d3.scaleLinear()
  .domain([0, 70000])
  .range([ height, 0 ]);
svg.append("g")
  .call(d3.axisLeft(y).ticks(5))

// Add Y axis label:
svg.append("text")
.attr("text-anchor", "end")
.attr("transform", "translate(" + (margin.left-35) + "," + (margin.top-50) + ") rotate(-90)")
.text("Amount of Plastic In Tonnes")


// Create the scatter variable: where the circles take place
var areaChart = svg.append('g')

// Area generator
var area = d3.area()
  .x(function(d) { return x(d.data.year); })
  .y0(function(d) { return y(d[0]); })
  .y1(function(d) { return y(d[1]); })

// Create the Area Chart
areaChart
  .selectAll("mylayers")
  .data(stackedData)
  .enter()
  .append("path")
    .attr("class", function(d) { return "myArea " + d.key })
    .style("fill", function(d) { return color(d.key); })
    .attr("d", area)

  //On Mouseover
  var MouseOver = function(d){
    console.log(d)
    // Lower the opacity of all values
    d3.selectAll(".myArea").style("opacity", .1)
    // other than the hovered one
    d3.select("."+d).style("opacity", 1)
  }

  // On Mouseleave
  var MouseLeave = function(d){
    // return graph to original state
    d3.selectAll(".myArea").style("opacity", 1)
  }

  // Add one dot in the legend for each name.
  var size = 20
  svg.selectAll("myrect")
    .data(keys)
    .enter()
    .append("rect")
      .attr("x", 1300)
      .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return color(d)})
      .on("mouseover", MouseOver)
      .on("mouseleave", MouseLeave)

  // Add one dot in the legend for each name.
  svg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
      .attr("x", 1300 + size*1.2)
      .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return color(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .on("mouseover", MouseOver)
      .on("mouseleave", MouseLeave)
})

}

// Creating Scatterplot
function scatterplot() {

  // Declaring variables
  var w = 1500;
  var h = 900;
  var margin = {top: 5, right: 60, bottom: 30, left: 60};
  
  
  //Appending the Graph with the declared attribute
  var svg = d3.select("#chart3")
  	.append("svg")
    .attr("width", w)
    .attr("height", h)
  
  // colour scale 
  var colours = d3.scaleOrdinal()
  	.domain(["Africa","Asia","Europe","North America","Oceania","South America"])
  	.range(["#E01A25", "#2074A0", "#10A66E", "#66489F", "#EFB605","#FFA500"]);
  
  //Creating x Scale
  var xScale = d3.scaleLinear()
  	.range([margin.left, w - margin.left - margin.right]);
  
  //Creating yScale
  var yScale = d3.scaleLinear()
  	.range([h - margin.bottom, margin.top]);
  
  //Creating xAxis
  var xAxis = d3.axisBottom()
  	.scale(xScale)
  	.tickFormat(d3.format("$"))
  	.tickSize(-(h - (margin.top+margin.bottom)))
  	.ticks(20);
  // Creating yAxis
  var yAxis = d3.axisLeft()
  	.scale(yScale)
  	.tickFormat(d3.format(","))
  	.tickSize(-(w - (margin.left+margin.right)))
  	.ticks(5);
  
    //Creating Tooltip
    var div = d3.select("#tooltip").append("label")
     .attr("class", "tooltip")
     .style("opacity", 0);
  
	// Loading in the data
  d3.csv("dataset/per-capita-plastic-waste-vs-gdp-per-capita.csv", prepare, function(data) {
    dataset = data;
    
    // xScale.domain([400, 40000])
    xScale.domain([0, d3.max(dataset, function(d) { return d.gdp; })]);
    yScale.domain([0, d3.max(dataset, function(d) { return d.capita; })]);
    
    // Creating xAxis
    svg.append("g")
  		.attr("class", "axis x")
  		.attr("transform", "translate(0," + (h - margin.bottom) + ")")
  		.call(xAxis)
    
    // Creating yAxis
  	svg.append("g")
  		.attr("class", "axis y")
  		.attr("transform", "translate(" + margin.left + ",0)")
  		.call(yAxis)
    
    // Creating scatterplot
    svg.selectAll("circle")
    	.data(data)
    	.enter()
    	.append("circle")
    	.attr("cx", function(d) { return xScale(d.gdp); })
			.attr("cy", function(d) { return yScale(d.capita); })
			.attr("r", 3.5)
    	.style("fill", function(d) { return colours(d.region); })
      // Courtesy of KJ Schmidt for implementation of mouse-over effect
      // https://medium.com/@kj_schmidt/hover-effects-for-your-scatter-plot-447df80ea116
      .on('mouseover', function (d, i) {
          d3.select(this).transition()
                .duration('100')
                .attr("r", 7);
          div.transition()
               .duration(100)
               .style("opacity", 1);
               div.html(" Country- " + (d.country) + ", GDP- $"  + (d.gdp) + ", Per Capita- " + (d.capita) + "kg");
     })
     .on('mouseout', function (d, i) {
          d3.select(this).transition()
               .duration('200')
               .attr("r", 5);
          div.transition()
               .duration('200')
               .style("opacity", 0);
     });
      
    // Creating y Label
    svg.append("g")
  		.append("text")
  		.attr("text-anchor", "end")
  		.attr("transform", "translate(" + (w - margin.right - 5) + "," + (h - margin.bottom - 7) + ")")
	  	.text("GDP per capita (int.-$)")
  
    // Creating x Label
  	svg.append("g")
  		.append("text")
	  	.attr("text-anchor", "end")
  		.attr("transform", "translate(" + (margin.left + 15) + "," + (margin.top + 5) + ") rotate(-90)")
  		.text("Per capita plastic waste (-kg)")
    
		// Creating Legend
  	var legendMargin = {top:12, right:5, bottom:10, left:5};
  	var legendW = 160;
  	var legendH = 200;
  
    //Appending Legend
    var svgLegend = svg.append("svg")
      .attr("width", legendW)
      .attr("height", legendH)
      .attr("x", w - margin.right - legendW)
      .attr("y", margin.top);
  
    // Placing legend into a container
    var legendContainer = svgLegend.append("g")
      .attr("class", "legendContainer")
      .attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top + ")");
  
    //Declaring variables
    var rectSize = 10;
    var rowHeight = 20;

    // Creating Legend
    var legend = legendContainer.selectAll(".legendSquare")
      .data(colours.range())
      .enter()
      .append("g")
      .attr("class", "legendSquare")
      .attr("transform", function(d, i) {
        return "translate(0," + (i*rowHeight) + ")";
      })

    // append squares to legend
    legend.append("rect")
      .attr("width", rectSize)
      .attr("height", rectSize)
      .style("fill", function(d) { return d; })

    // append text to legend
    legend.append("text")
      .attr("transform", "translate(20," + rectSize/2 + ")")
      .attr("class", "legendText shadow")
      .attr("dy", ".35em")
      .text(function(d, i) { return colours.domain()[i]; }) 
    
    // Apply values to checkbox
    d3.select("#logCheckbox").on("click", function() {
      if(this.checked) {
        // Creating Log version of x 
	      xScale = d3.scaleLog()
        	.domain([400,80000])
        	.range([margin.left, w - margin.left - margin.right]);
        yScale
      } else {
        // Reverting to original graph
        xScale = d3.scaleLinear()
        	.domain([0, d3.max(dataset, function(d) { return d.gdp; })])
	        .range([margin.left, w - margin.left - margin.right]);
      }
      xAxis.scale(xScale);
      
      d3.selectAll("circle")
      	.transition()
      	.delay(400)
      	.duration(600)
      	.attr("cx", function(d) { return xScale(d.gdp); })
    })
  })
  
  // Function that converts dataset into true values
  function prepare(d) {
    d.country = d.Country;
    d.region = d.Region;
    d.gdp = +d.gdp;
    d.capita = +d.Capita;
    return d;
  }
}
window.onload = init;

