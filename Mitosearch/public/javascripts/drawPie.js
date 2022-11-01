//�n�}��`�悷��DOM�v�f��I�����A�f�t�H���g�̈ܓx�o�x�A�k�ڂ�ݒ�B
var map = L.map("map").setView([latitude, longitude], ratio);

//�n�}�f�[�^�̎擾����Zoom�͈͂�ݒ肷��B
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 2, maxZoom: 18 }).addTo(map);

//�~�O���t���ꎞ�I�ɕ`�悷�邽�߂̗̈���擾(���ۂɂ͕\������Ȃ�)
var tmp = d3.select("#tmp");

//MarkerClusterGroup�I�u�W�F�N�g���쐬�B�O���t�̃A�C�R����defineClusterIcon�֐��ŕ`�悷��
var markers = L.markerClusterGroup({ iconCreateFunction: defineClusterIcon });

var radius = 25;

//pie�`���[�g�f�[�^�Z�b�g�p�֐��̐ݒ�
var pie = d3.pie()
    .value(function (d) { return d.value; })
    .sort(null);

sampleDataSet.forEach(sampleData => {
    //�e�T���v���̉~�O���t���`�悳�ꂽ�}�[�J�[�A�C�R�����擾
    var myIcon = drawPieIcon(radius, sampleData);

    var marker1 = L.marker([sampleData.latitude, sampleData.longitude], { icon: myIcon });
    //marker1�������ƒn�}�����̃A�����J�嗤�Ƀ}�[�J�[���}�b�s���O����Ă��܂��̂ŁA���{���E���Ɍ�����A�����J�嗤�ɂ��}�[�J�[���}�b�s���O���鏈��
    var marker2 = L.marker([sampleData.latitude, sampleData.longitude + 360], { icon: myIcon }); 

    //popup�\�����쐬���邽�߂ɉ~�O���t��`��p�f�[�^
    var pieInputList = createPieInput(sampleData);

    //popup�\���Ŏg�p����HTML���쐬
    var popupContent = "<table><tr><td><u>sample</u></td><td><a target='_blank' href='https://www.ncbi.nlm.nih.gov/sra/?term=" + sampleData.sample + "'><u>" + sampleData.sample + "</u></a></td></tr><tr><td><u>date</u></td><td><u>" + sampleData.date + "</u></td></tr>";
    pieInputList.forEach(fishData => {
        popupContent = popupContent + "<tr><td>" + fishData.name + "</td><td>" + fishData.value.toFixed(2) + "</td></tr>";
    })
    popupContent = popupContent + "</table>"

    //tooltip�I�u�W�F�N�g���쐬���A�}�[�J�[�Ƀo�C���h
    marker1.bindTooltip(popupContent, { direction: 'bottom' }).openTooltip();
    marker2.bindTooltip(popupContent, { direction: 'bottom' }).openTooltip();

    //popup�I�u�W�F�N�g���쐬���A�}�[�J�Ƀo�C���h
    var popup = L.popup().setContent(popupContent);
    marker1.bindPopup(popup);
    marker2.bindPopup(popup);

    //�}�[�J�[��MarkerClusterGroup�I�u�W�F�N�g���C���[�ɒǉ�����
    markers.addLayer(marker1);
    markers.addLayer(marker2);

});

markers.on('clustermouseover', function (e) { drawClusterPopup(e) }); 

//MarkerClusterGroup�I�u�W�F�N�g���C���[���}�b�v�I�u�W�F�N�g���C���[�ɒǉ�����
map.addLayer(markers);

redrawPolygon();

//���a�̏��ƃT���v���̃f�[�^�������Ƃ��āA�~�O���t��`�悷��SVG�v�f���L�q���ALeaflet�̃}�[�J�[�A�C�R���Ƃ��ĕԒl����֐��B
function drawPieIcon(radius, sampleData) {
    //�O���t�`��p�̃f�[�^�ɕϊ�
    var pieInputList = createPieInput(sampleData);

    //�~�ʂ�`�悷��
    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius / 3);

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
        .attr("fill", function (d) { return selectColor(d) })
        .attr("opacity", 0.9) //���߂��w�肷��v���p�e�B
        .attr("stroke", "white"); //�A�E�g���C���̐F���w�肷��v���p�e�B

    //�}�[�J�p��divIcon���쐬����B
    var myIcon = L.divIcon({ html: tmp.html(), className: 'marker-cluster' });

    //�ꎞ�`��̈�ɕ`�悵��SVG�v�f���폜
    tmp.select("svg").remove();

    return myIcon;
}

