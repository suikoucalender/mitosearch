'use strict';
var express = require('express');
var router = express.Router();
var app = express();

//�ǉ����W���[��
const fs = require("fs");
const { route } = require('./users');

//view��ejs�ɕύX
app.set('view engine', 'ejs');

let taxo;

/* GET home page. */
router.get('/', function (req, res) {
    taxo = req.query.taxo;
    if (taxo==undefined || taxo==""){
        taxo="fish"
    }
    let sampleDataObjList = getSampleDataObjList(taxo);
    let allFishList = getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo);
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
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio });
});

router.get('/fish', function (req, res) {
    taxo = "fish";
    let sampleDataObjList = getSampleDataObjList(taxo);
    let allFishList = getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo);
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
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio });
});

router.get('/mollusk', function (req, res) {
    taxo = "mollusk";
    let sampleDataObjList = getSampleDataObjList(taxo);
    let allFishList = getAllFishList(sampleDataObjList);
    let fishClassifyDataObj = fishClassify(taxo);
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
    res.render('ejs/index.ejs', { sampleDataObjList: sampleDataObjList, AllFishList: allFishList, fishClassifyDataObj: fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio });
});

router.post('/', function (req, res) {
    taxo = "fish";
    let selectedFishList = req.body.fishList;
    let { new_sampleDataObjList, new_fishClassifyDataObj } = filterBySelectFish(selectedFishList, taxo);
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
    res.send({ new_sampleDataObjList: new_sampleDataObjList, new_fishClassifyDataObj: new_fishClassifyDataObj, taxo: taxo, latitude: latitude, longitude: longitude, ratio: ratio });
});

router.get('/about', function (req, res) {
    res.render('ejs/about.ejs');
});

module.exports = router;

function getSampleList(taxo) {
    //�ܓx�o�x���̃t�@�C����ǂݍ���
    let sampleList;
    sampleList = fs.readFileSync("data/" + taxo + "/lat-long-date.txt", "utf-8");
    sampleList = sampleList.split("\n");

    return sampleList;
}

function getSampleDataObjList(taxo) {
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

    // �T���v�����^�f�[�^�ꗗ���擾
    let sampleList = getSampleList(taxo);

    //��������f�[�^�̎�荞��
    let waterornot = fs.readFileSync("data/" + taxo + "/mapwater.result.txt", "utf-8");
    waterornot = waterornot.split("\n");

    //��������f�[�^����A�z�z����쐬
    for (let i = 0; i < waterornot.length; i++) {
        if (waterornot[i] != undefined) {
            let waterornot2 = waterornot[i].split("\t");
            waterlist[waterornot2[0]] = waterornot2[1];
        }
    }

    //�T���v���ꗗ���̊e�s�ɑ΂��ď������s��
    sampleList.forEach(sampleMetaData => {
        //�e�s���^�u�ŕ������A�T���v��ID���擾����B
        sampleMetaData = sampleMetaData.split("\t");
        sampleID = sampleMetaData[0];

        //�T���v���̋���g����������
        sampleFishCompObj = {};

        if (waterlist[sampleID] == "1") {
            try {
                sampleLatLng = sampleMetaData[1];

                //�ܓx�o�x�̏�񂪑��݂��Ȃ��T���v���ł͏������s��Ȃ�
                if (sampleLatLng.includes("not applicable")) {
                    return;
                }

                sampleLatLng = sampleLatLng.split(' ');

                sampleLat = parseFloat(sampleLatLng[0]);
                //�ܓx�o�x��NaN�̃f�[�^������
                if (isNaN(sampleLat)) {
                    return
                }
                //��܂͕��̐��ɕϊ�
                if (sampleLatLng[1] == "S") {
                    sampleLat = sampleLat * -1;
                }

                //���o�͕��̐��ɕϊ�
                sampleLng = parseFloat(sampleLatLng[2]);
                if (sampleLatLng[3] == "W") {
                    sampleLng = sampleLng * -1;
                }

                //input�t�@�C������T���v������ǂݎ��
                sampleFishCompList = fs.readFileSync("db_" + taxo + "/" + sampleID + ".input", "utf-8");
                sampleFishCompList = sampleFishCompList.split("\n");

                //Header�������e�s���狛��g�����擾
                for (let i = 1; i < sampleFishCompList.length; i++) {
                    sampleFishComp = sampleFishCompList[i].split("\t");

                    //�ُ�l������
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

function fishClassify(taxo) {
    let fishClassifyDataList = fs.readFileSync("data/" + taxo + "/classifylist.txt", "utf-8");
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
    //�S����ꗗ
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

function filterBySelectFish(selectedFishList, taxo) {

    selectedFishList = selectedFishList.split(",");
    let sampleDataObjList = getSampleDataObjList(taxo);
    let fishClassifyDataObj = fishClassify(taxo);

    let new_sampleDataObjList = [];

    sampleDataObjList.forEach(sampleDataObj => {
        let sampleFishList = Object.keys(sampleDataObj.fish);

        let new_sampleDataObj = {
            sample: sampleDataObj.sample, latitude: sampleDataObj.latitude, longitude: sampleDataObj.longitude, date: sampleDataObj.date, fish: {}
        };

        let total = 0;

        selectedFishList.forEach(selectedFish => {
            if (sampleFishList.includes(selectedFish)) {
                new_sampleDataObj.fish[selectedFish] = sampleDataObj.fish[selectedFish];
                total += sampleDataObj.fish[selectedFish];
            }
        })

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