var AMSReDaily_clxn = ee.ImageCollection("projects/chile-water/AMSR-E/AMSR-E_daily"),
    imageCollection2 = ee.ImageCollection("MODIS/MOD10A1");

//var MODIS = ee.ImageCollection('projects/chile-water/MODIS_SC/MODIS_8day')
MODIS = MODIS.select(['NDSI_Snow_Cover']).filterDate('2001-01-01','2017-01-01');

// Compute min and max values
var Max = MODIS.max();

//blue to coral
Max = Max.visualize({min:78, max: 100, palette:['e4443c', 'ffffff', '124fa2']});
Max = Max.clip(ChileClip);
Map.setCenter(-74.28, -49.5, 6);
Map.addLayer(Max);
/*
Export.image.toDrive({
  image: Max,
  description: 'WebsiteImage4'})*/
