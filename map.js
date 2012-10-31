var m = new L.Map("map", {
    center: new L.LatLng(42.2, -71),
	zoom: 8,
	attributionControl: true
});
new L.Hash(m);
var mapQuestAttr = 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ';
var osmMapAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
  var osmDataAttr = 'Map data ' + osmMapAttr;
var opt = {
    url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpeg',
    options: {attribution:mapQuestAttr + osmDataAttr, subdomains:'1234'}
  };
var mq=L.tileLayer(opt.url,opt.options);
mq.addTo(m);
var bike=L.geoJson('',{style:style,onEachFeature:popUp}).addTo(m);
$.get("bike.geojson",function(d){bike.addData(d);},"JSON");

function style (f) {
    var sopt={opacity:1,weight:3}
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
            out.push(key+": "+f.properties[key])
        }
        l.bindPopup(out.join("<br />"));
    }
}