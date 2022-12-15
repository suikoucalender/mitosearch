var lowerHandle
var upperHandle
var graphChecker

function slidersize(){
    if(graphChecker=="exist"){
        sliderArea.style.display = "block";
        lowerHandleNumber.style.display = "block";
        upperHandleNumber.style.display = "block";
        var graph = document.querySelector("#bargraphAlltime > svg > g > g:nth-child(2)");
        var graphWidth = graph.getBoundingClientRect().width;
        var parent = document.querySelector(".parent");
        parent.style.width = graphWidth + "px"
        parent.style.marginRight = -15 + "px"
    } else {
        sliderArea.style.display = "none";
        lowerHandleNumber.style.display = "none";
        upperHandleNumber.style.display = "none";
    }
}


function timestamp(str){
    return new Date(str).getTime();
}



console.log(sampleDataSet[0]['date'])

function sliderUpdating(){
    if(isMove){return};
    //get min and max value of sample
    var tempdateAll=capturedSampleList[0]['date'];
    var maxTime=tempdateAll;
    var minTime=tempdateAll;
    for (var i=1;i<capturedSampleList.length;i++){
        tempdateAll=capturedSampleList[i]['date']
        if(isNaN(Date.parse(tempdateAll))){
            console.log('date missing '+i)
        }else{
            if (tempdateAll>maxTime){
                maxTime=tempdateAll
            }else if(tempdateAll<minTime){
                minTime=tempdateAll
            }
        }
    }
    var minTimestamp=timestamp(minTime)
    var maxTimestamp=timestamp(maxTime)

    //Update slider
    slider.noUiSlider.updateOptions({
        range: {
            min: minTimestamp,
            max: maxTimestamp
        },
        start: [minTimestamp, maxTimestamp],
    });
}


//get min and max value of slider
var tempdateAll=sampleDataSet[0]['date'];
var maxTime=tempdateAll;
var minTime=tempdateAll;
for (var i=1;i<sampleDataSet.length;i++){
    tempdateAll=sampleDataSet[i]['date']
    if(isNaN(Date.parse(tempdateAll))){
        console.log('date missing '+i)
    }else{
        if (tempdateAll>maxTime){
            maxTime=tempdateAll
        }else if(tempdateAll<minTime){
            minTime=tempdateAll
        }
        console.log(tempdateAll)
    }
}
var minTimestamp=timestamp(minTime)
var maxTimestamp=timestamp(maxTime)
console.log(minTimestamp)
console.log(maxTimestamp)


//create slider
var formatter = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium'
});
noUiSlider.create(slider, {
    start: [minTimestamp, maxTimestamp],
    connect: true,
    range:{
        min: minTimestamp,
        max: maxTimestamp
    },
    step: 7 * 24 * 60 * 60 * 1000,
    format:wNumb({
        decimals: 0
    }),
});

var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];


