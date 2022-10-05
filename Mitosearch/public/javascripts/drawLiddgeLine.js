var isMove = false;
//window.onload = getCapturedSampleList;
getCapturedSampleList();
map.on("mouseup", removeMoveFlagAndDraw);
map.on("mousedown", setMoveFlag);
map.on("move", getCapturedSampleList);
//document.querySelector('#map').onwheel = getCapturedSampleList;

function setMoveFlag(){isMove = true}
function removeMoveFlagAndDraw(){
    if(isMove){
        isMove = false;
        getCapturedSampleList();
    }
}
//キャプチャエリア内のサンプルの組成を取得
function getCapturedSampleList() {
    if(isMove){return}
    var pos = map.getCenter();
    var zoom = map.getZoom();
    console.log(pos.lat);
    console.log(zoom);
    var coordination="?taxo="+taxo+"&lat="+pos.lat+"&long="+pos.lng+"&ratio="+zoom
    history.replaceState(null,"",coordination)
    //マップの移動・拡大・縮小時に4隅の緯度経度を取得
    var bounds = map.getBounds();
    var north = bounds._northEast.lat;
    var south = bounds._southWest.lat;
    var east = bounds._northEast.lng;
    var west = bounds._southWest.lng;

    //キャプチャエリア内のサンプル情報を取得
    let capturedSampleList = [];

    sampleDataSet.forEach(sampleData => {
        if (south < sampleData.latitude && sampleData.latitude < north) {
            //日本の左右のアメリカ大陸両方にマーカーを表示するため、重複してマーカーを描画していることに注意
            if ((west < sampleData.longitude && sampleData.longitude < east) || (west < sampleData.longitude + 360 && sampleData.longitude + 360 < east)) {
                capturedSampleList.push(sampleData);
            }
        }
    })

    drawLiddgeLine(capturedSampleList);
}

