var m;
var tid = 3206745;
var gwid = 1808742;
var geocoder = new google.maps.Geocoder();
var zoom = 8;
var center = new google.maps.LatLng(42.04113400940814,-71.795654296875);
var marker;
var mainLayer,greenWay;

$(function() {
        $( "#tabs" ).tabs({
        	collapsible: true,
            selected: -1
		});
        $( "input:submit,input:reset" ).button();
        $('input, textarea').placeholder();
        fusion();
        popLists();
	});
function fusion() {
    
  m = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: zoom,
      mapTypeId: 'roadmap'
    });
greenWay = new google.maps.FusionTablesLayer(gwid);
 mainLayer = new google.maps.FusionTablesLayer(tid);
 greenWay.setQuery("SELECT 'geometry' FROM " + gwid + " WHERE 'Preferred' ='Y'" );
  mainLayer.setQuery("SELECT 'geometry' FROM " + tid);
  greenWay.setMap(m);
  mainLayer.setMap(m);
  }

function geocode() {
     var address = document.getElementById("address").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        m.setCenter(results[0].geometry.location);
        m.setZoom(14);
     marker = new google.maps.Marker({
            map: m, 
            position: results[0].geometry.location
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
}

function resetgeo() {
    
    m.setCenter(center);
    m.setZoom(zoom);
marker.setMap(null);
}


    
    google.load('visualization', '1', {});
    
function popLists(){    
    MakePopList('Type',getFacTypeData);
   MakePopList('Status',getStatusData);
    }

function MakePopList(columnName,callfunc){
 var queryText = encodeURIComponent("SELECT " +columnName + ", COUNT() FROM " + tid + " GROUP BY " +columnName);
    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + queryText);
    query.send(callfunc);
	}
    
var getFacTypeData = MakeData("facType"," 'Type' like '");
var getStatusData = MakeData("facStatus"," 'Status' like '");

function MakeData(selectID,querryText){

function getData(response) {
  // Get the number of rows
var numRows = response.getDataTable().getNumberOfRows();
  
  // Add options to the select menu based on the results
 var typeSelect = document.getElementById(selectID);  
  for(i = 0; i < numRows; i++) {
      var ftData = response.getDataTable().getValue(i, 0);
      if (!ftData)
     { continue;}
    
     else
     { var newoption = document.createElement('option');
      newoption.setAttribute('value',querryText + ftData + "'");
    newoption.innerHTML = ftData;
    typeSelect.appendChild(newoption);}
  }  
}
return getData;
}    
    
    

function changeMap() {
   var facType = document.getElementById('facType').value.replace("'", "\\'");
   var statusType = document.getElementById('facStatus').value.replace("'", "\\'");
   var andz = " and ";
 if(facType === "" ||statusType === "")
 {andz = "";}
  mainLayer.setQuery("SELECT 'geometry' FROM " + tid + " WHERE " + facType + andz + statusType);
 
}