$(function () {
    $('.test-select2').select2({
        language: "ja"
    });
})

$("#button").click(function () {
    let fishList = $("#filter").val().join(" ,");
    fishList = fishList + " ,";
    console.log(fishList)
    $.ajax({
        type: "POST",
        data: { fishList: fishList },
        dataType: "text"
    })
    .done(function (res) {
        res = JSON.parse(res);
        sampleDataSet = res.new_sampleDataObjList;
        console.log(sampleDataSet)
        fishClassifyDataObj = res.new_fishClassifyDataObj;
        console.log(fishClassifyDataObj)
        map.remove();

        //appendScript("javascripts/drawPie.js");
        //appendScript("javascripts/drawLiddgeLine.js");

        load_sync_js(["javascripts/drawPie.js", "javascripts/drawLiddgeLine.js"]);

    })
})

function load_sync_js(src_list) {
    var rootScript = _create_script(src_list[0]);
    var s = rootScript;
    var body = document.getElementsByTagName('body')[0];
    for (var i = 0; i < src_list.length; i++) {
        if (i + 1 >= src_list.length) break;
        var nextScript = _create_script(src_list[i + 1]);
        s.onload = function () {
            if (s.initialized) return;
            s.initialized = true;
            body.appendChild(nextScript);
        };
        s.onreadystatechange = function () {
            if (s.initialized) return;
            if (s.readyState == 'complete') {
                s.initialized = true;
                body.appendChild(nextScript);
            }
        };
        s = nextScript;
    }
    body.appendChild(rootScript);
}
function _create_script(src) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.initialized = false;
    return s;
}


function appendScript(URL) {
    var el = document.createElement('script');
    el.src = URL;
    document.body.appendChild(el);
};
