//window.onload = getCapturedSampleList;
getCapturedSampleList();
map.on("move", getCapturedSampleList);

//キャプチャエリア内のサンプルの組成を取得
function getCapturedSampleList() {
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
    var clickchecker = [];
    var alltimeBtn = document.getElementById("alltime");
    var alltimeBtnStyle = alltimeBtn.style;
    var alltimeBtnStyleDisplay = alltimeBtnStyle.getPropertyValue('display');

    console.log(alltimeBtnStyleDisplay);
    clickchecker = "alltime";
    if (alltimeBtnStyleDisplay == "block"){
        clickchecker = "alltime";
    }else if (alltimeBtnStyleDisplay == "none") {
        clickchecker = "monthly";
    }

    //svgタグを追加し、幅と高さを設定
    var graph = d3.select("#graph");

    //サンプルが存在しないときは、グラフを描画しない
    if (capturedSampleList.length == 0) {
        //svgタグを削除
        graph.select("svg").remove();
        return;
    }

    //魚種リストと日付のリストを取得
    capturedSampleList.forEach(sampleData => {
        if (isInvalidDate(sampleData.date)) {
            return;
        }
        dateList.push(sampleData.date);
        fishList = fishList.concat(Object.keys(sampleData.fish));
    });

    if (dateList.length == 0) {
        //svgタグを削除
        graph.select("svg").remove();
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

    if (clickchecker == "monthly") {
        scaleMax = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
        scaleMin = new Date(minDate.setMonth(minDate.getMonth() - 1));
    }

    //魚種ごとにデータを作成
    fishList.forEach(fishName => {
        //組成データのリストを作成
        var compList = [];

        //魚種ごとのオブジェクトを作成
        var undef = [null, null];
        var densityOfMonth = [undef, undef, undef, undef, undef, undef, undef, undef, undef, undef, undef, undef];
        var densityData = { fish: fishName, density: [] };

        //グラフの左側端点のデータを追加
        densityData.density.push([scaleMin, 0]);

        console.log(clickchecker);
        //月ごとor日付ごとにデータを作成
        if (clickchecker == "alltime") {
            dateList.forEach(date => {
                var i = 0;
                var date2 = new Date(date);
                var date2month = date2.getMonth() + 1;
                var date2monthstr = String(date2month);
                if (date2monthstr.length == 1)
                    date2monthstr = "0" + date2monthstr;

                var newdate = "2017-" + String(date2.getMonth() + 1) + "-01";
                var newdate2 = new Date(newdate);
                var densityOfDate = [newdate2, 0];

                capturedSampleList.forEach(sampleData => {
                    if (date2monthstr == sampleData.date.substr(5, 2)) {
                        i++;
                        if (fishName in sampleData.fish) {
                            densityOfDate[1] += sampleData.fish[fishName];
                        }
                    }
                })
                densityOfDate[1] = densityOfDate[1] / i;
                compList.push(densityOfDate[1]);
                densityOfMonth[date2month] = densityOfDate;
            })

            var deleteindex = [];
            for (var i = 0; i < densityOfMonth.length; i++) {
                if (densityOfMonth[i][0] == null)
                    deleteindex.push(i);
            }
            for (var i = deleteindex.length - 1; i >= 0; i--) {
                densityOfMonth.splice(deleteindex[i], 1);
            }

            densityData = { fish: fishName, density: densityOfMonth };

            //グラフの両側端点のデータを作成
            densityData.density.unshift([new Date("2016-12-01"), 0]);
            densityData.density.push([new Date("2018-01-01"), 0]);
        }
        else if (clickchecker == "monthly") {
            dateList.forEach(date => {
                var i = 0;
                var densityOfDate = [new Date(date), 0];
                capturedSampleList.forEach(sampleData => {
                    if (date == sampleData.date) {
                        i++;
                        if (fishName in sampleData.fish) {
                            densityOfDate[1] += sampleData.fish[fishName];
                        }
                    }
                })
                densityOfDate[1] = densityOfDate[1] / i;
                compList.push(densityOfDate[1]);
                densityData.density.push(densityOfDate);
            })
            densityData.density.push([scaleMax, 0]);
        }


        //組成の最大値を取得
        var maxComp = Math.max.apply(null, compList);

        //データの最大値が40になるように調整
        densityData.density = densityData.density.map(data => { return [data[0], data[1] * (40 / maxComp)] })

        //組成の最大値の情報を格納
        densityData["max"] = maxComp;

        //データを追加
        densityList.push(densityData);
    });

    //グラフ描画用リストをMaxでソート
    densityList = object_array_sort(densityList, "max");

    //魚種リストをソート
    fishList = densityList.map(densityData => {
        return densityData.fish;
    });

    //グラフ全体のサイズとマージンを設定
    var margin = { top: 100, right: 10, bottom: 30, left: 250 },
        width = 1000 - margin.left - margin.right,
        height = 40 * fishList.length;

    //svgタグを削除
    graph.select("svg").remove();

    var svg = graph.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //x軸のスケールを作成
    var xScale = d3.scaleTime()
        .domain([scaleMin,scaleMax])
        .range([0, width]);

    //x軸を追加する
    if (clickchecker == "alltime") {
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

    drawScale()

    window.addEventListener("scroll", function () {
        drawScale();
    })

    window.addEventListener("onresize", function () {
        drawScale();
    })

    function drawScale() {
        //x軸を追加する
        d3.select(".xaxis").remove();

        if (clickchecker == "alltime") {
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
