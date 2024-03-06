function getBlockSize(ratio){
    let ratioAndBlock = { "2": 45, "3": 30, "4": 15, "5": 5, "6": 3, "7": 2, "8": 1, "9": 0.5, "10": 0.2, "11": 0.1, "12": 0.05, "13": 0.05, "14": 0.02, "15": 0.02, "16": 0.02, "17": 0.01, "18": "special" }
    return ratioAndBlock[ratio]
}

function getTargetBlocks(southWest, northEast, blockSize){

    let leftlong = Decimal.mul(Decimal.floor(Decimal.div(southWest.lng, blockSize)), blockSize)
    let rightlong = Decimal.mul(Decimal.ceil(Decimal.div(northEast.lng, blockSize)), blockSize)
    let lowerlat = Decimal.mul(Decimal.floor(Decimal.div(southWest.lat, blockSize)), blockSize)
    let upperlat = Decimal.mul(Decimal.ceil(Decimal.div(northEast.lat, blockSize)), blockSize)
    if (blockSize > 1) {
        leftlong = Math.floor(southWest.lng / blockSize) * blockSize
        rightlong = Math.ceil(northEast.lng / blockSize) * blockSize
        lowerlat = Math.floor(southWest.lat / blockSize) * blockSize
        upperlat = Math.ceil(northEast.lat / blockSize) * blockSize
    }
    console.log("leftlong, rightlong, lowerlat, upperlat", leftlong, rightlong, lowerlat, upperlat)
    
    //decide the data reading range
    let longStart = Decimal.sub(leftlong, blockSize)
    let longEnd = Decimal.add(rightlong, blockSize)
    let latStart = Decimal.sub(lowerlat, blockSize)
    let latEnd = Decimal.add(upperlat, blockSize)
    if (blockSize > 1) {
        longStart = leftlong - blockSize
        longEnd = rightlong + blockSize
        latStart = lowerlat - blockSize
        latEnd = upperlat + blockSize
    }
    console.log("longStart, longEnd, latStart, latEnd", longStart, longEnd, latStart, latEnd)
    
    //ブロックをすべて列挙する
    let listBlocks = []
    
    for (let x = longStart; x <= longEnd; x = Decimal.add(x, blockSize)) {
    
        let long = x
        //Ensure readings are within range
        //if (long > 180) {
        //    long = Decimal.sub(long, 360)
        //}
        //if (long < -180) {
        //    long = Decimal.add(long, 360)
        //}
    
        for (let y = latStart; y <= latEnd; y = Decimal.add(y, blockSize)) {
            //console.log(x,y)
            let lat = y
            listBlocks.push(lat+"/"+long)
        }
    }
    return listBlocks
    
}

function removeAllPieChart(){
    
    //new added(changed)
    //  Get all pie chart
    let elementsToRemove = document.querySelectorAll('#map .leaflet-marker-icon');
    // And remove all the pie chart, to aviod multiple overlapping drawings
    elementsToRemove.forEach(element => element.remove());
}