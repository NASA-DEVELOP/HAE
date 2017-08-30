//Export Videos in Folder ->  11-atacama  10-vallenar mtns   9-aconcagua   8-san rafael

//var c = ee.ImageCollection('LANDSAT/LT5_L1T_TOA')
var c = ee.ImageCollection('LANDSAT/LE07/C01/T1_TOA')
  //.filter(ee.Filter.greaterThan('WRS_PATH', 232)).filter(ee.Filter.lessThan('WRS_PATH', 231))
  //.filter(ee.Filter.greaterThan('WRS_ROW', 91)).filter(ee.Filter.lessThan('WRS_ROW', 94))
  .filter(ee.Filter.eq('WRS_PATH',1))
  .filter(ee.Filter.eq('WRS_ROW', 76))
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .filterDate('2001-01-01','2011-12-30')
  // Need to have 3-band imagery for the video.
  .select(['B4', 'B3', 'B2'])
  // Need to make the data 8-bit.
  .map(function(image) {
    return image.multiply(512).uint8();
  });
print(c);
Map.addLayer(c);

// Define an area to export.
//var polygon = ee.Geometry.Rectangle([-122.7286, 37.6325, -122.0241, 37.9592]);
var polygon = ee.Geometry.Rectangle([-70.6641, -23.6093,-69.0161, -22.6039]);

/*
// Export (change dimensions or scale for higher quality).
Export.video.toDrive({
  collection: c,
  description: 'chileVideoExample10',
  dimensions: 720,
  framesPerSecond: 4,
  region: polygon
}); */