function drawLiddgeLine(capturedSampleList) {
    var dateList = [];
    var fishList = [];
    var densityList = [];
    let timemode = "monthly";
    var alltimeBtn = document.getElementById("alltime");
    var alltimeBtnStyle = alltimeBtn.style;
    var alltimeBtnStyleDisplay = alltimeBtnStyle.getPropertyValue('display');
    let timelineData = {};
    let numDataInDay = {};
    let numtimelineData = {};

    console.log(alltimeBtnStyleDisplay);
    if(alltimeBtnStyleDisplay === "none"){timemode = "alltime"}

    //svgタグを追加し、幅と高さを設定
    var graph = d3.select("#graph");
    var bargraph = d3.select("#bargraph")

    //サンプルが存在しないときは、グラフを描画しない
    if (capturedSampleList.length == 0) {
        //svgタグを削除
        graph.select("svg").remove();
        bargraph.select("svg").remove();
        return;
    }


    //魚種リストと日付のリストを取得
    capturedSampleList.forEach(sampleData => {
        if (isInvalidDate(sampleData.date)) {
            return;
        }
        let tempdate = sampleData.date;
        if(timemode === "monthly"){
            tempdate="2017-"+tempdate.substring(5,7)+"-01";
        }
        dateList.push(tempdate);
        fishList = fishList.concat(Object.keys(sampleData.fish));

        if(!(tempdate in numDataInDay)){
            numDataInDay[tempdate]=1;
        }else{
            numDataInDay[tempdate]++;
        }
        Object.keys(sampleData.fish).forEach(sampleFish => {
            if(!(sampleFish in timelineData)){
                timelineData[sampleFish]={};
                numtimelineData[sampleFish]={};
            }
            if(!(tempdate in timelineData[sampleFish])){
                timelineData[sampleFish][tempdate]=sampleData.fish[sampleFish];
                numtimelineData[sampleFish][tempdate]=1;
            }else{
                timelineData[sampleFish][tempdate]+=sampleData.fish[sampleFish];
                numtimelineData[sampleFish][tempdate]++;
            }
        });
    });

    var numDataInDaymax = 0;
    let numDataInDayList = [];

    for(var key in numDataInDay){
        numDataInDaymax = Math.max(numDataInDaymax, numDataInDay[key]);
        numDataInDayList.push({"date": new Date(key), "value": numDataInDay[key]});
    }
    //console.log(numDataInDay);
    //console.log(numDataInDaymax);
    //console.log(numDataInDayList);
    //console.log(timelineData);
    //console.log(numtimelineData);


    if (dateList.length == 0) {
        //svgタグを削除
        graph.select("svg").remove();
        bargraph.select("svg").remove();
        return;
    }

    //日付リストの要素を積集合をとる。
    dateList = Array.from(new Set(dateList));

    //魚種リストの積集合をとる。
    fishList = Array.from(new Set(fishList));

    //日付の昇順にソートする
    dateList.sort(function (a, b) {
        return (a > b ? 1 : -1);
    });

    //リスト内の最大・最小の日付を取得
    var minDate = new Date(dateList[0]);
    var maxDate = new Date(dateList[dateList.length - 1]);

    //x軸の端点の日付を取得
    var scaleMax = new Date("2017-12-31");
    var scaleMin = new Date("2016-12-01");

    if (timemode == "alltime") {
        scaleMax = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
        scaleMin = new Date(minDate.setMonth(minDate.getMonth() - 1));
    }

    //魚種ごとのデータ作成高速化版
    let fastdensityList = [];
    fishList.forEach(fishName => {
        let fastdensityData = { fish: fishName, density: [] };
        let fastmax = 0;
        fastdensityData.density.push([scaleMin, 0]);
        dateList.forEach(date => {
            if(date in timelineData[fishName]){
                let tempVal = timelineData[fishName][date]/numDataInDay[date];
                if(tempVal > fastmax){fastmax=tempVal};
                fastdensityData.density.push([new Date(date), tempVal]);
            }else{
                fastdensityData.density.push([new Date(date), 0]);
            }
        });
        fastdensityData.density.push([scaleMax, 0]);

        //データの最大値が40になるように調整
        fastdensityData.density = fastdensityData.density.map(data => { return [data[0], data[1] * (40 / fastmax)] })
        //組成の最大値の情報を格納
        fastdensityData["max"] = fastmax;

        fastdensityList.push(fastdensityData);
    });
    //console.log(fastdensityList);


    //グラフ描画用リストをMaxでソート
    densityList = object_array_sort(fastdensityList, "max");

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
        barmargin = { top: 10, right: mapLeft, bottom: margin.bottom, left: margin.left},
        barheight = 100,
        barwidth = width / 20;

    if(timemode == "alltime")
        barwidth = width / 300;

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
    else{
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
        .call(d3.axisLeft(fishScale));



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
        .attr("fill", function (d) { return "rgb(255,255," + ((100 - d.max) * 2) + ")" })
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
    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); },
    formatTick = function(d) { return 10 + formatPower(Math.round(Math.log(d) / Math.LN10)); };

    var baryScale = d3.scaleLog()
        .domain([numDataInDaymax, 0.90000000001])
        .range([0, barheight]);
    
    //バーの表示
    svgbar.append("g")
            .selectAll("rect")
            .data(numDataInDayList)
            .enter()
            .append("rect")
            .attr("x", function(d){return barxScale(d.date) - barwidth/2;})
            .attr("y", function(d){return baryScale(d.value);})
            .attr("width", barwidth)
            .attr("height", function(d){return barheight - baryScale(d.value);})
            .attr("fill", "steelBlue");

    //x軸を追加する
    if (timemode == "monthly") {
        svgbar.append("g")
                .attr("transform", "translate(0," + barheight + ")")
                .call(
                   d3.axisTop(barxScale)
                       .tickFormat(d3.timeFormat("%B"))
                    )
    }
    else{
        svgbar.append("g")
                .attr("transform", "translate(0," + barheight + ")")
                .call(
                    d3.axisTop(barxScale)
                        .tickFormat(d3.timeFormat("%y/%m"))
                    )
    }

    //y軸を追加する
    svgbar.append("g")
        .attr("transform", "translate(0, 0)")
        .call(d3.axisLeft(baryScale).ticks(10,0));
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
    else{
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
var num_a = -1;
var num_b = 1;

if (order === 'asc') {//指定があれば昇順(ASC)
    num_a = 1;
    num_b = -1;
}

data = data.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    if (x > y) return num_a;
    if (x < y) return num_b;
    return 0;
});

return data; // ソート後の配列を返す
}

function isInvalidDate(date) {
return Number.isNaN(new Date(date).getTime());
}
