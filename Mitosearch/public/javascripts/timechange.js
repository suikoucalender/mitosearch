console.log("=====timechange.js=====")
slider.noUiSlider.on('update', function (values, handle) {
    console.log("bar moving  "+userTimeSettingChecker)
    dateValues[handle].innerHTML = formatter.format(new Date(+values[handle]));
    lowerHandle=document.getElementById('event-start').innerHTML
    upperHandle=document.getElementById('event-end').innerHTML
    if (userTimeSettingChecker){
        userLowerHandleSetting=lowerHandle
        userUpperHandleSetting=upperHandle
        userLowerHandleSettingStamp=timestamp(userLowerHandleSetting);
        userUpperHandleSettingStamp=timestamp(userUpperHandleSetting);
    }
    console.log(userLowerHandleSettingStamp+' '+userLowerHandleSetting)
    console.log(userUpperHandleSettingStamp+' '+userUpperHandleSetting)
    document.getElementById('lowerHandleNumber').innerHTML=lowerHandle
    document.getElementById('upperHandleNumber').innerHTML=upperHandle
    //console.log("RUN updating")
    //getCapturedSampleListChecker=false
    //if(counter<=3){
        //appendScript("javascripts/drawLiddgeLine.js")
    //}else{
        upperHandleStamp=timestamp(upperHandle);
        lowerHandleStamp=timestamp(lowerHandle);
        upperHandleForRange=new Date(upperHandle);
        lowerHandleForRange=new Date(lowerHandle);
        //console.log(upperHandleStamp)
        //console.log(lowerHandleStamp)
        //dateRangeCheker = false
        getCapturedSampleList()
    //}
});

