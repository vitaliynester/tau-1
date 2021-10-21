$(document).ready(function () {
    $(document).on('click', '#btn-create-table', btnCreateTableHandler);
    $(document).on('click', '#btn-calculate', btnCalculateHandler);
    $(document).on('click', '#btn-test-1', btnTest1Handler);
    $(document).on('click', '#btn-test-2', btnTest2Handler);
    $(document).on('click', '#btn-test-3', btnTest3Handler);
});

const btnCreateTableHandler = () => {
    const productCnt = Math.max($("#product_cnt").val(), 1);
    const workerCnt = Math.max($("#worker_cnt").val(), 1);
    const materialCnt = Math.max($("#material_cnt").val(), 1);
    const groupCnt = Math.max($("#group_cnt").val(), 1);
    const equipmentCnt = Math.max($("#equipment_cnt").val(), 1);
    const salaryCnt = Math.max($("#salary_cnt").val(), 1);

    const maxOutput = Math.max($("#max-output").val(), 0);
    const minCost = Math.max($("#min-cost").val(), 0);
    const maxProfit = Math.max($("#max-profit").val(), 0);

    if (maxOutput + minCost + maxProfit !== 1) {
        alert('Сумма значимости критериев не равна 1!');
        return;
    }

    generateProductTable(productCnt);
    generateWorkerTable(workerCnt, productCnt);
    generateMaterialTable(materialCnt, productCnt);
    generateGroupTable(groupCnt);
    generateEquipmentTable(equipmentCnt, productCnt);
}

const btnCalculateHandler = () => {
    let equipmentConsumption = [];
    let equipmentRestrictions = [];

    // Формируем данные для отправки по ресурсам
    const productCnt = $("#product_cnt").val();
    const equipmentCnt = $("#equipment_cnt").val();

    for (let i = 1; i <= equipmentCnt; i++) {
        const resource = $(`#equipment-resource-${i}`).val();
        if (resource === "") {
            alert(`Оборудование ${i}: отсутствует ресурс!`);
            return;
        }
        equipmentRestrictions.push(resource);

        let equipmentProductArray = [];
        for (let j = 1; j <= productCnt; j++) {
            const eqProduct = $(`#equipment-product-${j}-${i}`).val();
            if (eqProduct === "") {
                alert(`Оборудование ${i}: отсутствует запись для продукта ${j}!`);
                return;
            }
            equipmentProductArray.push(eqProduct);
        }
        equipmentConsumption.push(equipmentProductArray);
    }

    // Формируем данные для отправки по сырью
    let rawMaterialConsumption = [];
    let rawMaterialResources = [];

    const materialCnt = $("#material_cnt").val();

    for (let i = 1; i <= materialCnt; i++) {
        const expense = $(`#material-resource-${i}`).val();
        if (isNaN(expense) || expense === "") {
            alert(`Сырье ${i}: отсутствует ресурс!`);
            return;
        }
        rawMaterialResources.push(expense);

        let materialProduct = [];
        for (let j = 1; j <= productCnt; j++) {
            const mProduct = $(`#material-expenses-${j}-${i}`).val();
            if (isNaN(mProduct) || mProduct === "") {
                alert(`Сырье ${i}: отсутствует запись для продукта ${j}!`);
                return;
            }
            materialProduct.push(mProduct);
        }
        rawMaterialConsumption.push(materialProduct);
    }

    let employeeData = [];
    let laborCosts = [];

    const workerCnt = $("#worker_cnt").val();

    for (let i = 1; i <= workerCnt; i++) {
        let workData = [];
        const workingTime = $(`#worker-time-${i}`).val();
        workData.push(workingTime);
        const workerSalary = $(`#worker-salary-${i}`).val();
        workData.push(workerSalary);

        let laborData = [];
        for (let j = 1; j <= productCnt; j++) {
            const wProduct = $(`#worker-product-${j}-${i}`).val();
            if (isNaN(wProduct) || wProduct === "") {
                alert(`Рабочий ${i}: отсутствует трудозатрата для продукта ${j}!`);
                return;
            }
            laborData.push(wProduct);
        }
        laborCosts.push(laborData);
        employeeData.push(workData);
    }

    const salarySum = $("#salary_cnt").val();

    let minRestrictionItems = [];
    let maxRestrictionItems = [];

    for (let i = 1; i <= productCnt; i++) {
        const productMin = $(`#product-max-${i}`).val();
        let productMax = $(`#product-min-${i}`).val();
        if (productMax === 'inf') {
            productMax = '-inf';
        } else {
            productMax = -productMax;
        }

        maxRestrictionItems.push(productMax);
        minRestrictionItems.push(productMin);
    }

    let groupAttachments = [];
    let groupsVolumes = [];

    const groupCnt = $("#group_cnt").val();

    for (let i = 1; i <= groupCnt; i++) {
        const groupVolume = $(`#group-min-${i}`).val() * -1;

        if (isNaN(groupVolume)) {
            alert(`Ассортиментная группа ${i}: отсутствует минимальный объем!`);
            return;
        }
        groupsVolumes.push(groupVolume);
    }
    for (let j = 1; j <= productCnt; j++) {
        const productGroup = $(`#product-group-${j}`).val();
        if (productGroup === "") {
            alert(`Продукт ${j}: отсутствует отвечающая группа!`);
            return;
        }
        groupAttachments.push(productGroup);
    }

    let wholesalePriceArray = [];
    let costPriceArray = [];
    for (let i = 1; i <= productCnt; i++) {
        const salePrice = $(`#product-price-${i}`).val();
        const costPrice = $(`#product-cost-${i}`).val();

        if (isNaN(salePrice) || salePrice === "") {
            alert(`Продукт ${i}: отсутствует цена!`);
            return;
        }
        if (isNaN(costPrice) || costPrice === "") {
            alert(`Продукт ${i}: отсутствует себестоимость!`);
            return;
        }
        wholesalePriceArray.push(salePrice);
        costPriceArray.push(costPrice);
    }

    const data = {
        'max_prod_criteria': $("#max-output").val(),
        'min_cost_criteria': $("#min-cost").val(),
        'max_profit_criteria': $("#max-profit").val(),
        'wholesale_price': wholesalePriceArray,
        'cost_price': costPriceArray,
        'equipment_consumption': equipmentConsumption,
        'equipment_restrictions': equipmentRestrictions,
        'raw_material_consumption': rawMaterialConsumption,
        'raw_material_resources': rawMaterialResources,
        'labor_costs': laborCosts,
        'employee_data': employeeData,
        'salary_sum': salarySum,
        'min_restriction_items': maxRestrictionItems,
        'max_restriction_items': minRestrictionItems,
        'groups_volumes': groupsVolumes,
        'group_attachments': groupAttachments,
    };

    $.ajax({
        url: `/lab1_pvv/ajax/`,
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
            generateResultTable(data);
        },
        error: function (data) {
            console.log(data);
        }
    });
}

