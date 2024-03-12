'use strict';
const e = require('express');
const express = require('express');
const router = express.Router();
const app = express();
// //Request body size の上限を100mbと大きく変更。デフォルトは100kbらしい。
// // Express 4.0以上、4.16未満の対応
// console.log("test")
// // JSONボディのサイズ制限を設定
// app.use(express.json({ limit: '50mb' }));
// // URLエンコードされたボディのサイズ制限を設定
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

//追加モジュール
const fs = require("fs");
const path = require('path');
const { route } = require('./users');
const { Console } = require('console');

const BigNumber = require('bignumber.js');
BigNumber.config({
    DECIMAL_PLACES: 50,                // 小数部50桁
    ROUNDING_MODE: BigNumber.ROUND_HALF_UP // 四捨五入
});


//viewをejsに変更
app.set('view engine', 'ejs');



let taxo;

/* GET home page. */
router.get('/', function (req, res) {
    taxo = req.query.taxo;
    if (taxo == undefined || taxo == "") {
        taxo = "fish"
    }
    let language = req.headers["accept-language"]
    language = language[0] + language[1]
    let sampleDataObjList = [] //getSampleDataObjList(taxo,language);
    let allFishList = [] //getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo, language);
    let latitude = req.query.lat;
    let longitude = req.query.long;
    let ratio = req.query.ratio;
    if (latitude == undefined || latitude == "") {
        latitude = 35.7
    }
    if (longitude == undefined || longitude == "") {
        longitude = 139.7
    }
    if (ratio == undefined || ratio == "") {
        ratio = 5
    }
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio, language: language });
});

router.get('/fish', function (req, res) {
    taxo = "fish";
    let language = req.headers["accept-language"]
    language = language[0] + language[1]
    //console.log(language)
    let sampleDataObjList = getSampleDataObjList(taxo, language);
    let allFishList = getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo, language);
    let latitude = req.query.lat;
    let longitude = req.query.long;
    let ratio = req.query.ratio;
    if (latitude == undefined || latitude == "") {
        latitude = 35.7
    }
    if (longitude == undefined || longitude == "") {
        longitude = 139.7
    }
    if (ratio == undefined || ratio == "") {
        ratio = 5
    }
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio, language: language });
});

router.get('/mollusk', function (req, res) {
    taxo = "mollusk";
    let language = req.headers["accept-language"]
    language = language[0] + language[1]
    //console.log(language)
    let sampleDataObjList = getSampleDataObjList(taxo, language);
    let allFishList = getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo, language);
    let latitude = req.query.lat;
    let longitude = req.query.long;
    let ratio = req.query.ratio;
    if (latitude == undefined || latitude == "") {
        latitude = 35.7
    }
    if (longitude == undefined || longitude == "") {
        longitude = 139.7
    }
    if (ratio == undefined || ratio == "") {
        ratio = 5
    }
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio, language: language });
});

router.post('/', function (req, res) {
    taxo = "fish";
    let selectedFishList = req.body.fishList;
    let language = req.headers["accept-language"]
    language = language[0] + language[1]
    let { new_sampleDataObjList, new_fishClassifyDataObj } = filterBySelectFish(selectedFishList, taxo, language);
    let latitude = req.query.lat;
    let longitude = req.query.long;
    let ratio = req.query.ratio;
    if (latitude == undefined || latitude == "") {
        latitude = 35.7
    }
    if (longitude == undefined || longitude == "") {
        longitude = 139.7
    }
    if (ratio == undefined || ratio == "") {
        ratio = 5
    }
    let pieDataSet = getDataForPieChart(language, ratio, latitude, longitude)
    res.send({ new_sampleDataObjList: new_sampleDataObjList, new_fishClassifyDataObj: new_fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio, language: language });
});

router.get('/about', function (req, res) {
    let language = req.headers["accept-language"]
    language = language[0] + language[1]
    res.render('ejs/about.ejs', { language: language });

});

router.post('/getTargetBlocksGraphMonth', function (req, res) {
    let language = req.headers["accept-language"]
    language = language[0] + language[1]
    // ブラウザから送られた情報を取得
    //console.log(req.body)
    const southWest = req.body.southWest
    const northEast = req.body.northEast
    const blockSize = BigNumber(req.body.blockSize) //もともとBigNumber型で送られてくるはずだけど念のため

    //左、下はブロックサイズで割って切り捨ててからブロックサイズを掛け、端数を切った値
    //右、上はブロックサイズで割って切り上げてからブロックサイズを掛け、端数を足した値
    let leftlong = BigNumber(Math.floor(BigNumber(southWest.lng).div(blockSize))).times(blockSize)
    let lowerlat = BigNumber(Math.floor(BigNumber(southWest.lat).div(blockSize))).times(blockSize)
    let rightlong = BigNumber(Math.ceil(BigNumber(northEast.lng).div(blockSize))).times(blockSize)
    let upperlat = BigNumber(Math.ceil(BigNumber(northEast.lat).div(blockSize))).times(blockSize)
    //console.log("leftlong, rightlong, lowerlat, upperlat", leftlong.toString(), rightlong.toString(), lowerlat.toString(), upperlat.toString())

    //上下左右ともにblockSizeだけ大きくしておく
    //decide the data reading range
    let longStart = leftlong.minus(blockSize)
    let latStart = lowerlat.minus(blockSize)
    let longEnd = rightlong.plus(blockSize)
    let latEnd = upperlat.plus(blockSize)
    //console.log("longStart, longEnd, latStart, latEnd", longStart.toString(), longEnd.toString(), latStart.toString(), latEnd.toString())

    //ブロックをすべて列挙する
    let listBlocks = []

    //ブロックを列挙しつつ地図上にブロック区切りの線も引く
    for (let x = longStart; x.isLessThanOrEqualTo(longEnd); x = x.plus(blockSize)) {
        for (let y = latStart; y.isLessThanOrEqualTo(latEnd); y = y.plus(blockSize)) {
            //console.log("public/layered_data/" + language + "/" + blockSize.toString() + "/" + y.toString() + "/" + x.toString() + "/month.json")
            if (fileExists("public/layered_data/" + language + "/" + blockSize.toString() + "/" + y.toString() + "/" + x.toString() + "/month.json")) {
                //ターゲットとして保存
                //console.log(x, y)
                listBlocks.push({ y: y.toString(), x: x.toString() })
                //console.log("y, x: ", y, x)
            }
        }
    }
    //return listBlocks

    // レスポンスとしてJSONを返す
    res.json({ listBlocks });
})

