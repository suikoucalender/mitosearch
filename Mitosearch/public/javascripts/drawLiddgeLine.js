//window.onload = getCapturedSampleList;
getCapturedSampleList();
map.on("move", getCapturedSampleList);

//�L���v�`���G���A���̃T���v���̑g�����擾
function getCapturedSampleList() {
    //�}�b�v�̈ړ��E�g��E�k������4���̈ܓx�o�x���擾
    var bounds = map.getBounds();
    var north = bounds._northEast.lat;
    var south = bounds._southWest.lat;
    var east = bounds._northEast.lng;
    var west = bounds._southWest.lng;

    //�L���v�`���G���A���̃T���v�������擾
    let capturedSampleList = [];

    sampleDataSet.forEach(sampleData => {
        if (south < sampleData.latitude && sampleData.latitude < north) {
            //���{�̍��E�̃A�����J�嗤�����Ƀ}�[�J�[��\�����邽�߁A�d�����ă}�[�J�[��`�悵�Ă��邱�Ƃɒ���
            if ((west < sampleData.longitude && sampleData.longitude < east) || (west < sampleData.longitude + 360 && sampleData.longitude + 360 < east)) {
                capturedSampleList.push(sampleData);
            }
        }
    })

    drawLiddgeLine(capturedSampleList);
}

