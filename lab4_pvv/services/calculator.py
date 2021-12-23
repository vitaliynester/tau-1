from lab4_pvv.services.draw_gantt import GanttGraph
from lab4_pvv.services.executor import Executor


class Calculator:
    def __init__(self, data):
        self.data = data

    def calculate(self):
        try:
            w_val = float(self.data['w'])
            t_val = float(self.data['t'])
            cp_val = float(self.data['cp'])
            cx_val = float(self.data['cx'])
            cd_val = float(self.data['cd'])
            cy_val = float(self.data['cy'])
            dt_val = float(self.data['dt'])
            solver = Executor(w_val, t_val, cp_val, cx_val, cd_val, cy_val, dt_val)

            solution_parameters = []
            solution_parameters.append(solver.calculate_parameters())

            sales_values = self.data['sales_values']
            for sale_value in sales_values:
                solution_parameters.append(
                    solver.calculate_parameters(float(sale_value['lo']), float(sale_value['hi']),
                                                float(sale_value['cf'])))

            best_parameter = sorted(solution_parameters, key=lambda x: x['s_sum'], reverse=False)[0]
            best_index = solution_parameters.index(best_parameter)
            graph = GanttGraph.draw_plot(best_parameter)

            result = {}
            result['graph'] = graph
            result['best_index'] = best_index
            result['data'] = solution_parameters

            return result
        except Exception as e:
            raise e
