'use strict';
const e = require('express');
var express = require('express');
var router = express.Router();
var app = express();

//追加モジュール
const fs = require("fs");
const path = require('path');
const { route } = require('./users');
const { Console } = require('console');

//viewをejsに変更
app.set('view engine', 'ejs');

let taxo;

/* GET home page. */
router.get('/', function (req, res) {
    taxo = req.query.taxo;
    if (taxo==undefined || taxo==""){
        taxo="fish"
    }
    let language = req.headers["accept-language"]
    language = language[0]+language[1]
    let sampleDataObjList = getSampleDataObjList(taxo,language);
    let allFishList = getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo,language);
    let latitude=req.query.lat;
    let longitude=req.query.long;
    let ratio=req.query.ratio;
    if(latitude==undefined || latitude==""){
        latitude=35.7
    }
    if (longitude==undefined || longitude==""){
        longitude=139.7
    }
    if (ratio==undefined || ratio==""){
        ratio=5
    }
    let pieDataSet=getDataForPieChart(language, ratio, latitude, longitude) //🌟problem
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio, language: language, pieDataSet:pieDataSet });
});

router.get('/fish', function (req, res) {
    taxo = "fish";
    let language = req.headers["accept-language"]
    language = language[0]+language[1]
    //console.log(language)
    let sampleDataObjList = getSampleDataObjList(taxo,language);
    let allFishList = getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo,language);
    let latitude=req.query.lat;
    let longitude=req.query.long;
    let ratio=req.query.ratio;
    if(latitude==undefined || latitude==""){
        latitude=35.7
    }
    if (longitude==undefined || longitude==""){
        longitude=139.7
    }
    if (ratio==undefined || ratio==""){
        ratio=5
    }
    let pieDataSet=getDataForPieChart(language, ratio, latitude, longitude)
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio, language: language, pieDataSet: pieDataSet });
});

router.get('/mollusk', function (req, res) {
    taxo = "mollusk";
    let language = req.headers["accept-language"]
    language = language[0]+language[1]
    //console.log(language)
    let sampleDataObjList = getSampleDataObjList(taxo,language);
    let allFishList = getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo,language);
    let latitude=req.query.lat;
    let longitude=req.query.long;
    let ratio=req.query.ratio;
    if(latitude==undefined || latitude==""){
        latitude=35.7
    }
    if (longitude==undefined || longitude==""){
        longitude=139.7
    }
    if (ratio==undefined || ratio==""){
        ratio=5
    }
    let pieDataSet=getDataForPieChart(language, ratio, latitude, longitude)
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio, language: language, pieDataSet: pieDataSet });
});

router.post('/', function (req, res) {
    taxo = "fish";
    let selectedFishList = req.body.fishList;
    let language = req.headers["accept-language"]
    language = language[0]+language[1]
    let { new_sampleDataObjList, new_fishClassifyDataObj } = filterBySelectFish(selectedFishList, taxo, language);
    let latitude=req.query.lat;
    let longitude=req.query.long;
    let ratio=req.query.ratio;
    if(latitude==undefined || latitude==""){
        latitude=35.7
    }
    if (longitude==undefined || longitude==""){
        longitude=139.7
    }
    if (ratio==undefined || ratio==""){
        ratio=5
    }
    let pieDataSet=getDataForPieChart(language, ratio, latitude, longitude)
    res.send({ new_sampleDataObjList: new_sampleDataObjList, new_fishClassifyDataObj: new_fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio, language: language, pieDataSet: pieDataSet });
});

router.get('/about', function (req, res) {
    let language = req.headers["accept-language"]
    language = language[0]+language[1]
    res.render('ejs/about.ejs', {language: language});

});

module.exports = router;

function getSampleList(taxo) {
    //緯度経度情報のファイルを読み込み
    let sampleList;
    sampleList = fs.readFileSync("data/" + taxo + "/lat-long-date.txt", "utf-8");
    sampleList = sampleList.split("\n");

    return sampleList;
}

