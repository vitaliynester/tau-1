import math
from io import StringIO

import matplotlib.pyplot as plt


class GanttGraph:
    @staticmethod
    def draw_plot(plot_data):
        fig, pl = plt.subplots(figsize=(6.5, 3.5))

        m_value = plot_data['m_opt']
        q_value = plot_data['q_opt']
        t_value = plot_data['t_opt']
        orders_quantity = plot_data['orders']
        order_level = plot_data['ord_opt']

        pl.set_xlim(0, orders_quantity * t_value)
        pl.set_ylim(m_value - q_value - 1, m_value + 1)

        x_coords = []
        y_coords = []
        for i in range(orders_quantity):
            y_coords.append(m_value)
            x_coords.append(i * t_value)
            y_coords.append(m_value - q_value)
            x_coords.append((i + 1) * t_value)
        pl.plot(x_coords, y_coords)

        pl.set_xlabel('t')
        pl.set_ylabel('I(t)')
        pl.set_title('График поставок')
        pl.axhline(y=order_level, color='red', linestyle='dashed')
        pl.axhline(y=0, color='black', linestyle='-')

        graph_data = GanttGraph.__return_graph(pl)

        return graph_data

    @staticmethod
    def __return_graph(fig):
        img_data = StringIO()
        fig.figure.savefig(img_data, format='svg')
        img_data.seek(0)

        data = img_data.getvalue()
        return data
