slider.noUiSlider.on('update', function (values, handle) {
    dateValues[handle].innerHTML = formatter.format(new Date(+values[handle]));
    lowerHandle=document.getElementById('event-start').innerHTML
    upperHandle=document.getElementById('event-end').innerHTML
    document.getElementById('lowerHandleNumber').innerHTML=lowerHandle
    document.getElementById('upperHandleNumber').innerHTML=upperHandle
    appendScript("javascripts/drawLiddgeLine.js")
});