$(document).ready(function () {
    $(document).on('click', '#btn-create-table', btnCreateTableHandler);
    $(document).on('click', '#btn-calculate', btnCalculateHandler);
    $(document).on('click', '#btn-test-1', btnTest1Handler);
    $(document).on('click', '#btn-test-2', btnTest2Handler);
    $(document).on('click', '#btn-test-3', btnTest3Handler);
    $(document).on('click', '#btn-test-4', btnTest4Handler);
    $(document).on('click', '#btn-test-5', btnTest5Handler);
    $(document).on('click', '#btn-test-6', btnTest6Handler);
});

const btnTest6Handler = () => {
    const taskCnt = 4;
    const eventCnt = 4;

    const use3mark = true;

    const tasks = [[0, 1, 2, 4, 3],
        [0, 2, 2, 5, 3.5],
        [1, 3, 4, 6, 5],
        [2, 3, 4, 5, 4.5]];
    const events = [[0], [3], [3.5], [8.5]];

    updateDataFromTest(taskCnt, eventCnt, tasks, events, use3mark);
}

const btnTest5Handler = () => {
    const taskCnt = 4;
    const eventCnt = 4;

    const use3mark = false;

    const tasks = [[0, 1, 2, 4],
        [0, 2, 2, 4],
        [1, 3, 4, 6],
        [2, 3, 4, 5]];
    const events = [[0], [3], [3], [7]];

    updateDataFromTest(taskCnt, eventCnt, tasks, events, use3mark);
}

const btnTest4Handler = () => {
    const taskCnt = 9;
    const eventCnt = 8;

    const use3mark = true;

    const tasks = [[0, 1, 1.5, 2.5, 2],
        [0, 2, 1, 3, 2],
        [1, 3, 2, 6, 2.5],
        [2, 3, 1.5, 2.5, 2],
        [3, 4, 0.5, 1.5, 1],
        [3, 5, 3, 7, 3.5],
        [4, 6, 1, 3, 2],
        [5, 6, 3, 5, 4],
        [6, 7, 1.5, 2.5, 2]];
    const events = [[2], [3], [5], [11], [7], [9], [13], [16]];

    updateDataFromTest(taskCnt, eventCnt, tasks, events, use3mark);
}

const btnTest3Handler = () => {
    const taskCnt = 11;
    const eventCnt = 8;

    const use3mark = false;

    const tasks = [[0, 1, 10.2, 12.1],
        [0, 2, 0.5, 1.6],
        [0, 3, 0.9, 1.7],
        [1, 7, 8.5, 9.3],
        [2, 3, 4.5, 5.8],
        [3, 4, 1.3, 2.9],
        [3, 5, 2.1, 3.3],
        [4, 5, 1.8, 2.7],
        [5, 6, 6.7, 7.4],
        [5, 7, 2.5, 3.5],
        [6, 7, 1.2, 1.6]];
    const events = [[0], [10], [1], [5.8], [8], [10], [17.1], [20]];

    updateDataFromTest(taskCnt, eventCnt, tasks, events, use3mark);
}

const btnTest2Handler = () => {
    const taskCnt = 11;
    const eventCnt = 7;

    const use3mark = false;

    const tasks = [[0, 1, 2, 4],
        [0, 2, 2, 5],
        [1, 3, 4, 6],
        [2, 3, 4, 5],
        [2, 4, 4, 7],
        [3, 4, 0, 0],
        [3, 6, 1, 3],
        [4, 5, 4, 6],
        [4, 6, 5, 7],
        [5, 6, 2, 3],
        [3, 5, 3, 5]];
    const events = [[0], [3.6], [3.2], [8.4], [8.4], [13.2], [16]];

    updateDataFromTest(taskCnt, eventCnt, tasks, events, use3mark);
}

const btnTest1Handler = () => {
    const taskCnt = 4;
    const eventCnt = 4;

    const use3mark = false;

    const tasks = [[0, 1, 2, 3], [0, 2, 7, 10], [1, 2, 5, 10], [2, 3, 4, 5]];
    const events = [[0], [3], [12], [15.5]];

    updateDataFromTest(taskCnt, eventCnt, tasks, events, use3mark);
}

