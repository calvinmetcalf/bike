m = L.map('map').setView [42.35904337942925, -71.06178045272827], 8

baseMaps = [
	"MapQuestOpen.OSM"
	"OpenStreetMap.Mapnik"
	"OpenStreetMap.DE"
	"Esri.WorldImagery"
	"Stamen.TerrainBackground"
	"Stamen.Watercolor"
]	
L.control.layers.filled baseMaps, {}, {map:m}
d3.json "json/bikes.topo.json", (error, bikes)->
	L.geoJson(topojson.object(bikes, bikes.objects.bikes)).addTo m
#d3.json "json/bikes.json", (error, bikes)->
#	L.geoJson(bikes,{style:{color:"#f00"}}).addTo m
	
m.addHash()