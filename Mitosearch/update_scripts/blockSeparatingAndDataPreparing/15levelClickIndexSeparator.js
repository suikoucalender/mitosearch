const fs = require('fs');
const path = require('path');
//const Decimal = require('./decimal.js')
const BigNumber = require('../../public/bignumber.js/bignumber.js');
BigNumber.config({
    DECIMAL_PLACES: 50,                // 小数部50桁
    ROUNDING_MODE: BigNumber.ROUND_HALF_UP // 四捨五入
});


const args = process.argv.slice(2)
let blockSize = new BigNumber(args[0]);
let lang = args[1]
const outputbasedir = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "public"

//read index files
let groupedList=fs.readFileSync(`${outputbasedir}/layered_data/${lang}/special/aGroupedDataList.json`)
groupedList=JSON.parse(groupedList)
let keys=Object.keys(groupedList)
//console.log(keys)

let indexSave={}
keys.forEach(key => {
    console.log("key: ", key)
    let keysplit = key.split(",")
    let keylat=new BigNumber(keysplit[0])
    let keylng=new BigNumber(keysplit[1])
    let blocklat=getBlockStartCoord(keylat,blockSize,"lat")
    let blocklng=getBlockStartCoord(keylng,blockSize,"lng")
    let block=`${blocklat},${blocklng}`
    console.log(block)
    if((block in indexSave)===false){
        indexSave[block]=[]
    }
    let temp={}
    temp[key]=groupedList[key]
    indexSave[block].push(temp)
});
//console.log(indexSave)
//let indexSaveJSON=JSON.stringify(indexSave,null,2);
//fs.writeFileSync('new/special/aindexSave.json',indexSaveJSON)
if (fs.existsSync(`${outputbasedir}/layered_data/${lang}/special/index`)===false) {
    fs.mkdirSync(`${outputbasedir}/layered_data/${lang}/special/index`)
} 
//separating the index file according to the block coordinate.
let indexkeys=Object.keys(indexSave)
indexkeys.forEach(indexkey =>{
    let SaveTemp=indexSave[indexkey]
    let SaveTempJSON=JSON.stringify(SaveTemp,null,2)
    //console.log(SaveTempJSON)
    fs.writeFileSync(`${outputbasedir}/layered_data/${lang}/special/index/${indexkey}.json`,SaveTempJSON)
});



function getBlockStartCoord(coordinate, blockSize, latORlng) {
    let cons
    if (latORlng==="lat"){
        cons=new BigNumber(90)
    }else if(latORlng==="lng"){
        cons=new BigNumber(180)
    }
    // Convert latitude and longitude into positive ranges to facilitate calculations
    let offsetFromMin = coordinate.plus(cons)
    // Calculate the number of blocks
    let blockNumber = bigNumberValue.integerValue((offsetFromMin.dividedBy(blockSize)).ROUND_FLOOR)
    // Calculates and returns the starting coordinates of the block
    return (blockNumber.multipliedBy(blockSize)).minus(cons)
}