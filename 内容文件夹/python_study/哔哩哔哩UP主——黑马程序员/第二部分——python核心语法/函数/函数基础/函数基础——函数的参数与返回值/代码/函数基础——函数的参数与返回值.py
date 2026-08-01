# 计算圆的面积
import math


def circle_area(radius):
    try:
        radius = float(radius)
        area = math.pi * radius ** 2
        return area
    except ValueError:
        return False

radius_input = input(f"请输出圆的半径，radius=")
result = circle_area(radius_input)
if result:
    print(f"半径为{radius_input}，的圆形面积是：{result:.2f}cm²") # 字符串不能 :.f
else:
    print("半径应为数字")



# 计算长方形面积

def rectangle_area(width, length):
    try:
        width = float(width)
        length = float(length)
        return width * length
    except ValueError:
        return False


width_input, length_input = input("请输入宽度，width="), input("请输入长度，height=")
result = rectangle_area(width_input, length_input)
if result:
    print(f"长为{length_input}，宽为{width_input}，长发形面积是：{result:.2f}cm²")
else:
    print("长或宽，应为数字")

# 计算圆的面积、周长
def circle_area_perimeter(radius):
    try:
        radius = float(radius)
        area = math.pi * radius ** 2
        perimeter = 2 * math.pi * radius
        return area , round(perimeter,2) # round(值，小数位数)函数：四舍五入
    except ValueError:
        return None

radius_input = input(f"请输出园的半径，radius=")
result = circle_area_perimeter(radius_input)
if result:
    print(f"半径为：{radius_input}，圆的周长为：{result[1]}cm，面积为：{result[0]:.2f}cm²")
else:
    print(f"半径应为数字")