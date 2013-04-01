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
var m = L.map('map',{maxZoom:16}).setView([42.1695,-71.1530],9);
var baseMaps = [
	"MapQuestOpen.OSM",
	"OpenStreetMap.Mapnik",
	"OpenStreetMap.DE",
	"Esri.WorldImagery",
	"Stamen.Watercolor",
];
var bike = L.tileLayer("http://tiles{s}.ro.lt/bike/{z}/{x}/{y}.png",{subdomains:[1,2,3,4]});
var bikeGrid = new L.UtfGrid('http://tiles{s}.ro.lt/bike/{z}/{x}/{y}.grid.json?callback={cb}', {
    resolution: 4,
	subdomains:[1,2,3,4]
});
var bikes = L.layerGroup([bike,bikeGrid]).addTo(m);
var envShape = L.tileLayer("http://tiles{s}.ro.lt/envbike/{z}/{x}/{y}.png",{subdomains:[1,2,3,4]});
var envGrid = new L.UtfGrid('http://tiles{s}.ro.lt/envbike/{z}/{x}/{y}.grid.json?callback={cb}', {
    resolution: 4,
	subdomains:[1,2,3,4]
});
var env = L.layerGroup([envShape,envGrid]);
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
bikeGrid.on('click', makePopup);
function makePopup (e) {
    if (e.data) {
        popup.setContent(template(e.data)).setLatLng(e.latlng).openOn(m);
    }
}
envGrid.on('click', makePopup);
var lc = L.control.layers.provided(baseMaps,{"bikes":bikes,"Envisioned Bikes":env}).addTo(m);
m.addHash({lc:lc});
$(function(){
	var mapmargin = parseInt($("#map").css("margin-top"), 10);
	$('#map').css("height", ($(window).height() - mapmargin));
	$(window).on("resize", function(){
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
var SearchForm = Backbone.View.extend({
	initialize:function(){
		this.render();
	},
	el:$("#searchForm"),
	template:Mustache.compile('\
	{{#error}}<div class="control-group error">{{/error}}\
		<div class="input-append">\
			<input type="text" class="span3 search-query" placeholder="Enter Address" id="searchData"{{#value}} value="{{value}}"{{/value}} />\
			<button type="submit" class="btn" id="searchButton">\
				<i id="searchIcon" class="{{#icon}}icon-{{.}} {{/icon}}"></i>\
			</button>\
			</div>\
			{{#error}}<span class="help-inline">{{error}}</span></div>{{/error}}\
	'),
	data:{
	value:false,
	icon:["search"],
	searches:0,
	error:false
	},
	events:{
		"submit":"searchStart",
		"focus input":"errorReset"
	},
	searchStart:function(e){
		e.preventDefault();
		var val = this.$el.children().children("input").val();
		this.data.icon=["spinner","spin"];
		this.data.value=val;
		this.render();
		var _this=this;
		$.ajax({
			url: "http://nominatim.openstreetmap.org/search",
			data:{
				q:val,
				format:"json",
				addressdetails: true,
				limit:1
			},
			dataType:"jsonp",
			jsonp:"json_callback"
		}).then(function(data){
			if(data.length){
			_this.data.searches ++;
			var ll = [data[0].lat,data[0].lon];
			var layer = L.marker(ll).addTo(m);
			layer.bindPopup(data[0].display_name.split(", ").join("<br />"));
			lc.addOverlay(layer,"Search Results " + _this.data.searches);
			m.setView(ll,16);
			}else{
				_this.data.error="No Address Found";
			}
			_this.data.icon=["search"];
			_this.render();
		});
		return true;
	},
	errorReset:function(){
		if(this.data.error){
			this.data.error=false;
			this.render();
		}
	},
	render:function(){
		this.$el.html(this.template(this.data));
	}
	});
var searchForm = new SearchForm();