const helpBtn = document.getElementById("help");
const expansionBtn = document.getElementById("expansion");
const restoreBtn = document.getElementById("restore")
const alltimeBtn = document.getElementById("alltime");
const monthlyBtn = document.getElementById("monthly");

const taxonomyLegend = document.getElementById("img");
const mapArea = document.getElementById("map");
const liddgeArea = document.getElementById("graph");
var timeBtnChecker = "alltimeBtn"


helpBtn.addEventListener("click", e => {
    taxonomyLegend.style.display = "block";
    helpBtn.style.display = "none";
    liddgeArea.style.display = "none";
});

taxonomyLegend.addEventListener("click", e => {
    taxonomyLegend.style.display = "none";
    helpBtn.style.display = "block";
    liddgeArea.style.display = "block";
});



expansionBtn.addEventListener("click", e => {
    mapArea.style.width = "100%";
    //liddgeArea.style.display = "none";
    //changeRidgeGraph.style.display = "none";

    map.remove();

    appendScript("javascripts/drawPie.js");

    expansionBtn.style.display = "none"
    restoreBtn.style.display = "block"
    liddgeArea.style.display = "none";

    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display == "none"
    }
    else {
        monthlyBtn.style.display == "none"
    }
});

restoreBtn.addEventListener("click", e => {
    mapArea.style.width = "40%";
    //liddgeArea.style.display = "block";
    //changeRidgeGraph.style.display = "block";

    map.remove();

    load_sync_js(["javascripts/drawPie.js", "javascripts/drawLiddgeLine.js"]);
    //appendScript("javascripts/drawPie.js");
    //appendScript("javascripts/drawLiddgeLine.js");

    restoreBtn.style.display = "none"
    expansionBtn.style.display = "block"
    liddgeArea.style.display = "block";

    if (timeBtnChecker == "alltimeBtn") {
        alltimeBtn.style.display == "block"
    }
    else {
        monthlyBtn.style.display == "block"
    }
});


alltimeBtn.addEventListener("click", e => {
    appendScript("javascripts/drawLiddgeLineWithIcon.js");
    alltimeBtn.style.display = "none"
    monthlyBtn.style.display = "block"
    timeBtnChecker == "monthlyBtn"

});

monthlyBtn.addEventListener("click", e => {
    appendScript("javascripts/drawLiddgeLineWithIcon.js");
    monthlyBtn.style.display = "none";
    alltimeBtn.style.display = "block"
    timeBtnChecker == "alltimeBtn"
});

