
//commonMito.js

function getBlockSize(ratio){
    let ratioAndBlock = { "2": 45, "3": 30, "4": 15, "5": 5, "6": 3, "7": 2, "8": 1, "9": 0.5, "10": 0.2, "11": 0.1, "12": 0.05, "13": 0.05, "14": 0.02, "15": 0.02, "16": 0.02, "17": 0.01, "18": "special" }
    return ratioAndBlock[ratio]
}

function getTargetBlocks(southWest, northEast, blockSize){

    let leftlong = Decimal.mul(Decimal.floor(Decimal.div(southWest.lng, blockSize)), blockSize)
    let rightlong = Decimal.mul(Decimal.ceil(Decimal.div(northEast.lng, blockSize)), blockSize)
    let lowerlat = Decimal.mul(Decimal.floor(Decimal.div(southWest.lat, blockSize)), blockSize)
    let upperlat = Decimal.mul(Decimal.ceil(Decimal.div(northEast.lat, blockSize)), blockSize)
    if (blockSize > 1) {
        leftlong = Math.floor(southWest.lng / blockSize) * blockSize
        rightlong = Math.ceil(northEast.lng / blockSize) * blockSize
        lowerlat = Math.floor(southWest.lat / blockSize) * blockSize
        upperlat = Math.ceil(northEast.lat / blockSize) * blockSize
    }
    console.log("leftlong, rightlong, lowerlat, upperlat", leftlong, rightlong, lowerlat, upperlat)
    
    //decide the data reading range
    let longStart = Decimal.sub(leftlong, blockSize)
    let longEnd = Decimal.add(rightlong, blockSize)
    let latStart = Decimal.sub(lowerlat, blockSize)
    let latEnd = Decimal.add(upperlat, blockSize)
    if (blockSize > 1) {
        longStart = leftlong - blockSize
        longEnd = rightlong + blockSize
        latStart = lowerlat - blockSize
        latEnd = upperlat + blockSize
    }
    console.log("longStart, longEnd, latStart, latEnd", longStart, longEnd, latStart, latEnd)
    
    //ブロックをすべて列挙する
    let listBlocks = []
    
    for (let x = longStart; x <= longEnd; x = Decimal.add(x, blockSize)) {
    
        let long = x
        //Ensure readings are within range
        //if (long > 180) {
        //    long = Decimal.sub(long, 360)
        //}
        //if (long < -180) {
        //    long = Decimal.add(long, 360)
        //}
    
        for (let y = latStart; y <= latEnd; y = Decimal.add(y, blockSize)) {
            //console.log(x,y)
            let lat = y
            listBlocks.push(lat+"/"+long)
        }
    }
    return listBlocks
    
}

function removeAllPieChart(){
    
    //new added(changed)
    //  Get all pie chart
    let elementsToRemove = document.querySelectorAll('#map .leaflet-marker-icon');
    // And remove all the pie chart, to aviod multiple overlapping drawings
    elementsToRemove.forEach(element => element.remove());
}



//timePicker.js

let counter = 1
let lowerHandle
let upperHandle
let graphChecker
let sliderLoadChecker = false
let userTimeSettingChecker = true
let userLowerHandleSetting
let userUpperHandleSetting
let userLowerHandleSettingStamp
let userUpperHandleSettingStamp
let userLowerCalanderSettingStamp
let userUpperCalanderSettingStamp

function timeTransformer(date) {
    let result
    let offset
    if (date.indexOf("Z") !== -1) {
        result = date.replace("T", " ")
        result = result.replace("Z", "")
        offset = 0
        result = new Date(result).getTime() + offset * 3600000//+32400000
        result = new Date(result).toUTCString()
    } else if (date.indexOf("+") !== -1) {
        result = date.substring(0, date.indexOf("+") - 1)
        result = result.replace("T", " ")
        offset = date.substring(date.indexOf("+") + 1)
        offset = Number(offset.substring(0, offset.indexOf(":")))
        //+32400000 is changing the time from GMT+9 localtime to UTC time
        result = new Date(result).getTime() + offset * 3600000//+32400000
        result = new Date(result).toUTCString()
    } else if (date.indexOf("-") !== -1) {
        result = date.substring(0, date.lastIndexOf("-") - 1)
        result = result.replace("T", " ")
        offset = date.substring(date.lastIndexOf("-") + 1)
        offset = Number(offset.substring(0, offset.indexOf(":")))
        result = new Date(result).getTime() - offset * 3600000//+32400000
        result = new Date(result).toUTCString()
    }
    result = result.toString()
    return result
}

function slidersize() {
    if (graphChecker == "exist") {
        //get width of graph, the caculate the size of slider
        sliderArea.style.display = "block";
        lowerHandleNumber.style.display = "block";
        upperHandleNumber.style.display = "block";
        var graph = document.querySelector("#bargraphAlltime > svg > g > g:nth-child(2)");
        var graphWidth = graph.getBoundingClientRect().width;
        var parent = document.querySelector(".parent");
        parent.style.width = graphWidth + "px"
        parent.style.marginRight = -15 + "px"
    } else {
        sliderArea.style.display = "none";
        lowerHandleNumber.style.display = "none";
        upperHandleNumber.style.display = "none";
    }
}

function timestamp(str) {
    return new Date(str).getTime();
}

function sliderUpdating() {
    if (isMove) {
        return
    };
    //get min and max value of sample
    if (capturedSampleList.length == 0) {
        return;
    }

    var tempdateAll = sampleDataSet[0]['date'];
    if (tempdateAll.indexOf("T") !== -1) {
        tempdateAll = tempdateAll.toString()
        var datetransformed = timeTransformer(tempdateAll)
        tempdateAll = datetransformed
    }
    tempdateAll = Date.parse(tempdateAll)
    //console.log("temdateAll____________"+tempdateAll)
    var maxTimestamp = tempdateAll;
    var minTimestamp = tempdateAll;


    for (var i = 1; i < sampleDataSet.length; i++) {

        tempdateAll = sampleDataSet[i]['date']

        if (tempdateAll.indexOf("T") !== -1) {
            tempdateAll = tempdateAll.toString()
            var datetransformed = timeTransformer(tempdateAll)
            tempdateAll = datetransformed
        }
        tempdateAll = Date.parse(tempdateAll)

        if (isNaN(tempdateAll)) {
            //console.log('date missing '+i)
        } else {
            if (tempdateAll >= maxTime) {
                maxTimestamp = tempdateAll
            } else if (tempdateAll <= minTime) {
                minTimestamp = tempdateAll
            }

            var maxTime = new Date(maxTimestamp)
            var minTime = new Date(minTimestamp)

        }

    }

    maxTimestamp = maxTimestamp + 86399000


    if (document.getElementById("lowerHandleNumberDatePicker").value == "") {
        userLowerHandleSettingStamp = minTimestamp
    } else {
        userLowerCalanderSettingStamp = timestamp(document.getElementById("lowerHandleNumberDatePicker").value)
        userLowerHandleSettingStamp = userLowerCalanderSettingStamp
        console.log("lowerCalanderWorked")
    }

    if (document.getElementById("upperHandleNumberDatePicker").value == "") {
        userUpperHandleSettingStamp = maxTimestamp
    } else {
        userUpperCalanderSettingStamp = timestamp(document.getElementById("upperHandleNumberDatePicker").value)
        userUpperHandleSettingStamp = userUpperCalanderSettingStamp
        console.log("upperCalanderWorked")
    }

    if (userTimeSettingChecker) {
        if (userUpperHandleSettingStamp > maxTimestamp) {
            maxTimestamp = userUpperHandleSettingStamp
        }
        if (userLowerHandleSettingStamp < minTimestamp) {
            minTimestamp = userLowerHandleSettingStamp
        }
    }
    userTimeSettingChecker = false
    slider.noUiSlider.updateOptions({
        range: {
            min: minTimestamp,
            max: maxTimestamp
        },
        start: [userLowerHandleSettingStamp, userUpperHandleSettingStamp],
    });

    userTimeSettingChecker = true
    sliderLoadChecker = true
}

