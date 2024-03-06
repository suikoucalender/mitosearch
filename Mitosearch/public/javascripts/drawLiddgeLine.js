let graphData = {} //{blockSize: {y_x: }} リッジグラフ用のデータをダウンロードした結果の保存場所
var isMove = false

var dateRangeCheker = false;
var upperHandleStamp = timestamp(upperHandle);
var lowerHandleStamp = timestamp(lowerHandle);
//if(upperHandle===lowerHandle){
//    upperHandle=upperHandle+100;
//    sliderLoadChecker=false;
//}
var upperHandleForRange = new Date(upperHandleStamp);
var lowerHandleForRange = new Date(lowerHandleStamp);

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
        // //サンプルが存在しないときは、グラフを描画しない
        // if (capturedSampleList.length == 0) {
        //     //svgタグを削除
        //     graph.select("svg").remove();
        //     bargraph.select("svg").remove();
        //     sliderArea.style.display = "none";
        //     lowerHandleNumber.style.display = "none";
        //     upperHandleNumber.style.display = "none";
        //     graphName.style.display = "none";
        //     graphChecker = "nonexist"
        //     return;
        // }


        // //魚種リストと日付のリストを取得
        // var counter = 0
        // capturedSampleList.forEach(sampleData => {
        //     var sampleDate = sampleData.date
        //     //console.log("readed-----------"+sampleDate)
        //     if (sampleData.date.indexOf("T") !== -1) {
        //         sampleData.data = sampleData.date.toString()
        //         var datetransformed = timeTransformer(sampleData.data)
        //         sampleDate = datetransformed
        //         sampleDate = Date.parse(sampleDate)
        //         sampleDate = new Date(sampleDate)
        //         var tempYear = sampleDate.getFullYear()
        //         var tempMonth = sampleDate.getMonth() + 1
        //         var tempDay = sampleDate.getDate()
        //         //console.log("readed month-----------"+tempMonth)
        //         if (tempMonth.toString().length === 1) {
        //             tempMonth = "0" + tempMonth
        //         }
        //         if (tempDay.toString().length === 1) {
        //             tempDay = "0" + tempDay
        //         }
        //         //console.log("changed month-----------"+tempMonth)

        //         sampleDate = tempYear + "-" + tempMonth + "-" + tempDay
        //     }
        //     //console.log("changed-----------"+sampleDate)
        //     if (isInvalidDate(sampleDate)) {
        //         return;
        //     }

        //     let tempdate = sampleDate;
        //     let tempdateTrans = new Date(tempdate);
        //     //console.log("tempdate----------------"+tempdate)
        //     //console.log("tempdateTrans----------------"+tempdateTrans)//Time with time zones cannot be converted

        //     //console.log(lowerHandleForRange)
        //     //console.log(upperHandleForRange)
        //     //Determine if the sample is within the date range
        //     if (tempdateTrans >= lowerHandleForRange && tempdateTrans <= upperHandleForRange) {
        //         dateRangeCheker = true
        //         //dateListAlltimeChangeable=true
        //     }
        //     //console.log(dateRangeCheker)

        //     if (dateRangeCheker == true) {
        //         //console.log("!!!!!!"+tempdate)

        //         if (timemode === "monthly") {
        //             tempdate = "2017-" + tempdate.substring(5, 7) + "-01";
        //         }
        //         //console.log("push content------"+tempdate)
        //         dateList.push(tempdate)
        //         //console.log(dateList)
        //         //fishList = fishList.concat(Object.keys(sampleData.fish));
        //         //console.log(fishList)
        //         if (!(tempdate in numDataInDay)) {
        //             numDataInDay[tempdate] = 1;
        //         } else {
        //             numDataInDay[tempdate]++;
        //         }
        //         Object.keys(sampleData.fish).forEach(sampleFish => {
        //             if (!(sampleFish in timelineData)) {
        //                 timelineData[sampleFish] = {};
        //                 numtimelineData[sampleFish] = {};
        //             }
        //             if (!(tempdate in timelineData[sampleFish])) {
        //                 timelineData[sampleFish][tempdate] = sampleData.fish[sampleFish];
        //                 numtimelineData[sampleFish][tempdate] = 1;
        //             } else {
        //                 timelineData[sampleFish][tempdate] += sampleData.fish[sampleFish];
        //                 numtimelineData[sampleFish][tempdate]++;
        //             }
        //         });
        //     }
        //     dateRangeCheker = false
        // });

        // var numDataInDaymax = 0;
        // let numDataInDayList = [];


        // for (var key in numDataInDay) {
        //     numDataInDaymax = Math.max(numDataInDaymax, numDataInDay[key]);
        //     numDataInDayList.push({ "date": new Date(key), "value": numDataInDay[key] });
        // }

        // //console.log(dateList)
        // if (dateList.length == 0) {
        //     //svgタグを削除
        //     graph.select("svg").remove();
        //     bargraph.select("svg").remove();
        //     return;
        // }

        // //日付リストの要素を積集合をとる。
        // dateList = Array.from(new Set(dateList));

        // //魚種リストの積集合をとる。
        // fishList = Array.from(new Set(fishArray));

        // //日付の昇順にソートする
        // dateList.sort(function (a, b) {
        //     return (a > b ? 1 : -1);
        // });


        // //リスト内の最大・最小の日付を取得
        // var minDate = new Date(dateList[0]);
        // var maxDate = new Date(dateList[dateList.length - 1]);

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

