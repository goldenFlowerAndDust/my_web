# 案例一：结合前面学习的输入输出及if条件判断的知识，完成B站登录功能的实现(正确账号和密码同时符合)
user_db = {}


# 阶段一：存内存。

def register():
    username = input("请输入账号：")
    if username in user_db:
        print("账号已存在，请登录")
        return False

    password = input("请输入密码：")
    if not password:
        print("密码不能为空")
        return False
    if not password.isdigit():
        print("密码只能包含字母和数字")
        return False

    confirm = input("请再次输入密码：")
    if password != confirm:
        print("两次密码不一致")
        return False
    user_db[username] = password
    print("注册成功！")
    return True


def login():
    username = input("请输入账号：")
    password = input("请输入密码：")
    if user_db.get(username) == password:
        print(f"欢迎回来，{username}")
        return True
    else:
        print("账号或密码错误")
        return False


# 主流程：先注册，再登录
print("===请先注册===")
if register():
    print("\n===注册完成，请登录 ===")
    login()
else:
    print("注册失败，请重试")


# 案例二：根据用户输入的年份，判断这一年是闰年还是平年
# 普通闰年：不能被100整除，同时能被4整除
# 世纪闰年：能被400整除
# 其他均是平年

# 方法一：函数：不传参，直接使用 (尽量避免)
# 优点/缺点：调用函数，代码简单，但是完全依赖键盘输入，可移植性非常差
def judge_leap_year():
    try:
        year = abs(int(input("请输入年份(非零整数),year=")))
        if year == 0:
            print("年份不能为零！！！")
        elif year % 400 == 0:
            print(f"{year}是世纪闰年")
        elif year % 100 != 0 and year % 4 == 0:
            print(f"{year}是普通闰年")
        else:
            print(f"{year}是平年")
    except ValueError:
        print("请输入整数")


judge_leap_year()


# 方法二：函数：传参，用户输入数据在函数外(次优)
# 优点/缺点：参数不再依赖于键盘输入，增强可移植性，但是输出结果单一，后续操作需要迭代，浪费性能
def judge_leap(year):
    try:
        input_year = abs(int(year))
        if input_year == 0:
            return "年份不能为零"
        elif input_year % 400 == 0:
            return f"{input_year}是世纪闰年"
        elif input_year % 100 != 0 and input_year % 4 == 0:
            return f"{input_year}是普通闰年"
        else:
            return f"{input_year}是平年"
    except ValueError:
        return f"请输入整数"


judge_leap(input("请输入年份，year="))


# 方法三：将函数返回值与输出结果具体分开，达到函数负责判断，输出结果由编码者决定 (最优)
# None是唯一对象，且默认假值，用来退出循环是绝佳
# 函数只用来判断：0，非整数、闰年、平年。返回布尔值
# 具体输出结果，由其他协作者或自己外部决定，好处：轻松应对多种情况，比如计数
def is_leap_year(year):
    try:
        text_year = abs(int(year))
        if text_year == 0:
            return None
        elif text_year % 400 == 0:
            return True
        elif text_year % 100 != 0 and text_year % 4 == 0:
            return True
        else:
            return False
    except ValueError:
        return None


leap_count = 0
common_count = 0
while True:
    input_year = input("请输入年份(0为终止输入)：year=")
    result = is_leap_year(input_year)
    if result is None:
        break
    elif result:
        leap_count += 1
    else:
        common_count += 1

print(f"您输入的润年有：{leap_count}个，平年有：{common_count}个")


# 案例三：根据用户输入的数字，判断数字是奇数还是偶数
# 小数没有奇偶概念
def judge_even(number):
    try:
        input_number = int(number)
        if input_number % 2 == 0:
            return True
        else:
            return False
    except ValueError:
        return None


input_number = input("请输入一个整数，number=")
if judge_even(input_number) is None:
    print(f"{input_number}不是整数")
elif judge_even(input_number):
    print(f"{input_number}是偶数")
else:
    print(f"{input_number}是奇数")


# 案例四：根据用户输入的年龄，判断该用户是否已经成年(>=18,成年；否则，未成年)
def judge_adult(age):
    try:
        input_age = abs(int(age))
        if input_age == 0:
            return None
        elif input_age >= 18:
            return True
        else:
            return False
    except ValueError:
        return None


input_age = input("请输入年龄(大于0)：age=")
result = judge_adult(input_age)
if result is None:
    print("请输入整数")
elif result:
    print("恭喜，成年了")
else:
    print("抱歉，你还未成年")


# 案例五：根据用户输入的数字，判断该数字是正数还是负数(不考虑0)
def judge_positives(number):
    try:
        number = float(number)
        if number == 0:
            return None
        elif number > 0:
            return True
        else:
            return False
    except ValueError:
        return None


judge_number = input("请输入数字：number=")
result = judge_positives(judge_number)
if result is None:
    print("请输入非零数字")
elif result:
    print(f"{judge_number}是正数")
else:
    print(f"{judge_number}是负数")


# 案例六：根据用户输入的考试分数，判断该分数是否及格(大于等于60为及格)
def judge_score(score):
    try:
        score = abs(float(score))
        if score >= 60:
            return True
        else:
            return False
    except ValueError:
        return None


input_score = input("请输入成绩， score=")
result = judge_score(input_score)
if result is None:
    print("请输入数字")
