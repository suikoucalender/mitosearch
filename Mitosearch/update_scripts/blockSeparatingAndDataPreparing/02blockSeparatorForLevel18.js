const { addAbortListener } = require('events');
//const Decimal = require('./decimal.js');
const BigNumber = require('../../public/bignumber.js/bignumber.js');
BigNumber.config({
    DECIMAL_PLACES: 50,                // 小数部50桁
    ROUNDING_MODE: BigNumber.ROUND_HALF_UP // 四捨五入
});

const args = process.argv.slice(2)
const fs = require('fs');
const path = require('path');

const language = args[0] //ja, en, zh
const ratio = 18 //parseInt(args[1]) //2-18

//mitosearchフォルダの中のパスを指定している
const locationPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "data" + path.sep + "fish" + path.sep + "lat-long-date.txt" //args[0]; //lat-long-date.txt
const waterPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "data" + path.sep + "fish" + path.sep + "mapwater.result.txt" //args[1]; //mapwater.result.txt
const imputFolderPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "db_fish_" + language //args[2]; //db_fish_[language]
const inputFileLocation = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "data" + path.sep + "fish" + path.sep + "input_file_path.txt"
const inputFileNum = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "data" + path.sep + "fish" + path.sep + "sample-num.txt"
//let blockSize = new Decimal(args[3]); //ratioAndBlock={"2":45,"3":30,"4":15,"5":5,"6":3,"7":2,"8":1,"9":0.5,"10":0.2,"11":0.1,"12":0.05,"13":0.05,"14":0.02,"15":0.02,"16":0.02,"17":0.01,"18":"special"}
const lang = language //imputFolderPath.slice(-2); //最後の2文字を切り出す
const outputbasedir = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "public"

// read lat-long-date.txt file
let locationInfo = fs.readFileSync(locationPath, 'utf8');
let locationInfoLines = locationInfo.split('\n');
removeEmptyLastItem(locationInfoLines);

//inputファイルがdb_fish以下のどのサブフォルダにあるのかの情報を読み取る
const inputFileLocationInfo = fs.readFileSync(inputFileLocation, 'utf8');
let inputFileLocationInfoLines = inputFileLocationInfo.split('\n');
removeEmptyLastItem(inputFileLocationInfoLines);
let inputFileLocationInfoMap = {}
for(const i of inputFileLocationInfoLines){
  const items = i.split("\t")
  inputFileLocationInfoMap[items[0]]=items[1]
  //console.log(items)
}

//read mapwater.result.txt file
//海・川・湖などなら追加
let aquaDataTemp=fs.readFileSync(waterPath,'utf8');
let aquaDataTempLines = aquaDataTemp.split('\n')
removeEmptyLastItem(aquaDataTempLines);
let aquaData={}
for(let aquaDataTemp of aquaDataTempLines){
    let aquaDataTempItems = aquaDataTemp.split('\t');
    aquaData[aquaDataTempItems[0]]=aquaDataTempItems[1];
}
//console.log(aquaData)

let locationInfoItems = [];
for(let locationInfoLine of locationInfoLines){
    let templocationInfoItem = locationInfoLine.split('\t'); //'ERR11637981', '11.84508333 S 96.82013333 E', '2022-12-06'
    let tempLatLong = templocationInfoItem[1].split(' ')
    //console.log(templocationInfoItem, tempLatLong[0], aquaData[templocationInfoItem[0]]);
    if (tempLatLong[0] !== "" && tempLatLong.length === 4 && !isNaN(tempLatLong[0]) && aquaData[templocationInfoItem[0]]==="1") {
        //経度緯度が記述されていれば追加
        locationInfoItems.push(templocationInfoItem);
    }
}
//console.log("locationInfoItems: ", locationInfoItems)
//fs.writeFileSync(inputFileNum, String(locationInfoItems.length), (err) => {
//                console.log('number file write error');
//            });

//for(let ratio=2; ratio<=18; ratio++){

    const base2 = BigNumber(2);
    const exponent = 4 - ratio;
    const myunit = BigNumber(360).div(base2.pow(8))
    const result = myunit.times(base2.pow(exponent));
    const blockSize = result.toString();
    //console.log("blockSize: ", blockSize)

    //ブロックごとにどのSRR IDが来るかを分別
    //prepare block information
    let blockInfo = {}
    let data = {}

    for(let locationInfoItem of locationInfoItems){
        //console.log(locationInfoItem)
        // reading .input files and Integrating location Info
        const inputFileID = locationInfoItem[0] //SRR24416895など
        const inputFilePath = imputFolderPath + "/" + inputFileLocationInfoMap[inputFileID]
        //console.log(inputFilePath)
        if (!fs.existsSync(inputFilePath)) {
            continue; // Skip to next iteration if file does not exist
        }
        let species = {}
        const tempLatLong = locationInfoItem[1].split(' ')
        let tempLat = BigNumber(tempLatLong[0])
        let tempLong = BigNumber(tempLatLong[2])
        if (tempLatLong[1] === "S") { tempLat = tempLat.negated() } //+-反転させる
        if (tempLatLong[3] === "W") { tempLong = tempLong.negated() } //+-反転させる
        let blocklattemp = BigNumber(Math.floor(tempLat.div(blockSize))).times(blockSize)
        let blocklongtemp = BigNumber(Math.floor(tempLong.div(blockSize))).times(blockSize)
        let key = `${blocklattemp},${blocklongtemp}`
        console.log([locationInfoItem[0], locationInfoItem[2], `${tempLat}`, `${tempLong}`, `${blocklattemp}`, `${blocklongtemp}`, `${blocklattemp}/${blocklongtemp}`, `${tempLat},${tempLong}`].join("\t"))
    }

//}

function removeEmptyLastItem(arr) {
    if (arr.length > 0 && arr[arr.length - 1] === '') {
        arr.pop();
    }
}
