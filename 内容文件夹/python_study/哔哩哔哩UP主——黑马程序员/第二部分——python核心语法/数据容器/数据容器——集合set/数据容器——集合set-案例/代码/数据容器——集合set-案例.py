list_1 = [50, 50, 30, 80, 100, 100]
print(f"原列表：{list_1}")
set_1 = set(list_1)
print(f"去重后：{list(set_1)}")

"""
    案例：根据提供的班级学生的选课情况，完成如下需求：
        1.找出同时选修了法语和艺术的学生  同时——交集 方法：intersection() /&  /element in container /issubset()
        2.找出同时选修了所有四门课程的学生 同时——交集 方法 ： intersection() & element in container /issubset()
        3.找出选修了足球，但是没有选修篮球的学生  首集合，独一无二元素组成的集合 差集 difference() /- 
        4.统计每个学生选修的课程数量 统计元素个数 len()
"""


class Student:
    def __init__(self, name, teach):
        self.姓名 = name
        self.课程 = teach

    def french_and_art(self):
        if ("法语" in self.课程 and "艺术" in self.课程) or ("French" in self.课程 and "Art" in self.课程):
            return self.姓名
        else:
            return None

    def four_teach(self):
        if len(self.课程) == 4:
            return self.姓名
        else:
            return None

    def football_not_basketball(self):
        if "篮球" not in self.课程:
            return self.姓名
        else:
            return None

    def count_stu_teach(self):
        count = len(self.课程)
        return count


def teach_judge(teach):
    allowed_chinese = {"法语", "艺术", "足球", "篮球"}
    allowed_english = {"French", "Art", "football", "basketball"}
    if len(teach) > 4:
        return None
    else:
        if teach.issubset(allowed_chinese):  # issubset 判断集合teach内的元素是否都在集合allowed范围内
            return teach
        elif teach.issubset(allowed_english):
            return teach
        else:
            return False


def student_teach():
    stus = []
    while True:
        print(
            "课程规定四门：法语(French)\t\t艺术(Art)\t\t足球(football)\t\t篮球(basketball)\n请输入全英文或全中文，不要中英混搭")
        name = input("请输入学生姓名(输入0，则停止输入)：name=")
        if name == "0":
            return stus
        teach = input("请输入课程-可以同时选多门课，课程之间由英文逗号隔开(最多四门)：teach=")
        teach = set(teach.split(','))
        result = teach_judge(teach)
        if result:
            students = Student(name, teach)
            stus.append(students)
        elif result is False:
            print("请输入要求的四门科目,或中英混搭了")
        else:
            print("请输入最多四门科目")


topics1 = []
topics2 = []
topics3 = []
topics4 = []
for student_answer in student_teach():
    if student_answer.french_and_art():
        topics1.append(student_answer.french_and_art())
    if student_answer.four_teach():
        topics2.append(student_answer.four_teach())
    if student_answer.football_not_basketball():
        topics3.append(student_answer.football_not_basketball())
    if student_answer.count_stu_teach():
        topics4.append((student_answer.姓名, student_answer.count_stu_teach()))

print(f"同时选修了法语和艺术的学生有：{','.join(map(str, topics1))}")
print(f"同时选修了四门课程的学生有：{','.join(map(str, topics2))}")
print(f"选修了足球，但没有选修篮球的学生有：{','.join(map(str, topics3))}")
for sty in topics4:
    print(f"{sty[0]}选修了{sty[1]}门课程")

#     案例二：同样要求，不过已知学生选择课程
# 选修足球学生名单
football_set = {"王林", "曾牛", "徐立国", "遁天", "天运子", "韩立", "厉飞雨", "乌丑", "紫灵"}
# 选修篮球学生名单
basketball_set = {"张铁", "墨居仁", "王林", "姜老道", "曾牛", "王蝉", "韩立", "天运子", "李化元", "厉飞雨", "云露"}
# 选修法语学生名单
french_set = {"许木", "王卓", "十三", "虎咆", "姜老道", "天运子", "红蝶", "厉飞雨", "韩立", "曾牛"}
# 选修艺术学生名单
art_set = {"遁天", "天运子", "韩立", "虎咆", "姜老道", "紫灵"}

#      1.找出同时选修了法语和艺术的学生  同时——交集 方法：intersection() /&  /element in container /issubset()
#   方法一：方法：intersection()
French = football_set.intersection(art_set)
print(f"同时选择法语与艺术学生有：{'、'.join(French)}")

# 方法二：&
French = football_set & art_set
print(f"同时选择法语与艺术学生有：{'、'.join(French)}")

#     2.找出同时选修了所有四门课程的学生 同时——交集 方法 ： intersection() & element in container /issubset()
# 方法一：intersection()
four_teach = football_set.intersection(basketball_set, football_set, art_set)
print(f"同时选择四门科目的学生有：{'、'.join(four_teach)}")

# 方法二： &
four_teach = football_set & basketball_set & football_set & art_set
print(f"同时选择法语与艺术学生有：{'、'.join(four_teach)}")

#     3.找出选修了足球，但是没有选修篮球的学生  首集合，独一无二元素组成的集合 差集 difference() /-
# 方法一：intersection()
football_not_basketball = football_set.difference(basketball_set)
print(f"同时选择足球，但是没有选择篮球学生有：{'、'.join(football_not_basketball)}")

# 方法二： -
football_not_basketball = football_set - basketball_set
print(f"同时选择足球，但是没有选择篮球学生有：{'、'.join(football_not_basketball)}")

# 方法三：集合推导式
football_not_basketball = {name for name in football_set if name not in basketball_set}
print(f"同时选择足球，但是没有选择篮球学生有：{'、'.join(football_not_basketball)}")

#     4.统计每个学生选修的课程数量 统计元素个数 len()

# 要想求出每个学生的课程数量，就要先求出所有学生，然后获取四门课程所有报名名字，最后通过count(姓名)，获取每个学生的课程人数
names = {*football_set, *basketball_set, *art_set, *french_set}  # 通过集合，自动去重特性，获取全部学生姓名

# 将所有课程的包名学生组合起来
name_list = [*french_set, *basketball_set, *art_set, *french_set]

# 先遍历出所有学生姓名：
for name in names:
    # 通过获取的名字，统计出现的次数
    print(f"学生{name}，共有{name_list.count(name)}门课程")
