function iconLocation() {
    //read the elements
    var helpBtn = document.getElementById("help");
    var expansionBtn = document.getElementById("expansion");
    var restoreBtn = document.getElementById("restore");
    var alltimeBtn = document.getElementById("alltime");
    var monthlyBtn = document.getElementById("monthly");
    var undoBtn = document.getElementById("undo");
    var pointBtn = document.getElementById("point");

    var map = document.getElementById("map");
    var graph = document.getElementById("graph");



    //get the position and size of map and graph
    var mapTop = map.offsetTop;
    var mapLeft = map.offsetLeft;
    var mapWidth = map.offsetWidth;
    var mapHeight = map.offsetHeight;
    var graphLeft = graph.offsetLeft;
    var graphWidth = graph.offsetWidth;

    var iconTop = mapTop + 30
        //0.02 * mapHeight;
    helpBtn.style.top = iconTop + "px";
    expansionBtn.style.top = iconTop + "px";
    restoreBtn.style.top = iconTop + "px";
    alltimeBtn.style.top = iconTop + "px";
    monthlyBtn.style.top = iconTop + "px";


    var helpLeft = mapLeft + 50;
    helpBtn.style.left = helpLeft + "px";

    var pointLeft= mapLeft + 10;
    pointBtn.style.left = pointLeft + "px";
    var pointTop = mapTop + 80;
    pointBtn.style.top = pointTop + "px";


    var undoLeft= mapLeft + 10;
    undoBtn.style.left = undoLeft + "px";
    var undoTop = pointTop + 40;
    undoBtn.style.top = undoTop + "px";


    //adjust the expention icon position with the map expansion, prevent icon position errors caused by window size changes
    var triger = window.innerWidth - 2 * mapWidth
    if (triger > 1) {
        var expensionLeft = mapLeft + mapWidth - 70;
        expansionBtn.style.left = expensionLeft + "px";
    } else {
        var expensionLeft = mapLeft + 0.37 * window.innerWidth - 50;
        expansionBtn.style.left = expensionLeft + "px";
    }
    mapWidth = map.offsetWidth;
    var restoreLeft = window.innerWidth - mapLeft - 80
    restoreBtn.style.left = restoreLeft + "px";
    var alltimeLeft = graphLeft + 0.90 * graphWidth;
    alltimeBtn.style.left = alltimeLeft + "px";
    var monthlyLeft = graphLeft + 0.90 * graphWidth;
    monthlyBtn.style.left = monthlyLeft + "px";
};

//decide icons' position when all content loaded
window.addEventListener("load", function () {
    iconLocation();
});



//dicide icons' position when window size changed
window.addEventListener('resize', function () {
    iconLocation();
});

