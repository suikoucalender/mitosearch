slider.noUiSlider.on('update', function (values, handle) {
    //read the date from the slider
    dateValues[handle].innerHTML = formatter.format(new Date(+values[handle]));
    lowerHandle=document.getElementById('event-start').innerHTML
    upperHandle=document.getElementById('event-end').innerHTML
    //if bar moved, time information change
    if (userTimeSettingChecker){
        userLowerHandleSetting=lowerHandle
        userUpperHandleSetting=upperHandle
        userLowerHandleSettingStamp=timestamp(userLowerHandleSetting);
        userUpperHandleSettingStamp=timestamp(userUpperHandleSetting);
    }
    //change the date label on the webpage
    document.getElementById('lowerHandleNumber').innerHTML=lowerHandle
    document.getElementById('upperHandleNumber').innerHTML=upperHandle
    
    //change date format
    var lowerHandleFormatChange=lowerHandle.split('/')
    lowerHandleFormatChange=lowerHandleFormatChange.join('-')
    var upperHandleFormatChange=upperHandle.split('/')
    upperHandleFormatChange=upperHandleFormatChange.join('-')
    document.getElementById("lowerHandleNumberDatePicker").value=lowerHandleFormatChange
    document.getElementById("upperHandleNumberDatePicker").value=upperHandleFormatChange

    upperHandleStamp=timestamp(upperHandle);
    lowerHandleStamp=timestamp(lowerHandle);
    upperHandleForRange=new Date(upperHandle);
    lowerHandleForRange=new Date(lowerHandle);
    //Retrieve new data and plot
    //getCapturedSampleList()
});


//change the slider with bar
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