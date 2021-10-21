import math
from functools import reduce

import numpy as np

from lab1_pvv.services.linear_optimizer import LinearOptimizer


class Calculator:
    def __init__(self, data):
        self.data = data
        self.group_attachments = np.asarray(self.data['group_attachments'], dtype='float64')
        self.groups_volumes = np.asarray(self.data['groups_volumes'], dtype='float64')
        self.max_restriction_items = np.asarray(self.data['max_restriction_items'], dtype='float64')
        self.min_restriction_items = np.asarray(self.data['min_restriction_items'], dtype='float64')
        self.salary_sum = float(self.data['salary_sum'])
        self.employee_data = np.asarray(self.data['employee_data'], dtype='float64')
        self.labor_costs = np.asarray(self.data['labor_costs'], dtype='float64')
        self.raw_material_resources = np.asarray(self.data['raw_material_resources'], dtype='float64')
        self.raw_material_consumption = np.asarray(self.data['raw_material_consumption'], dtype='float64')
        self.equipment_restrictions = np.asarray(self.data['equipment_restrictions'], dtype='float64')
        self.equipment_consumption = np.asarray(self.data['equipment_consumption'], dtype='float64')

    def prepare_data(self):
        # Ограничения по ресурсам оборудования
        left_restrictions = self.equipment_consumption
        right_restrictions = self.equipment_restrictions

        # Ограничения по сырью
        left_restrictions = np.concatenate((left_restrictions, self.raw_material_consumption), axis=0)
        right_restrictions = np.concatenate((right_restrictions, self.raw_material_resources), axis=0)

        # Ограничения по трудовым ресурсам и заработной плате
        self.employee_data = self.employee_data
        working_time = self.employee_data[:, 0]
        salary = self.employee_data[:, 1]
        salary_matrix = (self.labor_costs * salary[:, np.newaxis]).sum(axis=0)
        left_restrictions = np.concatenate((left_restrictions, self.labor_costs), axis=0)
        right_restrictions = np.concatenate((right_restrictions, working_time), axis=0)
        left_restrictions = np.concatenate((left_restrictions, [salary_matrix]), axis=0)
        right_restrictions = np.concatenate((right_restrictions, [float(self.salary_sum)]), axis=0)

        # Ограничения по выпуску продукции
        max_restriction_matrix = np.identity(len(self.max_restriction_items))
        min_restriction_matrix = np.identity(len(self.min_restriction_items)) * -1
        left_restrictions = np.concatenate((left_restrictions, max_restriction_matrix), axis=0)
        right_restrictions = np.concatenate((right_restrictions, self.max_restriction_items), axis=0)
        left_restrictions = np.concatenate((left_restrictions, min_restriction_matrix), axis=0)
        right_restrictions = np.concatenate((right_restrictions, self.min_restriction_items), axis=0)

        # Ограничения по ассортиментным группам
        for gr in range(len(self.groups_volumes)):
            items_attached = [x for x in range(len(self.group_attachments)) if self.group_attachments[x] == gr]
            if len(items_attached) == 0:
                continue
            restriction_row = np.zeros(len(self.group_attachments))
            for it in items_attached:
                restriction_row[it] = -1
            left_restrictions = np.concatenate((left_restrictions, [restriction_row]), axis=0)
            right_restrictions = np.concatenate((right_restrictions, [self.groups_volumes[gr]]), axis=0)

        self.left_restrictions = left_restrictions
        self.right_restrictions = right_restrictions
        # Целевая функция
        target = {}
        opt_target = {}
        target['wholesale_price'] = np.asarray(self.data['wholesale_price'], dtype='float64')
        opt_target['wholesale_price'] = 'max'
        target['cost_price'] = np.asarray(self.data['cost_price'], dtype='float64')
        opt_target['cost_price'] = 'min'
        target['profit'] = target['wholesale_price'] - target['cost_price']
        opt_target['profit'] = 'max'
        return target, opt_target

    def make_optimization(self):
        try:
            target, opt_target = self.prepare_data()
        except Exception as e:
            raise Exception('Ошибка при заполнении данных')

        try:
            compromise_weight = [
                float(self.data['max_prod_criteria']),
                float(self.data['min_cost_criteria']),
                float(self.data['max_profit_criteria'])
            ]
        except Exception:
            raise Exception('Ошибка преобразования значений')

        if reduce((lambda x, y: x + y), compromise_weight) != 1:
            raise Exception('Сумма значений значимостей не равна 1!')

        non_zero_left_ineq = []
        non_zero_right_ineq = []
        for i in range(len(self.right_restrictions)):
            if math.isfinite(self.right_restrictions[i]):
                non_zero_left_ineq.append(self.left_restrictions[i])
                non_zero_right_ineq.append(self.right_restrictions[i])
        non_zero_left_ineq = np.array(non_zero_left_ineq)
        non_zero_right_ineq = np.array(non_zero_right_ineq)

        optimizer = LinearOptimizer(item_count=len(self.data['wholesale_price']),
                                    a_matrix=non_zero_left_ineq,
                                    b_matrix=non_zero_right_ineq,
                                    dest=target,
                                    target=opt_target,
                                    compromise_weight=compromise_weight)

        try:
            plain_opt = optimizer.plain_optimization()
            hybrid_opt = optimizer.hybrid_optimize()
        except Exception as e:
            raise e

        return plain_opt, hybrid_opt
