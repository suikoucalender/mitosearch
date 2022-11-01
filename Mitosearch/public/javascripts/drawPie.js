//地図を描画するDOM要素を選択し、デフォルトの緯度経度、縮尺を設定。
var map = L.map("map").setView([latitude, longitude], ratio);

//地図データの取得元とZoom範囲を設定する。
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(map);

//円グラフを一時的に描画するための領域を取得(実際には表示されない)
var tmp = d3.select("#tmp");

//MarkerClusterGroupオブジェクトを作成。グラフのアイコンはdefineClusterIcon関数で描画する
var markers = L.markerClusterGroup({ iconCreateFunction: defineClusterIcon });

var radius = 25;

//pieチャートデータセット用関数の設定
var pie = d3.pie()
    .value(function (d) { return d.value; })
    .sort(null);

sampleDataSet.forEach(sampleData => {
    //各サンプルの円グラフが描画されたマーカーアイコンを取得
    var myIcon = drawPieIcon(radius, sampleData);

    var marker1 = L.marker([sampleData.latitude, sampleData.longitude], { icon: myIcon });
    //marker1だけだと地図左側のアメリカ大陸にマーカーがマッピングされてしまうので、日本より右側に見えるアメリカ大陸にもマーカーをマッピングする処理
    var marker2 = L.marker([sampleData.latitude, sampleData.longitude + 360], { icon: myIcon }); 

    //popup表示を作成するために円グラフを描画用データ
    var pieInputList = createPieInput(sampleData);

    //popup表示で使用するHTMLを作成
    var popupContent = "<table><tr><td><u>sample</u></td><td><a target='_blank' href='https://www.ncbi.nlm.nih.gov/sra/?term=" + sampleData.sample + "'><u>" + sampleData.sample + "</u></a></td></tr><tr><td><u>date</u></td><td><u>" + sampleData.date + "</u></td></tr>";
    pieInputList.forEach(fishData => {
        popupContent = popupContent + "<tr><td>" + fishData.name + "</td><td>" + fishData.value.toFixed(2) + "</td></tr>";
    })
    popupContent = popupContent + "</table>"

    //tooltipオブジェクトを作成し、マーカーにバインド
    marker1.bindTooltip(popupContent, { direction: 'bottom' }).openTooltip();
    marker2.bindTooltip(popupContent, { direction: 'bottom' }).openTooltip();

    //popupオブジェクトを作成し、マーカにバインド
    var popup = L.popup().setContent(popupContent);
    marker1.bindPopup(popup);
    marker2.bindPopup(popup);

    //マーカーをMarkerClusterGroupオブジェクトレイヤーに追加する
    markers.addLayer(marker1);
    markers.addLayer(marker2);

});

markers.on('clustermouseover', function (e) { drawClusterPopup(e) }); 

//MarkerClusterGroupオブジェクトレイヤーをマップオブジェクトレイヤーに追加する
map.addLayer(markers);

redrawPolygon();

//半径の情報とサンプルのデータを引数として、円グラフを描画するSVG要素を記述し、Leafletのマーカーアイコンとして返値する関数。
function drawPieIcon(radius, sampleData) {
    //グラフ描画用のデータに変換
    var pieInputList = createPieInput(sampleData);

    //円弧を描画する
    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius / 3);

    //pieチャートSVG要素の設定
    tmp.append("svg").attr("transform", "translate(" + (-1 * radius) + "," + (-1 * radius) + ")").attr("height", 2 * radius).attr("width", 2 * radius)
        .append("g").attr("transform", "translate(" + radius + "," + radius + ")")
        .selectAll(".pie")
        .data(pie(pieInputList))
        .enter()
        .append("g")
        .attr("class", "pie")
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d) { return selectColor(d) })
        .attr("opacity", 0.9) //透過を指定するプロパティ
        .attr("stroke", "white"); //アウトラインの色を指定するプロパティ

    //マーカ用のdivIconを作成する。
    var myIcon = L.divIcon({ html: tmp.html(), className: 'marker-cluster' });

    //一時描画領域に描画したSVG要素を削除
    tmp.select("svg").remove();

    return myIcon;
}

function selectColor(d) {
    var color = d3.scaleLinear()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
        .range(["#ffffff", "#d9d9d9", "#ffde80", "#92d050", "#c7d0b0", "#c39143", "#ff99ff", "#ea8c8c", "#83d3ff"]);
    return color(fishClassifyDataObj[d.data.name]);
}

//各サンプルのデータを引数と渡すことでグラフ描画用のデータに変換する関数
function createPieInput(sampleData) {
    var fishData = sampleData["fish"];
    var fishNameList = Object.keys(fishData);
    var pieInputList = [];
    fishNameList.forEach(fishName => {
        var pieInput = { name: fishName, value: fishData[fishName] };
        pieInputList.push(pieInput);
    });

    return pieInputList;
}

//markerClusterGroup用のアイコンの作成
function defineClusterIcon(cluster) {
    let { iconRadius, clusterData } = calc_clusterComp(cluster)

    //クラスター内の魚種組成の円グラフが描画されたマーカーアイコンを取得
    var myClusterIcon = drawPieIcon(iconRadius, clusterData);

    return myClusterIcon;
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

function calc_clusterComp(cluster) {
    //クラスターの子要素を取得
    var children = cluster.getAllChildMarkers();

    //アイコンの半径を算出
    var iconRadius = radius + 0.05 * children.length;

    //クラスター内の魚種組成を集計(データは各サンプルのpopupから取得している)
    var clusterData = { fish: {} };
    var total = 0;

    children.forEach(child => {
        var sampleData = child._tooltip._content;
        sampleData = sampleData.split("</tr>");
        for (var i = 2; i < sampleData.length - 1; i++) {
            var fishData = sampleData[i].split("</td><td>");
            var fishName = fishData[0].replace("<tr><td>", "");
            var fishStock = parseFloat(fishData[1].replace("</td>", ""));
            if (fishName in clusterData.fish) {
                clusterData.fish[fishName] += parseFloat(fishStock);
            } else {
                clusterData.fish[fishName] = parseFloat(fishStock);
            }
            total += parseFloat(fishStock);
        }
    })

    //組成をTotal100になるように調整
    var magnification = 100 / total;

    Object.keys(clusterData.fish).forEach(fishName => {
        clusterData.fish[fishName] = clusterData.fish[fishName] * magnification;
    });

    return { iconRadius: iconRadius, clusterData: clusterData };
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

function redrawPolygon(){
    if(polygoncheker=="exist"){
        var geoJsonLayer = L.geoJSON(polygonCoordinate).addTo(map);
        geoJsonLayer.eachLayer(function (layer) {
          layer._path.id = 'polygonlayer';
        });
        polygoncheker="exist"
    }
}