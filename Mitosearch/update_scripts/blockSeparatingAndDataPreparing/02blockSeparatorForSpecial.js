const fs = require('fs');
const path = require('path');
const BigNumber = require('../../public/bignumber.js/bignumber.js'); 
BigNumber.config({
    DECIMAL_PLACES: 50,                // 小数部50桁
    ROUNDING_MODE: BigNumber.ROUND_HALF_UP // 四捨五入
});
const args = process.argv.slice(2)
//const blockSize = new BigNumber(args[1])
const lang = args[0]
const language = args[0]

//ブロックサイズを計算
const ratio = 18
const base2 = BigNumber(2);
const exponent = 4 - ratio;
const myunit = BigNumber(360).div(base2.pow(8))
const result = myunit.times(base2.pow(exponent));
const blockSize = result.toString();

//mitosearchフォルダの中のパスを指定している
const locationPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "data" + path.sep + "fish" + path.sep + "lat-long-date.txt" //args[0]; //lat-long-date.txt
const waterPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "data" + path.sep + "fish" + path.sep + "mapwater.result.txt" //args[1]; //mapwater.result.txt
const imputFolderPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "db_fish_" + language //args[2]; //db_fish_[language]
const outputbasedir = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "public"


//read lat-long-date.txt file, transfer into array "locationInfo"
let locationInfo;
locationInfo = fs.readFileSync(locationPath,"utf-8");//change the path
locationInfo = locationInfo.split('\n');
removeEmptyLastItem(locationInfo);
for(let i = 0;i < locationInfo.length;i++){
    locationInfo[i] = locationInfo[i].split('\t');
    locationInfo[i][1] = locationInfo[i][1].split(' ') 
}


//read mapwater.result.txt file, transfer into array "aquaData"
let aquaDataTemp = fs.readFileSync(waterPath,'utf8');//change the path
aquaDataTemp = aquaDataTemp.split('\n')
let aquaData = {}
removeEmptyLastItem(aquaDataTemp);
for(let i = 0;i < aquaDataTemp.length;i++){
    aquaDataTemp[i] = aquaDataTemp[i].split('\t');
    aquaData[aquaDataTemp[i][0]] = `${aquaDataTemp[i][1]}`;
}


//Delete missing or abnormal or non-water-area latitude and longitude data
for (let i = locationInfo.length - 1; i >= 0; i--) {
    //console.log("key",`${locationInfo[i][0]}`)
    if (locationInfo[i][1][0]==="" || locationInfo[i][1].length!==4 || isNaN(locationInfo[i][1][0]) || aquaData[`${locationInfo[i][0]}`]===`0`) {
        //console.log("removed",aquaData[`${locationInfo[i][0]}`])
        locationInfo.splice(i, 1);
    }///else{
        //console.log("saved",aquaData[`${locationInfo[i][0]}`])
    //}
}


//Convert latitude and longitude to digital format, Set the longitude west, latitude south to negative values for easier calculations and comparisons.
for(let i=0;i<locationInfo.length;i++){
    locationInfo[i][1][0]=parseFloat(locationInfo[i][1][0])
    if(locationInfo[i][1][1]==="S"){
        locationInfo[i][1][0]=-locationInfo[i][1][0]
    }
    locationInfo[i][1][2]=parseFloat(locationInfo[i][1][2])
    if(locationInfo[i][1][3]==="W"){
        locationInfo[i][1][2]=-locationInfo[i][1][2]
    }
}


//according to the transferred locationInfo，read all DRR/ERR/SRR
//saving them in array "data"
let data={}
for(let i = 0;i < locationInfo.length;i++){
    let datatemp = {}
    let inputFileID = locationInfo[i][0]
    let inputFileName = inputFileID+".input"
    let inputFilePath = `${imputFolderPath}/${inputFileName}`
    //let species=[]
    let tempSpecies
    if (!fs.existsSync(inputFilePath)) {
        //console.log(`${inputFileID}.input does not exist. Skipping...`);
        continue; // Skip to next iteration if file does not exist
    }

    datatemp["ID"] = inputFileID;
    datatemp["lat"] = locationInfo[i][1][0];
    datatemp["long"] = locationInfo[i][1][2];
    datatemp["time"] = locationInfo[i][2];
    //read files
    tempSpecies = fs.readFileSync(inputFilePath,'utf8');
    //convert to array
    tempSpecies = tempSpecies.split('\n');
    //remove the first item and empty last item
    tempSpecies.splice(0, 1);
    removeEmptyLastItem(tempSpecies);
    //console.log(tempSpecies)

    
    //Organize into associative arrays
    let speciesTemp=[]
    for(let j = 0;j < tempSpecies.length;j++){
        let species = {}
        tempSpecies[j] = tempSpecies[j].split('\t');
        //console.log(tempSpecies[j])
        species["name"] = tempSpecies[j][0];
        species["value"] = parseFloat(tempSpecies[j][1]);
        //console.log(species)
        speciesTemp.push(species)
        //console.log(speciesTemp)
        //console.log(datatemp)
    }
    datatemp["species"] = speciesTemp;
        //datatemp["species"].push(species)
    data[`${inputFileID}`] = datatemp
}