function getSampleDataObjList(taxo,lang) {
    let sampleDataObjList = [];
    let sampleID;
    let sampleFishCompList;
    let sampleFishComp;
    let sampleFishCompObj;
    let sampleDataObj;
    let sampleLatLng;
    let sampleLat;
    let sampleLng;
    let waterlist = { ID: "water" };


    // サンプルメタデータ一覧を取得
    let sampleList = getSampleList(taxo);

    //水陸判定データの取り込み
    let waterornot = fs.readFileSync("data/" + taxo + "/mapwater.result.txt", "utf-8");
    waterornot = waterornot.split("\n");

    //水陸判定データから連想配列を作成
    for (let i = 0; i < waterornot.length; i++) {
        if (waterornot[i] != undefined) {
            let waterornot2 = waterornot[i].split("\t");
            waterlist[waterornot2[0]] = waterornot2[1];
        }
    }

    //サンプル一覧情報の各行に対して処理を行う
    sampleList.forEach(sampleMetaData => {
        //各行をタブで分割し、サンプルIDを取得する。
        sampleMetaData = sampleMetaData.split("\t");
        sampleID = sampleMetaData[0];

        //サンプルの魚種組成を初期化
        sampleFishCompObj = {};

        if (waterlist[sampleID] == "1") {
            try {
                sampleLatLng = sampleMetaData[1];

                //緯度経度の情報が存在しないサンプルでは処理を行わない
                if (sampleLatLng.includes("not applicable")) {
                    return;
                }

                sampleLatLng = sampleLatLng.split(' ');

                sampleLat = parseFloat(sampleLatLng[0]);
                //緯度経度がNaNのデータを除去
                if (isNaN(sampleLat)) {
                    return
                }
                //南緯は負の数に変換
                if (sampleLatLng[1] == "S") {
                    sampleLat = sampleLat * -1;
                }

                //西経は負の数に変換
                sampleLng = parseFloat(sampleLatLng[2]);
                if (sampleLatLng[3] == "W") {
                    sampleLng = sampleLng * -1;
                }
                
                //inputファイルからサンプル情報を読み取り
                if (lang==="zh"){
                    sampleFishCompList = fs.readFileSync("db_" + taxo + "_zh/" + sampleID + ".input", "utf-8");
                } else if(lang==="ja"){
                    sampleFishCompList = fs.readFileSync("db_" + taxo + "_ja/" + sampleID + ".input", "utf-8");
                } else {
                    sampleFishCompList = fs.readFileSync("db_" + taxo + "_en/" + sampleID + ".input", "utf-8");
                }
                sampleFishCompList = sampleFishCompList.split("\n");

                //Headerを除く各行から魚種組成を取得
                for (let i = 1; i < sampleFishCompList.length; i++) {
                    sampleFishComp = sampleFishCompList[i].split("\t");

                    //異常値を除去
                    if (sampleFishComp.length == 1) {
                        continue;
                    }

                    sampleFishCompObj[sampleFishComp[0]] = parseFloat(sampleFishComp[1]);
                }

                sampleDataObj = { sample: sampleID, latitude: sampleLat, longitude: sampleLng, date: sampleMetaData[2], fish: sampleFishCompObj };
                sampleDataObjList.push(sampleDataObj);

            } catch {
                return;
            }
        }
        else
            return;
    })
    return sampleDataObjList;
}

function fishClassify(taxo,lang) {
    let fishClassifyDataList
    if (lang==="zh"){
        fishClassifyDataList = fs.readFileSync("data/" + taxo + "/classifylist_zh.txt", "utf-8");
    } else if(lang==="ja"){
        fishClassifyDataList = fs.readFileSync("data/" + taxo + "/classifylist_ja.txt", "utf-8");
    } else {
        fishClassifyDataList = fs.readFileSync("data/" + taxo + "/classifylist_en.txt", "utf-8");
    }
    fishClassifyDataList = fishClassifyDataList.split("\n");
    fishClassifyDataList = fishClassifyDataList.map(data => data.split("\t"));
    fishClassifyDataList = fishClassifyDataList.map(data => [data[0], parseInt(data[1])]);
    let fishClassifyDataObj = {};
    fishClassifyDataList.forEach(fishClassifyData => {
        if (fishClassifyData[0] == "") {
            return
        }
        fishClassifyDataObj[fishClassifyData[0]] = fishClassifyData[1]
    });
    return fishClassifyDataObj;
}

