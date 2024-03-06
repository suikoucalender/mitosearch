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

//v2への更新にあたり使用不可能
// pointBtn.addEventListener("click", e => {
//   if (functioncheker=="off"){
//     //Activate the function of adding fixed points
//     functioncheker = "on";
//     undoBtn.className="iconPolygon2on";
//     undoBtn.disabled=false;
//     pointBtn.className="iconPolygonon";

//     map.on('click',function(e){
//       //draw polygon fix points on the map by click
//       var dotLayer = L.layerGroup().addTo(map);
//       var dotmarker = L.circle(e.latlng,{radius:100,color:'red',fillColor:'red',fillOpacity:1}).addTo(dotLayer);
//       dotLayer.eachLayer(function(layer){
//         layer._path.class = 'dots';
//         layer._path.id = 'dots';
//       });
//       dotnumber = dotnumber+1;
//       var tempco = [];
//       tempco.push(dotmarker.getLatLng().lng,dotmarker.getLatLng().lat);

//       if (dotnumber>=3){
//         //add polygon, when fix points more then 3
//         if (polygoncheker=="exist"){
//           $("#polygonlayer").remove();
//           polygonCoordinate.coordinates[0][0].pop();
//         }
//         polygonCoordinate.coordinates[0][0].push(tempco);
//         polygonCoordinate.coordinates[0][0].push(polygonCoordinate.coordinates[0][0][0]);
//         var geoJsonLayer = L.geoJSON(polygonCoordinate).addTo(map);
//         geoJsonLayer.eachLayer(function (layer) {
//           layer._path.id = 'polygonlayer';
//         });
//         polygoncheker="exist"

//       }else{
//         polygonCoordinate.coordinates[0][0].push(tempco);
//       }
//       sliderUpdating();//updating the plots and time slider
//       slider.noUiSlider.reset();
//       getCapturedSampleList();
//     })
//   } else if (functioncheker=="on"){
//     //Disable the ability to add a fixed point
//     map.off('click');
//     functioncheker="off"
//     pointBtn.className="iconPolygon";
    
//   }
// });

// undoBtn.addEventListener("click", e =>{
//   //reset the polygon function
//   $("#polygonlayer").remove();
//   $('#dots*').remove();
//   dotnumber=0
//   polygonCoordinate = {
//     "type": "MultiPolygon",
//     "coordinates": [
//       [[]]
//     ]
//   }
//   polygoncheker="nonexist"
  
//   //map.off('click');
//   getCapturedSampleList();
//   sliderUpdating();
//   slider.noUiSlider.reset();
  
// })


