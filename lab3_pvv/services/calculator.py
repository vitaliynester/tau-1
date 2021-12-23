import copy
import math
from functools import reduce

import numpy as np

from lab3_pvv.services.draw_gantt import GanttGraph


class Calculator:
    def __init__(self, data):
        self.data = data
        self.data['initial_queue'] = np.array(np.asarray(data['initial_queue'], dtype='float64'))

    def calculate(self):
        try:
            detail_items = DetailItem.create_from_multiple_list(data_list=self.data['initial_queue'])
            johnson = Johnson(detail_items)
            optimization = johnson.optimize(self.data['alternative_method'])
            orig_params = johnson.get_original_params()
            result = {}
            result['unit_items'] = []
            result['work_items'] = []
            for item1, item2 in zip(orig_params, optimization['params']):
                data = {}
                data['dt'] = optimization['params'][item2]['sum_delay']
                data['ut'] = optimization['params'][item2]['sum_working']
                data['sdt'] = orig_params[item1]['sum_delay']
                data['sut'] = orig_params[item1]['sum_working']
                result['work_items'].append(data)
            for item in optimization['path']:
                data = {}
                data['name'] = item.name
                data['value'] = item.machines_processing
                result['unit_items'].append(data)

            result['gantt'] = GanttGraph.draw_plot(orig_params, self.data['initial_queue'].shape[1])
            return result
        except Exception as e:
            raise e


class DetailItem:
    def __init__(self, machines_count, machines_processing, name=None):
        self.name = name
        self.machines_count = machines_count
        if not type(machines_processing) is list or len(machines_processing) != machines_count:
            raise Exception('Неправильные исходные данные')
        self.machines_processing = machines_processing

    @staticmethod
    def create_from_multiple_list(data_list):
        if len(data_list) == 0:
            raise Exception('Исходные данные пустые')
        details_count = len(data_list[0, :])
        data = [DetailItem(len(data_list), data_list[:, i].tolist(), i + 1) for i in range(details_count)]
        return data


