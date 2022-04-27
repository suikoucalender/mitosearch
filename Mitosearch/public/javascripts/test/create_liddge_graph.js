function draw_gragh(response){
    var fishcomp = response;

    var dateList = [];
    var fishList = [];
    var densityList = [];

    //魚種リストと日付のリストを取得
    fishcomp.forEach(data => {
        dateList.push(data.date);
        fishList = fishList.concat(Object.keys(data.fish));
    });

    //日付リストの要素を積集合をとる。
    dateList = Array.from(new Set(dateList));

    //魚種リストの積集合をとる。
    fishList = Array.from(new Set(fishList));

    //日付の昇順にソートする
    dateList.sort(function(a,b){
        return (a > b ? 1 : -1);
    });

    //リスト内の最大・最小の日付を取得
    var minDate = new Date(dateList[0]);
    var maxDate = new Date(dateList[dateList.length - 1]);

    //x軸の端点の日付を取得
    var scaleMax = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
    var scaleMin = new Date(minDate.setMonth(minDate.getMonth() - 1));

    //魚種ごとにデータを作成
    fishList.forEach(fishName => {
        //組成データのリストを作成
        var compList = [];

        //魚種ごとのオブジェクトを作成
        var densityData = {fish: fishName, density: []};

        //グラフの左側端点のデータを追加
        densityData.density.push([scaleMin,0]);

        //日付ごとにデータを作成
        dateList.forEach(date => {
            var i = 0;
            var densityOfDate = [new Date(date), 0];
            fishcomp.forEach(sample => {
                if (date == sample.date) {
                    i++;
                    if (fishName in sample.fish) {
                        densityOfDate[1] += sample.fish[fishName];
                    } 
                }
            })
            densityOfDate[1] = densityOfDate[1] / i;
            compList.push(densityOfDate[1]);
            densityData.density.push(densityOfDate);
        })

        //グラフの右側端点のデータを作成
        densityData.density.push([scaleMax,0]);

        //組成の最大値を取得
        var maxComp = Math.max.apply(null,compList);

        //データの最大値が50になるように調整
        densityData.density = densityData.density.map(data => {return [data[0], data[1] * (40 / maxComp)]})

        //組成の最大値の情報を格納
        densityData["max"] = maxComp;

        //データを追加
        densityList.push(densityData);
    });

    //グラフ描画用リストをMaxでソート
    densityList = object_array_sort(densityList, "max");
    console.log(densityList);

    //魚種リストをソート
    fishList = densityList.map(densityData => {
        return densityData.fish;
    });

    //グラフサイズとマージンを設定
    var margin = { top: 100, right: 10, bottom: 30, left: 200 },
        width = 1000 - margin.left - margin.right,
        height = (40 * fishList.length) - margin.top - margin.bottom;

    console.log(width)

    //svgタグを削除
    d3.select("svg").remove();

    //svgタグを追加し、幅と高さを設定
    var svg = d3.select("#graph_area").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //x軸のスケールを作成
    var xScale = d3.scaleTime()
        .domain([scaleMin,scaleMax])
        .range([0, width]);

    //x軸を追加する
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(
            d3.axisTop(xScale)
            .tickFormat(d3.timeFormat("%y/%m"))
        )

    //y軸のスケールを作成する
    var fishScale = d3.scaleBand()
        .domain(fishList)
        .range([0, height]);

    //y軸を追加する
    svg.append("g")
        .attr("transform", "translate(0, 0)")
        .call(d3.axisLeft(fishScale));

    //半メモリ分の長さを取得
    var betweenlen = fishScale(fishList[1]) / 2;

    //Riddgeグラフを作成する
    svg.selectAll("area")
        .data(densityList)
        .enter()
        .append("path")
            .attr("transform", function(d) { return ("translate(0," + (fishScale(d.fish) + betweenlen) + ")")}) 
            .attr("fill", function(d) { return "rgb(255,255," + ((100 - d.max) * 2) + ")" } )
            .datum(function(d){return d.density})
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                //.curve(d3.curveBasis)
                .curve(d3.curveMonotoneX)
                .x(function(d) {return xScale(d[0]);})
                .y(function(d) {return (- d[1]) ;})
            )

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