function selectColor(d) {
    var color = d3.scaleLinear()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
        .range(["#ffffff", "#d9d9d9", "#ffde80", "#92d050", "#c7d0b0", "#c39143", "#ff99ff", "#ea8c8c", "#83d3ff"]);
    return color(fishClassifyDataObj[d.data.name]);
}

//�e�T���v���̃f�[�^�������Ɠn�����ƂŃO���t�`��p�̃f�[�^�ɕϊ�����֐�
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

//markerClusterGroup�p�̃A�C�R���̍쐬
function defineClusterIcon(cluster) {
    let { iconRadius, clusterData } = calc_clusterComp(cluster)

    //�N���X�^�[���̋���g���̉~�O���t���`�悳�ꂽ�}�[�J�[�A�C�R�����擾
    var myClusterIcon = drawPieIcon(iconRadius, clusterData);

    return myClusterIcon;
}

function drawClusterPopup(e) {
    let cluster = e.layer;
    let childCount = cluster.getChildCount();
    let clusterComp = calc_clusterComp(cluster).clusterData.fish;
    let clusterCompList = [];
    Object.keys(clusterComp).forEach(fishName => {
        clusterCompList.push({ name: fishName, value: clusterComp[fishName] });
    });
    clusterCompList = object_array_sort(clusterCompList, "value");
    clusterCompList = clusterCompList.slice(0, 20);
    let toolTipContent = "<table><tr><td><u>No. of samples</u></td><td><u>" + childCount + "</u></td></tr>";
    clusterCompList.forEach(clusterCompObj => {
        toolTipContent = toolTipContent + "<tr><td>" + clusterCompObj.name + "</td><td>" + clusterCompObj.value.toFixed(2) + "</td></tr>";
    });
    toolTipContent = toolTipContent + "</table>";
    e.propagatedFrom.bindTooltip(toolTipContent).openTooltip();

}

function calc_clusterComp(cluster) {
    //�N���X�^�[�̎q�v�f���擾
    var children = cluster.getAllChildMarkers();

    //�A�C�R���̔��a���Z�o
    var iconRadius = radius + 0.05 * children.length;

    //�N���X�^�[���̋���g�����W�v(�f�[�^�͊e�T���v����popup����擾���Ă���)
    var clusterData = { fish: {} };
    var total = 0;

    children.forEach(child => {
        var sampleData = child._tooltip._content;
        sampleData = sampleData.split("</tr>");
        for (var i = 2; i < sampleData.length - 1; i++) {
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

    //�g����Total100�ɂȂ�悤�ɒ���
    var magnification = 100 / total;

    Object.keys(clusterData.fish).forEach(fishName => {
        clusterData.fish[fishName] = clusterData.fish[fishName] * magnification;
    });

    return { iconRadius: iconRadius, clusterData: clusterData };
}

function object_array_sort(data, key, order) {
    //�f�t�H�͍~��(DESC)
    var num_a = -1;
    var num_b = 1;

    if (order === 'asc') {//�w�肪����Ώ���(ASC)
        num_a = 1;
        num_b = -1;
    }

    data = data.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        if (x > y) return num_a;
        if (x < y) return num_b;
        return 0;
    });

    return data; // �\�[�g��̔z���Ԃ�
}

function redrawPolygon(){
    if(polygoncheker=="exist"){
        var geoJsonLayer = L.geoJSON(polygonCoordinate).addTo(map);
        geoJsonLayer.eachLayer(function (layer) {
          layer._path.id = 'polygonlayer';
        });
        polygoncheker="exist"
    }
}