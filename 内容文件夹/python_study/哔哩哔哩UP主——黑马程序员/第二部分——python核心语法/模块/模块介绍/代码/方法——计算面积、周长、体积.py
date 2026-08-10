import math


# 导入模块

def circle(radius: float|str) -> tuple[float,float] | None:
    """
    该函数主要计算，园的面积和周长

    :param radius: 半径
    :return: 输入为数字，返回值：(周长,面积) ，否则返回 None
    """

    try:
        radius = float(radius)
        perimeter = 2 * math.pi * radius
        area = math.pi * (radius ** 2 )
        return perimeter, area
    except ValueError:
        return None