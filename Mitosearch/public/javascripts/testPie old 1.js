console.log(pieDataSet)
//console.log(blockSize)
//console.log(language)
//console.log(pieDataSet[language][0][blockSize])

//地図を描画するDOM要素を選択し、デフォルトの緯度経度、縮尺を設定。
var mapTest = L.map("mapTest").setView([latitude, longitude], ratio);

//地図データの取得元とZoom範囲を設定する。
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(mapTest);
var tmptest = d3.select("#tmptemp")


//when you change this one, [!!! also change the same variable in index.js]
var ratioAndBlock={"2":45,"3":30,"4":15,"5":5,"6":3,"7":2,"8":1,"9":0.5,"10":0.2,"11":0.1,"12":0.05,"13":0.05,"14":0.02,"15":0.02,"16":0.02,"17":0.02,"18":"special"}
var blockSize=ratioAndBlock[ratio]

if(blockSize!=="special"){
    //Avoiding the loss of decimal precision
    var expansion=1
    var expandedBlockSize=blockSize*expansion
    for(let a=0;expandedBlockSize<1;a++){
        expansion=expansion*10
        expandedBlockSize=expandedBlockSize*10
    }
    //console.log(expansion)
    //console.log(expandedBlockSize)
}

    
// get map boundary
var bounds = mapTest.getBounds();
// get SouthWest and NorthEast coordinate
var southWest = bounds.getSouthWest();
var northEast = bounds.getNorthEast();
//console.log(southWest)
//console.log(northEast)
if(blockSize!=="special"){
    console.time("report")
    //get leftlong, rightlong, lowerlat, upperlat, adjust with blocksize
    var leftlong = Math.floor(southWest.lng*expansion/expandedBlockSize)*expandedBlockSize
    //leftlong = leftlong/expansion

    var rightlong = Math.ceil(northEast.lng*expansion/expandedBlockSize)*expandedBlockSize
    //rightlong = rightlong/expansion

    var lowerlat = Math.floor(southWest.lat*expansion/expandedBlockSize)*expandedBlockSize
    //lowerlat = lowerlat/expansion

    var upperlat = Math.ceil(northEast.lat*expansion/expandedBlockSize)*expandedBlockSize
    //upperlat = upperlat/expansion

    console.log("left long   "+leftlong)
    console.log("right long   "+rightlong)
    console.log("lower lat   "+lowerlat)
    console.log("upper lat   "+upperlat)

    //calculated the loop start number
    var longStart=leftlong
    //for(i=-180; i<leftlong; i=i+expandedBlockSize){
    //    longStart=i
    //}
    //longStart=(longStart-expandedBlockSize)/expansion
    if(longStart<-180||isNaN(longStart)){
        longStart=-180
    }
    console.log("🌟long start   "+longStart)
    var latStart=lowerlat
    //for(j=-90; j<=lowerlat; j=j+expandedBlockSize){
        //latStart=j
    //}
    
    console.log("expansion   "+expansion)
    console.log("expanded block   "+expandedBlockSize)
    
    //latStart=(latStart-expandedBlockSize)/expansion
    
    if(latStart<-90){
        latStart=-90
    }
    console.log("lat start   "+latStart)
    console.timeLog("report")

    var radiusTest = 25;
    //pieチャートデータセット用関数の設定
    var pie = d3.pie()
        .value(function (d) { return d.value; })
        .sort(null);
    
    console.log(longStart)
    console.log(latStart)
    console.log(rightlong)
    
    //if(rightlong>180){
        //longStart=-180
    //}
    
    //loop with longtitude and latitude, step is blocksize, range
    for(x=longStart-10*expandedBlockSize; x<=rightlong+10*expandedBlockSize; x=x+expandedBlockSize){
        var long=x/expansion
        //if(long<-180){
            //long=long+360
        //}else if(long>180){
            //long=long-360
        //}
        if(pieDataSet[language][0][blockSize][long]==undefined){
            console.log("passed long "+long)
            continue
        }else{
            console.log("go with long "+long)
            for(y=latStart-10*expandedBlockSize; y<=upperlat+10*expandedBlockSize; y=y+expandedBlockSize){
                var lat=y/expansion
                console.log(lat)
                if(pieDataSet[language][0][blockSize][long][lat]==undefined){
                    console.log("passed lat "+lat)
                    continue
                }else{
                    console.log("-----go with "+lat+","+long+"-----")
                    //record the piedata(species and ratio)
                    var pieDataTmp=pieDataSet[language][0][blockSize][long][lat][0]
                    console.log(pieDataTmp)
                    //sorted in descending order of ratio
                    var pieDataTmpSorted = pieDataTmp.sort(function(a, b) {
                        return b.value - a.value;
                    });
                    var pieCoorTmp=pieDataSet[language][0][blockSize][long][lat][1]
                    //console.log(pieDataTmpSorted)
                    //preparing the popup content
                    var htmlStringForPopup = "<table><tr><td><u>No. of samples</u></td><td><u>" + pieCoorTmp[2] + "</u></td></tr>";
                    var i=0
                    pieDataTmpSorted.forEach(function(item) {
                        if (i<20){
                            htmlStringForPopup += '<tr><td>' + item["name"] + '</td><td>' + item["value"].toFixed(2) + '</td></tr>';
                        }
                        i += 1
                    });
                    htmlStringForPopup += '</table>';
                    var pieId=lat+"_"+long
                    var customIcon = drawPieIcontest(radiusTest, pieDataTmp, pieCoorTmp[2])
                    //add pie chart//can not get data
                    var markersTest = L.marker([pieCoorTmp[0],pieCoorTmp[1]], { icon: customIcon }).addTo(mapTest);
                    var markersTest2 = L.marker([pieCoorTmp[0],pieCoorTmp[1]+360], { icon: customIcon }).addTo(mapTest);
                    markersTest.bindPopup(htmlStringForPopup)
                    markersTest2.bindPopup(htmlStringForPopup)
                    //markersTest.bindTooltip(htmlStringForPopup, { direction: 'bottom' }).openTooltip();
                }
            }
        }
    
    }
    console.timeEnd("report")
}else{
        //get leftlong, rightlong, lowerlat, upperlat, adjust with blocksize
        var leftlong = Math.floor(southWest.lng)
        var lowerlat = Math.floor(southWest.lat)
        var pieDataSetTmp=pieDataSet[language][0][blockSize][leftlong][lowerlat]
        //console.log(pieDataSetTmp)
        var radiusTest = 25;
        //pieチャートデータセット用関数の設定
        var pie = d3.pie()
            .value(function (d) { return d.value; })
            .sort(null);
        for(i=0;i<pieDataSetTmp.length;i++){
            console.log(pieDataSetTmp[i])
            //record the piedata(species and ratio)
            var pieDataTmp=pieDataSetTmp[i]["species"]
            var pieCoorTmp=[pieDataSetTmp[i]["lat"],pieDataSetTmp[i]["long"]]
            var pieNameTmp=pieDataSetTmp[i]["ID"]
            var pieTimeTmp=pieDataSetTmp[i]["time"]
            //console.log(pieDataTmp)
            //console.log(pieCoorTmp)
            //preparing the popup content
            var htmlStringForPopup = `<table><tr><td><u>${pieNameTmp}</u></td><td><u>` + pieTimeTmp + "</u></td></tr>";
            var j=0
            pieDataTmp.forEach(function(item) {
                if (j<20){
                    htmlStringForPopup += '<tr><td>' + item["name"] + '</td><td>' + item["value"].toFixed(2) + '</td></tr>';
                }
                j += 1
            });
            var customIcon = drawPieIcontest(radiusTest, pieDataTmp,1)
            //add pie chart
            var markersTest = L.marker([pieCoorTmp[0],pieCoorTmp[1]], { icon: customIcon }).addTo(mapTest);
            var markersTest2 = L.marker([pieCoorTmp[0],pieCoorTmp[1]+360], { icon: customIcon }).addTo(mapTest);
            markersTest.bindPopup(htmlStringForPopup)
            markersTest2.bindPopup(htmlStringForPopup)
        }



}
//markersTest.on('clustermouseover', function (e) { drawClusterPopup(e) }); 



function drawPieIcontest(radius, pieInputList,sampleNo){
    //create an custom icon with empty svg
    //console.log(pieInputList)

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


  

function selectColortest(d) {
  var color = d3.scaleLinear()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
    .range(["#ffffff", "#d9d9d9", "#ffde80", "#92d050", "#c7d0b0", "#c39143", "#ff99ff", "#ea8c8c", "#83d3ff"]);
  return color(fishClassifyDataObj[d.data.name]);
}
