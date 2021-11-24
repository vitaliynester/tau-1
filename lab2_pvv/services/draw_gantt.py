import math
import random as rand
from io import StringIO

import matplotlib.pyplot as plt


class GanttGraph:
    @staticmethod
    def draw_plot(tasks):
        fig, gnt = plt.subplots()

        y_lim = 100
        x_lim = max([float(t['len']) + float(t['start_time']) for t in tasks])

        gnt.set_ylim(0, y_lim)
        gnt.set_xlim(0, x_lim)

        gnt.set_xlabel('Время')
        gnt.set_ylabel('Работы')

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

        tasks.sort(key=lambda x: (x['start_event'], x['term_event']))

        spacing = math.floor(y_lim / len(tasks))
        position = [(spacing * int(i / spacing), spacing - 2) for i in range(y_lim) if i % spacing == 0]
        y_ticks = [(int(i / spacing) + 0.5) * spacing - 1 for i in range(y_lim - 1) if i % spacing == 0]

        x_step = int(x_lim / 10) if int(x_lim / 10) >= 3 else 1
        x_ticks = [i for i in range(math.ceil(x_lim)) if i % x_step == 0]

        gnt.set_yticks(y_ticks)
        gnt.set_xticks(x_ticks)

        y_labels = []
        for i in range(len(tasks)):
            gnt.broken_barh([(tasks[i]['start_time'], tasks[i]['len'])], position[i],
                            facecolors=(rand.choice(available_colors)))
            y_labels.append('%s-%s' % (str(tasks[i]['start_event']), str(tasks[i]['term_event'])))
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
