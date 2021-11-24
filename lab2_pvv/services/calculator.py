import math

import numpy as np
from scipy import stats as st

from lab2_pvv.services.draw_gantt import GanttGraph


class Calculator:
    def __init__(self, data):
        self.tasks_count = data['tasks_quantity']
        self.events_count = data['events_quantity']
        self.use_3_marks_method = data['use3mark_system']
        self.tasks_early = np.array(np.asarray(data['tasks_params_model_data'], dtype='float64')[:, 2])
        self.tasks_late = np.array(np.asarray(data['tasks_params_model_data'], dtype='float64')[:, 3])
        self.tasks_start_events = np.array(np.asarray(data['tasks_params_model_data'], dtype='float64')[:, 0])
        self.tasks_end_events = np.array(np.asarray(data['tasks_params_model_data'], dtype='float64')[:, 1])
        self.events_time_limits = np.array(np.asarray(data['event_params_model_data'], dtype='float64')[:, 0])

        if self.use_3_marks_method:
            self.tasks_possible = np.array(np.asarray(data['tasks_params_model_data'], dtype='float64')[:, 4])
        else:
            self.tasks_possible = []

        self.tasks_events = [[-1 for _ in range(self.events_count)] for __ in range(self.events_count)]

        for i in range(len(self.tasks_start_events)):
            if self.tasks_start_events[i] >= self.events_count or self.tasks_end_events[i] >= \
                    self.events_count or self.tasks_start_events[i] < 0 or self.tasks_end_events[i] < 0:
                raise Exception('Ошибка! Количество работ больше чем событий!')
            self.tasks_events[int(self.tasks_start_events[i])][int(self.tasks_end_events[i])] = i

        self.source, self.runoff = self.__calc_endpoints()
        self.task_exp, self.dispersion = self.calc_t_exp()

    def calc_t_exp(self):
        if self.use_3_marks_method:
            tasks_expected = [round((1 / 6) * (self.tasks_early[i] + 4 *
                                               self.tasks_possible[i] + self.tasks_late[i]), 4) for i in
                              range(self.tasks_count)]
            dispersion = [round((1 / 36) * (self.tasks_late[i] - self.tasks_early[i]) ** 2, 4) for i in
                          range(self.tasks_count)]
        else:
            tasks_expected = [round((1 / 5) * (3 * self.tasks_early[i] + 2 * self.tasks_late[i]), 4) for i in
                              range(self.tasks_count)]
            dispersion = [round((1 / 25) * (self.tasks_late[i] - self.tasks_early[i]) ** 2, 4) for i in
                          range(self.tasks_count)]
        return [tasks_expected, dispersion]

    def __calc_endpoints(self):
        runoffs = list(filter(lambda x: len(list(filter(lambda y: y != -1, self.tasks_events[x]))) == 0,
                              range(len(self.tasks_events))))
        if not len(runoffs):
            raise Exception('Ошибка! Данные неправильные, необнаружена завершающая работа!')
        elif len(runoffs) > 1:
            raise Exception('Ошибка! Данные неправильные, обнаружено несколько заверщающих работ!')
        runoff = runoffs[0]

        sources = list(
            filter(lambda x: len(list(filter(lambda y: y != -1, np.array(self.tasks_events)[:, x].tolist()))) == 0,
                   range(self.events_count)))
        if not len(sources):
            raise Exception('Ошибка! Данные неправильные, необнаружена завершающая работа!')
        elif len(sources) > 1:
            raise Exception('Ошибка! Данные неправильные, обнаружено несколько заверщающих работ!')
        source = sources[0]
        return [source, runoff]

    def calc_determ_net_params(self):
        mxmzd_paths = self.__floyd_warshall_inv()
        t_cr = mxmzd_paths[self.source][self.runoff]

        t_early = []
        for i in range(self.events_count):
            t_early.append(mxmzd_paths[self.source][i])
        t_early[self.source] = 0
        t_task_early_start = []
        for i in self.tasks_start_events:
            t_task_early_start.append(t_early[int(i)] if i != 0 else 0)
        t_task_early_end = t_task_early_start.copy()
        for i in range(len(t_task_early_end)):
            t_task_early_end[i] += self.task_exp[i]

        t_late = []
        for i in range(self.events_count):
            t_late.append(t_cr - mxmzd_paths[i][self.runoff])
        t_late[self.source] = 0
        t_late[self.runoff] = t_cr
        t_task_late_end = []
        for i in self.tasks_end_events:
            t_task_late_end.append(t_late[int(i)])
        t_task_late_start = t_task_late_end.copy()
        for i in range(len(t_task_late_start)):
            t_task_late_start[i] -= self.task_exp[i]

        task_full_time_reserve = []
        for i in range(self.tasks_count):
            task_full_time_reserve.append(t_late[int(self.tasks_end_events[i])] -
                                          t_early[int(self.tasks_start_events[i])] - self.task_exp[i])

        task_independent_time_reserve = []
        for i in range(self.tasks_count):
            task_independent_time_reserve.append(t_early[int(self.tasks_end_events[i])] -
                                                 t_late[int(self.tasks_start_events[i])] - self.task_exp[i])

        task_private_time_reserve_1 = []
        for i in range(self.tasks_count):
            task_private_time_reserve_1.append(t_late[int(self.tasks_end_events[i])] -
                                               t_late[int(self.tasks_start_events[i])] - self.task_exp[i])

        task_private_time_reserve_2 = []
        for i in range(self.tasks_count):
            task_private_time_reserve_2.append(t_early[int(self.tasks_end_events[i])] -
                                               t_early[int(self.tasks_start_events[i])] - self.task_exp[i])

        return [t_cr, t_early, t_task_early_start, t_task_early_end, t_late,
                t_task_late_start, t_task_late_end, task_full_time_reserve, task_independent_time_reserve,
                task_private_time_reserve_1, task_private_time_reserve_2]

    def __floyd_warshall_inv(self):
        task_exp = self.calc_t_exp()[0]
        task_net = [[-math.inf for j in range(self.events_count)] for i in range(self.events_count)]

        for i in range(len(self.tasks_events)):
            for j in range(len(self.tasks_events[i])):
                if self.tasks_events[i][j] != -1:
                    task_net[i][j] = task_exp[self.tasks_events[i][j]]

        for k in range(self.events_count):
            for i in range(self.events_count):
                for j in range(self.events_count):
                    if task_net[i][k] > -math.inf and task_net[k][j] > -math.inf:
                        task_net[i][j] = max(task_net[i][j], task_net[i][k] + task_net[k][j])

        return task_net

    def full_path_founder(self, index, full_paths, end, previous_event=None, prev_events=None,
                          prev_tasks=None, prev_route_task_exp=0, prev_route_dispersion_sum=0):
        if prev_events is None:
            prev_events = []
        if prev_tasks is None:
            prev_tasks = []
        prev_events.append(str(index))
        if previous_event is not None:
            prev_tasks.append(str(self.tasks_events[previous_event][index]))
            prev_route_task_exp += self.task_exp[self.tasks_events[previous_event][index]]
            prev_route_dispersion_sum += self.dispersion[self.tasks_events[previous_event][index]]
        if index == end:
            full_paths.append(dict({'events': prev_events.copy(), 'tasks': prev_tasks.copy(),
                                    'exp': prev_route_task_exp, 'disp': prev_route_dispersion_sum}))
            return
        for i in range(len(self.tasks_events[index])):
            if self.tasks_events[index][i] == -1:
                continue
            self.full_path_founder(i, full_paths, end, index, prev_events.copy(), prev_tasks.copy(),
                                   prev_route_task_exp, prev_route_dispersion_sum)

    def calc_full_path_reserves(self):
        mxmzd_paths = self.__floyd_warshall_inv()
        t_cr = mxmzd_paths[self.source][self.runoff]
        full_paths = []
        self.full_path_founder(self.source, full_paths, self.runoff)
        full_reserves_data = []
        for i in full_paths:
            full_reserves_data.append({'events': ', '.join(i['events']), 'len': round(t_cr - i['exp'], 2)})
        return full_reserves_data

    def calc_probabilistic_net_params(self):
        mxmzd_paths = self.__floyd_warshall_inv()
        t_cr = mxmzd_paths[self.source][self.runoff]

        t_early = []
        for i in range(self.events_count):
            t_early.append(mxmzd_paths[self.source][i])
        t_early[self.source] = 0

        max_disp = []
        for i in range(self.events_count):
            paths_to_event = []
            self.full_path_founder(self.source, paths_to_event, i)
            paths_to_event.sort(key=lambda x: x['disp'], reverse=True)
            max_disp.append(paths_to_event[0]['disp'])
        probabilities = []
        for i in range(len(max_disp)):
            if max_disp[i] == 0:
                probabilities.append(0)
            else:
                probabilities.append(
                    st.norm.cdf((self.events_time_limits[i] - t_early[i]) / math.sqrt(max_disp[i]), 0, 1))
        return [max_disp, probabilities]

    def __generate_tasks_props(self, tasks_expected, start_events, term_events, t_task_early_start):
        tasks_properties = []
        for i in range(self.tasks_count):
            if tasks_expected[i] != 0:
                tasks_properties.append({'start_event': start_events[i], 'term_event': term_events[i],
                                         'start_time': t_task_early_start[i], 'len': tasks_expected[i]})
        return tasks_properties

    def calculate(self):
        tasks_expected, dispersion = self.calc_t_exp()
        t_cr, t_early, t_task_early_start, t_task_early_end, t_late, \
        t_task_late_start, t_task_late_end, task_full_time_reserve, task_independent_time_reserve, \
        task_private_time_reserve_1, task_private_time_reserve_2 = self.calc_determ_net_params()
        full_reserves_data = self.calc_full_path_reserves()
        events_dispersion, probabilities = self.calc_probabilistic_net_params()

        tasks_props = self.__generate_tasks_props(tasks_expected,
                                                  self.tasks_start_events,
                                                  self.tasks_end_events,
                                                  t_task_early_start)
        gantt_fig = GanttGraph.draw_plot(tasks_props)

        response = {}
        response['events_data'] = {
            'Tdir': list(self.events_time_limits),
            'Tp': t_early,
            'Tpe': t_late,
            'Dp': events_dispersion,
            'P': probabilities
        }
        response['tasks_data'] = {
            'Tож': tasks_expected,
            'Dож': dispersion,
            'Tрн': t_task_early_start,
            'Tро': t_task_early_end,
            'Tпн': t_task_late_start,
            'Tпо': t_task_late_end,
            'Pполн': task_full_time_reserve,
            'Pch': task_private_time_reserve_1,
            'Pch2': task_private_time_reserve_2,
            'Pнезав': task_independent_time_reserve
        }
        response['time_data'] = [[i['events'], i['len']] for i in full_reserves_data]
        response['gantt_data'] = gantt_fig
        return response