const btnTest1Handler = () => {
    const productCnt = 2;
    const workerCnt = 1;
    const materialCnt = 1;
    const groupCnt = 2;
    const equipmentCnt = 3;
    const salaryCnt = 5000;

    const maxOutput = 0.5;
    const minCost = 0.5;
    const maxProfit = 0;

    const productMinArray = [150, 100];
    const productMaxArray = [270, 150];
    const productPriceArray = [17, 29];
    const productCostArray = [14, 10];
    const productGroupArray = [0, 1];

    const workerTimeArray = [1];
    const workerSalaryArray = [5000];
    const workerProductArray = [[5, 12]];

    const materialResourceArray = [4000];
    const materialExpensesArray = [[6, 11]];

    const groupMinArray = [150, 100];
    const groupMaxArray = [270, 150];

    const equipmentResourceArray = [2000, 7740, 3000];
    const equipmentProductArray = [[4.1, 6.2], [13, 23.8], [9.3, 14.5]];

    updateDataFromTest(productCnt,
        workerCnt,
        materialCnt,
        groupCnt,
        equipmentCnt,
        salaryCnt,
        maxOutput,
        minCost,
        maxProfit,
        productMinArray,
        productMaxArray,
        productPriceArray,
        productCostArray,
        productGroupArray,
        workerTimeArray,
        workerSalaryArray,
        workerProductArray,
        materialResourceArray,
        materialExpensesArray,
        groupMinArray,
        groupMaxArray,
        equipmentResourceArray,
        equipmentProductArray);
}