const updateDataFromTest = (taskCnt, eventCnt, tasks, events, use3mark) => {
    $('#event_cnt').val(eventCnt);
    $('#work_cnt').val(taskCnt);

    if (use3mark === true) {
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

    btnCreateTableHandler();

    for (let i = 1; i <= taskCnt; i++) {
        $(`#work-start-${i}`).val(tasks[i - 1][0]);
        $(`#work-end-${i}`).val(tasks[i - 1][1]);
        $(`#work-opt-${i}`).val(tasks[i - 1][2]);
        $(`#work-pessim-${i}`).val(tasks[i - 1][3]);
        if (use3mark === true) {
            $(`#work-prob-${i}`).val(tasks[i - 1][4]);
        } else {
            $(`#work-prob-${i}`).val(0);
        }
    }

    for (let i = 1; i <= eventCnt; i++) {
        $(`#event-term-${i}`).val(events[i - 1][0]);
    }

    btnCalculateHandler();
}

const generateResultHandler = (data, eventCnt, workCnt) => {
    let gantt = data.gantt_data;

    $('#gantt').empty();
    $('#gantt').append(gantt);
    $('#gantt').children().css('width', '100%');
    $('#gantt').children().css('height', '100%');
    $('#gantt').html($('#gantt').html());

    let eventsData = data.events_data;
    let resultEventTable = $("#result-table-events tbody");
    resultEventTable.empty();

    for (let j = 1; j <= eventCnt; j++) {
        let row = `<tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="Событие ${j}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${eventsData.Tdir[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${eventsData.Tp[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${eventsData.Tpe[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${eventsData.Dp[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${eventsData.P[j - 1].toFixed(6)}"></td>
                </tr>`
        resultEventTable.append(row);
    }

    let tasksData = data.tasks_data;
    let resultTasksTable = $("#result-table-work tbody");
    resultTasksTable.empty();

    for (let j = 1; j <= workCnt; j++) {
        let row = `<tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" placeholder="№${j}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Tож[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Dож[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Tрн[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Tро[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Tпн[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Tпо[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Pполн[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Pch[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Pch2[j - 1].toFixed(6)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${tasksData.Pнезав[j - 1].toFixed(6)}"></td>
                </tr>`
        resultTasksTable.append(row);
    }

    let timeData = data.time_data;
    let resultTimeTable = $("#result-table-time tbody");
    resultTimeTable.empty();
    for (let i = 0; i < timeData.length; i++) {
        let row = `<tr class="text-center">
                <td><input disabled class="form-control text-center" placeholder="0" value="${timeData[i][0]}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${timeData[i][1]}"></td>
                </tr>`
        resultTimeTable.append(row);
    }
}

const btnCreateTableHandler = () => {
    const eventCnt = Math.max($("#event_cnt").val(), 1);
    const workCnt = Math.max($("#work_cnt").val(), 1);
    const systemType = $('#system_criteria option:selected').val();
    generateWorkTable(workCnt, systemType);
    generateEventTable(eventCnt);
}

const btnCalculateHandler = () => {
    const eventCnt = Math.max($("#event_cnt").val(), 1);
    const workCnt = Math.max($("#work_cnt").val(), 1);
    const use3mark = $('#system_criteria option:selected').val() == 3;

    let data = {}
    data['tasks_quantity'] = workCnt;
    data['events_quantity'] = eventCnt;
    data['use3mark_system'] = use3mark;

    let event_params_model_data = [];
    for (let i = 1; i <= eventCnt; i++) {
        const term = $(`#event-term-${i}`).val();
        if (term === "") {
            alert(`Событие ${i}: отсутствует директивный срок!`);
            return;
        }
        event_params_model_data.push([term]);
    }

    let tasks_params_model_data = [];
    for (let i = 1; i <= workCnt; i++) {
        const buf = [];
        const workStart = $(`#work-start-${i}`).val();
        const workEnd = $(`#work-end-${i}`).val();
        const workOpt = $(`#work-opt-${i}`).val();
        const workPessim = $(`#work-pessim-${i}`).val();
        if (workStart == "" || workEnd == "" || workOpt == "" || workPessim == "") {
            alert(`Работа ${i}: проверьте корректность введенных данных!`);
            return;
        }
        buf.push(workStart);
        buf.push(workEnd);
        buf.push(workOpt);
        buf.push(workPessim);
        console.log(use3mark);
        if (use3mark) {
            const workProb = $(`#work-prob-${i}`).val();
            if (workProb == "") {
                alert(`Работа ${i}: проверьте корректность введенных данных!`);
                return;
            }
            buf.push(workProb);
        }
        tasks_params_model_data.push(buf);
    }

    data['event_params_model_data'] = event_params_model_data;
    data['tasks_params_model_data'] = tasks_params_model_data;

    console.log(data);

    $.ajax({
        url: `/lab2_pvv/ajax/`,
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
            console.log(data);
            generateResultHandler(data, eventCnt, workCnt);
        },
        error: function (data) {
            console.log(data);
        }
    });
}

const generateWorkTable = (workCnt, systemType) => {
    let workTable = $("#work-table tbody");
    let disabledValue = systemType == 2 ? "disabled" : "";
    workTable.empty();
    for (let i = 1; i <= workCnt; i++) {
        workTable.append(`
            <tr class="text-center">
                <td><input type="text" disabled class="form-control text-center" placeholder="Работа ${i}"></td>
                <td><input id="work-start-${i}" class="form-control text-center" placeholder="0"></td>
                <td><input id="work-end-${i}" class="form-control text-center" placeholder="0"></td>
                <td><input id="work-opt-${i}" class="form-control text-center" placeholder="0"></td>
                <td><input id="work-pessim-${i}" class="form-control text-center" placeholder="0"></td>
                <td><input id="work-prob-${i}" ${disabledValue} class="form-control text-center" placeholder="0"></td>
            </tr>
        `)
    }
}

const generateEventTable = (eventCnt) => {
    let eventTable = $("#event-table tbody");
    eventTable.empty();
    for (let i = 1; i <= eventCnt; i++) {
        eventTable.append(`
            <tr class="text-center">
                <td><input type="text" disabled class="form-control text-center" placeholder="Событие ${i}"></td>
                <td><input id="event-term-${i}" class="form-control text-center" placeholder="0"></td>
            </tr>
        `)
    }
}