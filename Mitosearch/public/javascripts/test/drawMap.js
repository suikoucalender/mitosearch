var radius = 20;

//pie�`���[�g�f�[�^�Z�b�g�p�֐��̐ݒ�
var pie = d3.pie()
    .value(function (d) { return d.value; })
    .sort(null);


//�F�̐ݒ�(scaleOrdinal��Range�Ŏw�肵���F���J��Ԃ��Ďg�p)
var color = d3.scaleOrdinal()
    .range(["#DC3912", "#3366CC", "#109618", "#FF9900", "#990099", "#998889", "#1459AF"]);

function drawMap(sampleDataSet) {
    //�n�}��`�悷��DOM�v�f��I�����A�f�t�H���g�̈ܓx�o�x�A�k�ڂ�ݒ�B
    var map = L.map("map").setView([35.7, 139.7], 5);

    //�n�}�f�[�^�̎擾����Zoom�͈͂�ݒ肷��B
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(map);

    var tmp = d3.select("#tmp");

    //var markers = L.markerClusterGroup();
    var markers = L.markerClusterGroup({ iconCreateFunction: defineClusterIcon });

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius / 3);

    sampleDataSet.forEach(sampleData => {
        var pieInputList = createPieInput(sampleData);
        //pie�`���[�gSVG�v�f�̐ݒ�
        tmp.append("svg").attr("transform", "translate(" + (-1 * radius) + "," + (-1 * radius) + ")").attr("height", 2 * radius).attr("width", 2 * radius)
            .append("g").attr("transform", "translate(" + radius + "," + radius + ")")
            .selectAll(".pie")
            .data(pie(pieInputList))
            .enter()
            .append("g")
            .attr("class", "pie")
            .append("path")
            .attr("d", arc)
            .attr("fill", function (d) { return color(d.index) })
            .attr("opacity", 0.75) //���߂��w�肷��v���p�e�B
            .attr("stroke", "white"); //�A�E�g���C���̐F���w�肷��v���p�e�B
        var myIcon = L.divIcon({ html: tmp.html(), className: 'marker-cluster' });

        tmp.select("svg").remove();

        var marker = L.marker([sampleData.latitude, sampleData.longitude], { icon: myIcon });

        //var popupContent = "<p>date: " + sampleData.date + "<br />";
        //pieInputList.forEach(fishData => {
        //    popupContent = popupContent + fishData.name + ": " + fishData.value.toFixed(2) + "<br />";
        //})
        //popupContent = popupContent + "</p>";

        var popupContent = "<table><tr><td>date</td><td>" + sampleData.date + "</td></tr>";
        pieInputList.forEach(fishData => {
            popupContent = popupContent + "<tr><td>" + fishData.name + "</td><td>" + fishData.value.toFixed(2) + "</td></tr>";
        })
        popupContent = popupContent + "</table>"

        var popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);

        markers.addLayer(marker);
    });

    map.addLayer(markers);

}

function createPieInput(sampleData) {
    var fishData = sampleData["fish"];
    var fishNameList = Object.keys(fishData);
    var pieInputList = [];
    fishNameList.forEach(fishName => {
        var pieInput = { name: fishName, value: fishData[fishName] };
        pieInputList.push(pieInput);
    });

    return pieInputList;
}

function defineClusterIcon(cluster) {
    var children = cluster.getAllChildMarkers();
    var iconRadius = radius + 0.05 * children.length;

    var clusterData = { fish: {} };
    var total = 0;

    children.forEach(child => {
        var sampleData = child._popup._content;
        sampleData = sampleData.split("</tr>");
        for (var i = 1; i < sampleData.length - 1; i++) {
            var fishData = sampleData[i].split("</td><td>");
            var fishName = fishData[0].replace("<tr><td>", "");
            var fishStock = parseFloat(fishData[1].replace("</td>", ""));
            if (fishName in clusterData.fish) {
                clusterData.fish[fishName] += parseFloat(fishStock);
            } else {
                clusterData.fish[fishName] = parseFloat(fishStock);
            }
            total += parseFloat(fishStock);
        }
    })

    var magnification = 100 / total;

    Object.keys(clusterData.fish).forEach(fishName => {
        clusterData.fish[fishName] = clusterData.fish[fishName] * magnification;
    });

    var pieInputList = createPieInput(clusterData);

    var tmp = d3.select("#tmp");

    var arc = d3.arc()
        .outerRadius(iconRadius)
        .innerRadius(iconRadius / 3);

    //pie�`���[�gSVG�v�f�̐ݒ�
    tmp.append("svg").attr("transform", "translate(" + (-1 * iconRadius) + "," + (-1 * iconRadius) + ")").attr("height", iconRadius * 2 + radius).attr("width", iconRadius * 2 + radius)
        .append("g").attr("transform", "translate(" + iconRadius + "," + iconRadius + ")")
        .selectAll(".pie")
        .data(pie(pieInputList))
        .enter()
        .append("g")
        .attr("class", "pie")
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d) { return color(d.index) })
        .attr("opacity", 0.75) //���߂��w�肷��v���p�e�B
        .attr("stroke", "white"); //�A�E�g���C���̐F���w�肷��v���p�e�B

    var myClusterIcon = L.divIcon({
        html: tmp.html(),
        className: 'marker-cluster'
    });

    tmp.select("svg").remove();

    return myClusterIcon;
}