function drawLiddgeLineChangeable(capturedSampleList) {
    var dateList = [];
    var dateListAlltime = [];
    var fishList = [];
    var densityList = [];
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
    //サンプルが存在しないときは、グラフを描画しない
    if (capturedSampleList.length == 0) {
        //svgタグを削除
        graph.select("svg").remove();
        bargraph.select("svg").remove();
        sliderArea.style.display = "none";
        lowerHandleNumber.style.display = "none";
        upperHandleNumber.style.display = "none";
        graphName.style.display = "none";
        graphChecker = "nonexist"
        return;
    }


    //魚種リストと日付のリストを取得
    var counter = 0
    capturedSampleList.forEach(sampleData => {
        var sampleDate = sampleData.date
        //console.log("readed-----------"+sampleDate)
        if (sampleData.date.indexOf("T") !== -1) {
            sampleData.data = sampleData.date.toString()
            var datetransformed = timeTransformer(sampleData.data)
            sampleDate = datetransformed
            sampleDate = Date.parse(sampleDate)
            sampleDate = new Date(sampleDate)
            var tempYear = sampleDate.getFullYear()
            var tempMonth = sampleDate.getMonth() + 1
            var tempDay = sampleDate.getDate()
            //console.log("readed month-----------"+tempMonth)
            if (tempMonth.toString().length === 1) {
                tempMonth = "0" + tempMonth
            }
            if (tempDay.toString().length === 1) {
                tempDay = "0" + tempDay
            }
            //console.log("changed month-----------"+tempMonth)

            sampleDate = tempYear + "-" + tempMonth + "-" + tempDay
        }
        //console.log("changed-----------"+sampleDate)
        if (isInvalidDate(sampleDate)) {
            return;
        }

        let tempdate = sampleDate;
        let tempdateTrans = new Date(tempdate);
        //console.log("tempdate----------------"+tempdate)
        //console.log("tempdateTrans----------------"+tempdateTrans)//Time with time zones cannot be converted

        //console.log(lowerHandleForRange)
        //console.log(upperHandleForRange)
        //Determine if the sample is within the date range
        if (tempdateTrans >= lowerHandleForRange && tempdateTrans <= upperHandleForRange) {
            dateRangeCheker = true
            //dateListAlltimeChangeable=true
        }
        //console.log(dateRangeCheker)

        if (dateRangeCheker == true) {
            //console.log("!!!!!!"+tempdate)

            if (timemode === "monthly") {
                tempdate = "2017-" + tempdate.substring(5, 7) + "-01";
            }
            //console.log("push content------"+tempdate)
            dateList.push(tempdate)
            //console.log(dateList)
            fishList = fishList.concat(Object.keys(sampleData.fish));
            if (!(tempdate in numDataInDay)) {
                numDataInDay[tempdate] = 1;
            } else {
                numDataInDay[tempdate]++;
            }
            Object.keys(sampleData.fish).forEach(sampleFish => {
                if (!(sampleFish in timelineData)) {
                    timelineData[sampleFish] = {};
                    numtimelineData[sampleFish] = {};
                }
                if (!(tempdate in timelineData[sampleFish])) {
                    timelineData[sampleFish][tempdate] = sampleData.fish[sampleFish];
                    numtimelineData[sampleFish][tempdate] = 1;
                } else {
                    timelineData[sampleFish][tempdate] += sampleData.fish[sampleFish];
                    numtimelineData[sampleFish][tempdate]++;
                }
            });
        }
        dateRangeCheker = false
    });

    var numDataInDaymax = 0;
    let numDataInDayList = [];


    for (var key in numDataInDay) {
        numDataInDaymax = Math.max(numDataInDaymax, numDataInDay[key]);
        numDataInDayList.push({ "date": new Date(key), "value": numDataInDay[key] });
    }

    //console.log(dateList)
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

            if (date in timelineData[fishName]) {
                let tempVal = timelineData[fishName][date] / numDataInDay[date];

                if (tempVal > fastmax) { fastmax = tempVal };
                fastdensityData.density.push([new Date(date), tempVal]);
            } else {
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

    var baryScale = d3.scaleLog()
        .domain([numDataInDaymax, 0.90000000001])
        .range([0, barheight]);

    //バーの表示
    svgbar.append("g")
        .selectAll("rect")
        .data(numDataInDayList)
        .enter()
        .append("rect")
        .attr("x", function (d) { return barxScale(d.date) - barwidth / 2; })
        .attr("y", function (d) { return baryScale(d.value); })
        .attr("width", barwidth)
        .attr("height", function (d) { return barheight - baryScale(d.value); })
        .attr("fill", "#27A391");

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

    //y軸を追加する
    svgbar.append("g")
        .attr("transform", "translate(0, 0)")
        .call(d3.axisLeft(baryScale).ticks(10, 0));
    //console.log(numDataInDayList)
    numDataInDayList = []
    graphChecker = "exist"

}





function drawLiddgeLine(capturedSampleList) {
    var dateList = [];
    var fishList = [];
    var densityList = [];
    let timemode = "alltime";
    var alltimeBtn = document.getElementById("alltime");
    var alltimeBtnStyle = alltimeBtn.style;
    var alltimeBtnStyleDisplay = alltimeBtnStyle.getPropertyValue('display');
    let timelineData = {};
    let numDataInDay = {};
    let numtimelineData = {};

    //console.log(alltimeBtnStyleDisplay);
    //if(alltimeBtnStyleDisplay === "none"){timemode = "alltime"}

    //svgタグを追加し、幅と高さを設定
    var bargraphAlltime = d3.select("#bargraphAlltime")
    graphName.style.display = "block";
    //サンプルが存在しないときは、グラフを描画しない
    if (capturedSampleList.length == 0) {
        //svgタグを削除
        bargraphAlltime.select("svg").remove();
        sliderArea.style.display = "none";
        lowerHandleNumber.style.display = "none";
        upperHandleNumber.style.display = "none";
        graphName.style.display = "none";
        return;
    }


    //魚種リストと日付のリストを取得
    capturedSampleList.forEach(sampleData => {
        var sampleDate = sampleData.date
        //console.log(sampleDate)
        if (sampleData.date.indexOf("T") !== -1) {
            sampleData.data = sampleData.date.toString()
            var datetransformed = timeTransformer(sampleData.data)
            sampleDate = datetransformed
            sampleDate = Date.parse(sampleDate)
            sampleDate = new Date(sampleDate)
            var tempYear = sampleDate.getFullYear()
            var tempMonth = sampleDate.getMonth() + 1
            if (tempMonth.length = 1) {
                tempMonth = "0" + tempMonth
            }
            var tempDay = sampleDate.getDate()
            sampleDate = tempYear + "-" + tempMonth + "-" + tempDay
        }
        //console.log(sampleDate)
        if (isInvalidDate(sampleDate)) {
            return;
        }
        let tempdate = sampleDate;
        if (timemode === "monthly") {
            tempdate = "2017-" + tempdate.substring(5, 7) + "-01";
        }
        dateList.push(tempdate);
        fishList = fishList.concat(Object.keys(sampleData.fish));

        if (!(tempdate in numDataInDay)) {
            numDataInDay[tempdate] = 1;
        } else {
            numDataInDay[tempdate]++;
        }
        Object.keys(sampleData.fish).forEach(sampleFish => {
            if (!(sampleFish in timelineData)) {
                timelineData[sampleFish] = {};
                numtimelineData[sampleFish] = {};
            }
            if (!(tempdate in timelineData[sampleFish])) {
                timelineData[sampleFish][tempdate] = sampleData.fish[sampleFish];
                numtimelineData[sampleFish][tempdate] = 1;
            } else {
                timelineData[sampleFish][tempdate] += sampleData.fish[sampleFish];
                numtimelineData[sampleFish][tempdate]++;
            }
        });
    });

    var numDataInDaymax = 0;
    let numDataInDayList = [];

    for (var key in numDataInDay) {
        numDataInDaymax = Math.max(numDataInDaymax, numDataInDay[key]);
        numDataInDayList.push({ "date": new Date(key), "value": numDataInDay[key] });
    }
    //console.log(numDataInDay);
    //console.log(numDataInDaymax);
    //console.log(numDataInDayList);
    //console.log(timelineData);
    //console.log(numtimelineData);


    if (dateList.length == 0) {
        //svgタグを削除
        bargraphAlltime.select("svg").remove();
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
            if (date in timelineData[fishName]) {
                let tempVal = timelineData[fishName][date] / numDataInDay[date];
                if (tempVal > fastmax) { fastmax = tempVal };
                fastdensityData.density.push([new Date(date), tempVal]);
            } else {
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
        barmargin = { top: 10, right: mapLeft, bottom: margin.bottom, left: margin.left },
        barheight = 100,
        barwidth = width / 20;

    if (timemode == "alltime")
        barwidth = width / 300;

    //svgタグを削除
    bargraphAlltime.select("svg").remove();

    //SVG領域の設定
    var svgbar = bargraphAlltime.append("svg").attr("width", width + barmargin.left + barmargin.right).attr("height", barheight + barmargin.top + barmargin.bottom)
        .append("g").attr("transform", "translate(" + barmargin.left + "," + barmargin.top + ")");

    //x軸のスケールを作成
    var barxScale = d3.scaleTime()
        .domain([scaleMin, scaleMax])
        .range([0, width]);

    //y軸のスケールを作成
    var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
        formatPower = function (d) { return (d + "").split("").map(function (c) { return superscript[c]; }).join(""); },
        formatTick = function (d) { return 10 + formatPower(Math.round(Math.log(d) / Math.LN10)); };

    var baryScale = d3.scaleLog()
        .domain([numDataInDaymax, 0.90000000001])
        .range([0, barheight]);

    //バーの表示
    svgbar.append("g")
        .selectAll("rect")
        .data(numDataInDayList)
        .enter()
        .append("rect")
        .attr("x", function (d) { return barxScale(d.date) - barwidth / 2; })
        .attr("y", function (d) { return baryScale(d.value); })
        .attr("width", barwidth)
        .attr("height", function (d) { return barheight - baryScale(d.value); })
        .attr("fill", "#8C4522");

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

    //y軸を追加する
    svgbar.append("g")
        .attr("transform", "translate(0, 0)")
        .call(d3.axisLeft(baryScale).ticks(10, 0));
    //console.log("loaded")
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

