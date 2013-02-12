var bikessrc;
if (L.Browser.vml){
bikessrc = "json/disolve6.json";
}else{
bikessrc = "json/bikes.json";
}
var b = [];
var m = L.map('map').setView([42.35904337942925, -71.06178045272827], 18);
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
		var coords = this.get('geometry').coordinates;
		var layer;
		if(coords.every(function(v){return v.length === 2})){
			layer = L.polyline(coords.map(function(v){
				return [v[1],v[0]];
				}),style(this.attributes));
		}else{
		layer = L.multiPolyline(coords.map(function(vv){
			return vv.map(function(v){
				return [v[1],v[0]];
				});
			}),style(this.attributes));
		}
		onEachFeature(this,layer);
		return layer;
	},
	addTo:function(m){
		this.leaflet.addTo(m);
		return this;
	},
	rmFrom : function(m){
		m.removeLayer(this.leaflet);
		return this;
	}
});
var Bikes = Backbone.Collection.extend({
    model: ft,
    query:{},
    initialize:function(){
        this.featureGroup = L.featureGroup().addTo(m);
    }
});
var bikes = new Bikes();
d3.json(bikessrc, function(error, dd){
	bikes.add(dd.features);

map.render();
statusSelect.render();
typeSelect.render();
	});
	
MapView = Backbone.View.extend({
	initialize:function(){
	this.render = this.options.render;
	if(this.options.template){
		this.template = (Mustache.compile(this.options.template));
	}else{
	this.collection.on("change:_cwm",this.render,this);
	}},
	collection:bikes,
	selectChanged:function(e){
		if(e.target.value === "all"){
			if(this.collection.query[e.target.id]){
				delete this.collection.query[e.target.id];
			}
		}else{
			this.collection.query[e.target.id] = e.target.value;
		}
		this.collection.at(0).set("_cwm",Math.random());
	}
});
var map = new MapView({	
	el :$("map"),
	render : function(){
		this.collection.featureGroup.clearLayers();
    if(Object.keys(this.collection.query).length === 0){
    	_.each(this.collection.models,function(v){v.addTo(this.collection.featureGroup)},this);
    }else{
    	_.each(this.collection.where(this.collection.query),function(v){v.addTo(this.collection.featureGroup)},this);
    }
	return this;
	},
	events:{
		"queryChanged div":"render"
	}
});

var statusSelect = new MapView({
	el : $("#FacilityStatus"),
	template : "<option value='all'>All Statuses</option>{{#statuses}}<option value='{{statusFull}}'>{{status}}</option>{{/statuses}}",
	render : function(){
		
		this.$el.html(this.template({statuses:_.map(_.uniq(this.collection.pluck("FacilityStatus")).sort(),function(v){return {statusFull : v,status:v.slice(0,v.indexOf(":"))}})}));
		return this;
	},
	events:{
		"change":"selectChanged"
	}
});
var typeSelect = new MapView({
	el : $("#FacilityType"),
	template : "<option value='all'>All Types</option>{{#types}}<option value='{{fullType}}'>{{type}}</option>{{/types}}",
	render : function(){
		this.$el.html(this.template({types:_.map(_.uniq(this.collection.pluck("FacilityType")).sort(),function(v){
			if(v.indexOf("(")===-1){
				return {type:v,fullType:v};
			}else{
			return {
				type:v.slice(0,v.indexOf("(")),
				fullType:v};
			}
			})}));
		return this;
	},
	events:{
		"change":"selectChanged"
	}
});

var baseMaps = [
    "MapQuestOpen.OSM",
    "OpenStreetMap.Mapnik",
    "OpenStreetMap.DE",
    "Esri.WorldImagery",
    "Stamen.TerrainBackground",
    "Stamen.Watercolor",
];
var lc = L.control.layers.filled(baseMaps,{},{map:m});
function onEachFeature(ft,layer) {
    // does this feature have a property named popupContent?
    if (ft.attributes) {
    	var out = [];
        for(var key in ft.attributes){
        	if(!_.contains(['geometry','id','_id','type','Shape_Length',"_cwm"],key)){
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