const btnTest2Handler = () => {
    const productCnt = 3;
    const workerCnt = 4;
    const materialCnt = 2;
    const groupCnt = 2;
    const equipmentCnt = 1;
    const salaryCnt = 1000;

    const maxOutput = 0.5;
    const minCost = 0.5;
    const maxProfit = 0;

    const productMinArray = ['inf', 'inf', 'inf'];
    const productMaxArray = ['inf', 'inf', "inf"];
    const productPriceArray = [2, 5, 4];
    const productCostArray = [1, 0.5, 2];
    const productGroupArray = [0, 0, 1];

    const workerTimeArray = [10, 10, 15, 30];
    const workerSalaryArray = [15, 15, 15, 15];
    const workerProductArray = [[1, 1, 2], [0, 1, 1], [1, 0, 2], [0, 2, 0]];

    const materialResourceArray = [50, 40];
    const materialExpensesArray = [[3, 2, 5], [2, 5, 1]];

    const groupMinArray = [5, 3];
    const groupMaxArray = [15, 7];

    const equipmentResourceArray = [30];
    const equipmentProductArray = [[3, 2, 5]];

    updateDataFromTest(productCnt,
        workerCnt,
        materialCnt,
        groupCnt,
        equipmentCnt,
        salaryCnt,
        maxOutput,
        minCost,
        maxProfit,
        productMinArray,
        productMaxArray,
        productPriceArray,
        productCostArray,
        productGroupArray,
        workerTimeArray,
        workerSalaryArray,
        workerProductArray,
        materialResourceArray,
        materialExpensesArray,
        groupMinArray,
        groupMaxArray,
        equipmentResourceArray,
        equipmentProductArray);
}

const btnTest3Handler = () => {
    const productCnt = 3;
    const workerCnt = 3;
    const materialCnt = 3;
    const groupCnt = 3;
    const equipmentCnt = 3;
    const salaryCnt = 'inf';

    const maxOutput = 0.333;
    const minCost = 0.333;
    const maxProfit = 0.334;

    const productMinArray = [3, 3, 3];
    const productMaxArray = [12, 12, 12];
    const productPriceArray = [2, 2.5, 2.5];
    const productCostArray = [1, 1, 2];
    const productGroupArray = [0, 1, 2];

    const workerTimeArray = [0, 0, 0];
    const workerSalaryArray = [40, 25, 30];
    const workerProductArray = [[2, 6, 1], [1, 2, 2], [2, 3, 1]];

    const materialResourceArray = [40, 50, 45];
    const materialExpensesArray = [[4, 3, 1], [7, 1, 2], [6, 1, 1]];

    const groupMinArray = [3, 3, 3];
    const groupMaxArray = [12, 12, 12];

    const equipmentResourceArray = [20, 25, 30];
    const equipmentProductArray = [[1, 2, 1], [2, 2, 3], [1, 4, 1]];

    updateDataFromTest(productCnt,
        workerCnt,
        materialCnt,
        groupCnt,
        equipmentCnt,
        salaryCnt,
        maxOutput,
        minCost,
        maxProfit,
        productMinArray,
        productMaxArray,
        productPriceArray,
        productCostArray,
        productGroupArray,
        workerTimeArray,
        workerSalaryArray,
        workerProductArray,
        materialResourceArray,
        materialExpensesArray,
        groupMinArray,
        groupMaxArray,
        equipmentResourceArray,
        equipmentProductArray);
}

