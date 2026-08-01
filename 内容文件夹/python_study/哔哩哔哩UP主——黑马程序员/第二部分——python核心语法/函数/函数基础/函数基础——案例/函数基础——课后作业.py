# 课后作业

# 1.定义一个函数，根据传入的分数，计算对应的分数等级并返回
"""
    分数 >= 90：A
    分数 >= 75：B
    分数 >= 60：C
    分数 < 60：D
"""


def judge_score_leven(score):
    """
        该函数主要判断分数等级(分数应在0~100之间)
        分数 >= 90：A
        分数 >= 75：B
        分数 >= 60：C
        分数 < 60：D

        :param score:传入的分数
        :return :返回值：(等级,成绩)元组形式
    """
    try:
        score = abs(float(score))
    except ValueError:
        return "非数字", None
    if score > 100:
        return "无等级", score
    elif score >= 90:
        return 'A', score
    elif score >= 75:
        return 'B', score
    elif score >= 60:
        return 'C', score
    else:
        return 'D', score


score_input = input("请输入分数(负数取绝对值，值域：[0,100]),number=")
result = judge_score_leven(score_input)
if result[1] is None:
    print("输入的不是数字类型")
else:
    print(f"成绩评定：{result[0]}, 分数：{result[1]}分")


# 定义一个函数，用于判断一个字符串是否是回文字符串，返回bool值
def palindrome_str(string):
    """
        该函数主要判断是否为回文字符串。

        回文字符串：正序与反序结果为同一字符串

        :param string:传入的字符串
        :return:是回文返回True，否则返回False
    """
    if string == string[::-1]:
        return True, string
    else:
        return False, string


string_input = input("请输入一个回文字符串：str=")
result = palindrome_str(string_input)
if result[0] is False:
    print(f"{result[1]} 不是回文字符串")
else:
    print(f"{result[1]} 是回文字符串")


# 定义一个函数：完成时间转换功能，能转入的秒转换为小时：分钟：秒


def countdown(times):
    """
        该函数用于指定时间的倒计时
        :parme times:需要倒计时的时间,默认时间为秒
        :return : 实参为数字，返回对应时间，否则False
        
    """
    try:
        times = int(round(abs(float(times)), 0))
    except ValueError:
        return False

    h = times // 3600
    m = (times % 3600) // 60
    s = (times % 3600) % 60

    return h, m, s


print("=====================秒转，[时：分：秒]转换器==========================")
times_input = input("请输入需要转换的时间(负数取绝对值)，time=")
result = countdown(times_input)

if result is False:
    print("输入的不是数字类型")
else:
    print(f"{result[0]}时 ：{result[1]} 分：{result[2]}秒")


# 定义一个函数：根据传入的三角形三个边长，判定三角形的类型（等边、等腰、普通、或者不够成三角形）
def judeg_triangle(brim):
    """
        该函数用于判断，三角形的类型，或不构成三角形

        :param brim:三条边长组成的容器
        :return ：构成三角形，返回对应类型，不构成返回False，含非数字类型或0返回：None
    """
    try:
        brim = [abs(float(b)) for b in brim]
        if any(b == 0 for b in brim):
            return None, None
    except ValueError:
        return None, None
    brim.sort()
    set_brim = set(brim)
    if brim[0] + brim[1] <= brim[2]:
        return False, brim
    elif len(set_brim) == 1:
        return "等边三角形", brim
    elif len(set_brim) == 2:
        return "等腰三角形", brim
    else:
        return "普通三角形", brim


brim = []
for brims in range(1, 4):
    b = input(f"请输入第{brims}条边(负数取绝对值、边长不为零)")
    brim.append(b)

result = judeg_triangle(brim)
if result[0] is None:
    print("包含非数字类型字符或存在边长为0情况")
elif result[0] is False:
    print(f"边长：{','.join(map(str, result))}不构成三角形")
else:
    print(f"边长：{','.join(map(str, result))},构成：{result[0]}")