elif result:
    print(f"{input_score}分，及格")
else:
    print(f"{input_score}分，不及格")


# 案例七：三角形类型判断：根据输入的三个边的边长(正正数)，判定是等边三角形、等腰三角形、普通三角形、不构成三角形
# 构成三角形条件：最长的边 < 另外两条边之和  也叫普通三角形
# 等腰三角形：两条边相等
# 等边三角形：三条边相等

def judge_triangle(by_1, by_2, by_3):
    try:
        by_1, by_2, by_3 = abs(int(by_1)), abs(int(by_2)), abs(int(by_3))
        triangle = [by_1, by_2, by_3]
        triangle.sort(reverse=True)
        if triangle[0] < triangle[1] + triangle[2]:
            if triangle[0] == triangle[1] == triangle[2]:
                return "equilateral"
            elif triangle[0] == triangle[1] or triangle[1] == triangle[2] or triangle[2] == triangle[0]:
                return "isosceles"
            else:
                return "ordinary"
        else:
            return False
    except ValueError:
        return None


by_1, by_2, by_3 = input("请输入三角形第一条边， by_="), input("请输入三角形第二条边， by_2="), input(
    "请输入三角形第三条边， by_3=")
result = judge_triangle(by_1, by_2, by_3)
if result is None:
    print("三条边必须是正数(当前情况下)！！！")
elif result == "equilateral":
    print(f"{by_1}, {by_2}, {by_3}组成的是等边三角形")
elif result == "isosceles":
    print(f"{by_1}, {by_2}, {by_3}组成的是等腰三角形")
elif result == "ordinary":
    print(f"{by_1}, {by_2}, {by_3}组成的是普通三角形")
else:
    print(f"{by_1}, {by_2}, {by_3}不构成三角形")

# 案例八：北京市居民年度用电电费计算：根据输入的用电度数，计算电费
# ·北京市居民电费采用阶梯电价计价方式，
# 所谓阶梯电价市指按照用户消费的电量分段定价，用电价格点亮增加呈阶梯状逐级递增的一种电价定价机制。
"""
    具体阶梯电价规则：
        第一档：2880度以下，电费单价：0.4223元/度
        第二档：2880-4800度，电费单价：0.5383元/度
        第三档：4800度以上，电费单价：0.7883远/度
"""


def calculate_electricity_bill(electricity_bill):
    try:
        electricity_bill = float(electricity_bill)
        if electricity_bill < 2880:
            return "first"
        elif 2800 <= electricity_bill < 4800:
            return "second"
        else:
            return "third"
    except ValueError:
        return None


print(
    """
        具体阶梯电价规则：
            第一档：2880度以下，电费单价：0.4223元/度
            第二档：2880-4800度，电费单价：0.5383元/度
            第三档：4800度以上，电费单价：0.7883远/度
    """
)
use_electricity = input("请输入年度用电：use_electricity=")
result = calculate_electricity_bill(use_electricity)
if result is None:
    print("请输入数字")
elif result == "first":
    use_electricity_bill = float(use_electricity) * 0.4223
    print(f"用电：{use_electricity}度，电费：{use_electricity_bill}元")
elif result == "second":
    use_electricity_bill = float(use_electricity) * 0.5383
    print(f"用电：{use_electricity}度，电费：{use_electricity_bill}元")
else:
    use_electricity_bill = float(use_electricity) * 0.7883
    print(f"用电：{use_electricity}度，电费：{use_electricity_bill}元")

# 情况二：分段计费，然后求和 令 第一档边界在 小于等于2800 第二档 大于2800 小于等于 4800 第三档 大于4800

result2 = calculate_electricity_bill(use_electricity)
if result2 is None:
    print("请输入数字")
elif result2 == "first":
    use_electricity_bill = float(use_electricity) * 0.4223
    print(f"用电：{use_electricity}度，电费：{use_electricity_bill}元")
elif result2 == "second":
    use_electricity = float(use_electricity)
    use_electricity_bill = 2800 * 0.4223 + (use_electricity - 2800) * 0.5383
    print(f"用电：{use_electricity}度，电费：{use_electricity_bill}元")
else:
    use_electricity = float(use_electricity)
    use_electricity_bill = 2800 * 0.4223 + (use_electricity - 2800) * 0.5383 + (use_electricity - 4800) * 0.7883
    print(f"用电：{use_electricity}度，电费：{use_electricity_bill}元")

# 案例八：对于小学：租公交问题
"""
    某旅游团有总人数people，每辆车最多坐 capacity人，计算至少需要多少辆车。
    步骤：
        1.用户输入数据(人数、座位数)
        2.函数负责判断
        3.输入结果
"""


def let_bus_problem(people, capacity):
    try:
        people = abs(int(people))
        capacity = abs(int(capacity))
        if people == 0 or capacity == 0:
            return None
        elif people <= capacity:
            return "1"
        elif people > capacity and (people - capacity) % capacity == 0:
            return (people - capacity) // capacity + 1
        else:
            return (people - capacity) // capacity + 2
    except ValueError:
        return None


peoples = input("请输入总人数, peoples=")
capacity = input("请输入每辆车最多坐人数,capacity=")
result = let_bus_problem(peoples, capacity)
if result is None:
    print("请输入整数(大于零)")
else:
    print(f"总人数：{peoples}人，每辆车座位：{capacity}，总共需要：{result}辆车")
