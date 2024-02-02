//地図を描画するDOM要素を選択し、デフォルトの緯度経度、縮尺を設定。
let mapTest = L.map("mapTest").setView([latitude, longitude], ratio);

//地図データの取得元とZoom範囲を設定する。
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(mapTest);
let tmptest = d3.select("#tmptemp")
//this array is the map zoom level and blocksize  //🌟8开始用markers？
let ratioAndBlock={"2":45,"3":30,"4":15,"5":5,"6":3,"7":2,"8":1,"9":0.5,"10":0.2,"11":0.1,"12":0.05,"13":0.05,"14":0.02,"15":0.02,"16":0.02,"17":0.0001,"18":"special"}
let blockSize=ratioAndBlock[ratio]
blockSize="special"


//円グラフを一時的に描画するための領域を取得(実際には表示されない)
var tmp = d3.select("#tmp");

var radius = 25;

//pieチャートデータセット用関数の設定
var pie = d3.pie()
    .value(function (d) { return d.value; })
    .sort(null);


