from manim import *

class PlotQuadratic(Scene):
    def construct(self):
        # 1. 坐标轴
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-1, 8, 2],
            x_length=8,
            y_length=5,
            axis_config={"include_numbers": True},
        )

        # 2. 画函数 y = x^2
        graph = axes.plot(lambda x: x**2, color=BLUE)

        # 3. 标出顶点和对称轴
        # 顶点 (0, 0)
        vertex = Dot(axes.i2gp(0, graph), color=RED)
        # 对称轴 x = 0
        axis_of_symmetry = axes.get_vertical_line(
            axes.i2gp(0, graph),
            color=YELLOW,
            line_func=DashedLine,
        )

        # 4. 标签
        label = MathTex("y = x^2", color=BLUE).next_to(graph, RIGHT, buff=0.5)
        label_axis = MathTex("x = 0", color=YELLOW).next_to(axis_of_symmetry, UP)

        # 5. 动画
        self.play(Create(axes), run_time=1)
        self.play(Create(graph), run_time=3)
        self.play(FadeIn(vertex), Create(axis_of_symmetry), run_time=1)
        self.play(Write(label), Write(label_axis), run_time=1)
        self.wait(2)