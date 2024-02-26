//The function of the button: to show or not show each element of the web page
//get button
const helpBtn = document.getElementById("help");
const expansionBtn = document.getElementById("expansion");
const restoreBtn = document.getElementById("restore")
const alltimeBtn = document.getElementById("alltime");
const monthlyBtn = document.getElementById("monthly");
const timeFilterOnBtn = document.getElementById("timeFilterOnBtn")
const timeFilterOffBtn = document.getElementById("timeFilterOffBtn")

//get each element
const taxonomyLegend = document.getElementById("img");
const mapArea = document.getElementById("map");
const liddgeArea = document.getElementById("graph");
const bargraphAlltimeArea = document.getElementById("bargraphAlltime")
const bargraphArea = document.getElementById("bargraph")
const sliderArea = document.getElementById("sliderArea")
const slider = document.getElementById("slider")
const lowerHandleNumber = document.getElementById("lowerHandleNumber")
const upperHandleNumber = document.getElementById("upperHandleNumber")
const graphName = document.getElementById("graphName")

//buttons and elements status
var timeBtnChecker = "alltimeBtn"
var sliderStatusChecker = "non-exist"

//if help button is clicked
helpBtn.addEventListener("click", e => {
    //show [taxonomy legend] display
    taxonomyLegend.style.display = "block";
    //Remove [all buttons, bargraph related elements] display
    helpBtn.style.display = "none";
    liddgeArea.style.display = "none";
    bargraphAlltimeArea.style.display = "none";
    bargraphArea.style.display = "none";
    sliderArea.style.display = "none";
    lowerHandleNumber.style.display = "none";
    upperHandleNumber.style.display = "none";
    graphName.style.display = "none";
    timeFilterOnBtn.style.display = "none"
    timeFilterOffBtn.style.display = "none"
});

//if taxonomy legent is clicked
taxonomyLegend.addEventListener("click", e => {
    //remove [taxonomy legend] disply
    taxonomyLegend.style.display = "none";
    //show  [all buttons, bargraph related elements] disply
    helpBtn.style.display = "block";
    liddgeArea.style.display = "block";
    bargraphAlltimeArea.style.display = "block";
    bargraphArea.style.display = "block";
    //show slider related elements
    sliderDisplay();
});


//if exansion button of map is clicked
expansionBtn.addEventListener("click", e => {
    //change the width of map to 100%
    mapArea.style.width = "100%";
    pointBtn.className="iconPolygon";
    functioncheker="off";
    //remove map
    map.remove();

    //relocd map
    appendScript("javascripts/drawPie.js");

    //remove expansion button
    expansionBtn.style.display = "none";
    //add restore button
    restoreBtn.style.display = "block";
    //remove bargrap related elements
    liddgeArea.style.display = "none";
    bargraphAlltimeArea.style.display = "none";
    bargraphArea.style.display = "none";
    //remove slider related elements
    sliderArea.style.display = "none";
    lowerHandleNumber.style.display = "none";
    upperHandleNumber.style.display = "none";
    graphName.style.display = "none";

    //Determine which button should be removed 
    //based on the slider's display state
    if (sliderStatusChecker=="non-exist"){
        timeFilterOnBtn.style.display="none"
    }else{
        timeFilterOffBtn.style.display="none"
    }

    //Determine which button should be removed 
    //based on the slider's mode
    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display = "none";
    }
    else {
        monthlyBtn.style.display = "none";
    }

});

//if restore button is clicked
restoreBtn.addEventListener("click", e => {
    //set mat width to 40%
    mapArea.style.width = "40%";
    pointBtn.className="iconPolygon";
    functioncheker="off";
    map.remove();

    //reload map
    load_sync_js(["javascripts/drawPie.js", "javascripts/drawLiddgeLine.js"]);

    //remove restore button
    restoreBtn.style.display = "none";
    //show expansion button
    expansionBtn.style.display = "block";
    //show bargraph related button
    liddgeArea.style.display = "block";
    bargraphAlltimeArea.style.display = "block";
    bargraphArea.style.display = "block";

    //Determine which button should be shown
    //based on the slider's display state
    if (sliderStatusChecker=="non-exist"){
        timeFilterOnBtn.style.display="block"
    }else{
        timeFilterOffBtn.style.display="block"
    }

    //Determine which button should be shown
    //based on the slider's mode
    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display = "block";
    }
    else {
        monthlyBtn.style.display = "block";
    }
});


//if all time button is clicked
alltimeBtn.addEventListener("click", e => {
    //change the button state
    timeBtnChecker = "monthlyBtn";
    //reload liddge graph
    appendScript("javascripts/drawLiddgeLine.js");
    //remove alltime button
    alltimeBtn.style.display = "none";
    //show monthly button
    monthlyBtn.style.display = "block";
    //reload slider
    sliderDisplay(); 
});

//if monthly buttion is clicked
monthlyBtn.addEventListener("click", e => {
    //change the button state
    timeBtnChecker = "alltimeBtn";
    //reload liddge graph
    appendScript("javascripts/drawLiddgeLine.js");
    //remove monthly button
    monthlyBtn.style.display = "none";
    //show all time button
    alltimeBtn.style.display = "block";
    //reload slider
    sliderDisplay();
});

//if time filter on button is clicked
timeFilterOnBtn.addEventListener("click", e => {
    //change slider disply state
    sliderStatusChecker = "exist"
    //reload slide, and show it
    sliderUpdating();
    sliderDisplay()
    slidersize();
});

//if time filter of button is clicked
timeFilterOffBtn.addEventListener("click", e => {
    //change slider disply state
    sliderStatusChecker="non-exist"
    //reset the slider
    slider.noUiSlider.reset();
    userTimeSettingChecker=false
    //remove slider related elements
    sliderDisplay()
});