// //get min and max value of slider
// var tempdateAll = sampleDataSet[0]['date'];
// //Checking time format, if it is zulu time, transform it into the utc time
// if (tempdateAll.indexOf("T") !== -1) {
//     tempdateAll = tempdateAll.toString()
//     var datetransformed = timeTransformer(tempdateAll)
//     //console.log("changed====="+datetransformed)
//     tempdateAll = datetransformed
// }
// //changing the time to timestamp format
// tempdateAll = Date.parse(tempdateAll)
// var maxTimestamp = tempdateAll;
// var minTimestamp = tempdateAll;



// //Iterate through the data to get the maximum and minimum time values
// for (var i = 1; i < sampleDataSet.length; i++) {
//     tempdateAll = sampleDataSet[i]['date']
//     if (tempdateAll.indexOf("T") !== -1) {
//         tempdateAll = tempdateAll.toString()
//         var datetransformed = timeTransformer(tempdateAll)
//         tempdateAll = datetransformed
//     }
//     tempdateAll = Date.parse(tempdateAll)
//     if (isNaN(tempdateAll)) {
//         //console.log('date missing '+i)
//     } else {
//         if (tempdateAll >= maxTimestamp) {
//             maxTimestamp = tempdateAll
//         } else if (tempdateAll <= minTimestamp) {
//             minTimestamp = tempdateAll
//         }
//         var maxTime = new Date(maxTimestamp)
//         var minTime = new Date(minTimestamp)
//     }

// }

// //maximun time value plus 1 day, to prevent error
// maxTimestamp = maxTimestamp + 86399000




// //create slider
// var formatter = new Intl.DateTimeFormat('ja-JP', {
//     dateStyle: 'medium'
// });
// noUiSlider.create(slider, {
//     start: [minTimestamp, maxTimestamp],
//     connect: true,
//     range: {
//         min: minTimestamp,
//         max: maxTimestamp
//     },
//     step: 1 * 24 * 60 * 60 * 1000,
//     behaviour: 'tap',
//     format: wNumb({
//         decimals: 0
//     }),
// });

// var dateValues = [
//     document.getElementById('event-start'),
//     document.getElementById('event-end')
// ];

// sliderLoadChecker = true;


//drawSelectbox.js

$(function () {
    $('.test-select2').select2({
        language: "ja"
    });
})

$("#button").click(function () {
    let fishList = $("#filter").val().join(" ,");
    fishList = fishList + " ,";
    console.log(fishList)
    $.ajax({
        type: "POST",
        data: { fishList: fishList },
        dataType: "text"
    })
    .done(function (res) {
        res = JSON.parse(res);
        sampleDataSet = res.new_sampleDataObjList;
        console.log(sampleDataSet)
        fishClassifyDataObj = res.new_fishClassifyDataObj;
        console.log(fishClassifyDataObj)
        map.remove();

        //appendScript("javascripts/drawPie.js");
        //appendScript("javascripts/drawLiddgeLine.js");

        load_sync_js(["javascripts/drawPie.js", "javascripts/drawLiddgeLine.js"]);

    })
})

function load_sync_js(src_list) {
    var rootScript = _create_script(src_list[0]);
    var s = rootScript;
    var body = document.getElementsByTagName('body')[0];
    for (var i = 0; i < src_list.length; i++) {
        if (i + 1 >= src_list.length) break;
        var nextScript = _create_script(src_list[i + 1]);
        s.onload = function () {
            if (s.initialized) return;
            s.initialized = true;
            body.appendChild(nextScript);
        };
        s.onreadystatechange = function () {
            if (s.initialized) return;
            if (s.readyState == 'complete') {
                s.initialized = true;
                body.appendChild(nextScript);
            }
        };
        s = nextScript;
    }
    body.appendChild(rootScript);
}
function _create_script(src) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.initialized = false;
    return s;
}


function appendScript(URL) {
    var el = document.createElement('script');
    el.src = URL;
    document.body.appendChild(el);
};



//polygon.js

const undoBtn = document.getElementById("undo");
const pointBtn = document.getElementById("point");
let dotnumber = 0

let functioncheker="off"
let polygonCoordinate = {
  "type": "MultiPolygon",
  "coordinates": [
    [[]]
  ]
}
let polygoncheker="nonexist"

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



// drawPie.js

//地図を描画するDOM要素を選択し、デフォルトの緯度経度、縮尺を設定。
let map = L.map("map").setView([latitude, longitude], ratio);

//地図データの取得元とZoom範囲を設定する。
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(map);
let tmptest = d3.select("#tmptemp")

//new added
let blockPlotRecorder = {}
let mapLevelRecoder = map.getZoom()

let loadedData = {}

//readDataAndPlotPieChart()

//pieチャートデータセット用関数の設定
let pie = d3.pie()
    .value(function (d) { return d.value; })
    .sort(null);

function deletePieChartLoadedData(){
    loadedData = {}
}

