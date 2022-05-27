const taxonomyShowBtn = document.getElementById("taxonomyShow");
const hideBtn = document.getElementById("hideRiddgeLine");

const taxonomyLegend = document.getElementById("img");
const mapArea = document.getElementById("map");
const liddgeArea = document.getElementById("graph");
const changeRidgeGraph = document.getElementById("changeRidgeGraph");

taxonomyShowBtn.addEventListener("click", e => {
    taxonomyLegend.style.display = "block";
})

taxonomyLegend.addEventListener("click", e => {
    taxonomyLegend.style.display = "none";
});


hideBtn.addEventListener("click", e => {
    if (hideBtn.classList.value == "hide") {
        mapArea.style.width = "100%";
        //liddgeArea.style.display = "none";
        //changeRidgeGraph.style.display = "none";

        map.remove();

        appendScript("javascripts/drawPie.js");

        hideBtn.classList.remove("hide");
        hideBtn.classList.add("show");

        hideBtn.textContent = "Show Liddge Line";

    } else if (hideBtn.classList.value == "show") {
        mapArea.style.width = "40%";
        //liddgeArea.style.display = "block"; 
        //changeRidgeGraph.style.display = "block";

        map.remove();

        load_sync_js(["javascripts/drawPie.js", "javascripts/drawLiddgeLine.js"]);
        //appendScript("javascripts/drawPie.js");
        //appendScript("javascripts/drawLiddgeLine.js");

        hideBtn.classList.remove("show");
        hideBtn.classList.add("hide");

        hideBtn.textContent = "Hide Liddge Line";
    }
});

changeRidgeGraph.addEventListener("click", e => {
    if (changeRidgeGraph.classList.value == "alltime") {
        changeRidgeGraph.classList.remove("alltime");
        changeRidgeGraph.classList.add("monthly");

        appendScript("javascripts/drawLiddgeLine.js");

        changeRidgeGraph.textContent = "All time ---> Monthly";
    }
    else if (changeRidgeGraph.classList.value == "monthly") {
        changeRidgeGraph.classList.remove("monthly");
        changeRidgeGraph.classList.add("alltime");

        appendScript("javascripts/drawLiddgeLine.js");

        changeRidgeGraph.textContent = "Monthly ---> All time";
    }
})