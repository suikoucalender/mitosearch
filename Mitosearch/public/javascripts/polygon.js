const polygonBtn = document.getElementById("polygon");
const polygon2Btn = document.getElementById("polygon2");
const undoBtn = document.getElementById("undo");
const eraserBtn = document.getElementById("eraser");
const trBtn = document.getElementById("tr");
var dotnumber = 0
var functioncheker="off"
var polygonCoordinate = {
  "type": "MultiPolygon",
  "coordinates": [
    [[]]
  ]
}



polygonBtn.addEventListener("click", e => {
    undoBtn.className="iconPolygon2on";
    eraserBtn.className="iconPolygon2on";
    polygonBtn.className="iconPolygonoff";
    polygonBtn.disabled = true
    //eraserBtn.disabled=false;

    polygonCoordinate.coordinates[0][0].push(polygonCoordinate.coordinates[0][0][0])
    console.log(polygonCoordinate)

    var geoJsonLayer = L.geoJSON(polygonCoordinate).addTo(map);
    geoJsonLayer.eachLayer(function (layer) {
      layer._path.id = 'polygonlayer';
    });
    polygonCoordinate = {
      "type": "MultiPolygon",
      "coordinates": [
        [[]]
      ]
    }
});



eraserBtn.addEventListener("click", e => {
    undoBtn.className="iconPolygon2off";
    //eraserBtn.className="iconPolygon2off";
    polygonBtn.className="iconPolygon"
    //undoBtn.disabled=true;
    //eraserBtn.disabled=true;
    polygonBtn.disabled = false
    $("#polygonlayer").remove();
    $('#dots*').remove();
    dotnumber=0
    polygonCoordinate = {
      "type": "MultiPolygon",
      "coordinates": [
        [[]]
      ]
    }
});


trBtn.addEventListener("click", e => {
  undoBtn.className="iconPolygon2on";
  eraserBtn.className="iconPolygon2on";
  eraserBtn.disabled=false;
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
    console.log(polygonCoordinate)
    console.log(dotnumber)
  });
});

undoBtn.addEventListener("click", e =>{
  map.off('click');
})

