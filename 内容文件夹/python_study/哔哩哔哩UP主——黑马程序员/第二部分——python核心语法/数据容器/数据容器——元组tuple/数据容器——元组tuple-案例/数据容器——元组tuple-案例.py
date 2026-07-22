# a =100 b=200 c=300 三个值分别进行交换 a, b, c 分别赋值为 c, a, b

a = 100
b = 200
c = 300

a, b, c = c, a, b
print(a)
print(b)
print(c)

"""
    案例一：
        根据提供的学生成绩单，完成如下需求：
            1.计算每个学生的总分，各科平均分，然后一并输出出来
            2.统计各科成绩的最低分、最高分、平均分，并输出
            3.查找成绩优秀(平均分大于90) 的学生，并输出
"""


# 录入成绩 + 计算总分 以及 平均分
class StudentScore:
    def __init__(self, name, math, chinese, english):
        self.姓名 = name
        self.数学 = math
        self.语文 = chinese
        self.英语 = english

    def sum_score(self):
        sum_scorex = self.语文 + self.英语 + self.数学
        return sum_scorex

    def score_avg(self):
        avg = self.sum_score() / 3
        return avg


def judge(math, chinese, english):
    try:
        math, chinese, english = abs(float(math)), abs(float(chinese)), abs(float(english))
        values = [math, chinese, english]
        if all(0 <= n <= 100 for n in values):
            return math, chinese, english
        else:
            return None
    except ValueError:
        return None  # 直接返回 None


def student_stu():
    student = []
    while True:
        name = input("请输入学生姓名(输入0，则停止成绩录入), name=")
        if name == "0":
            return student
        math = input(f"请输入{name}数学成绩, math=")
        chinese = input(f"请输入{name}语文成绩, chinese=")
        english = input(f"请输入{name}英语成绩, english=")
        result = judge(math, chinese, english)
        if result is not None:
            stu = StudentScore(name, *result)
            student.append(stu)
        else:
            print("分数必须为数字,且在0~100之间")


score_avg = []
students = student_stu()
score_chinese = [s.语文 for s in students]
score_math = [s.数学 for s in students]
score_english = [s.英语 for s in students]
print("姓名\t\t数学\t\t语文\t\t英语\t\t总分\t\t平均分")
for stus in students:
    sum_score = stus.sum_score()
    avg = stus.score_avg()
    score_avg.append((stus.姓名, avg))
    print(f"{stus.姓名}\t\t{stus.数学}\t{stus.语文}\t{stus.英语}\t{sum_score}\t{avg:.2f}")

# 统计各科平均分，最高分，最低分
print(
    f"其中英语最高分：{max(score_english)},最低分是：{min(score_english)},平均分是：{sum(score_english) / len(score_english):.2f}")
print(
    f"其中语文最高分：{max(score_chinese)},最低分是：{min(score_chinese)},平均分是：{sum(score_chinese) / len(score_chinese):.2f}")
print(f"其中数学最高分：{max(score_math)},最低分是：{min(score_math)},平均分是：{sum(score_math) / len(score_math):.2f}")

cracking_student = []
for score in score_avg:
    if score[1] > 90:
        cracking_student.append(score[0])

if cracking_student:
    print(f"其中以下学生是优秀学生[平均分大于90]：{','.join(cracking_student)}")
else:
    print("没有优秀的学生")
