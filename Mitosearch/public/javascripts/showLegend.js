const helpBtn = document.getElementById("help");
const expansionBtn = document.getElementById("expansion");
const restoreBtn = document.getElementById("restore")
const alltimeBtn = document.getElementById("alltime");
const monthlyBtn = document.getElementById("monthly");

const taxonomyLegend = document.getElementById("img");
const mapArea = document.getElementById("map");
const liddgeArea = document.getElementById("graph");
const bargraphAlltimeArea = document.getElementById("bargraphAlltime")
const bargraphArea = document.getElementById("bargraph")
const sliderArea = document.getElementById("sliderArea")
var timeBtnChecker = "alltimeBtn"


helpBtn.addEventListener("click", e => {
    taxonomyLegend.style.display = "block";
    helpBtn.style.display = "none";
    liddgeArea.style.display = "none";
    bargraphAlltimeArea.style.display = "none";
    bargraphArea.style.display = "none";
    sliderArea.style.display = "none";
});

taxonomyLegend.addEventListener("click", e => {
    taxonomyLegend.style.display = "none";
    helpBtn.style.display = "block";
    liddgeArea.style.display = "block";
    bargraphAlltimeArea.style.display = "block";
    bargraphArea.style.display = "block";
    sliderArea.style.display = "block";
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
    sliderArea.style.display = "block";

    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display = "block";
    }
    else {
        monthlyBtn.style.display = "block";
    }
});


alltimeBtn.addEventListener("click", e => {
    appendScript("javascripts/drawLiddgeLine.js");
    alltimeBtn.style.display = "none";
    monthlyBtn.style.display = "block";
    timeBtnChecker = "monthlyBtn";

});

monthlyBtn.addEventListener("click", e => {
    appendScript("javascripts/drawLiddgeLine.js");
    monthlyBtn.style.display = "none";
    alltimeBtn.style.display = "block";
    timeBtnChecker = "alltimeBtn";
});
