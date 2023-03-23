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

    var lowerHandleFormatChange=lowerHandle.split('/')
    lowerHandleFormatChange=lowerHandleFormatChange.join('-')
    var upperHandleFormatChange=upperHandle.split('/')
    upperHandleFormatChange=upperHandleFormatChange.join('-')
    document.getElementById("lowerHandleNumberDatePicker").value=lowerHandleFormatChange
    document.getElementById("upperHandleNumberDatePicker").value=upperHandleFormatChange

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


document.getElementById("lowerHandleNumberDatePicker").addEventListener("blur", dateChangedByLowerCalander);
document.getElementById("upperHandleNumberDatePicker").addEventListener("blur", dateChangedByUpperCalander);
function dateChangedByLowerCalander() {
    userLowerCalanderSettingStamp=timestamp(document.getElementById("lowerHandleNumberDatePicker").value);
    if (userLowerCalanderSettingStamp<minTimestamp){
        userLowerCalanderSettingStamp=minTimestamp
        var lowerHandleFormatChange=lowerHandle.split('/')
        lowerHandleFormatChange=lowerHandleFormatChange.join('-')
        document.getElementById("lowerHandleNumberDatePicker").value=lowerHandleFormatChange
    }
    userTimeSettingChecker=true
    sliderUpdating()
}
function dateChangedByUpperCalander() {
    userUpperCalanderSettingStamp=timestamp(document.getElementById("upperHandleNumberDatePicker").value);
    if (userUpperCalanderSettingStamp>maxTimestamp){
        userUpperCalanderSettingStamp=maxTimestamp
        var upperHandleFormatChange=upperHandle.split('/')
        upperHandleFormatChange=upperHandleFormatChange.join('-')
        document.getElementById("upperHandleNumberDatePicker").value=upperHandleFormatChange
    }
    userTimeSettingChecker=true
    sliderUpdating()
}