router.post('/getTargetBlocks', function (req, res) {
    let language = req.headers["accept-language"]
    language = language[0] + language[1]
    // ブラウザから送られた情報を取得
    //console.log(req.body)
    const filename = req.body.filename
    const southWest = req.body.southWest
    const northEast = req.body.northEast
    const blockSize = BigNumber(req.body.blockSize) //もともとBigNumber型で送られてくるはずだけど念のため

    //左、下はブロックサイズで割って切り捨ててからブロックサイズを掛け、端数を切った値
    //右、上はブロックサイズで割って切り上げてからブロックサイズを掛け、端数を足した値
    let leftlong = BigNumber(Math.floor(BigNumber(southWest.lng).div(blockSize))).times(blockSize)
    let lowerlat = BigNumber(Math.floor(BigNumber(southWest.lat).div(blockSize))).times(blockSize)
    let rightlong = BigNumber(Math.ceil(BigNumber(northEast.lng).div(blockSize))).times(blockSize)
    let upperlat = BigNumber(Math.ceil(BigNumber(northEast.lat).div(blockSize))).times(blockSize)
    //console.log("leftlong, rightlong, lowerlat, upperlat", leftlong.toString(), rightlong.toString(), lowerlat.toString(), upperlat.toString())

    //上下左右ともにblockSizeだけ大きくしておく
    //decide the data reading range
    let longStart = leftlong.minus(blockSize)
    let latStart = lowerlat.minus(blockSize)
    let longEnd = rightlong.plus(blockSize)
    let latEnd = upperlat.plus(blockSize)
    //console.log("longStart, longEnd, latStart, latEnd", longStart.toString(), longEnd.toString(), latStart.toString(), latEnd.toString())

    //ブロックをすべて列挙する
    let listBlocks = []

    //ブロックを列挙しつつ地図上にブロック区切りの線も引く
    for (let x = longStart; x.isLessThanOrEqualTo(longEnd); x = x.plus(blockSize)) {
        const dx_value = Math.floor((parseFloat(x.toString()) + 180) / 360) * 360
        const x_normalized = BigNumber(x.toString()).minus(dx_value)
        
        for (let y = latStart; y.isLessThanOrEqualTo(latEnd); y = y.plus(blockSize)) {
            //console.log("public/layered_data/" + language + "/" + blockSize.toString() + "/" + y.toString() + "/" + x_normalized.toString() + "/" + filename)
            if (fileExists("public/layered_data/" + language + "/" + blockSize.toString() + "/" + y.toString() + "/" + x_normalized.toString() + "/" + filename)) {
                //ターゲットとして保存
                //console.log(x, y)
                listBlocks.push({ y: y.toString(), x: x.toString() })
                //console.log("y, x: ", y, x)
            }
        }
    }
    //return listBlocks

    // レスポンスとしてJSONを返す
    res.json({ listBlocks });
})
router.post('/checkFiles', function (req, res) {
    // ブラウザから送られたファイルパスを取得
    //console.log(req.body.filePaths.length)
    const filePaths = req.body.filePaths; //[filePath]

    // ファイルの存在を確認
    const existingFiles = filePaths.filter(filePath => fileExists("public/" + filePath))
    //console.log("existingFiles.length: ", existingFiles.length)

    // レスポンスとしてJSONを返す
    res.json({ existingFiles });
})

module.exports = router;


// ファイルの存在を確認する関数
function fileExists(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

function getSampleList(taxo) {
    //緯度経度情報のファイルを読み込み
    let sampleList;
    sampleList = fs.readFileSync("data/" + taxo + "/lat-long-date.txt", "utf-8");
    sampleList = sampleList.split("\n");

    return sampleList;
}

function getSampleDataObjList(taxo, lang) {
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
                if (lang === "zh") {
                    sampleFishCompList = fs.readFileSync("db_" + taxo + "_zh/" + sampleID + ".input", "utf-8");
                } else if (lang === "ja") {
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

function fishClassify(taxo, lang) {
    let fishClassifyDataList
    if (lang === "zh") {
        fishClassifyDataList = fs.readFileSync("data/" + taxo + "/classifylist_zh.txt", "utf-8");
    } else if (lang === "ja") {
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
    let fishClassifyDataObj = fishClassify(taxo, lang);

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