const updateDataFromTest = (productCnt,
                            workerCnt,
                            materialCnt,
                            groupCnt,
                            equipmentCnt,
                            salaryCnt,
                            maxOutput,
                            minCost,
                            maxProfit,
                            productMinArray,
                            productMaxArray,
                            productPriceArray,
                            productCostArray,
                            productGroupArray,
                            workerSalaryArray,
                            workerTimeArray,
                            workerProductArray,
                            materialResourceArray,
                            materialExpensesArray,
                            groupMinArray,
                            groupMaxArray,
                            equipmentResourceArray,
                            equipmentProductArray) => {
    $("#product_cnt").val(productCnt);
    $("#worker_cnt").val(workerCnt);
    $("#material_cnt").val(materialCnt);
    $("#group_cnt").val(groupCnt);
    $("#equipment_cnt").val(equipmentCnt);
    $("#salary_cnt").val(salaryCnt);

    $("#max-output").val(maxOutput);
    $("#min-cost").val(minCost);
    $("#max-profit").val(maxProfit);

    btnCreateTableHandler();

    for (let i = 1; i <= productCnt; i++) {
        $(`#product-min-${i}`).val(productMinArray[i - 1].toString());
        $(`#product-max-${i}`).val(productMaxArray[i - 1]);
        $(`#product-price-${i}`).val(productPriceArray[i - 1]);
        $(`#product-cost-${i}`).val(productCostArray[i - 1]);
        $(`#product-group-${i}`).val(productGroupArray[i - 1]);
    }

    for (let i = 1; i <= workerCnt; i++) {
        $(`#worker-salary-${i}`).val(workerSalaryArray[i - 1]);
        $(`#worker-time-${i}`).val(workerTimeArray[i - 1]);
        for (let j = 1; j <= productCnt; j++) {
            $(`#worker-product-${j}-${i}`).val(workerProductArray[i - 1][j - 1]);
        }
    }

    for (let i = 1; i <= materialCnt; i++) {
        $(`#material-resource-${i}`).val(materialResourceArray[i - 1]);
        for (let j = 1; j <= productCnt; j++) {
            $(`#material-expenses-${j}-${i}`).val(materialExpensesArray[i - 1][j - 1]);
        }
    }

    for (let i = 1; i <= groupCnt; i++) {
        $(`#group-min-${i}`).val(groupMinArray[i - 1]);
        $(`#group-max-${i}`).val(groupMaxArray[i - 1]);
    }

    for (let i = 1; i <= equipmentCnt; i++) {
        $(`#equipment-resource-${i}`).val(equipmentResourceArray[i - 1]);
        for (let j = 1; j <= productCnt; j++) {
            $(`#equipment-product-${j}-${i}`).val(equipmentProductArray[i - 1][j - 1]);
        }
    }
}

const generateResultTable = (data) => {
    const wholesalePriceArray = data['wholesale_price'];
    const costPriceArray = data['cost_price'];
    const profitArray = data['profit'];
    const compromiseArray = data['compromise'];

    let resultArray = [];
    resultArray.push(wholesalePriceArray.x);
    resultArray.push(costPriceArray.x);
    resultArray.push(profitArray.x);
    resultArray.push(compromiseArray.x.splice(0, compromiseArray.x.length - 3));

    const productCnt = $("#product_cnt").val();

    let resultTable = $("#result-table tbody");
    resultTable.empty();

    for (let j = 1; j <= productCnt; j++) {
        let row = `<tr class="text-center"><td><input disabled type="text" class="form-control text-center" placeholder="Продукция ${j}"></td>`;
        row += `<td><input disabled type="number" min="0" class="form-control text-center" placeholder="0" value="${resultArray[0][j - 1]}"></td>`;
        row += `<td><input disabled type="number" min="0" class="form-control text-center" placeholder="0" value="${resultArray[1][j - 1]}"></td>`;
        row += `<td><input disabled type="number" min="0" class="form-control text-center" placeholder="0" value="${resultArray[2][j - 1]}"></td>`;
        row += `<td><input disabled type="number" min="0" class="form-control text-center" placeholder="0" value="${resultArray[3][j - 1]}"></td>`;
        row += `</tr>`;
        resultTable.append(row);
    }

    let row = `<tr class="text-center"><td><input disabled type="text" class="form-control text-center" placeholder="Значение функции"></td>`;
    row += `<td><input disabled type="number" min="0" class="form-control text-center" placeholder="0" value="${wholesalePriceArray.f}"></td>`;
    row += `<td><input disabled type="number" min="0" class="form-control text-center" placeholder="0" value="${costPriceArray.f}"></td>`;
    row += `<td><input disabled type="number" min="0" class="form-control text-center" placeholder="0" value="${profitArray.f}"></td>`;
    row += `<td><input disabled type="number" min="0" class="form-control text-center" placeholder="0" value="${compromiseArray.f}"></td>`;
    row += `</tr>`;
    resultTable.append(row);
}

