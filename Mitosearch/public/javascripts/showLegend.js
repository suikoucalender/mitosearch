console.log("=====showLegend.js=====")
const helpBtn = document.getElementById("help");
const expansionBtn = document.getElementById("expansion");
const restoreBtn = document.getElementById("restore")
const alltimeBtn = document.getElementById("alltime");
const monthlyBtn = document.getElementById("monthly");
const timeFilterOnBtn = document.getElementById("timeFilterOnBtn")
const timeFilterOffBtn = document.getElementById("timeFilterOffBtn")

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

var timeBtnChecker = "alltimeBtn"
var sliderStatusChecker = "non-exist"


helpBtn.addEventListener("click", e => {
    taxonomyLegend.style.display = "block";
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

taxonomyLegend.addEventListener("click", e => {
    taxonomyLegend.style.display = "none";
    helpBtn.style.display = "block";
    liddgeArea.style.display = "block";
    bargraphAlltimeArea.style.display = "block";
    bargraphArea.style.display = "block";
    //sliderArea.style.display = "block";
    //lowerHandleNumber.style.display = "block";
    //upperHandleNumber.style.display = "block";
    //graphName.style.display = "block";
    //timeFilterOnBtn.style.display = "block"
    //timeFilterOffBtn.style.display = "block"
    sliderDisplay();
});



expansionBtn.addEventListener("click", e => {
    mapArea.style.width = "100%";
    pointBtn.className="iconPolygon";
    functioncheker="off";
    //liddgeArea.style.display = "none";
    //changeRidgeGraph.style.display = "none";

    map.remove();

    appendScript("javascripts/drawPie.js");

    expansionBtn.style.display = "none";
    restoreBtn.style.display = "block";
    liddgeArea.style.display = "none";
    bargraphAlltimeArea.style.display = "none";
    bargraphArea.style.display = "none";
    sliderArea.style.display = "none";
    lowerHandleNumber.style.display = "none";
    upperHandleNumber.style.display = "none";
    graphName.style.display = "none";

    if (sliderStatusChecker=="non-exist"){
        timeFilterOnBtn.style.display="none"
    }else{
        timeFilterOffBtn.style.display="none"
    }


    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display = "none";
    }
    else {
        monthlyBtn.style.display = "none";
    }

});

restoreBtn.addEventListener("click", e => {
    mapArea.style.width = "40%";
    pointBtn.className="iconPolygon";
    functioncheker="off";
    //liddgeArea.style.display = "block";
    //changeRidgeGraph.style.display = "block";

    map.remove();

    load_sync_js(["javascripts/drawPie.js", "javascripts/drawLiddgeLine.js"]);
    //appendScript("javascripts/drawPie.js");
    //appendScript("javascripts/drawLiddgeLine.js");

    restoreBtn.style.display = "none";
    expansionBtn.style.display = "block";
    liddgeArea.style.display = "block";
    bargraphAlltimeArea.style.display = "block";
    bargraphArea.style.display = "block";
    //sliderArea.style.display = "block";
    //lowerHandleNumber.style.display = "block";
    //upperHandleNumber.style.display = "block";
    //graphName.style.display = "block";

    if (sliderStatusChecker=="non-exist"){
        timeFilterOnBtn.style.display="block"
    }else{
        timeFilterOffBtn.style.display="block"
    }

    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display = "block";
    }
    else {
        monthlyBtn.style.display = "block";
    }
});


alltimeBtn.addEventListener("click", e => {
    timeBtnChecker = "monthlyBtn";
    //getCapturedSampleList()
    appendScript("javascripts/drawLiddgeLine.js");
    alltimeBtn.style.display = "none";
    monthlyBtn.style.display = "block";
    sliderDisplay();
    
});

monthlyBtn.addEventListener("click", e => {
    timeBtnChecker = "alltimeBtn";
    //getCapturedSampleList()
    appendScript("javascripts/drawLiddgeLine.js");
    monthlyBtn.style.display = "none";
    alltimeBtn.style.display = "block";
    sliderDisplay();
    
});


timeFilterOnBtn.addEventListener("click", e => {
    //timeFilterOnBtn.style.display = "none";
    //timeFilterOffBtn.style.display = "block";
    //if (timeBtnChecker=="monthlyBtn"){
    //    bargraphArea.style.display = "none";
    //}else if (timeBtnChecker=="alltimeBtn"){
    //    bargraphArea.style.display = "block";
    //}
    //bargraphAlltimeArea.style.display = "block"
    //sliderArea.style.display = "block";
    //lowerHandleNumber.style.display = "block";
    //upperHandleNumber.style.display = "block";
    sliderStatusChecker = "exist"
    sliderUpdating();
    sliderDisplay()
    slidersize();
});

timeFilterOffBtn.addEventListener("click", e => {
    //timeFilterOnBtn.style.display = "block";
    //timeFilterOffBtn.style.display = "none";
    sliderStatusChecker="non-exist"
    slider.noUiSlider.reset();
    userTimeSettingChecker=false
    sliderDisplay()
});