function getAllFishList(sampleDataObjList) {
    //全魚種一覧
    let allFishList = [];

    sampleDataObjList.forEach(sampleDataObj => {
        let sampleFishList = Object.keys(sampleDataObj.fish);

        sampleFishList.forEach(fishName => {
            if (!(allFishList.includes(fishName))) {
                allFishList.push(fishName);
            }
        })
    })

    return allFishList;
}

function filterBySelectFish(selectedFishList, taxo, lang) {
    selectedFishList = selectedFishList.split(",");
    let sampleDataObjList = getSampleDataObjList(taxo, lang);
    let fishClassifyDataObj = fishClassify(taxo,lang);

    let new_sampleDataObjList = [];

    sampleDataObjList.forEach(sampleDataObj => {
        let sampleFishList = Object.keys(sampleDataObj.fish);
        let new_sampleDataObj = {
            sample: sampleDataObj.sample, latitude: sampleDataObj.latitude, longitude: sampleDataObj.longitude, date: sampleDataObj.date, fish: {}
        };

        let total = 0;

        selectedFishList.forEach(selectedFish => {
            //there may be spaces in original version, and we removed them when we add multi-languages
            //you can see below, there is a space after "others" *1
            //I still did not understand the reason 
            if (sampleFishList.includes(selectedFish.trimEnd())) {
                new_sampleDataObj.fish[selectedFish] = sampleDataObj.fish[selectedFish.trimEnd()];
                total += sampleDataObj.fish[selectedFish.trimEnd()];
            }
        })
        // *1
        new_sampleDataObj.fish["others "] = 100 - total;

        new_sampleDataObjList.push(new_sampleDataObj);
    })

    let new_fishClassifyDataObj = {};

    selectedFishList.forEach(selectedFish => {
        if (selectedFish == '') {
            return;
        }
        new_fishClassifyDataObj[selectedFish] = selectedFishList.indexOf(selectedFish) + 2;
    });

    new_fishClassifyDataObj["others "] = 1;

    if (new_sampleDataObjList.length == 0) {
        return { new_sampleDataObjList: sampleDataObjList, new_fishClassifyDataObj: fishClassifyDataObj };
    }

    return { new_sampleDataObjList: new_sampleDataObjList, new_fishClassifyDataObj: new_fishClassifyDataObj };
}



