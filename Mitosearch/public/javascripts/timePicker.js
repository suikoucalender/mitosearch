var counter=1
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

function timeTransformer(date){
    var result
    var offset
    if(date.indexOf("Z")!==-1){
        result=date.replace("T"," ")
        result=result.replace("Z","")
        offset=0
        result=new Date(result).getTime()+offset*3600000//+32400000
        result=new Date(result).toUTCString()
    }else if(date.indexOf("+")!==-1){
        result=date.substring(0,date.indexOf("+")-1)
        result=result.replace("T"," ")
        offset=date.substring(date.indexOf("+")+1)
        offset=Number(offset.substring(0,offset.indexOf(":")))
        //+32400000 is changing the time from GMT+9 localtime to UTC time 🌟 think later
        result=new Date(result).getTime()+offset*3600000//+32400000
        result=new Date(result).toUTCString()
    }else if(date.indexOf("-")!==-1){
        result=date.substring(0,date.lastIndexOf("-")-1)
        result=result.replace("T"," ")
        offset=date.substring(date.lastIndexOf("-")+1)
        offset=Number(offset.substring(0,offset.indexOf(":")))
        result=new Date(result).getTime()-offset*3600000//+32400000
        result=new Date(result).toUTCString()
    }
    result=result.toString()
    return result
}

function slidersize(){
    if(graphChecker=="exist"){
        //get width of graph, the caculate the size of slider
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

function sliderUpdating(){
    if(isMove){
        return
    };
    //get min and max value of sample
    if (capturedSampleList.length == 0) {
        return;
    }

    var tempdateAll=sampleDataSet[0]['date'];
    if(tempdateAll.indexOf("T")!==-1){
        tempdateAll=tempdateAll.toString()
        var datetransformed=timeTransformer(tempdateAll)
        tempdateAll=datetransformed
    }
    tempdateAll=Date.parse(tempdateAll)
    //console.log("temdateAll____________"+tempdateAll)
    var maxTimestamp=tempdateAll;
    var minTimestamp=tempdateAll;


for (var i=1;i<sampleDataSet.length;i++){

    tempdateAll=sampleDataSet[i]['date']

    if(tempdateAll.indexOf("T")!==-1){
        tempdateAll=tempdateAll.toString()
        var datetransformed=timeTransformer(tempdateAll)
        tempdateAll=datetransformed
    }
    tempdateAll=Date.parse(tempdateAll)

    if(isNaN(tempdateAll)){
        //console.log('date missing '+i)
    }else{
        if (tempdateAll>=maxTime){
            maxTimestamp=tempdateAll
        }else if(tempdateAll<=minTime){
            minTimestamp=tempdateAll
        }

        var maxTime=new Date(maxTimestamp)
        var minTime=new Date(minTimestamp)

    }

}
    
    maxTimestamp=maxTimestamp+86399000

    
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
}

//get min and max value of slider
var tempdateAll=sampleDataSet[0]['date'];
//Checking time format, if it is zulu time, transform it into the utc time
if(tempdateAll.indexOf("T")!==-1){
    tempdateAll=tempdateAll.toString()
    var datetransformed=timeTransformer(tempdateAll)
    //console.log("changed====="+datetransformed)
    tempdateAll=datetransformed
}
//changing the time to timestamp format
tempdateAll=Date.parse(tempdateAll)
var maxTimestamp=tempdateAll;
var minTimestamp=tempdateAll;



//Iterate through the data to get the maximum and minimum time values
for (var i=1;i<sampleDataSet.length;i++){
    tempdateAll=sampleDataSet[i]['date']
    if(tempdateAll.indexOf("T")!==-1){
        tempdateAll=tempdateAll.toString()
        var datetransformed=timeTransformer(tempdateAll)
        tempdateAll=datetransformed
    }
    tempdateAll=Date.parse(tempdateAll)
    if(isNaN(tempdateAll)){
        //console.log('date missing '+i)
    }else{
        if (tempdateAll>=maxTimestamp){
            maxTimestamp=tempdateAll
        }else if(tempdateAll<=minTimestamp){
            minTimestamp=tempdateAll
        }
        var maxTime=new Date(maxTimestamp)
        var minTime=new Date(minTimestamp)
    }

}

//maximun time value plus 1 day, to prevent error
maxTimestamp=maxTimestamp+86399000




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