function readDataAndPlotPieChart() {
    //get the zoom level of map
    ratio = map.getZoom()
    console.log("map zoom level", ratio)
    //this array is {“map zoom level”：blocksize}
    let ratioAndBlock = { "2": 45, "3": 30, "4": 15, "5": 5, "6": 3, "7": 2, "8": 1, "9": 0.5, "10": 0.2, "11": 0.1, "12": 0.05, "13": 0.05, "14": 0.02, "15": 0.02, "16": 0.02, "17": 0.01, "18": "special" }
    let blockSize = ratioAndBlock[ratio]

    //new added(changed)
    //  Get all pie chart
    //var elementsToRemove = document.querySelectorAll('#map .leaflet-marker-icon');
    // And remove all the pie chart, to aviod multiple overlapping drawings
    //elementsToRemove.forEach(function(element) {
    //element.remove();
    //});


    let radiusTest = 25;
    //pieチャートデータセット用関数の設定
    let pie = d3.pie()
        .value(function (d) { return d.value; })
        .sort(null);
    if (blockSize !== "special") {//this part, map level is 1-17
        //Avoiding the loss of decimal precision

        // get map boundary
        let bounds = map.getBounds();
        // get SouthWest and NorthEast coordinate
        let southWest = bounds.getSouthWest();
        let northEast = bounds.getNorthEast();
        console.log("blockSize, southWest, northEast: ",blockSize, southWest, northEast)
        //get leftlong, rightlong, lowerlat, upperlat, adjust with blocksize
        let leftlong = Decimal.mul(Decimal.floor(Decimal.div(southWest.lng, blockSize)), blockSize)
        let rightlong = Decimal.mul(Decimal.ceil(Decimal.div(northEast.lng, blockSize)), blockSize)
        let lowerlat = Decimal.mul(Decimal.floor(Decimal.div(southWest.lat, blockSize)), blockSize)
        let upperlat = Decimal.mul(Decimal.ceil(Decimal.div(northEast.lat, blockSize)), blockSize)
        if (blockSize > 1) {
            leftlong = Math.floor(southWest.lng / blockSize) * blockSize
            rightlong = Math.ceil(northEast.lng / blockSize) * blockSize
            lowerlat = Math.floor(southWest.lat / blockSize) * blockSize
            upperlat = Math.ceil(northEast.lat / blockSize) * blockSize
        }
        console.log("leftlong, rightlong, lowerlat, upperlat", leftlong, rightlong, lowerlat, upperlat)

        //decide the data reading range
        let longStart = Decimal.sub(leftlong, blockSize)
        let longEnd = Decimal.add(rightlong, blockSize)
        let latStart = Decimal.sub(lowerlat, blockSize)
        let latEnd = Decimal.add(upperlat, blockSize)
        if (blockSize > 1) {
            longStart = leftlong - blockSize
            longEnd = rightlong + blockSize
            latStart = lowerlat - blockSize
            latEnd = upperlat + blockSize
        }
        console.log("longStart, longEnd, latStart, latEnd", longStart, longEnd, latStart, latEnd)

        //list up the urls
        let urlsFishAndRatio = []
        let urlsPieCoord = []
        let urlsOutput = []
        let pieDataSetTrial = {}

        for (x = longStart; x <= longEnd; x = Decimal.add(x, blockSize)) {

            let long = x
            //Ensure readings are within range
            if (long > 180) {
                long = Decimal.sub(long, 360)
            }
            if (long < -180) {
                long = Decimal.add(long, 360)
            }

            for (y = latStart; y <= latEnd; y = Decimal.add(y, blockSize)) {

                let lat = y
                let folderPath = `layered_data/${language}/${blockSize}/${lat}/${long}`;
                let speciesPath = `${folderPath}/fishAndRatio.json`;
                let coordPath = `${folderPath}/pieCoord.json`;
                let outputPath = `${folderPath}/output.json`
                urlsFishAndRatio.push(speciesPath)
                urlsPieCoord.push(coordPath)
                urlsOutput.push(outputPath)
            }
        }
        //console.log(urlsFishAndRatio)
        //console.log(urlsPieCoord)
        //console.log(urlsOutput)

        for (i = 0; i < urlsFishAndRatio.length; i++) {

            let urlPieCoord = urlsPieCoord[i]
            if (urlPieCoord in loadedData) {
                continue //ロードされているデータは飛ばす
            } else {
                loadedData[urlPieCoord] = 1
            }

            let urlFishAndRatio = urlsFishAndRatio[i]
            let urlOutput = urlsOutput[i]
            let pieCoorTmp
            let pieDataTmp
            //console.log(fetch(urlOutput))

            //new added  not working well
            //console.log(urlFishAndRatio)
            let matches = urlFishAndRatio.split('/');
            //console.log(matches)
            let firstNumber = matches[3];
            let secondNumber = matches[4];
            let combinedString = `${firstNumber},${secondNumber}`;
            //console.log(combinedString);
            blockPlotRecorder[combinedString] = 1;

            //new added
            //if(blockPlotRecorder[combinedString]===1){
            //return;
            //}



            fetch(urlPieCoord)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    //console.log("*******",response.json())
                    return response.json();
                })
                .then(dataCoor => {
                    pieCoorTmp = dataCoor;
                    //console.log(`pieCoorTmp`, pieCoorTmp);//OK
                    //console.log(urlFishAndRatio)
                    fetch(urlFishAndRatio)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            //console.log("*******",response.json())
                            return response.json();
                        })
                        .then(data => {



                            pieDataTmp = data;
                            //console.log(`pieDataTmp`, pieDataTmp);

                            //Ordered from largest to smallest percentage
                            let pieDataTmpSorted = pieDataTmp.sort(function (a, b) {
                                return b.value - a.value;
                            });
                            //console.log("pie data sorted", pieDataTmpSorted)

                            //preparing the popup content
                            let htmlStringForPopup = urlPieCoord+"<table><tr><td><u>No. of samples</u></td><td><u>" + pieCoorTmp[2] + "</u></td></tr>";
                            //let htmlStringForPopup = "<table><tr><td><u>No. of samples</u></td><td><u>" + pieCoorTmp[2] + "</u></td></tr>";
                            let i = 0
                            pieDataTmpSorted.forEach(function (item) {
                                if (i < 20) {
                                    htmlStringForPopup += '<tr><td>' + item["name"] + '</td><td>' + item["value"].toFixed(2) + '</td></tr>';
                                }
                                i += 1
                            });
                            htmlStringForPopup += '</table>';
                            //console.log(pieCoorTmp[2])
                            //draw pie
                            let customIcon = drawPieIcontest(radiusTest, pieDataTmp, pieCoorTmp[2])

                            //add pie chart//can not get data
                            let markersTest1 = L.marker([pieCoorTmp[0], pieCoorTmp[1]], { icon: customIcon }).addTo(map);
                            let markersTest2 = L.marker([pieCoorTmp[0], Decimal.add(pieCoorTmp[1], 360)], { icon: customIcon }).addTo(map);//？
                            markersTest1.bindPopup(htmlStringForPopup)
                            //markersTest2.bindPopup(htmlStringForPopup)

                            blockPlotRecorder[combinedString] = 1;

                        })
                        .catch(error => {
                            console.error('There was a problem with the fetch operation:', error);
                        });
                })
                .catch(error => {
                    //データが存在しない場合このエラーになる
                    //console.error('There was a problem with the fetch operation:', error);
                });
        }
        console.log("blockPlotRecorder: ", blockPlotRecorder)

    } else {//This is when the map zoom level goes to 18
        //get the center location of map
        let mapCenter = map.getCenter();
        console.log("map center location", mapCenter)

        //calculate the block which we need
        let roundmapCenterLat = Math.floor(mapCenter.lat);
        let roundmapCenterLng = Math.floor(mapCenter.lng);
        console.log("map center round lat", roundmapCenterLat)
        console.log("map center round lng", roundmapCenterLng)
        let expectedNeededBlock = `${roundmapCenterLat},${roundmapCenterLng}`

        let blockData;
        //setting the offset of pie chart
        let offset = 0.0002

        let dataIconSaver

        //read block
        fetch(`layered_data/${language}/special/index/${expectedNeededBlock}.json`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                // data processing
                blockData = data

                mainLevel18(blockData, offset, radiusTest)


            })


            .catch(error => {
                console.error('Fetch error:', error);
            });

    }

}

function calculatePlotArrangement(sampleNumber) {
    let rows = 1;
    let columns = 1;

    while (rows * columns < sampleNumber) {
        if (rows === columns) {
            columns++;
        } else {
            rows++;
        }
    }

    return { rows, columns };

}