//console.log(data)
//shoul be like
//{
//  ...
//DRRxxxxxxx: {
//    ID: 'DRRxxxxxxx',
//    lat: xx.xxxxx,
//    long: xxx.xxxxx,
//    time: 'xxxx-xx-xx ',
//    species: [ [Object], [Object] ]
//  },
//  ...
//}

//Place the data in the corresponding block
let blockSeparatedData = {};
let dataKeys = Object.keys(data);

for(let i = 0;i < dataKeys.length;i++){
    //read sample one by one
    let key = dataKeys[i];
    let sample = data[`${key}`];
    //console.log("--------------------");

    //calculate block name
    //console.log(sample);
    let sampleLat = new BigNumber(sample[`lat`]);
    let sampleLng = new BigNumber(sample[`long`]);
    //console.log("sampleLat",sampleLat.toNumber());
    //console.log("sampleLng",sampleLng.toNumber());
    let blockLatIndex;
    blockLatIndex = (sampleLat.dividedBy(blockSize)).integerValue(BigNumber.ROUND_FLOOR);
    //console.log("blockLatIndex",blockLatIndex.toNumber())
    let blockLngIndex;
    blockLngIndex = (sampleLng.dividedBy(blockSize)).integerValue(BigNumber.ROUND_FLOOR);
    //console.log("blockLngIndex",blockLngIndex.toNumber())
    let blockLat;
    blockLat = (blockLatIndex.times(blockSize).toNumber());
    let blockLng;
    blockLng = (blockLngIndex.times(blockSize).toNumber());
    let blockName;
    blockName = blockLat + "," + blockLng;
   
    if(blockSeparatedData[blockName]){
        //console.log("exist") //if exist
        blockSeparatedData[blockName].push(sample);
    }else{
        //console.log("nonexist") //if not
        blockSeparatedData[blockName] = [];//Initialize to array
        blockSeparatedData[blockName].push(sample);
    }
}

//console.log(blockSeparatedData)
//console.log("blockSize",blockSize.toNumber())


let blockWithSampleKeys = Object.keys(blockSeparatedData);
let blockIndex = [];
for(i=0; i < blockWithSampleKeys.length; i++){
    let blockWithSampleKey = blockWithSampleKeys[i];
    //console.log("----------------");
    //console.log(blockSeparatedData[blockWithSampleKey]);
    //console.log(blockWithSampleKey);
    let blockWithSampleKeySpliced = blockWithSampleKey.split(",");
    let blockWithSampleKeyLat = blockWithSampleKeySpliced[0];
    let blockWithSampleKeyLng = blockWithSampleKeySpliced[1];
    blockIndex.push(blockWithSampleKeySpliced)
    let fileSavingUrl = `${outputbasedir}/layered_data/${lang}/special/${blockWithSampleKeyLat}/${blockWithSampleKeyLng}`
    fs.mkdirSync(`${fileSavingUrl}`, { recursive: true }, (err) => {
        if (err) throw err;
    });
    fs.writeFileSync(`${fileSavingUrl}/samples.json`, JSON.stringify(blockSeparatedData[blockWithSampleKey], null, 2), (err) =>{
        if (err) throw err;
        console.log('Data written to file');
    });

}


blockIndex.sort((a, b) => {
    let latA = new BigNumber(a[0]), latB = new BigNumber(b[0]);
    let lonA = new BigNumber(a[1]), lonB = new BigNumber(b[1]);
    if (!latA.eq(latB)) {
      return latA.comparedTo(latB);
    } else {
      return lonA.comparedTo(lonB);
    }
  });


fs.writeFileSync(`${outputbasedir}/layered_data/${lang}/special/index.json`, JSON.stringify(blockIndex, null, 2), (err) =>{
    if (err) throw err;
    console.log('Data written to file');
});


function removeEmptyLastItem(arr) {
    if (arr.length > 0 && arr[arr.length - 1] === '') {
      arr.pop();
    }
}