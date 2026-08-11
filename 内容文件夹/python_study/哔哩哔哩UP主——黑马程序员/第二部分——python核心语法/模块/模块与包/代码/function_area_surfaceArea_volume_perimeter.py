import math


# 导入模块 math


# 圆形
def circle(radius: float | str) -> tuple[float, float] | None | dict:
    """
    该函数主要计算，园的面积和周长  知识补充 : 二维图形没有体积，只有面积和周长

    :param radius: 半径(非零数字或数字字符串)
    :return: 输入为数字，返回值：(周长,面积) ，若为零 返回 空字典 , 非数字类型 返回 None
    """

    try:
        radius = abs(float(radius))
        if radius == 0:
            return {}
        perimeter = round(2 * math.pi * radius, 1)
        area = round(math.pi * (radius ** 2), 1)
        return perimeter, area
    except ValueError:
        return None


# 矩形/正方形
def rectangle(width: float | str, length: float | str) -> tuple[str, float, float] | None | dict:
    """

    Parameters
    ----------
    width: float | int | str
          矩形/正方形宽度 (非零数字或数字字符串)
    length: float | int | str
         矩形/正方形长度 (非零数字或数字字符串)

    Returns
    -------
    tuple[str, float,float] | None]
        输入为数字，返回一个元组 (矩形/正方形, 周长, 面积)

        输入包含非数字字符，返回 None

        输入包含零， 返回 空字典
    """
    try:
        width, length = abs(float(width)), abs(float(length))
        if width == 0 or length == 0:
            return {}

        if width == length:
            perimeter = round(4 * width, 1)
            area = round(width ** 2, 1)
            return '正方形', perimeter, area
        else:
            # 周长计算
            perimeter = round(2 * (width + length), 1)
            # 面积计算
            area = round(width * length, 1)
            return '长方形', perimeter, area
    except ValueError:
        return None


# 球

def globular(radius: float | str) -> tuple[float, float] | None | dict:
    """
    该函数主要求球(globular)的表面积、体积  知识补充：三维图形没有周长和面积、只有表面积和体积

    球表面积：       S = 4Πr²

    求体积：：       V = 3/4Πr³

    :param radius: 球的半径(非零数字或数字字符串)
    :return:输入的是数字，返回一个元组：(表面积，体积) ，若为零 返回 空字典 , 非数字类型 返回 None
    """
    try:
        radius = abs(float(radius))
        if radius == 0:
            return {}
        surface_area = round(4 * math.pi * (radius ** 2), 1)
        volume = round((4 * math.pi * (radius ** 3)) / 3, 1)
        return surface_area, volume
    except ValueError:
        return None


# 长方体/立方体

def cuboid(length: float | str, width: float | str, height: float | str) -> tuple[str, float, float] | None | dict:
    """
    该函数主要计算：长方体/正方体的体积与表面积

    长方体体积： V = 长 * 宽 * 高

    长方体表面积： S = 2 * (长*宽 + 长*高 + 宽*高)

    正方体体积： V = 任意边长 ** 3

    正方体表面积： S = 6 * (任意边长 ** 2)

    :param length:  长(非零数字或数字字符串)
    :param width:   宽(非零数字或数字字符串)
    :param height:  高(非零数字或数字字符串)
    :return: 输入的边长是数字或数字字符串，返回一个元组：(表面积,体积) ，若为零 返回 空字典 , 非数字类型 返回 None
    """
    try:
        if any(float(s) == 0 for s in (length, width, height)):
            return {}
        length, width, height = [abs(float(s)) for s in (length, width, height)]

        if length == width == height:  # 判断正方体
            surface_area = round(6 * length ** 2,1)
            volume =  round(length ** 3,1)
            return '正方体', surface_area, volume
        else:  # 长方体
            surface_area = round(2 * (length * (width + height) + width * height),1)
            volume = round(length * width * height)
            return '长方体', surface_area, volume
    except ValueError:
        return None
