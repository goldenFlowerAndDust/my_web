list_1 = [10, "hello", 30, 50, {"姓名": "老刘"}]
for index in range(0, len(list_1)):
    print(list_1[index])

for item in list_1:
    if isinstance(item, dict):
        item["姓名"] = "王五"
        print(item)
    else:
        print(item)


# 案例一、计算1~n之间所有奇数之和。使用for循环，n由用户输入
def judge_odd_numbers(nums):
    try:
        nums = int(nums)
        if nums <= 0:
            return False
        else:
            sums = 0
            for num in range(1, nums + 1, 2):
                sums += num
        return sums
    except ValueError:
        return None


num = input("求1~n之间奇数和，n(为大于0整数)=")
result = judge_odd_numbers(num)
if result is None:
    print("请输入数字")
elif result is False:
    print("必须是大于0的整数")
else:
    print(f"1~{num}的奇数和是：{result}")

# 第二中异常处理：raise ValueError()
# 在 try-except ValueError 内，用于指定判断后无(rerun 返回值)，后续输出判断价值的条件，直接交由 expect ValueError 兜底
# 在 try-except ValueError 外，直接报红，停止程序运行，报红提示就是 ValueError()，括号内的内容


# 案例二、计算100~500之间所有3的倍数的数字之和
# 方法一:列出所有数，内部判断，并相加。优点：清晰易懂。缺点：性能浪费，当范围内数字越多，越明显
sums = 0
for num in range(100, 501):
    if num % 3 == 0:
        sums += num
print(f"100~500之间三的倍数和为：{sums}")

# 方法二：公式(生成 n 的倍数序列：从第一个 n 的倍数开始，步长为 n。如果范围下限不是 n 的倍数，需要先调整起点。)
# 好处是：性能大减，不需要额外判断，直接取n的倍数，然后求和。 坏处：需要额外求第一个范围内n的倍数的数
# 先求范围内第一个 三 的倍数
n = 3
start = 100
while start % n != 0:  # while 循环条件(注意不是退出循环的条件)
    start += 1
sums = 0
for num in range(start, 501, n):
    sums += num

print(f"100~500之间三的倍数和为：{sums}")


# 案例三、内嵌循环案例：打印一个长度为m，宽度为n的长方形

def print_rectangle(width, height):
    try:
        width = abs(int(width))
        height = abs(int(height))
    except ValueError:
        return None
    total = ""
    for row in range(width):  # 控制列
        total += "\n"
        for col in range(height):  # 控制行
            total += "* "
    return total


print(print_rectangle(5, 8))
print("==================方法二======================")


def square_diamond(n):
    start_s = n
    for i in range(n):
        if i == 0 or i == n - 1:
            print("*  " * start_s)
        else:
            print("*" + " " * (3 * (start_s - 1) - 1) + "*")


square_diamond(8)

print("==================hello================")


# 菱形，每行符号数始终为奇数，关于对称图形，每行符号数始终为奇数。
def lin_xin(n):
    for i in range(n):
        start = 2 * min(i, n - i - 1) + 1  # 每行个数
        remove = start - 2  # 去头去尾，为留空做准备
        space = (n - start) // 2  # 外部空格数
        if start == 1:
            print(" " * space + "*")
        else:
            print(" " * space + "*" + " " * remove + "*")


lin_xin(9)


# 打印九九乘法表
def multiplication_table(n):
    try:
        n = int(n)
    except ValueError:
        return None
    total = ""
    for i in range(1, n + 1):
        total += "\n"
        for j in range(1, i + 1):  # 内层循环结束后，才会执行外循环
            total += f"{j} * {i} = {i * j} "
    return total


print(multiplication_table(9))


def triangle(n):
    try:
        n = int(n)
    except ValueError:
        return None
    total = ""
    for i in range(1, n + 1):
        total += f"{'*' * i}\n"
    return total


print(triangle(9))


def cube(n):
    try:
        n = int(n)
        for i in range(1, n + 1):
            start2 = 2 * i - 1
            space2 = (2 * n - 1 - start2) // 2
            print(' ' * space2 + "*" * start2)
    except ValueError:
        return None


cube(9)

total = ""
for i in range(1, 7):
    total += "\n"
    for j in range(1, i + 1):
        total += f"{j}\t"
print(total)

for i in range(1, 9):
    for j in range(1, 9):
        if (i + j) % 2 == 0:
            print("🤣", end=" ")
        else:
            print("🧡", end=" ")
    print()

print()

for i in range(1, 9):
    if i % 2 == 0:
        for j in range(1, 9):
            if j % 2 == 0:
                print("😍", end="\t")
            else:
                print("😏", end="\t")
    else:
        for j in range(1, 9):
            if j % 2 == 0:
                print("😏", end="\t")
            else:
                print("😍", end="\t")
    print()

# 综合案例：
# 一、需求：根据输入的用户名密码执行登录操作，具体要求如下：
"""
    1.正确的用户名和密码：admin/666888 zhangsan/123456  taoge/888666
    2.输入用户名和密码进行登录，知道登录成功，程序结束运行；
    3.登录失败，则继续输入用户名和密码进行登录
    4.输入的用户名和密码不能为空
    5.登录成功：输出”登陆成功，进入B站首页“
    6.登录失败：输出”用户名或密码错误，请重新输入“
"""

use = {"admin": "666888", "zhangsan": "123456", "taoge": "888666"}

def judge_use():
    while True:
        username = input("请输入用户名，username=")
        if username == "":
            print("用户名不能为空")
            continue
        if username not in use:
            print("用户名不存在，请重新输出")
            continue
        else:
            while True:
                password = input("请输入密码，password=")
                if password == "":
                    print("密码不能为空")
                    continue
                elif use[username] == password:
                    print("登入成功，进入B站首页~")
                    return
                else:
                    print("密码错误，请重新输入！！！")


judge_use()

# 案例二、猜数字游戏
"""
    1.系统随机生成一个随机数
    2.用户根据提示猜数字，并将所猜的数字输入系统
    3.如果猜错，系统给出提示是猜大了，还是猜小了，然后继续输入猜的数字
    4.如果猜对，系统自动退出，游戏结束
"""
import random
random_number = random.randint(1,100)
while True:
    try:
        num = int(input("请输入整数(1~100)，number="))
        if num <= 0 or num > 100:
            raise ValueError
    except ValueError:
        print("请输入1~100之间的整数")
        continue # 退出当前循环，继续执行下一个循环
    if num > random_number:
        print("猜大了")
        continue
    elif num < random_number:
        print("猜小了")
        continue
    else:
        print(f"恭喜猜成功了，你的幸运数字是：{random_number}")
        break # 退出循环