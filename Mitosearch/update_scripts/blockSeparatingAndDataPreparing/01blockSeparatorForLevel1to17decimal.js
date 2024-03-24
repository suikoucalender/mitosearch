const { addAbortListener } = require('events');
const BigNumber = require('../../public/bignumber.js/bignumber.js');
BigNumber.config({
    DECIMAL_PLACES: 50,                // 小数部50桁
    ROUNDING_MODE: BigNumber.ROUND_HALF_UP // 四捨五入
});

const args = process.argv.slice(2)
const fs = require('fs');
const path = require('path');

const language = args[0] //ja, en, zh
//mitosearchフォルダの中のパスを指定している
const locationPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "data" + path.sep + "fish" + path.sep + "lat-long-date.txt" //args[0]; //lat-long-date.txt
const waterPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "data" + path.sep + "fish" + path.sep + "mapwater.result.txt" //args[1]; //mapwater.result.txt
const imputFolderPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "db_fish_" + language //args[2]; //db_fish_[language]
//let blockSize = new Decimal(args[3]); //ratioAndBlock={"2":45,"3":30,"4":15,"5":5,"6":3,"7":2,"8":1,"9":0.5,"10":0.2,"11":0.1,"12":0.05,"13":0.05,"14":0.02,"15":0.02,"16":0.02,"17":0.01,"18":"special"}
const lang = language //imputFolderPath.slice(-2); //最後の2文字を切り出す
const outputbasedir = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "public"

// read lat-long-date.txt file
let locationInfo = fs.readFileSync(locationPath, 'utf8');
let locationInfoLines = locationInfo.split('\n');
removeEmptyLastItem(locationInfoLines);

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
console.log(aquaData)

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

