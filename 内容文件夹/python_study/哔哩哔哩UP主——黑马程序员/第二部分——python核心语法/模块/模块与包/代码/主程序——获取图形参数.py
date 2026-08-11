import function_area_surfaceArea_volume_perimeter as go
import sys
sys.path.append(r'../../../../../../python_study')
from function_study import student_system as st
# 园的面积
def circle():
    print("欢迎使用计算圆面积、周长计算器")
    while True:
        radius = input("请输入圆的半径(只能是数字类型，非零，负数取绝对值[回车强制终止输入])单位cm：radius=")

        if radius == '':
            print("已经强制退出计算器")
            break

        result = go.circle(radius)
        if result is None:
            print("半径包含非数字类型，请重新输入")
            continue
        elif not result:
            print("半径不能为零，请重新输入")
            continue
        else:
            print(f"圆的周长为：{result[0]}cm，圆的面积为：{result[1]}cm²")
            break


# 矩形，正方形
def rectangle():
    print("欢迎使用矩形、正方形面积、周长计算器")
    while True:
        length = input("请输入长(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，length=")
        if length == '':
            break
        width = input("请输入宽(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，width=")
        if width == '':
            break

        result = go.rectangle(width, length)
        if result is None:
            print("包含非数字类型，请重新输入")
            continue
        elif not result:
            print("长宽不能为零，请重新输入")
            continue
        else:
            print(f"{result[0]}, 周长是：{result[1]}cm，面积是：{result[2]}cm²")
            break


def globular():
    print("欢迎使用球体：表面积、体积计算器")
    while True:
        radius = input("请输入球的半径(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，radius=")
        if radius == '':
            break

        result = go.globular(radius)
        if result is None:
            print("包含非数字字符，请重新输入")
            continue
        elif not result:
            print("半径不能为零，请重新输入")
            continue
        else:
            print(f"球体：表面积是：{result[0]}，体积是：{result[1]}")
            break


def cuboid():
    print("欢迎使用长方体、正方体表面积、体积计算器")
    while True:
        length = input("请输入长(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，length=")
        if length == '':
            break
        width = input("请输入宽(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，width=")
        if width == '':
            break
        height = input("请输入高(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，height=")
        if height == '':
            break

        result = go.cuboid(width, length, height)

        if result is None:
            print("包含非数字类型，请重新输入")
            continue
        elif not result:
            print("长宽不能为零，请重新输入")
            continue
        else:
            print(f"{result[0]}, 表面积是：{result[1]}cm，体积是：{result[2]}cm²")
            break


if __name__ == "__main__":
    print(
        "============================================================控制台===========================================================================")
    while True:
        print(
            """==================1.圆计算器=========2.矩形/正方形计算器=========3.球体计算器=========4.长方体/正方体计算器=========5.退出控制台==================""")
        result2 = input("请输入要执行的操作：")

        match result2:
            case '1':
                circle()
            case '2':
                rectangle()
            case '3':
                globular()
            case '4':
                cuboid()
            case '5':
                print("已退出控台，欢迎下次使用")
                break
            case _:
                print("请输入合法操作")