function adjustPieChartCenter(index, baseLatitude, baseLongitude, plotArrangement, offset) {
    const columns = plotArrangement.columns;

    // determinate the columns of plot, calculate the lng of pie
    const centerLng = baseLongitude + (index % columns) * offset;
    // determinate the rows of plot, calculate the lat of pie
    const centerLat = baseLatitude + Math.floor(index / columns) * offset;

    // return the center of pie
    return { centerLat, centerLng };
}

async function fetchSampleData(urlSample) {
    try {
        const response = await fetch(urlSample);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call fetchSampleData with async/await
async function plotingLevel18(j, urlSample, baseLat, baseLng, plotArrangement, offset, radiusTest) {
    const sampleDataTmp = await fetchSampleData(urlSample);
    console.log('Data outside fetchData:', sampleDataTmp);
    let pieDataTmp = sampleDataTmp["species"]
    console.log(`sample name`, sampleDataTmp["ID"]);
    console.log(`lat`, sampleDataTmp["lat"]);
    console.log(`lng`, sampleDataTmp["long"]);
    console.log(`fish ratio`, pieDataTmp);


    let pieCenter = adjustPieChartCenter(j, baseLat, baseLng, plotArrangement, offset)


    //preparing the popup content
    let htmlStringForPopup = "<table><tr><td><u>Sample name</u></td><td><u>" + sampleDataTmp["ID"] + "</u></td></tr>";
    htmlStringForPopup += '<tr><td><u>Date</u></td><td><u>' + sampleDataTmp["time"] + '</u></td><td>';
    let k = 0
    pieDataTmp.forEach(function (item) {
        if (k < 20) {
            htmlStringForPopup += '<tr><td>' + item["name"] + '</td><td>' + item["value"].toFixed(2) + '</td></tr>';
        }
        k += 1
    });
    htmlStringForPopup += '</table>';

    //draw pie
    let customIcon = drawPieIcontest(radiusTest, pieDataTmp, 1)

    console.log(pieCenter)

    //add pie chart
    let markersTest1 = L.marker([pieCenter["centerLat"], pieCenter["centerLng"]], { icon: customIcon }).addTo(map);
    markersTest1.bindPopup(htmlStringForPopup)
}

async function mainLevel18(blockData, offset, radiusTest) {
    let dataIconSaver
    //read data in the block
    for (i = 0; i < blockData.length; i++) {
        //get lat,lng
        let blockDataKeys = Object.keys(blockData[i])
        //get sample number
        let sampleNumber = blockData[i][blockDataKeys].length

        console.log("sample number", sampleNumber)

        //decide rows and column of pie chart
        let plotArrangement = calculatePlotArrangement(sampleNumber)
        console.log("plot arangement", plotArrangement)



        //
        console.log(blockDataKeys)
        console.log(blockData[i][blockDataKeys])

        let coordinate = blockDataKeys[0]
        coordinate = coordinate.split(',')
        //lat
        let baseLat = parseFloat(coordinate[0])
        let baseLng = parseFloat(coordinate[1])
        console.log(baseLat)
        console.log(baseLng)

        console.log("----------------------------")
        for (let j = 0; j < sampleNumber; j++) {

            let urlSample = `layered_data/${language}/special/${blockData[i][blockDataKeys][j]}`
            console.log(urlSample)
            console.log(j)
            await plotingLevel18(j, urlSample, baseLat, baseLng, plotArrangement, offset, radiusTest)
        }
    }
}


function drawPieIcontest(radius, pieInputList, sampleNo) {

    //円弧を描画する
    if (sampleNo < 10) { sampleNo = 10 }
    radius = radius * (Math.log10(sampleNo))
    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius / 3);

    tmptest.append("svg").attr("transform", "translate(" + (-1 * radius) + "," + (-1 * radius) + ")").attr("height", 2 * radius).attr("width", 2 * radius)
        .append("g").attr("transform", "translate(" + radius + "," + radius + ")")
        .selectAll(".pie")
        .data(pie(pieInputList))
        .enter()
        .append("g")
        .attr("class", "pie")
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d) { return selectColortest(d) })
        .attr("opacity", 0.9) //透過を指定するプロパティ
        .attr("stroke", "white"); //アウトラインの色を指定するプロパティ

    var customIcon = L.divIcon({ html: tmptest.html(), className: 'marker-cluster' });
    //console.log(customIcon)
    tmptest.select("svg").remove();
    return customIcon
}

function pieChartOverlap(circle1, circle2) {
    var dx = circle1.centerX - circle2.centerX;
    var dy = circle1.centerY - circle2.centerY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

function filterInRange(fileLocas, minLat, maxLat, minLon, maxLon) {
    return fileLocas.filter(Loca => {
        const parts = Loca.split(',');
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);

        return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
    });
}

function selectColortest(d) {
    var color = d3.scaleLinear()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
        .range(["#ffffff", "#d9d9d9", "#ffde80", "#92d050", "#c7d0b0", "#c39143", "#ff99ff", "#ea8c8c", "#83d3ff"]);
    return color(fishClassifyDataObj[d.data.name]);
}

function drawClusterPopup(e) {
    let cluster = e.layer;
    let childCount = cluster.getChildCount();
    let clusterComp = calc_clusterComp(cluster).clusterData.fish;
    let clusterCompList = [];
    Object.keys(clusterComp).forEach(fishName => {
        clusterCompList.push({ name: fishName, value: clusterComp[fishName] });
    });
    clusterCompList = object_array_sort(clusterCompList, "value");
    clusterCompList = clusterCompList.slice(0, 20);
    let toolTipContent = "<table><tr><td><u>No. of samples</u></td><td><u>" + childCount + "</u></td></tr>";
    clusterCompList.forEach(clusterCompObj => {
        toolTipContent = toolTipContent + "<tr><td>" + clusterCompObj.name + "</td><td>" + clusterCompObj.value.toFixed(2) + "</td></tr>";
    });
    toolTipContent = toolTipContent + "</table>";
    e.propagatedFrom.bindTooltip(toolTipContent).openTooltip();
}



// showLegend.js

//The function of the button: to show or not show each element of the web page
//get button
const helpBtn = document.getElementById("help");
const expansionBtn = document.getElementById("expansion");
const restoreBtn = document.getElementById("restore")
const alltimeBtn = document.getElementById("alltime");
const monthlyBtn = document.getElementById("monthly");
const timeFilterOnBtn = document.getElementById("timeFilterOnBtn")
const timeFilterOffBtn = document.getElementById("timeFilterOffBtn")

//get each element
const taxonomyLegend = document.getElementById("img");
const mapArea = document.getElementById("map");
const liddgeArea = document.getElementById("graph");
const bargraphAlltimeArea = document.getElementById("bargraphAlltime")
const bargraphArea = document.getElementById("bargraph")
const sliderArea = document.getElementById("sliderArea")
const slider = document.getElementById("slider")
const lowerHandleNumber = document.getElementById("lowerHandleNumber")
const upperHandleNumber = document.getElementById("upperHandleNumber")
const graphName = document.getElementById("graphName")

//buttons and elements status
let timeBtnChecker = "alltimeBtn"
let sliderStatusChecker = "non-exist"

