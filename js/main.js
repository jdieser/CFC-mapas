//$(function(){

// create map
var map = new L.Map('map').setView([-40, -64], 4);

//create layers
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 3, attribution: osmAttrib});
var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib });
var ggl = new L.Google();
var baselayers = {"Satelital Google":ggl,"OpenStreetMap":osm};
var prov;
// add default layer
map.addLayer(ggl);

// create controls
var selector = L.control.layers(baselayers,{}).addTo(map);
L.control.minimap(osm2, { toggleDisplay: true }).addTo(map);

// create geojson layer
$.getJSON("provincias.json", function(data){ 
     prov = L.geoJson(data,{
           style: {
                 weight: 1,
                 opacity: 1,
                 color: 'white',
                 dashArray: '3',
                 fillOpacity: 0
           },
           onEachFeature: provEachFeature
     }).addTo(map);
     
     selector.addOverlay(prov,"Provincias");
});

// event functions
function provEachFeature(feature, layer){
      layer.on({
        mouseover: mouseoverHandler,
        mouseout: mouseoutHandler,
        click: clickHandler
      });
      //add labels
      layer.bindLabel(feature.properties.provincia);
}

function mouseoverHandler(e) {
	var layer = e.target;
	// highlight feature
	layer.setStyle({
		weight: 2,
		color: '#D60000',
		dashArray: '',
		fillOpacity: 0.5
	});
	if (!L.Browser.ie && !L.Browser.opera) layer.bringToFront();
}

function mouseoutHandler(e) {
	//set default style
	prov.resetStyle(e.target);
}

function clickHandler(e) {
	var feature = e.target
	//zoom to feature
	map.fitBounds(feature.getBounds());
	//remove mouseover handler
	map.eachLayer(function(layer){
		layer.off('mouseover', mouseoverHandler)
	})
	//set default style
	prov.resetStyle(feature);
	//remove feature label
	feature.unbindLabel();
  //add layers to sidebar
  fillSidebar(feature.feature);
}

//adds layer list to sidebar
function fillSidebar(feature) {
  //remove current list
  $('ul.sidebar-nav .layer').remove();

  if (feature.properties.wms_url) {
    //hide abstract
    $('#abstract').css('display', 'none');
    //get wms layers 
    getLayersList(feature.properties.wms_url);

  } else {
    //show abstract
    $('#abstract').css('display', 'block');
    $('#abstract p').text('No se encontró un servicio WMS para el Catastro de ' 
      + feature.properties.provincia);
  } 
}

function getLayersList(wms_url) {
  var url = "wms_getlayers.php?url=" + wms_url;

  $.getJSON(url, function(data) {
    $.each(data, function(i, item) {
      $('ul.sidebar-nav').append(
        '<li class=\'layer\'><a href="#">' + item.title + '</a></li>'
      );
    });
  });
}
//});