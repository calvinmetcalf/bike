var bikessrc;
if (L.Browser.vml){
bikessrc = "json/bikes-rm.json";
}else{
bikessrc = "json/bikes.json";
}
var dd;

var ft = Backbone.Model.extend({
	initialize:function(){
		props=this.get("properties");
		if(props){
			this.set(props);
		}
		this.unset("properties");
		this.leaflet=this.toMap();
		this.onMap=false;
	},
	toMap:function(){
		layer = L.polyline(this.get('geometry').coordinates.map(function(v){return [v[1],v[0]]}),style(this.attributes));
		onEachFeature(this,layer);
		return layer;
	},
	addTo:function(m){
		if(!this.onMap){
			this.leaflet.addTo(m);
			this.onMap=true;
		}
		return this;
	},
	rmFrom : function(m){
		if(this.onMap){
			m.removeLayer(this.leaflet);
			this.onMap=false;
		}
		return this;
	}
});
var Bikes = Backbone.Collection.extend({
  model: ft
});
var bikes = new Bikes;
$.get(bikessrc,function(d){
	bikes.add(d.features);
map.render();
statusSelect.render();
typeSelect.render();
	},"json");
	
MapView = Backbone.View.extend({
	initialize:function(){
	this.render = this.options.render;
	if(this.options.template){
		this.template = (Mustache.compile(this.options.template));
	}
	},
	query:{},
	collection:bikes,
});
var map = new MapView({	
	tag:"div",
	id:"map",
	render : function(){

	_.each(this.collection.models,function(v){
	var add = true;
		for(var key in this.query){
			if(v.get(key)!==this.query[key]){
				add=false;
			}
		}
		if(add){
		
			v.addTo(m);
		}else{
	
			v.rmFrom(m);
		}
		},this);
	}
});
var statusSelect = new MapView({
	el : $("#statusSelect"),
	template : "<option value='all'>All Statuses</option>{{#statuses}}<option value='{{status}}'>{{status}}</option>{{/statuses}}",
	render : function(){
		this.$el.html(this.template({statuses:_.map(_.map(_.uniq(this.collection.pluck("FacilityStatus")),function(v){return v.slice(0,v.indexOf(":"))}).sort(),function(v){return {status:v}})}));
	}
});
var typeSelect = new MapView({
	el : $("#typeSelect"),
	template : "<option value='all'>All Types</option>{{#types}}<option value='{{status}}'>{{type}}</option>{{/types}}",
	render : function(){
		this.$el.html(this.template({types:_.map(_.map(_.uniq(this.collection.pluck("FacilityType")),function(v){
			if(v.indexOf("(")===-1){
				return v;
			}else{
			return v.slice(0,v.indexOf("("));
			}
			}).sort(),function(v){return {type:v}})}));
	}
});
var m = L.map('map').setView([42.35904337942925, -71.06178045272827], 18);
var baseMaps = [
    "MapQuestOpen.OSM",
    "OpenStreetMap.Mapnik",
    "OpenStreetMap.DE",
    "Esri.WorldImagery",
    "Stamen.TerrainBackground",
    "Stamen.Watercolor",
];
L.control.layers.filled(baseMaps,{},{map:m});
function onEachFeature(ft,layer) {
    // does this feature have a property named popupContent?
    if (ft.attributes) {
    	var out = [];
        for(var key in ft.attributes){
        	if(!_.contains(['geometry','id','_id','type','Shape_Length'],key)){
        			out.push(key + ": "+ft.attributes[key]);
        	}
        }
        layer.on('click', function(e){
    L.rrose({ autoPan: false })
      .setContent(out.join("<br/>"))
      .setLatLng(e.latlng)
      .openOn(m);
  });
    }
}
function style(doc) {
		var status = doc.FacilityStatus.slice(0,doc.FacilityStatus.indexOf(":"));
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
        var facT = doc.FacilityType
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

m.addHash();
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