//if help button is clicked
helpBtn.addEventListener("click", e => {
    //show [taxonomy legend] display
    taxonomyLegend.style.display = "block";
    //Remove [all buttons, bargraph related elements] display
    helpBtn.style.display = "none";
    liddgeArea.style.display = "none";
    bargraphAlltimeArea.style.display = "none";
    bargraphArea.style.display = "none";
    sliderArea.style.display = "none";
    lowerHandleNumber.style.display = "none";
    upperHandleNumber.style.display = "none";
    graphName.style.display = "none";
    timeFilterOnBtn.style.display = "none"
    timeFilterOffBtn.style.display = "none"
});

//if taxonomy legent is clicked
taxonomyLegend.addEventListener("click", e => {
    //remove [taxonomy legend] disply
    taxonomyLegend.style.display = "none";
    //show  [all buttons, bargraph related elements] disply
    helpBtn.style.display = "block";
    liddgeArea.style.display = "block";
    bargraphAlltimeArea.style.display = "block";
    bargraphArea.style.display = "block";
    //show slider related elements
    sliderDisplay();
});


//if exansion button of map is clicked
expansionBtn.addEventListener("click", e => {
    //change the width of map to 100%
    mapArea.style.width = "100%";
    pointBtn.className="iconPolygon";
    functioncheker="off";
    //remove map
    map.remove();

    //relocd map
    appendScript("javascripts/drawPie.js");

    //remove expansion button
    expansionBtn.style.display = "none";
    //add restore button
    restoreBtn.style.display = "block";
    //remove bargrap related elements
    liddgeArea.style.display = "none";
    bargraphAlltimeArea.style.display = "none";
    bargraphArea.style.display = "none";
    //remove slider related elements
    sliderArea.style.display = "none";
    lowerHandleNumber.style.display = "none";
    upperHandleNumber.style.display = "none";
    graphName.style.display = "none";

    //Determine which button should be removed 
    //based on the slider's display state
    if (sliderStatusChecker=="non-exist"){
        timeFilterOnBtn.style.display="none"
    }else{
        timeFilterOffBtn.style.display="none"
    }

    //Determine which button should be removed 
    //based on the slider's mode
    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display = "none";
    }
    else {
        monthlyBtn.style.display = "none";
    }

});

//if restore button is clicked
restoreBtn.addEventListener("click", e => {
    //set mat width to 40%
    mapArea.style.width = "40%";
    pointBtn.className="iconPolygon";
    functioncheker="off";
    map.remove();

    //reload map
    load_sync_js(["javascripts/drawPie.js", "javascripts/drawLiddgeLine.js"]);

    //remove restore button
    restoreBtn.style.display = "none";
    //show expansion button
    expansionBtn.style.display = "block";
    //show bargraph related button
    liddgeArea.style.display = "block";
    bargraphAlltimeArea.style.display = "block";
    bargraphArea.style.display = "block";

    //Determine which button should be shown
    //based on the slider's display state
    if (sliderStatusChecker=="non-exist"){
        timeFilterOnBtn.style.display="block"
    }else{
        timeFilterOffBtn.style.display="block"
    }

    //Determine which button should be shown
    //based on the slider's mode
    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display = "block";
    }
    else {
        monthlyBtn.style.display = "block";
    }
});


//if all time button is clicked
alltimeBtn.addEventListener("click", e => {
    //change the button state
    timeBtnChecker = "monthlyBtn";
    //reload liddge graph
    appendScript("javascripts/drawLiddgeLine.js");
    //remove alltime button
    alltimeBtn.style.display = "none";
    //show monthly button
    monthlyBtn.style.display = "block";
    //reload slider
    sliderDisplay(); 
});

//if monthly buttion is clicked
monthlyBtn.addEventListener("click", e => {
    //change the button state
    timeBtnChecker = "alltimeBtn";
    //reload liddge graph
    appendScript("javascripts/drawLiddgeLine.js");
    //remove monthly button
    monthlyBtn.style.display = "none";
    //show all time button
    alltimeBtn.style.display = "block";
    //reload slider
    sliderDisplay();
});

//if time filter on button is clicked
timeFilterOnBtn.addEventListener("click", e => {
    //change slider disply state
    sliderStatusChecker = "exist"
    //reload slide, and show it
    sliderUpdating();
    sliderDisplay()
    slidersize();
});

//if time filter of button is clicked
timeFilterOffBtn.addEventListener("click", e => {
    //change slider disply state
    sliderStatusChecker="non-exist"
    //reset the slider
    slider.noUiSlider.reset();
    userTimeSettingChecker=false
    //remove slider related elements
    sliderDisplay()
});



// drawLiddgeLine.js

let graphData = {} //{blockSize: {y_x: }} リッジグラフ用のデータをダウンロードした結果の保存場所
let isMove = false
let oldZoomSize = map.getZoom()

let dateRangeCheker = false;
let upperHandleStamp = timestamp(upperHandle);
let lowerHandleStamp = timestamp(lowerHandle);
//if(upperHandle===lowerHandle){
//    upperHandle=upperHandle+100;
//    sliderLoadChecker=false;
//}
let upperHandleForRange = new Date(upperHandleStamp);
let lowerHandleForRange = new Date(lowerHandleStamp);

//console.log(upperHandleStamp);
//console.log(lowerHandleStamp);
//console.log(upperHandle);
//console.log(lowerHandle);


//window.onload = getCapturedSampleList;
getCapturedSampleList();

map.on("mouseup", removeMoveFlagAndDraw);
map.on("mousedown", setMoveFlag);
map.on("move", moveFunc)

function moveFunc(){
    const curZoomSize = map.getZoom()
    if(curZoomSize !== oldZoomSize){
        oldZoomSize = curZoomSize;
        console.log("Zoom Level Changed: ", curZoomSize)

        removeAllPieChart()
        deletePieChartLoadedData()
        getCapturedSampleList()
    }
    if (!isMove) {
        console.log("valid move")
        //getCapturedSampleList()
        //sliderUpdating()
    }
}

function setMoveFlag() {
    console.log("mouse up")
    isMove = true
}

function removeMoveFlagAndDraw() {
    console.log("mouse down")
    if (isMove) {
        isMove = false;
        getCapturedSampleList();
    }
    //readDataAndPlotPieChart();
    //getCapturedSampleListChecker=false
    //sliderDisplay;//to solve disappear problem
    //sliderUpdating;

    // if (sliderStatusChecker == "non-exist") {
    //     slider.noUiSlider.reset();
    // }

}



