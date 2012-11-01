var m = new L.Map("map", {
    center: new L.LatLng(42.2, -71),
	zoom: 8,
	attributionControl: true
});

new L.Hash(m);
var mapQuestAttr = 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ';
var osmDataAttr = 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
var opt = {
    url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpeg',
    options: {attribution:mapQuestAttr + osmDataAttr, subdomains:'1234'}
  };
var mq=L.tileLayer(opt.url,opt.options);
mq.addTo(m);
var bike=L.geoJson('',{style:style,onEachFeature:popUp}).addTo(m);
$.get("bike.geojson",function(d){bike.addData(d);},"JSON");

function style (f) {
    var sopt={opacity:1,weight:3,clickable:true,stroke:true};
    switch (f.properties.FacilityType) {
            case "Bike lane": sopt.color = "#ff0000"; return sopt;
            case "Shared use path":   sopt.color = "#00ff00"; return sopt;
            case "To be determined (retired type - hold for future use, use for unknown faciliy)":   sopt.color = "#ffffff"; return sopt;
            case "Marked shared lane": sopt.color = "#F2A90A"; return sopt;
            case "Sign-posted on-road bike route (with no other accommodation on the road surface)": sopt.color = "#919191"; return sopt;
            case "Bicycle/Pedestrian priority roadway": sopt.color = "#FFFB00"; return sopt;
            case "Usable bike shoulder (4-5 foot min./moderate volume/speed road, locally identified as a bike facility)": sopt.color = "#919191"; sopt.dashArray="5, 5"; return sopt;
            case "Hybrid (raod segment with different treatments in each direction of travel)": sopt.color = "#919191"; sopt.dashArray="5, 5, 1, 5"; return sopt;
            case "Cycle track": sopt.color = "#EA00FF"; sopt.dashArray="5, 5, 1, 5"; return sopt;
        }
        return sopt;
}
function popUp(f,l){
    var out = [];
    if (f.properties){
        for(key in f.properties){
            out.push(key+": "+f.properties[key]);
        }
        l.bindPopup(out.join("<br />"));
    }
}
function mQuery(q){
    var out = function (f){
        if(f.properties.FacilityType!==q){
            return {clickable:false,stroke:false};
        }
    };
    return out;
}
$(function() {
    var select='<div id="tabs"><ul><li><a href="#search">search</a></li><li><a href="#query">Query</a></li></ul> <div id="search"><form id="geocoder"><input type="text" class="tbox" id="address" placeholder="Enter an Address or LatLong" /><input type="submit" value="Search" id="geocode"/><input type="reset" value="Reset" id="resetgeo"/></form></div><div id="query"><select id="selq"><option value="all">All Types</option></select></div></div>';
    $('body').prepend(select);
    $( "#tabs" ).tabs({
            collapsible: true,
            selected: -1
    });
    var all = [
            "Bike lane"
            ,"Shared use path"
            ,"To be determined (retired type - hold for future use, use for unknown faciliy)"
            ,"Marked shared lane"
            ,"Sign-posted on-road bike route (with no other accommodation on the road surface)"
            ,"Bicycle/Pedestrian priority roadway"
            ,"Usable bike shoulder (4-5 foot min./moderate volume/speed road, locally identified as a bike facility)"
            ,"Hybrid (raod segment with different treatments in each direction of travel)"
            ,"Cycle track"
        ];
        $.each(all,function(_i,v){
            $("#selq").append('<option value="'+v+'">'+v+'</option>');
        });
        $("#selq").change(function(){
            bike.eachLayer(function(l){bike.resetStyle(l);});
            var val = $("#selq").val();
            if(val && val!=="all"){
                bike.setStyle(mQuery(val));
                
            }
            });
$("#geocoder").submit(geocode);
$("#resetgeo").click(resetgeo);
$("#getStatus").change(function(){
      var val = $("#getStatus").val();
      if(val===""){
        url.rmW("Status");
      }else{
        url.setW("Status",val);
      }
      redo();
    });

var old={};
var marker = new L.Marker();
function geocode(){
    old.center=m.getCenter();
    old.zoom=m.getZoom();
 var address =$("#address").val();
 var gURL = 'http://open.mapquestapi.com/nominatim/v1/search?countrycodes=us&exclude_place_ids=955483008,950010827&viewbox=-76.212158203125%2C44.46123053905882%2C-66.005859375%2C40.107487419012415&bounded=1&format=json&q=';
  $.ajax({
       type: "GET",
       url: gURL + address,
       dataType: 'jsonp',
       jsonp: 'json_callback',
       success: function (data, textStatus) {
           if(textStatus=="success"){
          var latlng = new L.LatLng(data[0].lat, data[0].lon);
         marker.setLatLng(latlng);
        
         m.addLayer(marker);
         m.setView(latlng,17);
      
           }
       }
  });
  return false;
}

function resetgeo(){
    m.removeLayer(marker);
    m.setView(old.center, old.zoom);
}
});