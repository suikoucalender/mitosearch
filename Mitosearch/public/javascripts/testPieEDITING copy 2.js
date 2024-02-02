//地図を描画するDOM要素を選択し、デフォルトの緯度経度、縮尺を設定。
let mapTest = L.map("mapTest").setView([latitude, longitude], ratio);

//地図データの取得元とZoom範囲を設定する。
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(mapTest);
let tmptest = d3.select("#tmptemp")
//when you change this one, [!!! also change the same variable in index.js]
let ratioAndBlock={"2":45,"3":30,"4":15,"5":5,"6":3,"7":2,"8":1,"9":0.5,"10":0.2,"11":0.1,"12":0.05,"13":0.05,"14":0.02,"15":0.02,"16":0.02,"17":0.02,"18":"special"}
let blockSize=ratioAndBlock[ratio]

readDataAndPlotPieChart()

function readDataAndPlotPieChart(){
if(blockSize!=="special"){
    //Avoiding the loss of decimal precision
    let expansion=1
    let expandedBlockSize=blockSize*expansion
    for(let a=0;expandedBlockSize<1;a++){
        expansion=expansion*10
        expandedBlockSize=expandedBlockSize*10
    }
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

    //get leftlong, rightlong, lowerlat, upperlat, adjust with blocksize
    let leftlong = Math.floor(southWest.lng*expansion/expandedBlockSize)*expandedBlockSize
    let rightlong = Math.ceil(northEast.lng*expansion/expandedBlockSize)*expandedBlockSize
    let lowerlat = Math.floor(southWest.lat*expansion/expandedBlockSize)*expandedBlockSize
    let upperlat = Math.ceil(northEast.lat*expansion/expandedBlockSize)*expandedBlockSize

    //decide the data reading range
    let longStartExpanded=leftlong-expandedBlockSize
    let longEndExpanded=rightlong+expandedBlockSize
    let latStartExpanded=lowerlat-expandedBlockSize
    let latEndExpanded=upperlat+expandedBlockSize

    //list up the urls
    let urlsFishAndRatio=[]
    let urlsPieCoord=[]
    let urlsOutput=[]
    let pieDataSetTrial={}
    for(x=longStartExpanded;x<=longEndExpanded;x=x+expandedBlockSize){
        let longExpanded=x
        if(longExpanded>180*expansion){
            longExpanded=longExpanded-360
        }
        if(longExpanded<-180*expansion){
            longExpanded=longExpanded+360
        }
        let long=longExpanded/expansion
        for(y=latStartExpanded;y<=latEndExpanded;y=y+expandedBlockSize){
            let latExpanded=y
            let lat=latExpanded/expansion
            let folderPath = `layered_data/${language}/${blockSize}/${lat}/${long}`;
            let speciesPath = `${folderPath}/fishAndRatio.json`;
            let coordPath = `${folderPath}/pieCoord.json`;
            let outputPath = `${folderPath}/output.json`
            urlsFishAndRatio.push(speciesPath)
            urlsPieCoord.push(coordPath)
            urlsOutput.push(outputPath)
        }
    }

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
        .then(data => {
            pieCoorTmp = data;
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
                    //2pie chart
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

                    let customIcon = drawPieIcontest(radiusTest, pieDataTmp, pieCoorTmp[2])
                    //add pie chart//can not get data
                    let markersTest = L.marker([pieCoorTmp[0],pieCoorTmp[1]], { icon: customIcon }).addTo(mapTest);
                    let markersTest2 = L.marker([pieCoorTmp[0],pieCoorTmp[1]+360], { icon: customIcon }).addTo(mapTest);
                    markersTest.bindPopup(htmlStringForPopup)
                    markersTest2.bindPopup(htmlStringForPopup)
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
    let leftlong = Math.floor(southWest.lng)
    let lowerlat = Math.floor(southWest.lat)
    let folderPath = `layered_data/${language}/${blockSize}/${lowerlat}/${leftlong}`
    let urlFileIndex = `${folderPath}/fileList.json`
    console.log(urlFileIndex)
    fetch(urlFileIndex)
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
        })
        .then(data => {
            let fileIndex = data["files"]
            //console.log(fileIndex);
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
                        var markersTest = L.marker([pieCoord[0],pieCoord[1]], { icon: customIcon }).addTo(mapTest);
                        var markersTest2 = L.marker([pieCoord[0],pieCoord[1]+360], { icon: customIcon }).addTo(mapTest);
                        markersTest.bindPopup(htmlStringForPopup)
                        markersTest2.bindPopup(htmlStringForPopup)
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

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
    
    
      
    
function selectColortest(d) {
    var color = d3.scaleLinear()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
    .range(["#ffffff", "#d9d9d9", "#ffde80", "#92d050", "#c7d0b0", "#c39143", "#ff99ff", "#ea8c8c", "#83d3ff"]);
    return color(fishClassifyDataObj[d.data.name]);
}
    
      


