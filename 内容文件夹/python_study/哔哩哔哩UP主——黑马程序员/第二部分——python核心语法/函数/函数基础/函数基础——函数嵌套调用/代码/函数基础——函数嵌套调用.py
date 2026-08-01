import math


#  不适用嵌套：

def judge_number(*num):
    """
    判断实参是否均为数字
    :param num: 无定长参数，接收传入实参
    :return: 如果均为数字，返回无定长参数，否则None
    """
    try:
        return tuple(float(n) for n in num)
    except ValueError:
        return None


def input_number():
    """
    接收用户输入的实参
    :return: 返回用户输入的实参
    """
    a, b, c, y = input("请输入二次项系数(数字)，a="), input("请输入一次项系数(数字)，b="), input(
        "请输出常数项(数字)，c="), input(
        "请输出函数值(数字)，y=")
    return a, b, c, y


def judge_prove(a, b, c):
    """
    判断函数类别：二次函数(是否有解)、一次函数

    动态码：

        一次函数(a = 0) : 0, None

        二次函数误解(Δ < 0): 3, None

        二次函数一个解(Δ = 0): 1, Δ ** 0.5

        二次函数两个解(Δ > 0): 2, Δ **0.5
    :param a: 二次项系数
    :param b: 一次项系数
    :param c: 常数项
    :return: 返回动态码
    """
    if a == 0:
        return 0, None
    drt = b ** 2 - 4 * a * c
    if drt < 0:
        return 3, None
    sqrt_drt = math.sqrt(drt)
    if drt == 0:
        return 1, sqrt_drt
    else:
        return 2, sqrt_drt


def quadratic_formula():
    """
    求二次函数解：

    通过函数：judge_number、input_number实现用户输入以及判断，judge_prove判断函数是什么函数、是否有解

    最后该函数统一计算结果，以及输出结果

    :return: 返回值为None，所有结果均在函数内部输出
    """
    result = judge_number(*input_number())  # 获取用户输入的值，并判断是都为数字
    if result:
        a, b, c, y = result
        result2, drt = judge_prove(a, b, c)
        if result2 == 0:
            if b == 0:
                if y == c:
                    print("恒等式，有无数个解")
                else:
                    print("无解或有无数个解")
            else:
                x = round((y - c) / b, 2)
                print(f"该一次函数的解是：{x}")
        elif result2 == 3:
            print(f"该二次函数，无实数解")
        elif result2 == 1:
            x = round(-b / (2 * a))
            print(f"该二次函数，有一个实数解：{x}")
        else:
            x1 = round((-b + drt) / (2 * a),2)
            x2 = round((-b - drt) / (2 * a),2)
            print(f"该二次函数有两个实数解：x1={x1}, x2={x2}")
    else:
        print(f"包含非数字")


quadratic_formula()

a  = 10
b = 10
print(a == b)

a = [10, 50, 30]
b = [10, 50, 30]

print(a == b)