//为什么美洲的数据无法读取？在服务器端加载的时候，地图还没有加载好，不知道显示地图的范围。
function getDataForPieChart(language, ratio, latitude, longitude){
    let pieDataSet = {};
    let pieInputList;
    let pieLocation;
    let blockSizeLayer={};
    let blockSize;
    let ratioAndBlock={"2":45,"3":30,"4":15,"5":5,"6":3,"7":2,"8":1,"9":0.5,"10":0.2,"11":0.1,"12":0.05,"13":0.05,"14":0.02,"15":0.02,"16":0.02,"17":0.02,"18":"special"}
    blockSize=ratioAndBlock[ratio]
    if(blockSize!=="special"){


        //Avoiding the loss of decimal precision
        var expansion=1
        var expandedBlockSize=blockSize*expansion
        for(let a=0;expandedBlockSize<1;a++){
            expansion=expansion*10
            expandedBlockSize=expandedBlockSize*10
        }
        console.log(blockSize)
        console.log("关注点1")
        console.log(longitude)
        console.log(latitude)
        //Calculating the range of data to be read, Larger range prevents incomplete reading of data, Multiplier adjustable
        var leftlong = Math.floor((longitude*expansion-10*expandedBlockSize)/expandedBlockSize)*expandedBlockSize
        leftlong = leftlong/expansion
        if (leftlong<-180){
            leftlong=-180
        }
        var rightlong = Math.floor((longitude*expansion+10*expandedBlockSize)/expandedBlockSize)*expandedBlockSize
        rightlong = rightlong/expansion
        if (rightlong>180){
            rightlong=180
        }
        var lowerlat = Math.floor((latitude*expansion-10*expandedBlockSize)/expandedBlockSize)*expandedBlockSize
        lowerlat = lowerlat/expansion
        if (lowerlat<-90){
            lowerlat=-90
        }
        var upperlat = Math.floor((latitude*expansion+10*expandedBlockSize)/expandedBlockSize)*expandedBlockSize
        upperlat = upperlat/expansion
        if (upperlat>90){
            upperlat=90
        }
        console.log("关注点2")
        console.log(leftlong)
        console.log(rightlong)
        console.log(lowerlat)
        console.log(upperlat)
        console.log(expansion)
        let longitudeLayer={}
        let x
        for(x=leftlong*expansion; x<rightlong*expansion; x=x+expandedBlockSize){
            let pathLong=x/expansion
            let latitudeLayer={}
            let y
            for(y=lowerlat*expansion; y<upperlat*expansion; y=y+expandedBlockSize){
                let pathLat=y/expansion
                let pieDataTemp=[]
                let folderPath = `layered_data/${language}/${blockSize}/${pathLat}/${pathLong}`;
                let speciesPath = `${folderPath}/fishAndRatio.json`;
                let coordPath = `${folderPath}/pieCoord.json`;
                if (fs.existsSync(speciesPath.toString())) {
                    //read data of each block
                    pieInputList=JSON.parse(fs.readFileSync(speciesPath, 'utf8'));
                    pieLocation=JSON.parse(fs.readFileSync(coordPath,'utf8'));
                    pieDataTemp=[pieInputList,pieLocation]
                    latitudeLayer[pathLat]=pieDataTemp
                } else {
                    //console.log(`output.json 文件不存在: ${speciesPath}`);
                    continue
                }
            
            }
            let keys = Object.keys(latitudeLayer);
            if(keys.length!==0){
                longitudeLayer[pathLong]=latitudeLayer
            }
        }
        blockSizeLayer[blockSize]=longitudeLayer
        pieDataSet[language]=[]
        pieDataSet[language].push(blockSizeLayer)
    }else{
        console.log(blockSize)
        let longitudeLayer={}
        let x
        for(x=-180; x<180; x=x+1){
            var pathLong=x
            let latitudeLayer={}
            let y
            for(y=-90; y<90; y=y+1){
                var pathLat=y
                var pieDataTemp=[]
                let folderPath = `layered_data/${language}/${blockSize}/${pathLat}/${pathLong}`;
                if(fs.existsSync(folderPath.toString())){
                    var contents = fs.readdirSync(folderPath);
                    for(let j=0; j<contents.length; j=j+1){
                        var data
                        var filePath=`${folderPath}/${contents[j]}`
                        data=fs.readFileSync(filePath, 'utf8')
                        data=JSON.parse(data)
                        //console.log("---1---")
                        //console.log(data)
                        pieDataTemp.push(data)
                    }
                }
                //console.log("---2---")
                //console.log(pieDataTemp)
                if(pieDataTemp.length!==0){
                    latitudeLayer[pathLat]=pieDataTemp
                    //console.log("---3---")
                    //console.log(latitudeLayer)
                }
                
            }
            if(getAssociativeArrayLength(latitudeLayer)!==0){
                longitudeLayer[pathLong]=latitudeLayer
                //console.log("---4---")
                //console.log(longitudeLayer)
            }
            

            
            
        }
        if(getAssociativeArrayLength(longitudeLayer)!==0){
            blockSizeLayer[blockSize]=longitudeLayer
            //console.log("---5---")
            //console.log(blockSizeLayer)
        }
            
        pieDataSet[language]=[]
        pieDataSet[language].push(blockSizeLayer)
    }
    //console.log(pieDataSet)
    return pieDataSet
}

function countFilesInDirectory(directoryPath) {
    try {
      const files = fs.readdirSync(directoryPath);
      return files.length;
    } catch (error) {
      // non-exist or empty directory
      return -1;
    }
  }

  function getAssociativeArrayLength(obj) {
    let keysArray = Object.keys(obj);
    return keysArray.length;
  }