for(let ratio=2; ratio<=18; ratio++){
    
    const base2 = BigNumber(2);
    const exponent = 4 - ratio;
    const myunit = BigNumber(360).div(base2.pow(8))
    const result = myunit.times(base2.pow(exponent));
    const blockSize = result.toString();

    console.log("blockSize: ", blockSize)
    //ブロックごとにどのSRR IDが来るかを分別
    //prepare block information
    let blockInfo = {}
    let data = {}
    //Convert latitude and longitude to digital format
    for(let locationInfoItem of locationInfoItems){
        // reading .input files and Integrating location Info
        const inputFileID = locationInfoItem[0] //SRR24416895など
        let inputFileName = inputFileID + ".input"
        const inputFilePath = imputFolderPath + "/" + inputFileName
        //console.log(inputFilePath)
        if (!fs.existsSync(inputFilePath)) {
            continue; // Skip to next iteration if file does not exist
        }
        let species = {}

        let tempLatLong = locationInfoItem[1].split(' ')
        let tempLat = BigNumber(tempLatLong[0])
        let tempLong = BigNumber(tempLatLong[2])
        if (tempLatLong[1] === "S") { tempLat = tempLat.negated() } //+-反転させる
        if (tempLatLong[3] === "W") { tempLong = tempLong.negated() } //+-反転させる
        let blocklattemp = BigNumber(Math.floor(tempLat.div(blockSize))).times(blockSize)
        let blocklongtemp = BigNumber(Math.floor(tempLong.div(blockSize))).times(blockSize)
        let key = `${blocklattemp},${blocklongtemp}`

        // reading .input files and Integrating location Info
        const tempSpecies = fs.readFileSync(inputFilePath, 'utf8');
        //convert to array
        let tempSpeciesLines = tempSpecies.split('\n');
        //remove the first item and empty last item
        tempSpeciesLines.splice(0, 1);
        removeEmptyLastItem(tempSpeciesLines);
        //Organize into associative arrays
        for (let j = 0; j < tempSpeciesLines.length; j++) {
            let tempSpeciesItems = tempSpeciesLines[j].split('\t');
            //console.log(tempSpeciesItems)
            species[tempSpeciesItems[0]] = parseFloat(tempSpeciesItems[1]);
        }
        let datatemp = { ID: inputFileID, time: locationInfoItem[2], lat: tempLat, long: tempLong, species: species }
        data[inputFileID] = datatemp

        if (!(key in blockInfo)) {
            blockInfo[key] = [inputFileID];
        } else {
            blockInfo[key].push(inputFileID);
        }
    }
    //console.log(blockInfo)//looks like {`blocklat,blocklng`:fileName}
    //console.log(data)

    for(let blockname in blockInfo){ //blockname: lat: 39,long: 140など, blockInfo: {key(lat-long): [fileID]}
        //円グラフを作成
        //follow the block information, prepare pie data
        let blocknamearray = blockname.split(',')
        let samplenumber = blockInfo[blockname].length
        let sumLat = BigNumber(0)
        let sumLong = BigNumber(0)
        let blockSpecies = {}
        console.log("--------------------------(" + blocknamearray + ")--------------------------")
        let eachData = {}
        for(let filename of blockInfo[blockname]){
            const fileSpeciesData = data[filename] //lat, long, time, species{}
            //record pie location
            sumLat = sumLat.plus(fileSpeciesData.lat)
            sumLong = sumLong.plus(fileSpeciesData.long)
            let fileSpeciesName = Object.keys(fileSpeciesData.species)
            for (let y = 0; y < fileSpeciesName.length; y++) {//loop for each species
                if (!(fileSpeciesName[y] in blockSpecies)) {
                    blockSpecies[fileSpeciesName[y]] = parseFloat(fileSpeciesData.species[fileSpeciesName[y]])
                } else {
                    blockSpecies[fileSpeciesName[y]] += parseFloat(fileSpeciesData.species[fileSpeciesName[y]])
                }
                //console.log(parseFloat(fileSpeciesData.species[fileSpeciesName[y]]), blockSpecies[fileSpeciesName[y]])
            }

            //各データを表示する用 ratio=18
            if(ratio===18){
                keySP = fileSpeciesData.lat + "," + fileSpeciesData.long
                if (!(keySP in eachData)) {
                    eachData[keySP] = [fileSpeciesData];
                } else {
                    eachData[keySP].push(fileSpeciesData);
                }
            }
        }
        let averageLat = sumLat.div(samplenumber)//pie chart location
        let averageLong = sumLong.div(samplenumber)

        let pieInputList = []
        let blockSpeciesKeys = Object.keys(blockSpecies)
        for (let s = 0; s < blockSpeciesKeys.length; s++) {
            pieInputList.push({ name: blockSpeciesKeys[s], value: blockSpecies[blockSpeciesKeys[s]] / samplenumber })
        }

        //calcutate the ratio of each species in each block
        if (blockSpeciesKeys.length !== 0) {//some sample is in lat-lng-date.txt file, but there were no input file, remove them in this step.
            fs.mkdirSync(`${outputbasedir}/layered_data/${lang}/${blockSize}/${blocknamearray[0]}/${blocknamearray[1]}`, { recursive: true }, (err) => {
                if (err) throw err;
            });
            //円グラフを描く位置とサンプル数を出力
            let pieCoord = [averageLat, averageLong, samplenumber]
            console.log("[pieLat,pieLng,sampleNum]: ", pieCoord)
            fs.writeFileSync(`${outputbasedir}/layered_data/${lang}/${blockSize}/${blocknamearray[0]}/${blocknamearray[1]}/pieCoord.json`,
             JSON.stringify(pieCoord, null, 2), (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });
            fs.writeFileSync(`${outputbasedir}/layered_data/${lang}/${blockSize}/${blocknamearray[0]}/${blocknamearray[1]}/fishAndRatio.json`,
             JSON.stringify(pieInputList, null, 2), (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });

            //レベル18限定処理
            if(ratio===18){
                //もとのlatlong.txtファイルが日付ソートされている場合はソートを省略
                //for(const i in eachData){
                //    eachData[i].sort((a, b) => a.time.localeCompare(b.time));
                //}
                fs.writeFileSync(`${outputbasedir}/layered_data/${lang}/${blockSize}/${blocknamearray[0]}/${blocknamearray[1]}/eachData.json`,
                 JSON.stringify(eachData, null, 2), (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            }

        }

        //月ごとにデータを集約したファイルを作成
        let MonthSamples = {}
        for(let filename of blockInfo[blockname]){
            let fileData = data[filename] //lat, long, time, species{}
            const regex = /^[12][0-9]{3}-[0-9]{2}/; //年月が1xxx-xx, 2xxx-xxを対象
            const isMatch = regex.test(fileData.time);
            if(isMatch){
                const Month = fileData.time.slice(5,7) //月を抜き出す
                if (!(Month in MonthSamples)) {
                    MonthSamples[Month] = [filename];
                } else {
                    MonthSamples[Month].push(filename);
                }
            }else{
                console.log("Date is missing: ", filename)
            }
        }
        //月ごとに生物種を集計
        let MonthWholeData = []
        for (const month in MonthSamples) {
            let monthSpeciesData = {}
            let sampleNumberInMonth = MonthSamples[month].length
            for (const filename of MonthSamples[month]) {
                const monthSampleData = data[filename].species;
                for(const specname in monthSampleData){
                    if(!(specname in monthSpeciesData)){
                        monthSpeciesData[specname] = parseFloat(monthSampleData[specname])
                    }else{
                        monthSpeciesData[specname] += parseFloat(monthSampleData[specname])
                    }
                }
            }
            let monthInputList = []
            for(const specname in monthSpeciesData){
                monthInputList.push({name: specname, value: monthSpeciesData[specname] / sampleNumberInMonth})
            }
            console.log("### month, sampleNumberInMonth: ", month, sampleNumberInMonth)
            MonthWholeData.push({month: month, num: sampleNumberInMonth, data: monthInputList})
        }
        //月ごとの種組成を出力
        if(MonthWholeData.length!=0){
            fs.writeFileSync(`${outputbasedir}/layered_data/${lang}/${blockSize}/${blocknamearray[0]}/${blocknamearray[1]}/month.json`,
             JSON.stringify({y: blocknamearray[0], x: blocknamearray[1], monthdata: MonthWholeData}, null, 2), (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });
        }
    }


}

function removeEmptyLastItem(arr) {
    if (arr.length > 0 && arr[arr.length - 1] === '') {
        arr.pop();
    }
}