class Johnson:
    def __init__(self, data):
        if not type(data) is list:
            raise Exception('Неправильный формат исходных данных')
        self.data = data

    def optimize(self, alter_method):
        if all([i.machines_count == 2 for i in self.data]):
            return self.__johnson_method_2_machines()
        elif all([i.machines_count == 3 for i in self.data]):
            return self.__johnson_method_3_machines('alternative' if alter_method else 'ordinary')
        else:
            raise Exception('Неправильное количество агрегатов')

    @staticmethod
    def __sort(arr, cmp):
        while True:
            swapped = False
            for i in range(0, len(arr) - 1):
                if cmp(arr[i], arr[i + 1]):
                    arr[i], arr[i + 1] = arr[i + 1], arr[i]
                    swapped = True
            if not swapped:
                break
        return arr

    def __johnson_method_2_machines(self):
        opt = Johnson.__sort([copy.deepcopy(x) for x in self.data],
                             lambda a, b: min(a.machines_processing[0], b.machines_processing[1]) >
                                          min(a.machines_processing[1], b.machines_processing[0]))
        opt_params = Johnson.__calc_up_downtime(opt, 2)
        return {
            'path': opt,
            'params': opt_params,
            'delay': Johnson.__find_sum_delay(opt),
            'duration': Johnson.__find_sum_duration(opt)
        }

    def __custom_johnson_method(self, comparator):
        return Johnson.__sort([copy.deepcopy(x) for x in self.data], comparator)

    def __johnson_method_3_machines(self, method='ordinary'):
        min_1st_machine = min([i.machines_processing[0] for i in self.data])
        min_3rd_machine = min([i.machines_processing[2] for i in self.data])
        max_2nd_machine = max([i.machines_processing[1] for i in self.data])

        if method == 'ordinary':
            if min_1st_machine >= max_2nd_machine:
                opt = self.__custom_johnson_method(lambda a, b: min(a.machines_processing[0] + a.machines_processing[1],
                                                                    b.machines_processing[2]) >
                                                                min(a.machines_processing[2], b.machines_processing[0] +
                                                                    b.machines_processing[1]))
            elif min_3rd_machine >= max_2nd_machine:
                opt = self.__custom_johnson_method(lambda a, b: min(a.machines_processing[0], b.machines_processing[1]
                                                                    + b.machines_processing[2]) >
                                                                min(a.machines_processing[1] + a.machines_processing[2],
                                                                    b.machines_processing[0]))
            else:
                opt = Johnson.__opt_cmb([copy.deepcopy(x) for x in self.data], 3)
        elif method == 'alternative':
            if min_1st_machine >= max_2nd_machine or min_3rd_machine >= max_2nd_machine:
                opt = self.__custom_johnson_method(lambda a, b: min(a.machines_processing[0] + a.machines_processing[1],
                                                                    b.machines_processing[1] + b.machines_processing[
                                                                        2]) >
                                                                min(a.machines_processing[1] + a.machines_processing[2],
                                                                    b.machines_processing[0] + b.machines_processing[
                                                                        1]))
            else:
                opt = Johnson.__opt_cmb([copy.deepcopy(x) for x in self.data], 3)
        else:
            raise Exception('Неправильный метод оптимизации')
        opt_params = Johnson.__calc_up_downtime(opt, 3)

        return {
            'path': opt,
            'params': opt_params
        }

    def get_original_params(self):
        if all([i.machines_count == 2 for i in self.data]):
            return Johnson.__calc_up_downtime(self.data, 2)
        elif all([i.machines_count == 3 for i in self.data]):
            return Johnson.__calc_up_downtime(self.data, 3)
        else:
            raise Exception('Неправильное количество агрегатов')

    @staticmethod
    def __calc_up_downtime(data, machine_count, prev_machine=0, tracing=None):
        if machine_count == 0 or prev_machine + 1 == machine_count:
            return
        if tracing is None:
            start_work_times = [i.machines_processing[0] for i in data]
            tasks = []
            for i in range(len(data)):
                prev_tasks_duration = sum([start_work_times[j] for j in range(len(start_work_times)) if j < i])
                tasks.append({'delay': {'starts': prev_tasks_duration, 'duration': 0},
                              'activity': {'starts': prev_tasks_duration, 'duration': start_work_times[i]}})
            tracing = {'0': {'tasks': tasks, 'sum_delay': 0, 'sum_working': sum(start_work_times)}}
        curr_machine = prev_machine + 1
        delays = []
        for i in range(len(data)):
            delay = max(sum([data[x].machines_processing[prev_machine] for x in range(len(data)) if x <= i]) -
                        sum([data[x].machines_processing[curr_machine] for x in range(len(data)) if x < i]) - sum(
                delays), 0)
            delays.append(delay)
        current_work_times = [data[i].machines_processing[curr_machine] for i in range(len(data))]
        tasks = []
        prev_detail_time_end = 0
        for i in range(len(data)):
            tasks.append(dict(delay=dict(starts=prev_detail_time_end, duration=delays[i]),
                              activity=dict(starts=prev_detail_time_end + delays[i], duration=current_work_times[i])))
            prev_detail_time_end += delays[i] + current_work_times[i]
        tracing[str(curr_machine)] = {
            'tasks': tasks, 'sum_delay': sum(delays), 'sum_working': sum(current_work_times) + sum(delays)
        }
        next_data = []
        for i in data:
            next_data.append(copy.deepcopy(i))
        for i in range(len(data)):
            next_data[i].machines_processing[curr_machine] += delays[i]
        Johnson.__calc_up_downtime(next_data, machine_count, prev_machine + 1, tracing)
        return tracing

    @staticmethod
    def __find_sum_delay(data):
        return max([reduce(lambda p, c: p + c.machines_processing[0], data[:i], 0) -
                    reduce(lambda p, c: p + c.machines_processing[1], data[:i - 1], 0) for i in range(len(data))])

    @staticmethod
    def __find_sum_duration(data):
        return sum([i.machines_processing[1] for i in data]) + Johnson.__find_sum_delay(data)

    @staticmethod
    def __opt_cmb(data, units_count, prev=None, index=0, opt_path=None):
        if prev is None:
            prev = [0 for _ in range(len(data))]
        if opt_path is None:
            opt_path = dict(duration=math.inf, path=None)
        if not len(data):
            properties = Johnson.__calc_up_downtime(prev, units_count)
            max_duration = max([properties[i]['sum_working'] for i in properties])
            if opt_path['duration'] > max_duration:
                opt_path['duration'] = max_duration
                opt_path['path'] = [copy.deepcopy(x) for x in prev]
        else:
            for i in range(len(data)):
                prev[index] = copy.deepcopy(data[i])
                Johnson.__opt_cmb(data[:i] + data[i + 1:], units_count, prev, index + 1, opt_path)
        return opt_path['path']
