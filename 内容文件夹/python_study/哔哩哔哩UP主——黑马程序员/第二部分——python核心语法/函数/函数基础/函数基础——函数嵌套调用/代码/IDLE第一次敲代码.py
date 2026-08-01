def judge_number(*num):
    try:
        return tuple(float(num) for num in num)
    except ValueError: return None

def input_number():
    a, b, c, y = input("请输入二次项系数，a="), input("请输入一次项系数, b="), input("请输出常数项, c="), input("请输入值, y=")
    return a, b, c, y
    
def judge_prove(a, b, c, y):
    if a == 0:
        return 0,None
    drt = b ** 2 - 4 * a * (c-y)
    if drt < 0:
        return 3,None
    import math
    sqrt_drt = math.sqrt(drt)
    if drt == 0:
        return 1,sqrt_drt
    else:
        return 2,sqrt_drt

def qurdratic_formula():
    reslut = judge_number(*input_number())
    if reslut:
        a, b, c, y = reslut
        reslut2,sqrt_drt = judge_prove(a,b,c,y)
        if reslut2 == 0:
            if b == 0 and c == y:
                print("恒等式，有无数个解")
            elif b != 0:
                x = round((y-c)/b,2)
                print(f"该一次函数的解是：{x}")
            else:
                print("无解，或有无数个解")
        elif reslut2 == 3:
            print("该函数无实数解")
        elif reslut2 == 1:
            x = round(-b/(2*a) ,2)
            print(f"函数只有一个解：x={x}")
        else:
            x1 = round((-b + sqrt_drt)/(2*a) ,2)
            x2 = round((-b - sqrt_drt)/(2*a) ,2)
            print(f"函数有两个解，x1={x1}, x2={x2}")
    else:
        print("所有参数均为数字")
qurdratic_formula()
