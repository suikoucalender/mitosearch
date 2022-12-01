var lowerHandle
var upperHandle


function slidersize(){
    var graph = document.querySelector("#bargraphAlltime > svg > g > g:nth-child(2)");
    var graphWidth = graph.getBoundingClientRect().width;
    var parent = document.querySelector(".parent");
    parent.style.width = graphWidth + "px"
}


function timestamp(str){
    return new Date(str).getTime();
}
console.log(sampleDataSet[0]['date'])
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
    }
}
var minTimestamp=timestamp(minTime)
var maxTimestamp=timestamp(maxTime)
console.log(minTime)
console.log(maxTime)


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
    step: 1,
    format:wNumb({
        decimals: 0
    })
});

var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];


