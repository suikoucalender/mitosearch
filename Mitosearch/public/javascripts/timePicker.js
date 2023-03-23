//console.log("=====timePicker.js=====")
var counter=1
//var getCapturedSampleListChecker=true
var lowerHandle
var upperHandle
var graphChecker
var sliderLoadChecker = false
var userTimeSettingChecker=true
var userLowerHandleSetting
var userUpperHandleSetting
var userLowerHandleSettingStamp
var userUpperHandleSettingStamp
var userLowerCalanderSettingStamp
var userUpperCalanderSettingStamp


function slidersize(){
    //console.log("RUN slidersize function")
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
    //console.log("=====finish slidersize=====")
}


function timestamp(str){
    return new Date(str).getTime();
}



function sliderUpdating(){
    console.log("RUN sliderUpdating function")
    if(isMove){
        //console.log("moving, CANCELED sliderUpdating")
        return
    };
    //get min and max value of sample
    if (capturedSampleList.length == 0) {
        return;
    }
    //console.log("captured Sample List")
    //console.log(capturedSampleList)
    var tempdateAll=capturedSampleList[0]['date'];
    var maxTime=tempdateAll;
    var minTime=tempdateAll;
    for (var i=1;i<capturedSampleList.length;i++){
        tempdateAll=capturedSampleList[i]['date']
        if(isNaN(Date.parse(tempdateAll))){
            //console.log('date missing '+i)
        }else{
            if (tempdateAll>maxTime){
                maxTime=tempdateAll
            }else if(tempdateAll<minTime){
                minTime=tempdateAll
            }
        }
    }
    //console.log()
    var minTimestamp=timestamp(minTime)
    var maxTimestamp=timestamp(maxTime)
    maxTimestamp=maxTimestamp+86399000
    //if (userTimeSettingChecker){
        //if (userUpperHandleSettingStamp>maxTimestamp){
        //    maxTimestamp=userUpperHandleSettingStamp
        //}
        //if (userLowerHandleSettingStamp<minTimestamp) {
        //    minTimestamp=userLowerHandleSettingStamp
        //}
    //}
    console.log(maxTime)
    console.log(maxTimestamp)
    console.log(minTime)
    console.log(minTimestamp)
    console.log(userLowerHandleSettingStamp+' '+userLowerHandleSetting)
    console.log(userUpperHandleSettingStamp+' '+userUpperHandleSetting)
    
    //Update slider


    console.log(document.getElementById("lowerHandleNumberDatePicker").value+"====="+userLowerCalanderSettingStamp)
    console.log(document.getElementById("upperHandleNumberDatePicker").value+"====="+userUpperCalanderSettingStamp)
    
    if(document.getElementById("lowerHandleNumberDatePicker").value==""){
        userLowerHandleSettingStamp=minTimestamp
    }else{
        userLowerCalanderSettingStamp=timestamp(document.getElementById("lowerHandleNumberDatePicker").value)
        userLowerHandleSettingStamp=userLowerCalanderSettingStamp
        console.log("lowerCalanderWorked")
    }

    if(document.getElementById("upperHandleNumberDatePicker").value==""){
        userUpperHandleSettingStamp=maxTimestamp
    }else{
        userUpperCalanderSettingStamp=timestamp(document.getElementById("upperHandleNumberDatePicker").value)
        userUpperHandleSettingStamp=userUpperCalanderSettingStamp
        console.log("upperCalanderWorked")
    }
    
    if (userTimeSettingChecker){
        if (userUpperHandleSettingStamp>maxTimestamp){
            maxTimestamp=userUpperHandleSettingStamp
        }
        if (userLowerHandleSettingStamp<minTimestamp) {
            minTimestamp=userLowerHandleSettingStamp
        }
    }
    userTimeSettingChecker=false
    slider.noUiSlider.updateOptions({
        range: {
            min: minTimestamp,
            max: maxTimestamp
        },
        start: [userLowerHandleSettingStamp, userUpperHandleSettingStamp],
    });

    userTimeSettingChecker=true
    sliderLoadChecker=true
    //console.log("=====finish sliderUpdating=====")
}

//get min and max value of slider
var tempdateAll=sampleDataSet[0]['date'];
var maxTime=tempdateAll;
var minTime=tempdateAll;
for (var i=1;i<sampleDataSet.length;i++){
    tempdateAll=sampleDataSet[i]['date']
    let dateformatChecker=tempdateAll.indexOf("T")
    if (dateformatChecker!==-1){
        tempdateAll=tempdateAll.substring(0,dateformatChecker)
    }
    if(isNaN(Date.parse(tempdateAll))){
        console.log('date missing '+i)
    }else{
        if (tempdateAll>=maxTime){
            maxTime=tempdateAll
        }else if(tempdateAll<=minTime){
            minTime=tempdateAll
        }
        //console.log(tempdateAll)
    }
}
var minTimestamp=timestamp(minTime)
var maxTimestamp=timestamp(maxTime)
maxTimestamp=maxTimestamp+86399000
    console.log(maxTime)
    console.log(maxTimestamp)
    console.log(minTime)
    console.log(minTimestamp)



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
    step: 1 * 24 * 60 * 60 * 1000,
    behaviour: 'tap',
    format:wNumb({
        decimals: 0
    }),
});

var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];

sliderLoadChecker=true;

