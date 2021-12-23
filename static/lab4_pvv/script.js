$(document).ready(function () {
    $(document).on('click', '#btnAddDiscount', btnAddDiscountHandler);
    $(document).on('click', '#btn-calculate', btnCalculateHandler);
    $(document).on('click', '#btn-test-1', btnTest1Handler);
    $(document).on('click', '#btn-test-2', btnTest2Handler);
});

const btnAddDiscountHandler = () => {
    const perc = $('#discountPerc').val();
    if (perc == "") {
        alert('Укажите процент при котором будет применена данная скидка');
        return;
    }
    const value = $('#discountValue').val();
    if (value == "") {
        alert('Укажите размер скидки');
        return;
    }

    let discountTable = $('#discount-table tbody');
    const idx = $('#discount-table tbody tr').length + 1;
    discountTable.append(
        `
        <tr class="text-center">
            <td><input type="text" disabled class="form-control text-center" placeholder="Коэффициент скидки ${idx}"></td>
            <td><input id="prc-${idx}" class="form-control text-center" placeholder="0" disabled value="${perc}"></td>
            <td><input id="value-${idx}" class="form-control text-center" placeholder="0" disabled value="${value}"></td>
        </tr>
        `
    );
}

const btnCalculateHandler = () => {
    const cd = $('#cd').val();
    const cx = $('#cx').val();
    const cy = $('#cy').val();
    const t = $('#t').val();
    const w = $('#w').val();
    const dt = $('#dt').val();
    const cp = $('#cp').val();

    const discountCnt = $('#discount-table tbody tr').length;
    let discount = [];
    for (let i = 1; i <= discountCnt; i++) {
        let data = {};
        data['lo'] = $(`#value-${i}`).val();
        data['hi'] = $(`#value-${i}`).val();
        data['cf'] = $(`#prc-${i}`).val();
        discount.push(data);
    }

    let result = {};
    result['cd'] = cd;
    result['cx'] = cx;
    result['cy'] = cy;
    result['t'] = t;
    result['w'] = w;
    result['dt'] = dt;
    result['cp'] = cp;
    result['sales_values'] = discount;
    console.log(result);

    $.ajax({
        url: `/lab4_pvv/ajax/`,
        type: 'POST',
        cache: false,
        data: JSON.stringify({
            'data': result
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
    let gantt = data.graph;

    $('#gantt').empty();
    $('#gantt').append(gantt);
    $('#gantt').children().css('width', '100%');
    $('#gantt').children().css('height', '100%');
    $('#gantt').html($('#gantt').html());

    let resultData = data.data;
    let resultTable = $("#result-table tbody");
    resultTable.empty();

    for (let i = 0; i < resultData.length; i++) {
        resultTable.append(`
            <tr class="text-center">
                <td><input disabled type="text" class="form-control text-center" value="${i + 1}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].m_opt.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].q_opt.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].lossd.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].ord_opt.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].d_ord_opt.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].t_opt.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].orders.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].s_x.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].s_d.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].s_p.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].s_y.toFixed(4)}"></td>
                <td><input disabled class="form-control text-center" placeholder="0" value="${resultData[i].s_sum.toFixed(4)}"></td>
            </tr>
        `);
    }
}

const btnTest1Handler = () => {
    const cd = 50;
    const cx = 7.5;
    const cy = 5;
    const t = 300;
    const w = 2000;
    const dt = 1.2;
    const cp = 50;

    const discount = [[10, 100], [20, 200]];

    updateDataFromTest(cd, cx, cy, t, w, dt, cp, discount);
}

const btnTest2Handler = () => {
    const cd = 400;
    const cx = 0.5;
    const cy = 1.15;
    const t = 300;
    const w = 1000;
    const dt = 10;
    const cp = 12;

    const discount = [[10, 100], [20, 500]];

    updateDataFromTest(cd, cx, cy, t, w, dt, cp, discount);
}

const updateDataFromTest = (cd, cx, cy, t, w, dt, cp, discount) => {
    $('#cd').val(cd);
    $('#cx').val(cx);
    $('#cy').val(cy);
    $('#t').val(t);
    $('#w').val(w);
    $('#dt').val(dt);
    $('#cp').val(cp);

    let discountTable = $('#discount-table tbody');
    discountTable.empty();
    for (let i = 1; i <= discount.length; i++) {
        discountTable.append(`
            <tr class="text-center">
                <td><input type="text" disabled class="form-control text-center" placeholder="Коэффициент скидки ${i}"></td>
                <td><input id="prc-${i}" class="form-control text-center" placeholder="0" disabled value="${discount[i - 1][0]}"></td>
                <td><input id="value-${i}" class="form-control text-center" placeholder="0" disabled value="${discount[i - 1][1]}"></td>
            </tr>
        `);
    }

    btnCalculateHandler();
}