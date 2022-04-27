function draw_gragh(response){
    var fishcomp = response;

    var dateList = [];
    var fishList = [];
    var densityList = [];

    //���탊�X�g�Ɠ��t�̃��X�g���擾
    fishcomp.forEach(data => {
        dateList.push(data.date);
        fishList = fishList.concat(Object.keys(data.fish));
    });

    //���t���X�g�̗v�f��ϏW�����Ƃ�B
    dateList = Array.from(new Set(dateList));

    //���탊�X�g�̐ϏW�����Ƃ�B
    fishList = Array.from(new Set(fishList));

    //���t�̏����Ƀ\�[�g����
    dateList.sort(function(a,b){
        return (a > b ? 1 : -1);
    });

    //���X�g���̍ő�E�ŏ��̓��t���擾
    var minDate = new Date(dateList[0]);
    var maxDate = new Date(dateList[dateList.length - 1]);

    //x���̒[�_�̓��t���擾
    var scaleMax = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
    var scaleMin = new Date(minDate.setMonth(minDate.getMonth() - 1));

    //���킲�ƂɃf�[�^���쐬
    fishList.forEach(fishName => {
        //�g���f�[�^�̃��X�g���쐬
        var compList = [];

        //���킲�Ƃ̃I�u�W�F�N�g���쐬
        var densityData = {fish: fishName, density: []};

        //�O���t�̍����[�_�̃f�[�^��ǉ�
        densityData.density.push([scaleMin,0]);

        //���t���ƂɃf�[�^���쐬
        dateList.forEach(date => {
            var i = 0;
            var densityOfDate = [new Date(date), 0];
            fishcomp.forEach(sample => {
                if (date == sample.date) {
                    i++;
                    if (fishName in sample.fish) {
                        densityOfDate[1] += sample.fish[fishName];
                    } 
                }
            })
            densityOfDate[1] = densityOfDate[1] / i;
            compList.push(densityOfDate[1]);
            densityData.density.push(densityOfDate);
        })

        //�O���t�̉E���[�_�̃f�[�^���쐬
        densityData.density.push([scaleMax,0]);

        //�g���̍ő�l���擾
        var maxComp = Math.max.apply(null,compList);

        //�f�[�^�̍ő�l��50�ɂȂ�悤�ɒ���
        densityData.density = densityData.density.map(data => {return [data[0], data[1] * (40 / maxComp)]})

        //�g���̍ő�l�̏����i�[
        densityData["max"] = maxComp;

        //�f�[�^��ǉ�
        densityList.push(densityData);
    });

    //�O���t�`��p���X�g��Max�Ń\�[�g
    densityList = object_array_sort(densityList, "max");
    console.log(densityList);

    //���탊�X�g���\�[�g
    fishList = densityList.map(densityData => {
        return densityData.fish;
    });

    //�O���t�T�C�Y�ƃ}�[�W����ݒ�
    var margin = { top: 100, right: 10, bottom: 30, left: 200 },
        width = 1000 - margin.left - margin.right,
        height = (40 * fishList.length) - margin.top - margin.bottom;

    console.log(width)

    //svg�^�O���폜
    d3.select("svg").remove();

    //svg�^�O��ǉ����A���ƍ�����ݒ�
    var svg = d3.select("#graph_area").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //x���̃X�P�[�����쐬
    var xScale = d3.scaleTime()
        .domain([scaleMin,scaleMax])
        .range([0, width]);

    //x����ǉ�����
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(
            d3.axisTop(xScale)
            .tickFormat(d3.timeFormat("%y/%m"))
        )

    //y���̃X�P�[�����쐬����
    var fishScale = d3.scaleBand()
        .domain(fishList)
        .range([0, height]);

    //y����ǉ�����
    svg.append("g")
        .attr("transform", "translate(0, 0)")
        .call(d3.axisLeft(fishScale));

    //�����������̒������擾
    var betweenlen = fishScale(fishList[1]) / 2;

    //Riddge�O���t���쐬����
    svg.selectAll("area")
        .data(densityList)
        .enter()
        .append("path")
            .attr("transform", function(d) { return ("translate(0," + (fishScale(d.fish) + betweenlen) + ")")}) 
            .attr("fill", function(d) { return "rgb(255,255," + ((100 - d.max) * 2) + ")" } )
            .datum(function(d){return d.density})
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                //.curve(d3.curveBasis)
                .curve(d3.curveMonotoneX)
                .x(function(d) {return xScale(d[0]);})
                .y(function(d) {return (- d[1]) ;})
            )

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