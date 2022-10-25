const polygonBtn = document.getElementById("polygon");
const undoBtn = document.getElementById("undo");
const pointBtn = document.getElementById("point");
var dotnumber = 0
var functioncheker="off"
var polygonCoordinate = {
  "type": "MultiPolygon",
  "coordinates": [
    [[]]
  ]
}
var polygoncheker="nonexist"



polygonBtn.addEventListener("click", e => {
  if (polygonCoordinate.coordinates[0][0].length<=2){
    alert("Please select at least 3 points")
  }else{
    undoBtn.className="iconPolygon2on";
    undoBtn.disabled=false;
    polygonBtn.className="iconPolygonoff";
    polygonBtn.disabled = true;
    pointBtn.className="iconPolygonoff";
    pointBtn.disabled=true;
    polygonCoordinate.coordinates[0][0].push(polygonCoordinate.coordinates[0][0][0])
    var geoJsonLayer = L.geoJSON(polygonCoordinate).addTo(map);
    geoJsonLayer.eachLayer(function (layer) {
      layer._path.id = 'polygonlayer';
    });
    polygoncheker="exist"
    getCapturedSampleList()
    map.off('click');
  }

});

pointBtn.addEventListener("click", e => {
  polygonBtn.className="iconPolygon";
  polygonBtn.disabled=false;
  undoBtn.className="iconPolygon2on";
  undoBtn.disabled=false;
  pointBtn.className="iconPolygonon"
  map.on('click',function(e){
    var dotLayer = L.layerGroup().addTo(map);
    var dotmarker = L.circle(e.latlng,{radius:100,color:'red',fillColor:'red',fillOpacity:1}).addTo(dotLayer);
    dotLayer.eachLayer(function (layer) {
      layer._path.class = 'dots';
      layer._path.id = 'dots';
    });
    dotnumber=dotnumber+1
    var tempco=[]
    tempco.push(dotmarker.getLatLng().lng,dotmarker.getLatLng().lat)
    console.log(tempco)
    polygonCoordinate.coordinates[0][0].push(tempco)
  });
});

undoBtn.addEventListener("click", e =>{
  undoBtn.className="iconPolygon2off";
  undoBtn.disabled=true;
  pointBtn.className="iconPolygon";
  pointBtn.disabled=false;
  polygonBtn.className="iconPolygonoff";
  polygonBtn.disabled=false;
  $("#polygonlayer").remove();
  $('#dots*').remove();
  dotnumber=0
  polygonCoordinate = {
    "type": "MultiPolygon",
    "coordinates": [
      [[]]
    ]
  }
  polygoncheker="nonexist"
  map.off('click');
  getCapturedSampleList();
})

