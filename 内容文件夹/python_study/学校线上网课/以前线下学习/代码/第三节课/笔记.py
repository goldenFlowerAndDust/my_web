"""
    输出时，使用f关键字，在大括号内(变量名)后加英文冒号:
        1.单纯输入数字。【表示该变量名输出的占N位(具体以输入的数字为主)】
        2.点加数字:【如果输出的数值太长，会变成科学计数法】
        3.单加数字+后缀【F强制以浮点数输出，】

    在Python中，对于缩进，空格非常敏感
"""

height = input("请输入你的身高(米)：")

weight = input("请输入你的体重(千克)：")

height2 = float(height) ** 2

BMI = float(weight) / height2

print(f'您的BMI指数是：{BMI:.2f}')

if 18.5 < BMI < 23.9:
    print("正常范围")
elif BMI < 18.5:
    print("需要加强营养")
elif 23.9 < BMI < 28:
    print("需要控制体重")
else:
    print("需要警惕健康风险")

    """
        任务：输入BMI指数计算结果后，判断正常指标，并给出建议
    """

while True:
    age = input("请输入你的年龄(年龄大于0)：")
    try: # 用于捕获代码执行过程中可能出现的异常(错误)。比如int()转非数字字符串,以及浮点数
        # 尝试执行的代码(可能会输错)
        age1 = int(age)
        if age1 > 0:
            break
        else:
            print("输入的整数必须大于0，请重新输入")
    #  与try是固定搭配  （异常处理）
    except ValueError: # 具体流程：tyr识别，输入程序会不会有Error返回值（数据类型自动判断，不符合会报错，被try识别）， 识别到Error,执行except Error的内容。
        print("输入无效，请输入一个整数")
# 循环结束后判断
if age1 >= 18:
    print("你已经成年，可以进入网吧")
else:
    print("你未成年不能进入网吧")
