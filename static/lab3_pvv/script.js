$(document).ready(function () {
    $(document).on('click', '#btn-create-table', btnCreateTableHandler);
    $(document).on('click', '#btn-calculate', btnCalculateHandler);
    $(document).on('click', '#btn-test-1', btnTest1Handler);
    $(document).on('click', '#btn-test-2', btnTest2Handler);
    $(document).on('click', '#btn-test-3', btnTest3Handler);
    $(document).on('click', '#btn-test-4', btnTest4Handler);
    $(document).on('click', '#btn-test-5', btnTest5Handler);
    $(document).on('click', '#btn-test-6', btnTest6Handler);
    $(document).on('click', '#btn-test-7', btnTest7Handler);
});

const btnCreateTableHandler = () => {
    const unitCnt = $('#system_criteria option:selected').val();
    const detailCnt = Math.max($("#event_cnt").val(), 1);
    generateInputTable(unitCnt, detailCnt);
}

const btnTest1Handler = () => {
    const unitCnt = 2;
    const detailCnt = 5;

    const data = [[2, 6], [3, 2], [7, 4], [1, 8], [9, 3]];
    updateDataFromTest(unitCnt, detailCnt, data);
}

const btnTest2Handler = () => {
    const unitCnt = 2;
    const detailCnt = 5;

    const data = [[7, 3], [4, 5], [8, 9], [6, 1], [5, 10]];
    updateDataFromTest(unitCnt, detailCnt, data);
}

const btnTest3Handler = () => {
    const unitCnt = 3;
    const detailCnt = 5;

    const data = [[11, 6, 7], [14, 2, 12], [17, 1, 11], [13, 4, 3], [10, 5, 9]];
    updateDataFromTest(unitCnt, detailCnt, data);
}

const btnTest4Handler = () => {
    const unitCnt = 3;
    const detailCnt = 5;

    const data = [[11, 3, 7], [14, 5, 9], [17, 4, 11], [9, 1, 4], [8, 2, 1]];
    updateDataFromTest(unitCnt, detailCnt, data);
}

const btnTest5Handler = () => {
    const unitCnt = 3;
    const detailCnt = 5;

    const data = [[1, 2, 4], [4, 2, 3], [1, 3, 2], [2, 4, 3], [1, 3, 2]];
    updateDataFromTest(unitCnt, detailCnt, data);
}

const btnTest6Handler = () => {
    const unitCnt = 2;
    const detailCnt = 6;

    const data = [[7, 2], [7, 5], [8, 9], [10, 9], [3, 5], [4, 6]];
    updateDataFromTest(unitCnt, detailCnt, data);
}

const btnTest7Handler = () => {
    const unitCnt = 2;
    const detailCnt = 7;

    const data = [[2, 3], [5, 9], [7, 4], [5, 7], [4, 8], [3, 2], [8, 1]];
    updateDataFromTest(unitCnt, detailCnt, data);
}

const generateInputTable = (unitCnt, detailCnt) => {
    let workTable = $("#work-table tbody");
    let disabledValue = unitCnt == 2 ? "disabled" : "";
    workTable.empty();
    for (let i = 1; i <= detailCnt; i++) {
        workTable.append(`
            <tr class="text-center">
                <td><input type="text" disabled class="form-control text-center" placeholder="Деталь ${i}"></td>
                <td><input id="t1-${i}" class="form-control text-center" placeholder="0"></td>
                <td><input id="t2-${i}" class="form-control text-center" placeholder="0"></td>
                <td><input id="t3-${i}" class="form-control text-center" ${disabledValue} placeholder="0"></td>
            </tr>
        `)
    }
}