dateRangeCheker = false
//キャプチャエリア内のサンプルの組成を取得
function getCapturedSampleList() {
    console.log("getCapturedSampleList")
    //if(getCapturedSampleListChecker===true){
    //    console.log("runed once, CANCELED getCapturedSampleList")
    //    return
    //}
    if (isMove) {
        return
    }
    var pos = map.getCenter();
    var zoom = map.getZoom();

    //var pos = mapTest.getCenter();
    //var zoom = mapTest.getZoom();
    readDataAndPlotPieChart();
    var coordination = "?taxo=" + taxo + "&lat=" + pos.lat + "&long=" + pos.lng + "&ratio=" + zoom
    history.replaceState(null, "", coordination)
    //マップの移動・拡大・縮小時に4隅の緯度経度を取得
    var bounds = map.getBounds();
    var north = bounds._northEast.lat;
    var south = bounds._southWest.lat;
    var east = bounds._northEast.lng;
    var west = bounds._southWest.lng;

    //キャプチャエリア内のサンプル情報を取得
    capturedSampleList = [];

    if (polygoncheker == "exist") {
        var sampledotlayer = L.layerGroup().addTo(map)
        sampledotlayer.eachLayer(function (layer) {
            layer._path.id = 'sampledotlayer';
        });
        var newpolygon = L.polygon(polygonCoordinate.coordinates[0][0]);
        sampleDataSet.forEach(sampleData => {
            var sampleCoTmp = [];
            sampleCoTmp.push(sampleData.longitude)
            sampleCoTmp.push(sampleData.latitude)
            var samplePoint = L.marker(sampleCoTmp);
            //console.log("hayeswise=" (L.polygon(polygonCoordinate)).contains(L.marker(sampleCoTmp).getLatLng()))
            //console.log("mapbox="leafletPip.pointInLayer(sampleCoTmp,(L.geoJson(polygonCoordinate))))
            console.log("sample__________" + sampleCoTmp)
            console.log(samplePoint)
            try {
                if (newpolygon.contains(samplePoint.getLatLng())) {
                    //L.circle([sampleData.latitude,sampleData.longitude],{radius:100,color:'red',fillColor:'red',fillOpacity:1}).addTo(sampledotlayer);
                    capturedSampleList.push(sampleData);
                    //console.log(sampleData)
                } else {
                    //L.circle([sampleData.latitude,sampleData.longitude],{radius:100,color:'black',fillColor:'black',fillOpacity:1}).addTo(sampledotlayer);
                }
            } catch {
                console.log("latlngdata is 0")
            }
        })

    } else {
        // sampleDataSet.forEach(sampleData => {
        //     if (south < sampleData.latitude && sampleData.latitude < north) {
        //         //日本の左右のアメリカ大陸両方にマーカーを表示するため、重複してマーカーを描画していることに注意
        //         if ((west < sampleData.longitude && sampleData.longitude < east) || (west < sampleData.longitude + 360 && sampleData.longitude + 360 < east)) {
        //             capturedSampleList.push(sampleData);
        //         }
        //     }
        // })
    }

    //drawLiddgeLineChangeable(capturedSampleList)
    //drawLiddgeLine(capturedSampleList);
    drawLiddgeLine3(capturedSampleList)
    //slidersize();
    if (graphChecker !== "nonexist") {
        sliderDisplay();
    }
    getCapturedSampleListChecker = true
}

async function fetchFiles(urls) {
    // 各URLに対してfetchリクエストを作成し、Promise.allSettledに渡す
    const promises = urls.map(url =>
        fetch(url)
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Failed to load')))
    );

    // すべてのプロミスがsettled（完了）するのを待つ
    const results = await Promise.allSettled(promises);

    // 成功した結果のみをフィルタリング
    const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

    return successfulResults;
}

function addKeyVal(obj, key, valueToAdd) {
    // キーがオブジェクトに存在しなければ0で初期化
    if (!obj.hasOwnProperty(key)) {
        obj[key] = 0;
    }

    // 値を追加
    obj[key] += valueToAdd;
}

