L.Control.Layers.prototype._addItem= function (obj) {
		var label = document.createElement('label'),
			input,
			checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		label.appendChild(input);
		label.appendChild(name);
		label.className = obj.overlay ? "checkbox" : "radio";
		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	}

//var b = [];
var m = L.map('map').setView([42.1695,-71.1530],9);
var baseMaps = [
	"MapQuestOpen.OSM",
	"OpenStreetMap.Mapnik",
	"OpenStreetMap.DE",
	"Esri.WorldImagery",
	"Stamen.TerrainBackground",
	"Stamen.Watercolor",
];
var bikes = L.tileLayer("http://tiles{s}.ro.lt/bike/{z}/{x}/{y}.png",{subdomains:[1,2,3,4]}).addTo(m)
var utfGrid = new L.UtfGrid('http://tiles{s}.ro.lt/bike/{z}/{x}/{y}.grid.json?callback={cb}', {
    resolution: 4,
	subdomains:[1,2,3,4]
});
m.addLayer(utfGrid);
var popup = L.popup();
var template = Mustache.compile("<ul>\
{{#facilitytype}}<li>Type : {{{facilitytype}}}</li>{{/facilitytype}}\
{{#facilitydetail}}<li>Type details : {{{facilitydetail}}}</li>{{/facilitydetail}}\
{{#altfacilitytype}}<li>Alternate Facility Type: {{{altfacilitytype}}}</li>{{/altfacilitytype}}\
{{#facilitystatus}}<li>Status : {{{facilitystatus}}}</li>{{/facilitystatus}}\
{{#bsgkind}}<li>Bay State Greenway : {{{bsgkind}}}</li>{{/bsgkind}}\
{{#currentowner}}<li>Owner : {{{currentowner}}}</li>{{/currentowner}}\
{{#steward}}<li>Steward : {{{steward}}}</li>{{/steward}}\
{{#localname}}<li>Local Name : {{{localname}}}</li>{{/localname}}\
{{#regionalname}}<li>Regional Name : {{{regionalname}}}</li>{{/regionalname}}\
{{#alternatetrailname}}<li>Alternate Trail Name : {{{alternatetrailname}}}</li>{{/alternatetrailname}}\
</ul>")
utfGrid.on('click', function (e) {
    //click events are fired with e.data==null if an area with no hit is clicked
    if (e.data) {
		console.log(e.data);
        popup.setContent(template(e.data)).setLatLng(e.latlng).openOn(m);
    }
});
var lc = L.control.layers.filled(baseMaps,{"bikes":bikes},{map:m});
	m.addHash({lc:lc});
	 $(function(){
				var mapmargin = parseInt($("#map").css("margin-top"), 10);
		  $('#map').css("height", ($(window).height() - mapmargin));
		  $(window).on("resize", function(e){
			$('#map').css("height", ($(window).height() - mapmargin));
			   if($(window).width()>=980){
			$('#map').css("margin-top",40);
		}else{
				$('#map').css("margin-top",-20);
		}
		});
		if($(window).width()>=980){
			$('#map').css("margin-top",40);
		}else{
				$('#map').css("margin-top",-20);
		}
				});

