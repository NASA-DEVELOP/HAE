var MODIS_daily = ee.ImageCollection("MODIS/006/MOD10A1"),
    chileShape = ee.FeatureCollection("ft:1ASqgoI8tplPOQ0RLe_jhCA31IPClFyKwXTH__HGy");

/********************************************************************
  Visualize MODIS Snow Cover comparing 2016 with previous monthly averages 
  - built by NASA DEVELOP Team Chile Water Resources (Spring 2017)
  - Billy Babis (billybabis@gmail.com), Mariana Webb, Garrett Mcgurk
  This map uses the MODIS v6 data from Terra stellite publically available on the GEE data catalog

*******************************************************************/

var MODIS_SC_daily = MODIS_daily.select(['NDSI_Snow_Cover']).filterDate("2001-02-23","2017-03-03");
//Only include chile data
MODIS_SC_daily = MODIS_SC_daily.map(function(img) { 
  img = img.clip(chileShape);
  //set the month and year properties in metadata to simplyify process
  var d = ee.Date(ee.Number(img.get('system:time_start')));
    var m = ee.Number(d.get('month'));
    var y = ee.Number(d.get('year'));
    return img.set({'month':m, 'year':y});
  });
//initialize variables to be modified in showLayer() function and used afterward.
var difference_2016vsAvg = ee.ImageCollection("test"); 
var range=[-10,10];
var PALETTE = ['5e1641', '87205e', '87205e', 'e55252', 'e59c52', '1a3e66', '52e5e5', 'cbf7f7', 'ffffff'];
var years = ee.List.sequence(2001,2016);
var months = ee.List.sequence(1, 12);
print("Due to sensor malfunctions, there is no data for the following months:");
print("     2001:[1,12], 2002:[1-3,5,7,8,12], 2003:[1-7,12], 2004:[1-7]");
print("     Thus, modelling based off the months 1-7 and 12 may be less accurate");

//this function is called whenever the slider changes the current month
var showLayer = function(month) {
  Map.layers().reset();
  var nullImage = ee.Image(0);  //default for months with no data... to be deleted from ImageCollection
  var MODIS_SC_monthAvgs_list = years.map(function(y){
    var MODIS_SC_daily_monthYear =  MODIS_SC_daily.filterMetadata('year', 'equals', y)
                                      .filterMetadata('month', 'equals', month);
    //if month-year combo yields no results, we add nullImage to List
    return ee.Algorithms.If(MODIS_SC_daily_monthYear.size().gt(0), //if there is no data for this date, add nullImage
                             MODIS_SC_daily_monthYear.select('NDSI_Snow_Cover').mean() //if true
                              .set('year', y).set('month', month).set('date', ee.Date.fromYMD(y,month,1)),
                          nullImage); //if false
  });
  MODIS_SC_monthAvgs_list=MODIS_SC_monthAvgs_list.removeAll(ee.List.repeat(nullImage,8));
  var MODIS_SC_monthAvgs = ee.ImageCollection.fromImages(MODIS_SC_monthAvgs_list);
  //print(MODIS_SC_monthAvgs);
  
  var MODIS_SC_month2016 = ee.Image( MODIS_SC_monthAvgs.filterMetadata('year', 'equals', 2016).first() );
  var MODIS_SC_monthAvg = MODIS_SC_monthAvgs.mean();
  difference_2016vsAvg = MODIS_SC_month2016.subtract(MODIS_SC_monthAvg).divide(MODIS_SC_month2016);
  
  range = [-5,5]
  var vis_params = {min: range[0], max: range[1], palette: PALETTE};
  Map.addLayer(difference_2016vsAvg, vis_params, "2016 vs the average");
}
Map.setCenter(-73.97, -48.68, 7);

/*************ADD THE LEGEND****************/

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});
var legendTitle = ui.Label({
  value: 'MODIS Snow Cover',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
legend.add(legendTitle);
var legendSubTitle = ui.Label({
  value: 'Current Month 2016 vs Monthly Average (2001-2016)',
  style: {
    fontWeight: 'bold',
    fontSize: '14px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
legend.add(legendSubTitle);
var loading = ui.Label('Loading legend...', {margin: '2px 0 4px 0'});
legend.add(loading);
// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: '#' + color,
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });
  var description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  });
  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};
// Get the list of palette colors and class names from the image.
difference_2016vsAvg.toDictionary().select(["NDSI_Snow_Cover" + ".*"]).evaluate(function(result) {
  loading.style().set('shown', false);
  var rangeDiff = range[1]-range[0]
  for (var i = 0; i < PALETTE.length; i++) {
    var changeTier = (( i/(PALETTE.length) ) * rangeDiff + range[0]);
    var shortTier = changeTier.toFixed(2);
    legend.add(makeRow(PALETTE[i],shortTier+"% change"));
  }
});
Map.add(legend);




/**************ADD SLIDER**************/
// Create a label and slider.
var label = ui.Label("Month in 2016 to compare to '01-'16 Average");
var slider = ui.Slider({
  min: 1,
  max:12,
  step: 1,
  onChange: showLayer,
  style: {stretch: 'horizontal'}
});

// Create a panel that contains both the slider and the label.
var panel = ui.Panel({
  widgets: [label, slider],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    position: 'top-center',
    padding: '7px'
  }
});
// Add the panel to the map.
Map.add(panel);
// Set default values on the slider and map.
slider.setValue(8);