function drawLiddgeLine(capturedSampleList) {
    var dateList = [];
    var fishList = [];
    var densityList = [];
    const changeRidgeGraph = document.getElementById("changeRidgeGraph");

    //svg�^�O��ǉ����A���ƍ�����ݒ�
    var graph = d3.select("#graph");

    //�T���v�������݂��Ȃ��Ƃ��́A�O���t��`�悵�Ȃ�
    if (capturedSampleList.length == 0) {
        //svg�^�O���폜
        graph.select("svg").remove();
        return;
    } 

    //���탊�X�g�Ɠ��t�̃��X�g���擾
    capturedSampleList.forEach(sampleData => {
        if (isInvalidDate(sampleData.date)) {
            return;
        }
        dateList.push(sampleData.date);
        fishList = fishList.concat(Object.keys(sampleData.fish));
    });

    if (dateList.length == 0) {
        //svg�^�O���폜
        graph.select("svg").remove();
        return;
    }

    //���t���X�g�̗v�f��ϏW�����Ƃ�B
    dateList = Array.from(new Set(dateList));

    //���탊�X�g�̐ϏW�����Ƃ�B
    fishList = Array.from(new Set(fishList));

    //���t�̏����Ƀ\�[�g����
    dateList.sort(function (a, b) {
        return (a > b ? 1 : -1);
    });

    //���X�g���̍ő�E�ŏ��̓��t���擾
    var minDate = new Date(dateList[0]);
    var maxDate = new Date(dateList[dateList.length - 1]);

    //x���̒[�_�̓��t���擾
    var scaleMax = new Date("2017-12-31");
    var scaleMin = new Date("2016-12-01");

    if (changeRidgeGraph.classList.value == "monthly") {
        scaleMax = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
        scaleMin = new Date(minDate.setMonth(minDate.getMonth() - 1));
    }

    //���킲�ƂɃf�[�^���쐬
    fishList.forEach(fishName => {
        //�g���f�[�^�̃��X�g���쐬
        var compList = [];

        //���킲�Ƃ̃I�u�W�F�N�g���쐬
        var undef = [null, null];
        var densityOfMonth = [undef, undef, undef, undef, undef, undef, undef, undef, undef, undef, undef, undef];
        var densityData = { fish: fishName, density: [] };

        //�O���t�̍����[�_�̃f�[�^��ǉ�
        densityData.density.push([scaleMin, 0]);

        console.log(changeRidgeGraph.classList.value);
        //������or���t���ƂɃf�[�^���쐬
        if (changeRidgeGraph.classList.value == "alltime") {
            dateList.forEach(date => {
                var i = 0;
                var date2 = new Date(date);
                var date2month = date2.getMonth() + 1;
                var date2monthstr = String(date2month);
                if (date2monthstr.length == 1)
                    date2monthstr = "0" + date2monthstr;

                var newdate = "2017-" + String(date2.getMonth() + 1) + "-01";
                var newdate2 = new Date(newdate);
                var densityOfDate = [newdate2, 0];

                capturedSampleList.forEach(sampleData => {
                    if (date2monthstr == sampleData.date.substr(5, 2)) {
                        i++;
                        if (fishName in sampleData.fish) {
                            densityOfDate[1] += sampleData.fish[fishName];
                        }
                    }
                })
                densityOfDate[1] = densityOfDate[1] / i;
                compList.push(densityOfDate[1]);
                densityOfMonth[date2month] = densityOfDate;
            })

            var deleteindex = [];
            for (var i = 0; i < densityOfMonth.length; i++) {
                if (densityOfMonth[i][0] == null)
                    deleteindex.push(i);
            }
            for (var i = deleteindex.length - 1; i >= 0; i--) {
                densityOfMonth.splice(deleteindex[i], 1);
            }

            densityData = { fish: fishName, density: densityOfMonth };

            //�O���t�̗����[�_�̃f�[�^���쐬
            densityData.density.unshift([new Date("2016-12-01"), 0]);
            densityData.density.push([new Date("2018-01-01"), 0]);
        }
        else if (changeRidgeGraph.classList.value == "monthly") {
            dateList.forEach(date => {
                var i = 0;
                var densityOfDate = [new Date(date), 0];
                capturedSampleList.forEach(sampleData => {
                    if (date == sampleData.date) {
                        i++;
                        if (fishName in sampleData.fish) {
                            densityOfDate[1] += sampleData.fish[fishName];
                        }
                    }
                })
                densityOfDate[1] = densityOfDate[1] / i;
                compList.push(densityOfDate[1]);
                densityData.density.push(densityOfDate);
            })
            densityData.density.push([scaleMax, 0]);
        }


        //�g���̍ő�l���擾
        var maxComp = Math.max.apply(null, compList);

        //�f�[�^�̍ő�l��40�ɂȂ�悤�ɒ���
        densityData.density = densityData.density.map(data => { return [data[0], data[1] * (40 / maxComp)] })

        //�g���̍ő�l�̏����i�[
        densityData["max"] = maxComp;

        //�f�[�^��ǉ�
        densityList.push(densityData);
    });

    //�O���t�`��p���X�g��Max�Ń\�[�g
    densityList = object_array_sort(densityList, "max");

    //���탊�X�g���\�[�g
    fishList = densityList.map(densityData => {
        return densityData.fish;
    });

    //�O���t�S�̂̃T�C�Y�ƃ}�[�W����ݒ�
    var margin = { top: 100, right: 10, bottom: 30, left: 250 },
        width = 1000 - margin.left - margin.right,
        height = 40 * fishList.length;

    //svg�^�O���폜
    graph.select("svg").remove();

    var svg = graph.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //x���̃X�P�[�����쐬
    var xScale = d3.scaleTime()
        .domain([scaleMin,scaleMax])
        .range([0, width]);

    //x����ǉ�����
    if (changeRidgeGraph.classList.value == "alltime") {
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(
                d3.axisTop(xScale)
                    .tickFormat(d3.timeFormat("%B"))
            )
    }
    else{
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(
                d3.axisTop(xScale)
                    .tickFormat(d3.timeFormat("%y/%m"))
            )
    }

    //y���̃X�P�[�����쐬����
    var fishScale = d3.scaleBand()
        .domain(fishList)
        .range([0, height]);

    //y����ǉ�����
    svg.append("g")
        .attr("transform", "translate(0, 0)")
        .call(d3.axisLeft(fishScale));

    //�����������̒������擾
    var betweenlen;

    if (fishList.length > 1) {
        betweenlen = fishScale(fishList[1]) / 2;
    } else {
        betweenlen = height / 2;
    }

    //Riddge�O���t���쐬����
    svg.selectAll("area")
        .data(densityList)
        .enter()
        .append("path")
        .attr("transform", function (d) { return ("translate(0," + (fishScale(d.fish) + betweenlen) + ")") })
        .attr("fill", function (d) { return "rgb(255,255," + ((100 - d.max) * 2) + ")" })
        .datum(function (d) { return d.density })
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            //.curve(d3.curveBasis)
            .curve(d3.curveMonotoneX)
            .x(function (d) { return xScale(d[0]); })
            .y(function (d) { return (- d[1]); })
    )

    drawScale()

    window.addEventListener("scroll", function () {
        drawScale();
    })

    window.addEventListener("onresize", function () {
        drawScale();
    })

    function drawScale() {
        //x����ǉ�����
        d3.select(".xaxis").remove();

        if (changeRidgeGraph.classList.value == "alltime") {
            svg.append("g")
                .attr("class", "xaxis")
                .attr("transform", "translate(0," + ($(window).scrollTop()) + ")")
                .call(
                    d3.axisTop(xScale)
                        .tickFormat(d3.timeFormat("%B"))
                )
        }
        else{
            svg.append("g")
                .attr("class", "xaxis")
                .attr("transform", "translate(0," + ($(window).scrollTop()) + ")")
                .call(
                    d3.axisTop(xScale)
                        .tickFormat(d3.timeFormat("%y/%m"))
                )
        }
    }

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

function isInvalidDate(date) {
    return Number.isNaN(new Date(date).getTime());
}


