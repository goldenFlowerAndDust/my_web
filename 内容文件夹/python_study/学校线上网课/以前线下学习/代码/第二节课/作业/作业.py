"""
    输入对一个加数，再输入第二个加数，最后输出结果
    默认输出：字符串
"""

# num1 = input("请输入第一个加数：")
# num2 = input("请输入第二个加数：")
#
# SUM = int(num1) + int(num2)
#
# print(f"计算结果：{SUM}")

# Python字符类型：int(整数类型)   float(浮点数类型)   String  (字符串类型)  bool  （布尔类型）：只有true和false两个值
# 所以：转整数类型 int(变量名)  转浮点数类型 float(变量名)    转字符串类型   str(变量名)


# 作业计算个人的BMI指数，输入身高和体重，BMI指数=体重/身高 的平方

height = input("请输入你的身高(米)：")

weight = input("请输入你的体重(千克)：")

BMI = float(weight) / float(height)

BMI2 = BMI ** 2

print(f"您的BMI指数是：{BMI2}")

