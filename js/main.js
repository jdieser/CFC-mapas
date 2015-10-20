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
var prov, active_prov;
// add default layer
map.addLayer(ggl);

// create controls
var selector = L.control.layers(baselayers, {}, { collapsed:false }).addTo(map);
L.control.minimap(osm2, { toggleDisplay: true }).addTo(map);

// create geojson layer
$.getJSON("provincias.json", function(data){ 
     prov = L.geoJson(data,{
           style: function(feature) {
              return { 
                weight: 1,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: feature.properties.wms_url? 0.3 : 0
              }
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
	var polygon = e.target;
	// highlight feature
	polygon.setStyle({
		weight: 2,
		color: '#D60000',
		dashArray: '',
		fillOpacity: 0.5
	});
	if (!L.Browser.ie && !L.Browser.opera) polygon.bringToFront();
}

function mouseoutHandler(e) {
	//set default style
	prov.resetStyle(e.target);
}

function clickHandler(e) {
  var polygon = e.target;
  active_prov = polygon.feature;
	//zoom to feature
	map.fitBounds(polygon.getBounds());
	//remove mouseover handler
	map.eachLayer(function(layer){
		layer.off('mouseover', mouseoverHandler)
	})
	//set default style
	prov.resetStyle(polygon);
  //remove fill color
	polygon.setStyle({fillOpacity: 0});
	//remove feature label
	polygon.unbindLabel();
  //add layers to sidebar
  listLayers(active_prov);
  //
  $('#url p').text('WMS server: ' + (active_prov.properties.wms_url || '--'));
}

function listLayers(provincia) {
  //remove current list
  $('.layer').remove();

  if (provincia.properties.wms_url) {
    //loading message
    $('#abstract').css('display', 'block');
    $('#abstract p').text('Cargando capas...');
    //get wms layers 
    loadLayerList(provincia.properties.wms_url);

  } else {
    //no wms message
    $('#abstract').css('display', 'block');
    $('#abstract p').text('No se encontró un servicio WMS para el Catastro de ' 
      + provincia.properties.provincia);
  } 
}

//adds layer list to sidebar
function loadLayerList(wms_url) {
    var url = "wms_getlayers.php?url=" + wms_url;
    //gets layer list from server
    $.getJSON( url, function(data) {
        //hide abstract
        $('#abstract').css('display', 'none');

        //add layers to ul
        $.each(data, function(i, item) {
          $('ul.sidebar-nav').append(
            '<li class=\'layer\' data-layername=\'' + item.name + '\'><a href="#">' + item.title + '</a></li>'
          );
        });

        setLiClickHandlers();
    });
}

function setLiClickHandlers() {
    //adds layer when layer list item is clicked
    $('.layer').click(function() {
        var newLayer = L.tileLayer.wms( active_prov.properties.wms_url, {
            layers: $(this).data("layername"),
            format: 'image/png',
            transparent: true
        }).addTo(map);

        selector.addOverlay(newLayer, $(this).text() + ' (' + active_prov.properties.provincia + ')');
    });
}
//});