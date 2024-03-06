//地図を描画するDOM要素を選択し、デフォルトの緯度経度、縮尺を設定。
var map = L.map("map").setView([latitude, longitude], ratio);

//地図データの取得元とZoom範囲を設定する。
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(map);
let tmptest = d3.select("#tmptemp")

//new added
let blockPlotRecorder = {}
let mapLevelRecoder = map.getZoom()

let loadedData = {}

//readDataAndPlotPieChart()

//pieチャートデータセット用関数の設定
var pie = d3.pie()
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