const btnCalculateHandler = () => {
    const unitCnt = $('#system_criteria option:selected').val();
    const detailCnt = Math.max($("#event_cnt").val(), 1);

    const checkT3 = unitCnt != 2;

    let data = {};
    data['alternative_method'] = unitCnt == 4;

    let unit1_data = [];
    let unit2_data = [];
    let unit3_data = [];
    for (let i = 1; i <= detailCnt; i++) {
        const unit1 = $(`#t1-${i}`).val();
        if (unit1 == "") {
            alert(`Деталь ${i} для Т1 отсутствует!`);
            return;
        }

        const unit2 = $(`#t2-${i}`).val();
        if (unit2 == "") {
            alert(`Деталь ${i} для Т2 отсутствует!`);
            return;
        }

        if (checkT3) {
            const unit3 = $(`#t3-${i}`).val();
            if (unit3 == "") {
                alert(`Деталь ${i} для Т3 отсутствует!`);
                return;
            }
            unit3_data.push(unit3);
        }

        unit1_data.push(unit1);
        unit2_data.push(unit2);
    }

    data['initial_queue'] = [];
    data['initial_queue'].push(unit1_data);
    data['initial_queue'].push(unit2_data);
    if (checkT3) {
        data['initial_queue'].push(unit3_data);
    }

    $.ajax({
        url: `/lab3_pvv/ajax/`,
        type: 'POST',
        cache: false,
        data: JSON.stringify({
            'data': data
        }),
        dataType: 'json',
        success: function (data) {
            if (data['msg']) {
                alert(data['msg']);
                return;
            }
            generateResultHandler(data);
        },
        error: function (data) {
            console.log(data);
        }
    });
}

const generateResultHandler = (data) => {
    let gantt = data.gantt;

    $('#gantt').empty();
    $('#gantt').append(gantt);
    $('#gantt').children().css('width', '100%');
    $('#gantt').children().css('height', '100%');
    $('#gantt').html($('#gantt').html());

    let eventData = data.unit_items;
    let resultEventTable = $("#result-table-events tbody");
    resultEventTable.empty();

    const unitCnt = $('#system_criteria option:selected').val();
    const detailCnt = Math.max($("#event_cnt").val(), 1);

    for (let i = 1; i <= detailCnt; i++) {
        let t3value = unitCnt == 2 ? "-" : eventData[i - 1].value[2];
        let row = `
                <tr class="text-center">
                    <td><input disabled type="text" class="form-control text-center" placeholder="Деталь ${eventData[i - 1].name}"></td>
                    <td><input disabled class="form-control text-center" placeholder="0" value="${eventData[i - 1].value[0]}"></td>
                    <td><input disabled class="form-control text-center" placeholder="0" value="${eventData[i - 1].value[1]}"></td>
                    <td><input disabled class="form-control text-center" placeholder="0" value="${t3value}"></td>
                </tr>
        `;
        resultEventTable.append(row);
    }

    let workData = data.work_items;
    let resultWorkTable = $("#result-table-work tbody");
    resultWorkTable.empty();

    if (workData.length === 2) {
        let row = `
            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Время простоя после"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[0].dt}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[1].dt}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="-"></td>
            </tr>

            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Время работы после"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[0].ut}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[1].ut}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="-"></td>
            </tr>

            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Время простоя до"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[0].sdt}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[1].sdt}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="-"></td>
            </tr>

            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Время работы до"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[0].sut}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[1].sut}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="-"></td>
            </tr>
    `;
        resultWorkTable.append(row);
    } else {
        let row = `
            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Время простоя после"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[0].dt}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[1].dt}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[2].dt}"></td>
            </tr>

            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Время работы после"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[0].ut}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[1].ut}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[2].ut}"></td>
            </tr>

            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Время простоя до"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[0].sdt}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[1].sdt}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[2].sdt}"></td>
            </tr>

            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Время работы до"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[0].sut}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[1].sut}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${workData[2].sut}"></td>
            </tr>
    `;
        resultWorkTable.append(row);
    }
}

const updateDataFromTest = (unitCnt, detailCnt, data) => {
    if (unitCnt > 2) {
        $('#system_criteria_3').attr({
            'selected': 'true',
        });
        $('#system_criteria_2').removeAttr('selected');
    } else {
        $('#system_criteria_2').attr({
            'selected': 'true',
        });
        $('#system_criteria_3').removeAttr('selected');
    }
    $('#system_criteria').html($('#system_criteria').html());
    $(`#event_cnt`).val(detailCnt);

    btnCreateTableHandler();

    for (let i = 1; i <= detailCnt; i++) {
        let t3value = unitCnt === 2 ? "-" : data[i - 1][2];
        $(`#t1-${i}`).val(data[i - 1][0]);
        $(`#t2-${i}`).val(data[i - 1][1]);
        $(`#t3-${i}`).val(t3value);
    }

    btnCalculateHandler();
}