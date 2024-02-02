//地図を描画するDOM要素を選択し、デフォルトの緯度経度、縮尺を設定。
let mapTest = L.map("mapTest").setView([latitude, longitude], ratio);

//地図データの取得元とZoom範囲を設定する。
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(mapTest);
let tmptest = d3.select("#tmptemp")


readDataAndPlotPieChart()


function readDataAndPlotPieChart(){

ratio=mapTest.getZoom()
//this array is the “map zoom level”：blocksize  //🌟8开始用markers？
let ratioAndBlock={"2":45,"3":30,"4":15,"5":5,"6":3,"7":2,"8":1,"9":0.5,"10":0.2,"11":0.1,"12":0.05,"13":0.05,"14":0.02,"15":0.02,"16":0.02,"17":0.0001,"18":"special"}
let blockSize=ratioAndBlock[ratio]
//  Get all pie
var elementsToRemove = document.querySelectorAll('#mapTest .leaflet-marker-icon');
// And remove them
elementsToRemove.forEach(function(element) {
    element.remove();
});

if(blockSize!=="special"){
    
    //Avoiding the loss of decimal precision
    let radiusTest = 25;
    //pieチャートデータセット用関数の設定
    let pie = d3.pie()
        .value(function (d) { return d.value; })
        .sort(null);

    // get map boundary
    let bounds = mapTest.getBounds();
    // get SouthWest and NorthEast coordinate
    let southWest = bounds.getSouthWest();
    let northEast = bounds.getNorthEast();
    console.log(blockSize)
    console.log(southWest)
    console.log(northEast)
    //get leftlong, rightlong, lowerlat, upperlat, adjust with blocksize
    let leftlong = Decimal.mul(Decimal.floor(Decimal.div(southWest.lng,blockSize)),blockSize)
    let rightlong = Decimal.mul(Decimal.ceil(Decimal.div(northEast.lng,blockSize)),blockSize)
    let lowerlat = Decimal.mul(Decimal.floor(Decimal.div(southWest.lat,blockSize)),blockSize)
    let upperlat = Decimal.mul(Decimal.ceil(Decimal.div(northEast.lat,blockSize)),blockSize)
    if(blockSize>1){
        leftlong = Math.floor(southWest.lng/blockSize)*blockSize
        rightlong = Math.ceil(northEast.lng/blockSize)*blockSize
        lowerlat = Math.floor(southWest.lat/blockSize)*blockSize
        upperlat = Math.ceil(northEast.lat/blockSize)*blockSize
    }
    console.log(leftlong)
    console.log(rightlong)
    console.log(lowerlat)
    console.log(upperlat)

    //decide the data reading range
    let longStart=Decimal.sub(leftlong,blockSize)
    let longEnd=Decimal.add(rightlong,blockSize)
    let latStart=Decimal.sub(lowerlat,blockSize)
    let latEnd=Decimal.add(upperlat,blockSize)
    if(blockSize>1){
        longStart=leftlong-blockSize
        longEnd=rightlong+blockSize
        latStart=lowerlat-blockSize
        latEnd=upperlat+blockSize
    }
    console.log(longStart)
    console.log(longEnd)
    console.log(latStart)
    console.log(latEnd)

    //list up the urls
    let urlsFishAndRatio=[]
    let urlsPieCoord=[]
    let urlsOutput=[]
    let pieDataSetTrial={}
 
    for(x=longStart;x<=longEnd;x=Decimal.add(x,blockSize)){
    
        let long=x
        //Ensure readings are within range
        if(long>180){
            long=Decimal.sub(long,360)
        }
        if(long<-180){
            long=Decimal.add(long,360)
        }

        for(y=latStart;y<=latEnd;y=Decimal.add(y,blockSize)){
       
            let lat=y
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

    for(i=0;i<urlsFishAndRatio.length;i++){
    
        let urlFishAndRatio=urlsFishAndRatio[i]
        let urlPieCoord=urlsPieCoord[i]
        let urlOutput=urlsOutput[i]
        let pieCoorTmp
        let pieDataTmp
        //console.log(fetch(urlOutput))

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
                console.log(`pieCoorTmp`, pieCoorTmp);//OK
                console.log(urlFishAndRatio)
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
                        let pieDataTmpSorted = pieDataTmp.sort(function(a, b) {
                            return b.value - a.value;
                        });
                        //console.log("pie data sorted", pieDataTmpSorted)

                        //preparing the popup content
                        let htmlStringForPopup = "<table><tr><td><u>No. of samples</u></td><td><u>" + pieCoorTmp[2] + "</u></td></tr>";
                        let i=0
                        pieDataTmpSorted.forEach(function(item) {
                            if (i<20){
                                htmlStringForPopup += '<tr><td>' + item["name"] + '</td><td>' + item["value"].toFixed(2) + '</td></tr>';
                            }
                            i += 1
                        });
                        htmlStringForPopup += '</table>';

                        //draw pie
                        let customIcon = drawPieIcontest(radiusTest, pieDataTmp, pieCoorTmp[2])
                        
                        //add pie chart//can not get data
                        let markersTest1 = L.marker([pieCoorTmp[0],pieCoorTmp[1]], { icon: customIcon }).addTo(mapTest);
                        let markersTest2 = L.marker([pieCoorTmp[0],Decimal.add(pieCoorTmp[1],360)], { icon: customIcon }).addTo(mapTest);//？
                        markersTest1.bindPopup(htmlStringForPopup)
                        //markersTest2.bindPopup(htmlStringForPopup)
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}


}else{
    let radiusTest = 25;
    //pieチャートデータセット用関数の設定
    let pie = d3.pie()
        .value(function (d) { return d.value; })
        .sort(null);
    // get map boundary
    let bounds = mapTest.getBounds();

    // get SouthWest and NorthEast coordinate
    let southWest = bounds.getSouthWest();
    let northEast = bounds.getNorthEast();
    let leftlong = new Decimal(southWest.lng)
    let lowerlat = new Decimal(southWest.lat)
    let rightlong = new Decimal(northEast.lng)
    let upperlat = new Decimal(northEast.lat)
    let groupeDataList = `layered_data/${language}/${blockSize}/groupedDataList.json`
    let groupeDataListKey = Object.keys(groupeDataList)
    let groupeDataListScreenedKey=[]
    let folderPath = `layered_data/${language}/${blockSize}/${lowerlat}/${leftlong}`//maybe could be delete
    //let urlFileIndex = `${folderPath}/fileList.json`
    //console.log(urlFileIndex)
    fetch(urlFileIndex)
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
        })
        .then(data => {
            let fileIndex = data["files"]
            console.log(fileIndex);
            for(i=0;i<fileIndex.length;i++){
                let urlFile = `${folderPath}/${fileIndex[i]}`
                //console.log(urlFile)
                fetch(urlFile)
                    .then(response => {
                        if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                    })
                    .then(data => {
                        let pieData=data["species"];
                        let pieCoord=[data["lat"],data["long"]];
                        let pieName=data["ID"]
                        let pieTime=data["time"]
                        let htmlStringForPopup = `<table><tr><td><u>${pieName}</u></td><td><u>` + pieTime + "</u></td></tr>";
                        let j=0
                        pieData.forEach(function(item) {
                            if (j<20){
                                htmlStringForPopup += '<tr><td>' + item["name"] + '</td><td>' + item["value"].toFixed(2) + '</td></tr>';
                            }
                            j += 1
                        });
                        var customIcon = drawPieIcontest(radiusTest, pieData,1)
                        //add pie chart
                        var markersTest1 = L.marker([pieCoord[0],pieCoord[1]], { icon: customIcon }).addTo(mapTest);
                        var markersTest2 = L.marker([pieCoord[0],pieCoord[1]+360], { icon: customIcon }).addTo(mapTest);
                        //markersTest1.bindPopup(htmlStringForPopup)
                        //markersTest2.bindPopup(htmlStringForPopup)
                        
                        //tooltipオブジェクトを作成し、マーカーにバインド
                        markersTest1.bindTooltip(htmlStringForPopup, { direction: 'bottom' }).openTooltip();
                        markersTest2.bindTooltip(htmlStringForPopup, { direction: 'bottom' }).openTooltip();

                        //popupオブジェクトを作成し、マーカにバインド
                        var popuptest = L.popup().setContent(htmlStringForPopup);
                        markersTest1.bindPopup(popuptest);
                        markersTest2.bindPopup(popuptest);
                        
                        //マーカーをMarkerClusterGroupオブジェクトレイヤーに追加する
                        markersTest.addLayer(markersTest1);
                        markersTest.addLayer(markersTest2);
                    })
                    
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
        markersTest.on('clustermouseover', function (e) { drawClusterPopup(e) }); 
        //MarkerClusterGroupオブジェクトレイヤーをマップオブジェクトレイヤーに追加する
        mapTest.addLayer(markersTest);
}

}


 
function drawPieIcontest(radius, pieInputList,sampleNo){
    
    //円弧を描画する
    if(sampleNo<10){sampleNo=10}
    radius=radius*(Math.log10(sampleNo))
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
    
function filterInRange(fileLocas, minLat, maxLat, minLon, maxLon){
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