function drawLiddgeLine3(capturedSampleList) {
    console.log("drawLiddgeLine3")
    // get map boundary
    let bounds = map.getBounds();
    // get SouthWest and NorthEast coordinate
    let southWest = bounds.getSouthWest();
    let northEast = bounds.getNorthEast();
    let blockSize = getBlockSize(map.getZoom())
    let targetBlocks = getTargetBlocks(southWest, northEast, blockSize)
    //console.log(targetBlocks)

    let urls = [];
    for (let y_x of targetBlocks) {
        //console.log(y_x)
        if (!(blockSize in graphData)) {
            graphData[blockSize] = {}
        }
        if (!(y_x in graphData[blockSize])) {
            graphData[blockSize][y_x] = [] //ファイルがない場合もあるので、あらかじめ空のデータを突っ込んでおく
            let fileUrl = `layered_data/${language}/${blockSize}/${y_x}/month.json`
            urls.push(fileUrl)
        }
    }

    fetchFiles(urls).then(dataList => {
        console.log('ダウンロードできたファイルの結果:', dataList);

        let fishList = {} //{fishname:1}
        let numList = {} //{month: num}
        let sumList = {} //{month: {species: sum_percentage}}
        for (let blockTableData of dataList) { //dataList: [x, y, monthdata:[{month, num, data:[{name, value}]}]]<-全ブロック分
            //blockTableData: x, y, monthdata:[{month, num, data:[{name, value}]}]<-1ブロック分
            graphData[blockSize][blockTableData.y + "/" + blockTableData.x] = blockTableData.monthdata
        }
        for (let y_x of targetBlocks) { //targetBlocks: 集計対象となる全ブロックの場所情報
            for (let blockMonthTableData of graphData[blockSize][y_x]) {
                //blockMonthTableData: {month, num, data:[{name, value}]}<-1月分
                addKeyVal(numList, blockMonthTableData.month, blockMonthTableData.num)
                for (let blockMonthSpeciesTableData of blockMonthTableData.data) {
                    //blockMonthSpeciesTableData: {name, value}<-1種分
                    addKeyVal(fishList, blockMonthSpeciesTableData.name, 1)
                    if (!(blockMonthTableData.month in sumList)) {
                        sumList[blockMonthTableData.month] = {}
                    }
                    addKeyVal(sumList[blockMonthTableData.month], blockMonthSpeciesTableData.name,
                        blockMonthSpeciesTableData.value * blockMonthTableData.num)
                }
            }
        }
        //console.log(fishList)
        let averageList = {} //{month: {species: sum_percentage}}
        for (let month in sumList) {
            if (!(month in averageList)) {
                averageList[month] = {}
            }
            for (let species in sumList[month]) {
                addKeyVal(averageList[month], species, sumList[month][species] / numList[month])
            }
        }
        //console.log(averageList)

        let fishArray = Object.keys(fishList)
        let dateArray = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]


        dateList = [];
        var dateListAlltime = [];
        //fishList = [];
        let densityList = [];
        let timemode = "monthly";
        var alltimeBtn = document.getElementById("alltime");
        var alltimeBtnStyle = alltimeBtn.style;
        var alltimeBtnStyleDisplay = alltimeBtnStyle.getPropertyValue('display');
        let timelineData = {};
        let numDataInDay = {};
        let numtimelineData = {};

        //console.log(alltimeBtnStyleDisplay);
        if (alltimeBtnStyleDisplay === "none") { timemode = "alltime" }

        //svgタグを追加し、幅と高さを設定
        var graph = d3.select("#graph");
        var bargraph = d3.select("#bargraph")
        graphName.style.display = "block";
        
        //x軸の端点の日付を取得
        var scaleMax = new Date("2017-12-31");
        var scaleMin = new Date("2016-12-01");


        if (timemode == "alltime") {
            scaleMax = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
            scaleMin = new Date(minDate.setMonth(minDate.getMonth() - 1));
        }

        //魚種ごとのデータ作成高速化版
        let fastdensityList = [];
        for (let fishName of fishArray) {
            let fastdensityData = { fish: fishName, density: [] };
            let fastmax = 0;
            fastdensityData.density.push([scaleMin, 0]);
            for (let date of dateArray) {
                if (date in averageList && fishName in averageList[date]) {
                    if (averageList[date][fishName] > fastmax) {
                        fastmax = averageList[date][fishName]
                    }
                    fastdensityData.density.push([new Date("2017-" + date + "-01"), averageList[date][fishName]]);
                } else {
                    fastdensityData.density.push([new Date("2017-" + date + "-01"), 0]);
                }
            }
            fastdensityData.density.push([scaleMax, 0]);

            //データの最大値が40になるように調整
            fastdensityData.density = fastdensityData.density.map(data => { return [data[0], data[1] * (40 / fastmax)] })
            //組成の最大値の情報を格納
            fastdensityData["max"] = fastmax;
            fastdensityList.push(fastdensityData);
        }

        //グラフ描画用リストをMaxでソート
        densityList = object_array_sort(fastdensityList, "max");
        densityList = densityList.slice(0, 20)

        //魚種リストをソート
        fishList = densityList.map(densityData => {
            return densityData.fish;
        });

        //グラフ全体のサイズとマージンを設定
        var map = document.getElementById("map");
        var mapLeft = map.offsetLeft;
        var mapWidth = map.offsetWidth;

        var margin = { top: 75, right: mapLeft, bottom: 30, left: 250 },
            width = window.innerWidth - mapWidth - mapLeft - margin.left - margin.right,
            height = 40 * fishList.length,
            barmargin = { top: 10, right: mapLeft, bottom: margin.bottom, left: margin.left },
            barheight = 100,
            barwidth = width / 20;


        if (timemode == "alltime") {
            barwidth = width / 300;
        }


        //svgタグを削除
        bargraph.select("svg").remove();
        graph.select("svg").remove();

        //var svg = graph.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        var svg = graph.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
            .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //x軸のスケールを作成
        var xScale = d3.scaleTime()
            .domain([scaleMin, scaleMax])
            .range([0, width]);

        //x軸を追加する
        if (timemode == "monthly") {
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(
                    d3.axisTop(xScale)
                        .tickFormat(d3.timeFormat("%B"))
                )
        }
        else {
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(
                    d3.axisTop(xScale)
                        .tickFormat(d3.timeFormat("%y/%m"))
                )
        }
        //y軸のスケールを作成する
        var fishScale = d3.scaleBand()
            .domain(fishList)
            .range([0, height]);

        //y軸を追加する
        svg.append("g")
            .attr("transform", "translate(0, 0)")
            .call(d3.axisLeft(fishScale))



        //半メモリ分の長さを取得
        var betweenlen;

        if (fishList.length > 1) {
            betweenlen = fishScale(fishList[1]) / 2;
        } else {
            betweenlen = height / 2;
        }

        //Riddgeグラフを作成する
        svg.selectAll("area")
            .data(densityList)
            .enter()
            .append("path")
            .attr("transform", function (d) { return ("translate(0," + (fishScale(d.fish) + betweenlen) + ")") })
            //.attr("fill", function (d) { return "rgb(255,255," + ((100 - d.max) * 2) + ")" })
            .attr("fill", function (d) { return "rgb(255,255,103)" })
            .datum(function (d) { return d.density })
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                //.curve(d3.curveBasis)
                .curve(d3.curveMonotoneX)
                .x(function (d) { return xScale(d[0]); })
                .y(function (d) { return (- d[1]); })
            )

        drawScale(timemode, svg, xScale)

        window.addEventListener("scroll", function () {
            drawScale(timemode, svg, xScale);
        })

        window.addEventListener("onresize", function () {
            drawScale(timemode, svg, xScale);
        })

        //SVG領域の設定
        var svgbar = bargraph.append("svg").attr("width", width + barmargin.left + barmargin.right).attr("height", barheight + barmargin.top + barmargin.bottom)
            .append("g").attr("transform", "translate(" + barmargin.left + "," + barmargin.top + ")");
        //x軸のスケールを作成
        var barxScale = d3.scaleTime()
            .domain([scaleMin, scaleMax])
            .range([0, width]);

        //y軸のスケールを作成
        var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
            formatPower = function (d) { return (d + "").split("").map(function (c) { return superscript[c]; }).join(""); },
            formatTick = function (d) { return 10 + formatPower(Math.round(Math.log(d) / Math.LN10)); };

        // var baryScale = d3.scaleLog()
        //     .domain([numDataInDaymax, 0.90000000001])
        //     .range([0, barheight]);

        // //バーの表示
        // svgbar.append("g")
        //     .selectAll("rect")
        //     .data(numDataInDayList)
        //     .enter()
        //     .append("rect")
        //     .attr("x", function (d) { return barxScale(d.date) - barwidth / 2; })
        //     .attr("y", function (d) { return baryScale(d.value); })
        //     .attr("width", barwidth)
        //     .attr("height", function (d) { return barheight - baryScale(d.value); })
        //     .attr("fill", "#27A391");

        //x軸を追加する
        if (timemode == "monthly") {
            svgbar.append("g")
                .attr("transform", "translate(0," + barheight + ")")
                .call(
                    d3.axisTop(barxScale)
                        .tickFormat(d3.timeFormat("%B"))
                )
        }
        else {
            svgbar.append("g")
                .attr("transform", "translate(0," + barheight + ")")
                .call(
                    d3.axisTop(barxScale)
                        .tickFormat(d3.timeFormat("%y/%m"))
                )
        }

        // //y軸を追加する
        // svgbar.append("g")
        //     .attr("transform", "translate(0, 0)")
        //     .call(d3.axisLeft(baryScale).ticks(10, 0));
        // //console.log(numDataInDayList)
        numDataInDayList = []
        graphChecker = "exist"


    }).catch(error => {
        console.error('エラー:', error);
    });

}


function drawScale(timemode, svg, xScale) {
    //x軸を追加する
    d3.select(".xaxis").remove();

    if (timemode == "monthly") {
        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + ($(window).scrollTop()) + ")")
            .call(
                d3.axisTop(xScale)
                    .tickFormat(d3.timeFormat("%B"))
            )
    }
    else {
        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + ($(window).scrollTop()) + ")")
            .call(
                d3.axisTop(xScale)
                    .tickFormat(d3.timeFormat("%y/%m"))

            )
    }
}

function object_array_sort(data, key, order) {
    //デフォは降順(DESC)
    let num_a = -1;
    let num_b = 1;

    if (order === 'asc') {//指定があれば昇順(ASC)
        num_a = 1;
        num_b = -1;
    }

    data = data.sort(function (a, b) {
        let x = a[key];
        let y = b[key];
        if (x > y) return num_a;
        if (x < y) return num_b;
        return 0;
    });

    return data; // ソート後の配列を返す
}

//1st problem 
function isInvalidDate(date) {
    return Number.isNaN(new Date(date).getTime());
}


