$(function(){
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
var bsgShape = L.tileLayer("http://tiles{s}.ro.lt/bsg/{z}/{x}/{y}.png",{subdomains:[1,2,3,4]});
var bsgGrid = new L.UtfGrid('http://tiles{s}.ro.lt/bsg/{z}/{x}/{y}.grid.json?callback={cb}', {
	resolution: 4,
	subdomains:[1,2,3,4]
});
var bsg = L.layerGroup([bsgShape,bsgGrid]);
var popup = L.popup();
var template = Mustache.compile("<ul>\
{{#FacilityType}}<li>Type : {{{showType}}}</li>{{/FacilityType}}\
{{#FacilityDetail}}<li>Type details : {{{FacilityDetail}}}</li>{{/FacilityDetail}}\
{{#AltFacilityType}}<li>Alternate Facility Type: {{{AltFacilityType}}}</li>{{/AltFacilityType}}\
{{#FacilityStatus}}<li>Status : {{{showStatus}}}</li>{{/FacilityStatus}}\
{{#showBsg}}<li>Bay State Greenway : {{{BSG}}}</li>{{/showBsg}}\
{{#Steward}}<li>Steward : {{{Steward}}}</li>{{/Steward}}\
{{#LocalName}}<li>Local Name : {{{LocalName}}}</li>{{/LocalName}}\
{{#showReg}}<li>Regional Name : {{{showReg}}}</li>{{/showReg}}\
</ul>")
bikeGrid.on('click', makePopup);
function makePopup (e) {
	if (e.data) {
		e.data.showStatus=function(){return cleanStatus(this.FacilityStatus).replace(/(\b)[a-z]/g,function(a){return a.toUpperCase();})};
		e.data.showType=function(){return cleanType(this.FacilityType).replace(/(\b)[a-z]/g,function(a){return a.toUpperCase();});}
		e.data.showBsg = function(){
			return !(this.BSG === "" || this.BSG === "Not in Bay State Greenway network" || this.bsg === "Secondary")
		}
		if(this.RegionalName){
			e.data.showReg=function(){return this.RegionalName.split("+").filter(function(a){return !(a==="" || a.match(/BSG\_/))}).join(", ")}
		}
		popup.setContent(template(e.data)).setLatLng(e.latlng).openOn(m);
	}
}
envGrid.on('click', makePopup);
bsgGrid.on('click', makePopup);
var lc = L.control.layers.provided(baseMaps,{"bikes":bikes,"Envisioned Bikes":env,"BSG":bsg},{collapsed:L.Browser.mobile}).addTo(m);
m.addHash({lc:lc});
m.attributionControl.setPrefix('Powered by <a href="http://leafletjs.com">Leaflet</a> — Search by <a href="http://nominatim.openstreetmap.org/">Nominatim</a>');
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
			var parseName = function(data){
				var out = {items:[]};
				var k;
				for(var key in data){
					k = key.replace(/_/," ").replace(/\s\w/g,function(a){return a.toUpperCase()});
					out.items.push({key:k.slice(0,1).toUpperCase()+k.slice(1),value:data[key]});
				}
				return Mustache.render('<dl class="dl-horizontal">{{#items}} <dt>{{key}}</dt><dd>{{value}}</dd>{{/items}}</dl>',out);
			};
			layer.bindPopup(parseName(data[0].address));
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
function cleanStatus(status){
	var p = status.indexOf(":");
	if(p>-1){
		status = status.slice(0,p);
	}
	return status;
}
function cleanType(type){
	var p = type.indexOf("(");
	if(p>-1){
		type = type.slice(0,p);
	}
	return type;
}
var Legend = L.Control.extend({
    options: {
        position: 'bottomleft'
    },

    onAdd: function () {
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', true/*L.Browser.mobile*/?'legend container-fluid':'legend container-fluid leaflet-popup-content-wrapper');
        var data = {items:[
        	{name:"Cycle Track",color:"rgb(115,0,0)",icon:"road"},
        	{name:"Marked Shared Lane",color:"rgb(115,178,255)",icon:"road"},
        	{name:"Bike Lane",color:"rgb(0,112,255)",icon:"road"},
        	{name:"Bicycle/Pedestrian Priority Roadway",color:"rgb(112,168,0)",icon:"road"},
        	{name:"Paved Bike Shoulder",color:"rgb(255,170,0)",icon:"road"},
        	{name:"Sign-Posted On-Road Bike Route",color:"rgb(255,255,0)",icon:"road"},
        	{name:"Shared Use Path",color:"rgb(38,115,0)",icon:"leaf"},
        	{name:"Hybrid",color:"rgb(255,167,127)",icon:"adjust"},
        	{name:"To Be Determined",color:"rgb(223,115,255)",icon:"question-sign"}
        ],mobile:true/*L.Browser.mobile*/};
        var template = Mustache.compile("<div id='legendOutline' class='span3'><button type='button' id='legendButton' class='btn btn-info{{#mobile}} cwm-collapsed{{/mobile}}' data-target='#legendList' data-toggle='collapse'>{{^mobile}}Hide{{/mobile}}{{#mobile}}Show{{/mobile}} Legend</button><div id='legendList' class='collapse {{^mobile}}in{{/mobile}}'><ul class='icons'>{{#items}}<li><i class='icon-{{icon}} icon-2x' style='color:{{color}}'></i>{{name}}</li>{{/items}}</ul></div></div>");
		$("#map").on("show",'#legendList',function(){$('#legendButton').html("Hide Legend").toggleClass("cwm-collapsed");$('.legend').toggleClass('leaflet-popup-content-wrapper')});
		$("#map").on("hide",'#legendList',function(){$('#legendButton').html("Show Legend").toggleClass("cwm-collapsed");});
		$("#map").on("hidden",'#legendList',function(){$('.legend').toggleClass('leaflet-popup-content-wrapper')});
		container.innerHTML=template(data);
        return container;
    }
});
m.addControl(new Legend());
	var mapmargin = parseInt($("#map").css("margin-top"), 10);

	$(window).on("resize", function(){
	
		if($(window).width()>=980){
			$('#map').css("margin-top",40);
				$('#map').css("height", ($(window).height() - mapmargin));	
		}else if($(window).width()<334){
		$('#map').css("margin-top",0);
			$('#map').css("height", ($(window).height()-85));	
	}else{
				$('#map').css("margin-top",0);
		$('#map').css("height", ($(window).height()-50));	
		}
	});
	if($(window).width()>=980){
		$('#map').css("margin-top",40);
			$('#map').css("height", ($(window).height() - mapmargin));	
	}else if($(window).width()<334){
		$('#map').css("margin-top",0);
			$('#map').css("height", ($(window).height()-85));	
	}else{
		$('#map').css("margin-top",0);
			$('#map').css("height", ($(window).height()-50));	
	}
});