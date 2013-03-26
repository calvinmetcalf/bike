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
var m = L.map('map').setView([41.9360,-71.6611], 9);
var baseMaps = [
	"MapQuestOpen.OSM",
	"OpenStreetMap.Mapnik",
	"OpenStreetMap.DE",
	"Esri.WorldImagery",
	"Stamen.TerrainBackground",
	"Stamen.Watercolor",
];
function getURL(){
	//L.Browser.vml?"json/bikes-xrm.json":"json/bikes.json"
	return "https://gis-otp.rhcloud.com/bikes?bbox="+m.getBounds().toBBoxString()+"&simplify="+getRes();
}
var bikes = L.geoJson.ajax(getURL(),{style:style,onEachFeature:onEachFeature,dataType:"jsonp"}).addTo(m);

var lc = L.control.layers.filled(baseMaps,{"bikes":bikes},{map:m});
var popupTemplate=Mustache.compile('<ul>{{#items}}<li><strong>{{key}}</strong>: {{value}}</li>{{/items}}</ul>');
function onEachFeature(ft,layer) {
	if (ft.properties) {
		var out = {items:[]},val;
		for(var key in ft.properties){
			if(['geometry','id','_id','type','Shape_Length',"_cwm"].indexOf(key)===-1){
				val = ft.properties[key].replace(/\+.+\+/g,"");
				if(val&&val!==""){
					out.items.push({key:key.replace(/([a-z])([A-Z])/g,"$1 $2"),value:val});
		}
			}
		}
		layer.bindPopup(popupTemplate(out));
	}
}
m.on("moveend",function(){
	bikes.refresh(getURL());
});
function style(doc) {
		var status = doc.properties.FacilityStatus.slice(0,doc.properties.FacilityStatus.indexOf(":"));
		out = {opacity:0.9};
		switch (status) {
			case 'Existing':
				//
				break;
			case 'Under construction':
				out.dashArray = "4, 10";

				break;
			case 'In design':
				out.dashArray = "4,15";

				break;
			case 'Planned':
				out.dashArray = "3, 20"
				break;
		}
		var facT = doc.properties.FacilityType
		var pn = facT.indexOf("(")
		if( pn>0 ){
				facT = facT.slice(0,pn)
		}
		switch (facT.trim()) {
			case 'Bike lane':
				out.color = "#E41A1C";
				break;
			case "Bicycle/Pedestrian priority roadway":
				out.color ="#377EB8";
				break;
			case "Cycle track":
				out.color ="#4DAF4A";
				break;
			case "Marked shared lane":
				out.color ="#984EA3";
				break;
			case "Shared use path":
				out.color ="#FF7F00";
				break;
			case "Sign-posted on-road bike route":
				out.color ="#FFFF33";
				break;
			case "On-Road - To Be Determined":
				out.color ="#A65628";
				break;
			case "Paved bike shoulder":
				out.color ="#F781BF";
				break;
			case "Hybrid":
				out.color ="#999999";
				break;
		}
		return out;
	}
var dropdowns = {"status":[{"value":"Existing: Facility is open for use","display":"Existing"},{"value":"In design: Currently in design review by MassDOT or under design locally","display":"In design"},{"value":"Under construction: Facility is actively being built, under contract for construction or advertised for construction","display":"Under construction"},{"value":"Planned: Programmed in STIP, feasability being studied or local design funds encumbered/earmarked","display":"Planned"}],"type":[{"value":"Shared use path","display":"Shared use path"},{"value":"Bike lane","display":"Bike lane"},{"value":"Sign-posted on-road bike route (with no other accommodation on the road surface)","display":"Sign-posted on-road bike route"},{"value":"Paved bike shoulder (4-5 foot min./moderate volume/speed road, locally identified as a bike facility)","display":"Paved bike shoulder"},{"value":"Bicycle/Pedestrian priority roadway","display":"Bicycle/Pedestrian priority roadway"},{"value":"On-Road - To Be Determined","display":"On-Road - To Be Determined"},{"value":"Hybrid (road segment with different treatments in each direction of travel)","display":"Hybrid"},{"value":"Marked shared lane","display":"Marked shared lane"},{"value":"Cycle track","display":"Cycle track"}]};
var statusTemplate=Mustache.compile('<option>All Statuses</option>\
{{#status}}\
<option value="{{value}}">{{display}}</options>\
{{/status}}');
var typeTemplate=Mustache.compile('<option>All Types</option>\
{{#type}}\
<option value="{{value}}">{{display}}</options>\
{{/type}}');
$("#FacilityStatus").html(statusTemplate(dropdowns));
$("#FacilityType").html(typeTemplate(dropdowns));

var state=[];
$("select").change(function(){
	var situation = 0;
	var newState=[$("#FacilityType").val(), $("#FacilityStatus").val()];
	if(state[0]===newState[0]&&state[1]===newState[1]){
		return;
	}
	state=newState;
	if(state[0]!=="All Types"){
		situation++;
	}
	if(state[1]!=="All Statuses"){
		situation++;
		situation++;
	}
	switch(situation){
		case 0:
			bikes.refilter();
			return false;
		case 1:
			bikes.refilter(function(a){
				return a.properties.FacilityType===state[0];
			});
			return false;
		case 2:
			bikes.refilter(function(a){
				return a.properties.FacilityStatus===state[1];
			});
			return;
		case 3:
			bikes.refilter(function(a){
				return a.properties.FacilityType===state[0]&&a.properties.FacilityStatus===state[1];
			});
			return false;
	}
});

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

function getRes(){
	var b = m.getBounds();
	var p = m.getPixelBounds();
	var xSize= ((b.getNorthEast().lng-b.getSouthWest().lng)/p.getSize().x);
	var ySize = ((b.getNorthEast().lat-b.getSouthWest().lat)/p.getSize().y);
	return (xSize>ySize)?xSize:ySize;
}