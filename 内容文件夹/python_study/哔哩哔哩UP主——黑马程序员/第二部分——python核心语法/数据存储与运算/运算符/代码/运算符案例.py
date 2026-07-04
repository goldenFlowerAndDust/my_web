import math


# 封装函数，判断用户输入的值
def get_float(value):
    while True:
        try:
            number = float(input(value))
            return number
        except ValueError:
            print(f"不是数值类型，请重新输入!!!")


# 案例1：要求输入两个数x与y，分别输出x+y 与 x-y
x = get_float("请输入一个数字，X=")
y = get_float("请输入一个数字，Y=")
print(f"x + y = {x + y}")
print(f"x - y = {x - y}")

# 精度损失：由于计算机底层是基于二级制进行数据的存储和处理，二级制是无法准确的表示所有的小数
# 因此涉及到浮点数的运算，可能会损失精度

# 案例2：计算输入的三个整数的平均数
# 无敌的新发现：同时赋值+input+try-except 可以实现用户每个输入数据的判断。避免重复if-elsif
x = get_float("请输入一个整数，X=")
y = get_float("请输入一个整数，Y=")
z = get_float("请输入一个整数，Z=")
print(f"{x}, {y}, {z} 的平均数 = {(x + y + z) / 3}")

# 案例2：要求输入梯形的上低、下底、高，然后计算梯形的面积
# S梯 = (上底 + 下底) * 高 / 2
upper_base = get_float("请输入一个整数，upperBase=")
lower_base = get_float("请输入一个整数，lowerBase=")
height = get_float("请输入一个整数，height=")
print(
    f"梯形的上底为：{upper_base}cm,下底为：{lower_base}cm,高为：{height}cm,面积为：{(upper_base + lower_base) * height / 2}cm²")

# 案例3：要求输入圆的半径，然后计算圆的周长和面积
# C圆 = 2Πr  S圆 = Πr²
radius = get_float("请输入半径(整数), radius=")
print(f"圆的半径为{radius}cm,C圆 = {2 * math.pi * radius}cm,S圆 = {math.pi * radius ** 2}cm²")

# 案例4：身体质量指数BMI的计算
# BMI = 体重(kg) / 身高(m)²
bmi_weight, bmi_height = get_float("请输入体重(kg)，weight="), get_float("请输入身高(m)：height=")
print(f"您的身高为{bmi_height}m,体重为{bmi_weight}kg,BMI值为{bmi_weight / bmi_height ** 2:.2f}")

# 赋值运算符的示例
num = 10  # 10
num += 10  # 20
num -= 10  # 10
num *= 10  # 100
num /= 10  # 10.0
num //= 10  # 1.0
num %= 10  # 1.0
num **= 10  # 1.0
print(num)


# 案例5：判断一个术是否为偶数 使用 == 运算符
def judge_even():
    even_number = get_float("请输入一个数字：number=")
    if even_number % 2 == 0:
        return f"{even_number}是一个偶数"
    else:
        return f"{even_number}是一个奇数"


print(judge_even())

# 思考1：电商项目的支付功能业务，需要判断银行卡余额是否足够，使用那个关系运算符？ 答：>=
# 思考1：电商项目的购买商品业务，需要判断货物的库存是否足够，使用那个关系运算符？ 答：>=
# 思考1：点餐项目的筛选商品业务，需要不超过100元的，使用那个关系运算符？ 答：<=


# 案例6：键盘输入一个数字，判断这个数字是否在10~20之间
judge_num = get_float("请输入数字,number=")
if 10 < judge_num < 20:
    print("数字在10~20之间")
else:
    print("数字不在10~20之间")
