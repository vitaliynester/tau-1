import math
from io import StringIO

import matplotlib.pyplot as plt


class GanttGraph:
    @staticmethod
    def draw_plot(units, detail_count):
        fig, gnt = plt.subplots()

        y_lim = 100
        x_lim = max(
            [max([i['activity']['starts'] + i['activity']['duration'] for i in units[unit]['tasks']]) for unit in
             units])

        gnt.set_ylim(0, y_lim)
        gnt.set_xlim(0, x_lim)

        gnt.set_xlabel('Время')
        gnt.set_ylabel('Агрегаты')

        gnt.grid(True)

        available_colors = [
            'tab:blue',
            'tab:orange',
            'tab:green',
            'tab:red',
            'tab:purple',
            'tab:brown',
            'tab:pink',
            'tab:gray',
            'tab:olive',
            'tab:cyan',
        ]
        spacing = math.floor(y_lim / len(units))
        position = [(spacing * int(i / spacing), spacing - 2) for i in range(y_lim) if i % spacing == 0]
        y_ticks = [(int(i / spacing) + 0.5) * spacing - 1 for i in range(y_lim - 1) if i % spacing == 0]

        x_step = int(x_lim / 10) if int(x_lim / 10) >= 3 else 1
        x_ticks = [i for i in range(math.ceil(x_lim)) if i % x_step == 0]

        gnt.set_yticks(y_ticks)
        gnt.set_xticks(x_ticks)

        y_labels = []
        iters = 0
        colors_scheme = tuple(
            (available_colors[i % len(available_colors)] for i in range(detail_count)))
        for i in units.values():
            barh_data = list([(x['activity']['starts'], x['activity']['duration']) for x in i['tasks']])
            gnt.broken_barh(barh_data, position[iters], facecolors=colors_scheme)
            y_labels.append(str(iters + 1))
            iters += 1
        gnt.set_yticklabels(y_labels)

        graph_data = GanttGraph.__return_graph(gnt)

        return graph_data

    @staticmethod
    def __return_graph(fig):
        img_data = StringIO()
        fig.figure.savefig(img_data, format='svg')
        img_data.seek(0)

        data = img_data.getvalue()
        return data