function sliderDisplay() {
    if (sliderStatusChecker == "exist") {
        timeFilterOnBtn.style.display = "none";
        timeFilterOffBtn.style.display = "block";
        if (timeBtnChecker == "monthlyBtn") {
            bargraphArea.style.display = "none";
            bargraphAlltimeArea.style.display = "block";
        } else {
            bargraphArea.style.display = "block";
            bargraphAlltimeArea.style.display = "block";
        }
        sliderArea.style.display = "block";
        lowerHandleNumber.style.display = "block";
        upperHandleNumber.style.display = "block";
    } else if (sliderStatusChecker == "non-exist") {
        timeFilterOnBtn.style.display = "block";
        timeFilterOffBtn.style.display = "none";
        if (timeBtnChecker == "monthlyBtn") {
            bargraphArea.style.display = "none";
            bargraphAlltimeArea.style.display = "block"
        } else {
            bargraphArea.style.display = "block"
            bargraphAlltimeArea.style.display = "none"
        }
        sliderArea.style.display = "none";
        lowerHandleNumber.style.display = "none";
        upperHandleNumber.style.display = "none";
    }
}



// iconLocation.js

function iconLocation() {
    //read the elements
    var helpBtn = document.getElementById("help");
    var expansionBtn = document.getElementById("expansion");
    var restoreBtn = document.getElementById("restore");
    var alltimeBtn = document.getElementById("alltime");
    var monthlyBtn = document.getElementById("monthly");
    var undoBtn = document.getElementById("undo");
    var pointBtn = document.getElementById("point");
    var timeFilterOnBtn = document.getElementById("timeFilterOnBtn");
    var timeFilterOffBtn = document.getElementById("timeFilterOffBtn");

    var map = document.getElementById("map");
    var graph = document.getElementById("graph");
    var bargraphx = document.querySelector("#bargraph > svg > g > g:nth-child(3)")
    var bargraphAlltimex = document.querySelector("#bargraphAlltime > svg > g > g:nth-child(2)")
    var bargraphxLeft = bargraphx.getBoundingClientRect().left;
    var bargraphAlltimexLeft = bargraphAlltimex.getBoundingClientRect().left;
    var graphName = document.getElementById("graphName");


    //get the position and size of map and graph
    var mapTop = map.offsetTop;
    var mapLeft = map.offsetLeft;
    var mapWidth = map.offsetWidth;
    var mapHeight = map.offsetHeight;
    var graphLeft = graph.offsetLeft;
    var graphWidth = graph.offsetWidth;

    var iconTop = mapTop + 30
        //0.02 * mapHeight;
    helpBtn.style.top = iconTop + "px";
    expansionBtn.style.top = iconTop + "px";
    restoreBtn.style.top = iconTop + "px";

    var helpLeft = mapLeft + 50;
    helpBtn.style.left = helpLeft + "px";

    var pointLeft= mapLeft + 10;
    pointBtn.style.left = pointLeft + "px";
    var pointTop = mapTop + 80;
    pointBtn.style.top = pointTop + "px";


    var undoLeft= mapLeft + 10;
    undoBtn.style.left = undoLeft + "px";
    var undoTop = pointTop + 40;
    undoBtn.style.top = undoTop + "px";


    //adjust the expention icon position with the map expansion, prevent icon position errors caused by window size changes
    var triger = window.innerWidth - 2 * mapWidth
    if (triger > 1) {
        var expensionLeft = mapLeft + mapWidth - 70;
        expansionBtn.style.left = expensionLeft + "px";
    } else {
        var expensionLeft = mapLeft + 0.37 * window.innerWidth - 50;
        expansionBtn.style.left = expensionLeft + "px";
    }
    mapWidth = map.offsetWidth;
    var restoreLeft = window.innerWidth - mapLeft - 80
    restoreBtn.style.left = restoreLeft + "px";
    var alltimeLeft = graphLeft + 0.90 * graphWidth;
    alltimeBtn.style.left = alltimeLeft + "px";
    var monthlyLeft = graphLeft + 0.90 * graphWidth;
    monthlyBtn.style.left = monthlyLeft + "px";

    var graphNameTop=mapTop+30;
    graphName.style.top=graphNameTop + "px";
    //console.log(bargraphAlltimexLeft)
    //console.log(bargraphxLeft)
    if(bargraphxLeft>0){
        var graphNameLeft=bargraphxLeft-40; 
    }else{
        var graphNameLeft=bargraphAlltimexLeft-40; 
    }
   
    graphName.style.left=graphNameLeft+"px";

};

//decide icons' position when all content loaded
window.addEventListener("load", function () {
    //iconLocation();
});



//dicide icons' position when window size changed
window.addEventListener('resize', function () {
    //iconLocation();
});



// timechange.js

// slider.noUiSlider.on('update', function (values, handle) {
//     //read the date from the slider
//     dateValues[handle].innerHTML = formatter.format(new Date(+values[handle]));
//     lowerHandle=document.getElementById('event-start').innerHTML
//     upperHandle=document.getElementById('event-end').innerHTML
//     //if bar moved, time information change
//     if (userTimeSettingChecker){
//         userLowerHandleSetting=lowerHandle
//         userUpperHandleSetting=upperHandle
//         userLowerHandleSettingStamp=timestamp(userLowerHandleSetting);
//         userUpperHandleSettingStamp=timestamp(userUpperHandleSetting);
//     }
//     //change the date label on the webpage
//     document.getElementById('lowerHandleNumber').innerHTML=lowerHandle
//     document.getElementById('upperHandleNumber').innerHTML=upperHandle
    
//     //change date format
//     var lowerHandleFormatChange=lowerHandle.split('/')
//     lowerHandleFormatChange=lowerHandleFormatChange.join('-')
//     var upperHandleFormatChange=upperHandle.split('/')
//     upperHandleFormatChange=upperHandleFormatChange.join('-')
//     document.getElementById("lowerHandleNumberDatePicker").value=lowerHandleFormatChange
//     document.getElementById("upperHandleNumberDatePicker").value=upperHandleFormatChange

//     upperHandleStamp=timestamp(upperHandle);
//     lowerHandleStamp=timestamp(lowerHandle);
//     upperHandleForRange=new Date(upperHandle);
//     lowerHandleForRange=new Date(lowerHandle);
//     //Retrieve new data and plot
//     //getCapturedSampleList()
// });


//change the slider with bar
document.getElementById("lowerHandleNumberDatePicker").addEventListener("blur", dateChangedByLowerCalander);
document.getElementById("upperHandleNumberDatePicker").addEventListener("blur", dateChangedByUpperCalander);



function dateChangedByLowerCalander() {
    userLowerCalanderSettingStamp=timestamp(document.getElementById("lowerHandleNumberDatePicker").value);
    if (userLowerCalanderSettingStamp<minTimestamp){
        userLowerCalanderSettingStamp=minTimestamp
        var lowerHandleFormatChange=lowerHandle.split('/')
        lowerHandleFormatChange=lowerHandleFormatChange.join('-')
        document.getElementById("lowerHandleNumberDatePicker").value=lowerHandleFormatChange
    }
    userTimeSettingChecker=true
    sliderUpdating()
}
function dateChangedByUpperCalander() {
    userUpperCalanderSettingStamp=timestamp(document.getElementById("upperHandleNumberDatePicker").value);
    if (userUpperCalanderSettingStamp>maxTimestamp){
        userUpperCalanderSettingStamp=maxTimestamp
        var upperHandleFormatChange=upperHandle.split('/')
        upperHandleFormatChange=upperHandleFormatChange.join('-')
        document.getElementById("upperHandleNumberDatePicker").value=upperHandleFormatChange
    }
    userTimeSettingChecker=true
    sliderUpdating()
}