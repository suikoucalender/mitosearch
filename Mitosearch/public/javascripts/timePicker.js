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
    //console.log("RUN slidersize function")
    if(graphChecker=="exist"){
        sliderArea.style.display = "block";
        lowerHandleNumber.style.display = "block";
        upperHandleNumber.style.display = "block";
        var graph = document.querySelector("#bargraphAlltime > svg > g > g:nth-child(2)");
        var graphWidth = graph.getBoundingClientRect().width; //🌟graph没有生成所以没办法读取宽度
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
    console.log("RUN sliderUpdating function")// bug
    if(isMove){
        console.log("moving, CANCELED sliderUpdating")
        return
    };
    //get min and max value of sample
    console.log("1")
    if (capturedSampleList.length == 0) {
        return;
    }
    console.log("2")
    //console.log("captured Sample List")
    //console.log(capturedSampleList)
    var tempdateAll=sampleDataSet[0]['date'];
    if(tempdateAll.indexOf("T")!==-1){
        tempdateAll=tempdateAll.toString()
        var datetransformed=timeTransformer(tempdateAll)
        //console.log("changed====="+datetransformed)
        tempdateAll=datetransformed
    }
    tempdateAll=Date.parse(tempdateAll)
    console.log("temdateAll____________"+tempdateAll)
    var maxTimestamp=tempdateAll;
    var minTimestamp=tempdateAll;


for (var i=1;i<sampleDataSet.length;i++){
    //console.log("_________________uppdate new slider____________________")
    tempdateAll=sampleDataSet[i]['date']
    //console.log("readed date=========="+tempdateAll)
    if(tempdateAll.indexOf("T")!==-1){
        tempdateAll=tempdateAll.toString()
        var datetransformed=timeTransformer(tempdateAll)
        //console.log("changed====="+datetransformed)
        tempdateAll=datetransformed
    }
    tempdateAll=Date.parse(tempdateAll)
    //let dateformatChecker=tempdateAll.indexOf("T")
    //if (dateformatChecker!==-1){
    //    tempdateAll=tempdateAll.substring(0,dateformatChecker)
    //}
    //console.log("tempdateallstamp====="+tempdateAll)
    //console.log("tempdatealldate====="+new Date(tempdateAll))
    if(isNaN(tempdateAll)){
        console.log('date missing '+i)
    }else{
        if (tempdateAll>=maxTime){
            maxTimestamp=tempdateAll
        }else if(tempdateAll<=minTime){
            minTimestamp=tempdateAll
        }
        //console.log(tempdateAll)
        var maxTime=new Date(maxTimestamp)
        var minTime=new Date(minTimestamp)

        //console.log("maxStamp======="+maxTimestamp)
        //console.log("maxTime======="+maxTime)
        //console.log("minStamp======="+minTimestamp)
        //console.log("minTime======="+minTime)
    }

}
    //console.log()
    maxTimestamp=maxTimestamp+86399000
    //if (userTimeSettingChecker){
        //if (userUpperHandleSettingStamp>maxTimestamp){
        //    maxTimestamp=userUpperHandleSettingStamp
        //}
        //if (userLowerHandleSettingStamp<minTimestamp) {
        //    minTimestamp=userLowerHandleSettingStamp
        //}
    //}

    //console.log(maxTimestamp)

    //console.log(minTimestamp)
    //console.log(userLowerHandleSettingStamp+' '+userLowerHandleSetting)
    //console.log(userUpperHandleSettingStamp+' '+userUpperHandleSetting)
    
    //Update slider


    //console.log(document.getElementById("lowerHandleNumberDatePicker").value+"====="+userLowerCalanderSettingStamp)
    //console.log(document.getElementById("upperHandleNumberDatePicker").value+"====="+userUpperCalanderSettingStamp)
    
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
if(tempdateAll.indexOf("T")!==-1){
    tempdateAll=tempdateAll.toString()
    var datetransformed=timeTransformer(tempdateAll)
    //console.log("changed====="+datetransformed)
    tempdateAll=datetransformed
}
tempdateAll=Date.parse(tempdateAll)
var maxTimestamp=tempdateAll;
var minTimestamp=tempdateAll;

for (var i=1;i<sampleDataSet.length;i++){
    //console.log("_________________create new slider____________________")
    tempdateAll=sampleDataSet[i]['date']
    //console.log("readed date=========="+tempdateAll)
    if(tempdateAll.indexOf("T")!==-1){
        tempdateAll=tempdateAll.toString()
        var datetransformed=timeTransformer(tempdateAll)
        //console.log("changed====="+datetransformed)
        tempdateAll=datetransformed
    }
    tempdateAll=Date.parse(tempdateAll)
    //let dateformatChecker=tempdateAll.indexOf("T")
    //if (dateformatChecker!==-1){
    //    tempdateAll=tempdateAll.substring(0,dateformatChecker)
    //}
    //console.log("tempdateallstamp====="+tempdateAll)
    //console.log("tempdatealldate====="+new Date(tempdateAll))
    if(isNaN(tempdateAll)){
        //console.log('date missing '+i)
    }else{
        if (tempdateAll>=maxTimestamp){
            maxTimestamp=tempdateAll
        }else if(tempdateAll<=minTimestamp){
            minTimestamp=tempdateAll
        }
        //console.log(tempdateAll)
        var maxTime=new Date(maxTimestamp)
        var minTime=new Date(minTimestamp)

        //console.log("maxStamp======="+maxTimestamp)
        //console.log("maxTime======="+maxTime)
        //console.log("minStamp======="+minTimestamp)
        //console.log("minTime======="+minTime)
    }

}

maxTimestamp=maxTimestamp+86399000

    //console.log("max======="+maxTimestamp)

    //console.log("mix======="+minTimestamp)



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

