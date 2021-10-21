import numpy as np
from scipy.optimize import linprog


class LinearOptimizer:
    def __init__(self, item_count, a_matrix, b_matrix, dest, target, compromise_weight):
        self.item_count = item_count
        self.a_matrix = a_matrix
        self.b_matrix = b_matrix
        self.dest = dest
        self.target = target
        self.compromise_weight = compromise_weight
        self.optimization = None

    def plain_optimization(self):
        result = {}
        if self.optimization:
            return self.optimization

        for i in self.dest:
            sign = -1 if self.target[i] == 'max' else 1
            optimization = linprog(c=(sign * self.dest[i]).tolist(),
                                   A_ub=self.a_matrix.tolist(),
                                   b_ub=self.b_matrix.tolist(),
                                   bounds=[(0, float('inf')) for x in range(self.item_count)],
                                   method='simplex')

            if not optimization.success:
                raise Exception('Не получилось оптимизировать указанное выражение')
            result[i] = {}
            result[i]['f'] = sign * optimization.fun
            result[i]['x'] = optimization.x

        self.optimization = result
        return result

    def hybrid_optimize(self):
        result = {}
        if not self.optimization:
            return self.plain_optimization()

        left_restrictions = np.concatenate((self.a_matrix, np.zeros((len(self.a_matrix), 3))), axis=1)
        a_eq = []
        it = 0

        for i in self.dest:
            add_row = np.zeros(len(self.target))
            sign = 1 if self.target[i] == 'max' else -1
            add_row[it] = sign * self.optimization[i]['f']
            a_eq.append(np.concatenate((self.dest[i], np.array(add_row))))
            it += 1

        b_eq = []
        for i in self.optimization:
            b_eq.append(self.optimization[i]['f'])

        compromise_criteria = np.concatenate((np.zeros(self.item_count), np.array(self.compromise_weight)))
        compromise_opt = linprog(c=compromise_criteria.tolist(),
                                 A_ub=left_restrictions.tolist(),
                                 b_ub=self.b_matrix.tolist(),
                                 A_eq=a_eq,
                                 b_eq=b_eq,
                                 bounds=[(0, float('inf')) for x in range(len(compromise_criteria))],
                                 method='simplex')
        if not compromise_opt.success:
            raise Exception('Не получилось оптимизировать указанное выражение')
        result['f'] = compromise_opt.fun
        result['x'] = compromise_opt.x
        return result