const generateProductTable = (productCnt) => {
    let productTable = $("#product-table tbody");
    productTable.empty();
    for (let i = 1; i <= productCnt; i++) {
        productTable.append('            <tr class="text-center">\n' +
            `                <td><input type="text" disabled class="form-control text-center" placeholder="Продукт ${i}"></td>\n` +
            `                <td><input id="product-min-${i}" class="form-control text-center" placeholder="0"></td>\n` +
            `                <td><input id="product-max-${i}" class="form-control text-center" placeholder="0"></td>\n` +
            `                <td><input id="product-price-${i}" class="form-control text-center" placeholder="0"></td>\n` +
            `                <td><input id="product-cost-${i}" class="form-control text-center" placeholder="0"></td>\n` +
            `                <td><input id="product-group-${i}" class="form-control text-center" placeholder="0"></td>\n` +
            '            </tr>');
    }
}

const generateWorkerTable = (workerCnt, productCnt) => {
    let workerBody = $("#worker-table tbody");
    let workerHeader = $("#worker-table thead");
    workerBody.empty();
    workerHeader.empty();
    for (let i = 1; i <= workerCnt; i++) {
        let row = '            <tr class="text-center">\n' +
            `                <td><input type="text" disabled class="form-control text-center" placeholder="Рабочий ${i}"></td>\n` +
            `                <td><input id="worker-salary-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>\n` +
            `                <td><input id="worker-time-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>\n`;
        for (let j = 1; j <= productCnt; j++) {
            row += `<td><input id="worker-product-${j}-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>`;
        }
        row += '            </tr>';
        workerBody.append(row);
    }
    let header = `            <tr class="text-center">
                <th scope="col" class="align-middle">Имя</th>
                <th scope="col" class="align-middle">Заработная плата</th>
                <th scope="col" class="align-middle">Время работы</th>`;
    for (let i = 1; i <= productCnt; i++) {
        header += `<th scope="col" class="align-middle">Трудозатраты на продукт ${i}</th>`;
    }
    workerHeader.append(header);
}

const generateMaterialTable = (materialCnt, productCnt) => {
    let materialBody = $("#raw-material-table tbody");
    let materialHeader = $("#raw-material-table thead");
    materialBody.empty();
    materialHeader.empty();
    for (let i = 1; i <= materialCnt; i++) {
        let row = `            <tr class="text-center">
                <td><input type="text" disabled class="form-control text-center" placeholder="Сырье ${i}"></td>
                <td><input id="material-resource-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>`;
        for (let j = 1; j <= productCnt; j++) {
            row += `<td><input id="material-expenses-${j}-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>`;
        }
        row += '            </tr>';
        materialBody.append(row);
    }
    let header = `            <tr class="text-center">
                <th scope="col" class="align-middle">Название</th>
                <th scope="col" class="align-middle">Ресурс</th>`;
    for (let i = 1; i <= productCnt; i++) {
        header += `<th scope="col" class="align-middle">Расходы на продукт ${i}</th>`;
    }
    materialHeader.append(header);
}

const generateGroupTable = (groupCnt) => {
    let groupTable = $("#group-table tbody");
    groupTable.empty();
    for (let i = 1; i <= groupCnt; i++) {
        groupTable.append(`            <tr class="text-center">
                <td><input type="text" disabled class="form-control text-center" placeholder="Группа ${i}"></td>
                <td><input id="group-min-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>
                <td><input id="group-max-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>
            </tr>`);
    }
}

const generateEquipmentTable = (equipmentCnt, productCnt) => {
    let equipmentBody = $("#equipment-table tbody");
    let equipmentHeader = $("#equipment-table thead");
    equipmentBody.empty();
    equipmentHeader.empty();
    for (let i = 1; i <= equipmentCnt; i++) {
        let row = `            <tr class="text-center">
                <td><input type="text" disabled class="form-control text-center" placeholder="Оборудование ${i}"></td>
                <td><input id="equipment-resource-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>`;
        for (let j = 1; j <= productCnt; j++) {
            row += `<td><input id="equipment-product-${j}-${i}" type="number" min="0" class="form-control text-center" placeholder="0"></td>`;
        }
        row += '            </tr>';
        equipmentBody.append(row);
    }
    let header = `            <tr class="text-center">
                <th scope="col" class="align-middle">Название</th>
                <th scope="col" class="align-middle">Ресурс</th>`;
    for (let i = 1; i <= productCnt; i++) {
        header += `<th scope="col" class="align-middle">Затраты на продукт ${i}</th>`;
    }
    equipmentHeader.append(header);
}