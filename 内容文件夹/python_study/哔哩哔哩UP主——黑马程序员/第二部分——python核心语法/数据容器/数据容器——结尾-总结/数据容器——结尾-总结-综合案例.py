# 综合案例
"""
    开发一个教务管理系统，再该系统中可以维护和管理学员的成绩信息，具体要求如下：
        1.添加学生信息：根据提示录入学生：姓名、数学、语文、英语成绩，录入完成保存到系统中。
        2.修改学生信息：要求输出要修改的学生姓名，然后再提示输入语文、数学、英语成绩，输入完成后修改学员信息
        3.删除学生信息：要求输入要删除的学生姓名，根据姓名和删除学生信息
        4.查询学生信息：要求输入要查询的学生姓名，根据姓名查询学生信息并输出
        5.列出所有学生，遍历所有学生信息并输出
        6.统计班级成绩：统计班级语文、数学、英语成绩最高分、最低分、平均分
            以及语文、数学、英语最低分和最高分的学生姓名
        7.退出系统
"""


class Student:
    def __init__(self):
        self.OS = {}

    def add(self, name, chinese_score, math_score, english_score):
        """
        添加学生信息到系统中
        参数：name(姓名)、Chinese_score(语文成绩)、math_score(数学成绩)、english_score(英语成绩)
        返回 bool 添加成功返回 True, 否则 False
        """
        # 1. 校验参数类型
        try:
            chinese_score = float(chinese_score)
            math_score = float(math_score)
            english_score = float(english_score)
            scor = chinese_score, math_score, english_score
        except ValueError:
            print("成绩应为数字")
            return False

        # 2. 判断成绩是否在 0~100之间
        if all(0 <= score <= 100 for score in scor):
            # 3. 将成绩录入
            self.OS[name] = {f"语文": chinese_score, "数学": math_score, "英语": english_score}
            print(f"学生：{name} 已录入系统")
            return True
        else:
            print(f"成绩在0~100之间")
            return False

    def revise(self, name, chinese_score=None, math_score=None, english_score=None):  # 默认成绩不更改
        """
        修改系统中的学生信息
        参数：name(姓名)、Chinese_score(新语文成绩，可选)、math_score(数学成绩，可选)、english_score(英语成绩，可选)
        返回 bool 添加成功返回 True, 否则 False
        """
        # 判断学生是否在系统内
        if name not in self.OS:
            print(f"学生：[{name}]，未录入系统当中")
            return False

        # 验证 并 更新 语文成绩
        if chinese_score is not None:  # 当用户重新输出，则更改成绩，否则不更改
            try:
                chinese_score = float(chinese_score)
                if chinese_score > 100 or chinese_score < 0:
                    raise ValueError
                else:
                    self.OS[name]["语文"] = chinese_score
            except ValueError:
                print(f"语文成绩必须是0~100之间数字")
                return False

        # 验证 并 更新 数学成绩
        if math_score is not None:
            try:
                math_score = float(math_score)
                if math_score > 100 or math_score < 0:
                    raise ValueError
                else:
                    self.OS[name]["数学"] = math_score
            except ValueError:
                print(f"数学成绩必须是0~100之间数字")
                return False

        # 验证 并 更新 英语成绩
        if english_score is not None:
            try:
                english_score = float(english_score)
                if english_score > 100 or english_score < 0:
                    raise ValueError
                else:
                    self.OS[name]["英语"] = english_score
            except ValueError:
                print(f"英语成绩必须是0~100之间数字")
                return False

        print(f"学生：[{name}] 数据已更新")
        return True

    def remove(self, name):
        """
        从系统中删除学生信息
        参数：name(学生姓名)
        返回：bool 删除成功返回True，否则返回False
        """

        # 判断学生是否在系统中
        if name not in self.OS:
            print(f"学生：[{name}]，未录入系统")
            return False

        del self.OS[name]
        print(f"学生：[{name}] 信息已删除")
        return True

    def refer(self, name):
        """
        查询单个学生信息
        参数：name(学生姓名)
        返回：dict 学生信息，不存在返回None
        """
        if name not in self.OS:
            print(f"学生：{name}，未录入系统")
            return None

        item = self.OS[name]
        print(f"学生：{name}，语文：{item["语文"]}分，数学：{item["数学"]}分，英语：{item["英语"]}分")
        return item

    def refer_all(self):
        """
        查询录入全部学生信息：
        """

        if not self.OS:
            print(f"未录入，任何学生信息")
            return

        print("姓名\t\t语文\t\t\t数学\t\t\t英语\t\t\t总分\t\t\t平均分")

        for name, info in self.OS.items():
            chinese_score, math_score, english_score = info["语文"], info["数学"], info["英语"]
            total = chinese_score + math_score + english_score
            avg = total / len(info)
            print(f"{name}\t\t{chinese_score}\t\t{math_score}\t\t{english_score}\t\t{total:.2f}\t\t{avg:.2f}")

    def score_max_min(self):
        if not self.OS:
            print(f"未录入，任何学生信息")
            return

        chinese_score = []
        math_score = []
        english_score = []
        for name in self.OS.keys():
            # 犯同样错误，视图没有下标
            value = self.OS[name]
            chinese_score.append(value["语文"])
            math_score.append(value["数学"])
            english_score.append(value["英语"])

        max_chinese = max(chinese_score)
        min_chinese = min(chinese_score)
        max_math = max(math_score)
        min_math = min(math_score)
        max_english = max(english_score)
        min_english = min(english_score)
        # 获取姓名原版
        # for name in self.OS.keys():
        #     if self.OS[name]["语文"] == max_chinese:
        #         max_chinese_name = name
        #     if self.OS[name]["语文"] == min_chinese:
        #         min_chinese_name = name
        #
        #     if self.OS[name]["数学"] == max_math:
        #         max_math_name = name
        #     if self.OS[name]["数学"] == min_math:
        #         min_math_name = name
        #
        #     if self.OS[name]["英语"] == max_english:
        #         max_english_name = name
        #     if self.OS[name]["英语"] == min_english:
        #         min_english_name = name

        # 使用列表推到式更好：筛选用列表推到式 获取姓名
        max_chinese_name = str([name for name, info in self.OS.items() if info["语文"] == max_chinese])
        min_chinese_name = str([name for name, info in self.OS.items() if info["语文"] == min_chinese])
        max_math_name = str([name for name, info in self.OS.items() if info["数学"] == max_math])
        min_math_name = str([name for name, info in self.OS.items() if info["数学"] == min_math])
        max_english_name = str([name for name, info in self.OS.items() if info["英语"] == max_english])
        min_english_name = str([name for name, info in self.OS.items() if info["英语"] == min_english])

        print(f"语文最高分：{max_chinese}，学生：{max_chinese_name}，语文最低分：{min_chinese}，学生：{min_chinese_name}\n"
              f"数学最高分：{max_math}，学生：{max_math_name}，数学最低分：{min_math}，学生：{min_math_name}\n"
              f"英语最高分：{max_english}，学生：{max_english_name}，数学最低分：{min_english}，学生：{min_english_name}\n")

    def clear(self):
        # 清空系统
        self.OS.clear()
        print("已清空全部学生信息")
        return

    # 主程序


def student():
    # 创建一个学生实例，所有操作围绕这个实例进行
    stu = Student()
    while True:
        print("""
            ##################学生管理系统##################
            #   1.添加学生信息        2.修改学生信息         #
            #   3.删除学生信息        4.查询学生信息         #
            #   5.查询全部学生信息     6.清空全部学生信息     #
            #   7.统计班级成绩        8.退出管理系统         #
            ##################学生管理系统##################
        """)
        choose = input("请输入要执行的操作(1~8)，choose=")
        match choose:
            case "1":
                name = input("请输入学生姓名, name=")
                chinese_score = input(f"请输出学生[{name}]的语文成绩(0~100), 语文成绩=")
                math_score = input(f"请输出学生[{name}]的数学成绩(0~100), 数学成绩=")
                english_score = input(f"请输出学生[{name}]的英语成绩(0~100), 英语成绩=")
                reslut = stu.add(name, chinese_score, math_score, english_score)
                if reslut is False:
                    continue
            case "2":
                name = input("请输出要修改信息的学生姓名， name=")
                chinese_score = input(f"{name},新语文成绩(直接回车跳过)：语文成绩=")
                math_score = input(f"{name},新数学成绩(直接回车跳过)：数学成绩=")
                english_score = input(f"{name},新英语成绩(直接回车跳过)：英语成绩=")
                reslut = stu.revise(name, chinese_score if chinese_score else None, math_score if math_score else None,
                                    english_score if english_score else None)  # 暂时不懂啥意思
                if reslut is False:
                    continue
            case "3":
                name = input("请输入要删除信息的学生姓名, name=")
                stu.remove(name)

            case "4":
                name = input("请输入需要查询信息的学生名称, name=")
                stu.refer(name)

            case "5":
                stu.refer_all()

            case "6":
                stu.clear()

            case "7":
                stu.score_max_min()

            case "8":
                print("退出管理系统，期待您的下次使用！！！")
                break


student()

# 老师案例答案：
"""
    案例:
    开发一个教务管理系统，在该系统中可以维护和管理学员的成绩信息，具体需求如下：
        1. 添加学生信息：根据提示录入学生姓名、语文、数学、英语成绩，录入完成保存到系统中。
        2. 修改学生信息：要求输入要修改的学生姓名，然后再提示输入语文、数学、英语成绩，输入完成后修改学员信息。
        3. 删除学生信息：要求输入要删除的学生姓名，根据姓名删除学生信息。
        4. 查询学生信息：要求输入要查询的学生姓名，根据姓名查询学生信息并输出。
        5. 列出所有学生：遍历所有学生信息并输出。
        6. 统计班级成绩：统计班级语文、数学、英语成绩的最高分、最低分、平均分，以及语文、数学、英语最高分和最低分的学员姓名。
        7. 退出系统。
"""

menu = """
# # # # # # # # # # # # # # # # # # # # # # # # # # 【菜单】 # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#  1. 添加学生信息   2. 修改学生信息   3. 删除学生信息   4. 查询学生信息   5. 列出所有学生   6. 统计班级成绩   7. 退出系统       #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""
print("欢迎使用教务管理系统 ~")

student_scores = {}

while True:
    # 1. 制作菜单
    print(menu)

    # 2. 执行的具体操作
    choice = input("请选择要执行的操作(1-7): ")
    match choice:
        case "1":  # 添加学生信息
            student_name = input("请输入学生姓名: ")
            chinese_score = float(input("请输入语文成绩: "))
            math_score = float(input("请输入数学成绩: "))
            english_score = float(input("请输入英语成绩: "))

            # 如果学生存在, 则不执行添加, 提示信息
            if student_name in student_scores:
                print("该学生已存在, 请重新选择 ~")
            else:
                student_scores[student_name] = {"chinese": chinese_score, "math": math_score, "english": english_score}
                print("学生信息添加完毕 ~")
        case "2":  # 修改学生信息
            student_name = input("请输入要修改的学生姓名: ")
            # 如果学生不存在, 则提示错误信息, 重新选择
            if student_name not in student_scores:
                print("该学生不存在, 请重新选择 ~")
                continue

            chinese_score = float(input("请输入语文成绩: "))
            math_score = float(input("请输入数学成绩: "))
            english_score = float(input("请输入英语成绩: "))
            student_scores[student_name] = {"chinese": chinese_score, "math": math_score, "english": english_score}
            print("学生信息修改完毕 ~")
        case "3":  # 删除学生信息
            student_name = input("请输入要删除的学生姓名: ")

            # 如果学生不存在, 则提示错误信息, 重新选择
            if student_name not in student_scores:
                print("该学生不存在, 请重新选择 ~")
            else:
                del student_scores[student_name]
                print("学生信息删除完毕 ~")
        case "4":  # 查询学生信息
            student_name = input("请输入要查询的学生姓名: ")

            # 如果学生不存在, 则提示错误信息
            if student_name not in student_scores:
                print("该学生不存在, 请重新选择 ~")
            else:
                student_info = student_scores[student_name]
                print(
                    f"学生姓名: {student_name}, 语文成绩: {student_info['chinese']}, 数学成绩: {student_info['math']}, 英语成绩: {student_info['english']}")
        case "5":  # 列出所有学生
            for student_name in student_scores.keys():
                student_info = student_scores[student_name]
                print(
                    f"学生姓名: {student_name}, 语文成绩: {student_info['chinese']}, 数学成绩: {student_info['math']}, 英语成绩: {student_info['english']}")
        case "6":  # 统计班级成绩
            if not student_scores:
                print("系统中暂无学生信息，请先添加学生 ~")
                continue

            # 初始化统计变量
            chinese_scores = []
            math_scores = []
            english_scores = []

            # 收集所有成绩
            for student_name, scores in student_scores.items():
                chinese_scores.append(scores['chinese'])
                math_scores.append(scores['math'])
                english_scores.append(scores['english'])

            # 计算最高分、最低分、平均分
            chinese_max = max(chinese_scores)
            chinese_min = min(chinese_scores)
            chinese_avg = sum(chinese_scores) / len(chinese_scores)

            math_max = max(math_scores)
            math_min = min(math_scores)
            math_avg = sum(math_scores) / len(math_scores)

            english_max = max(english_scores)
            english_min = min(english_scores)
            english_avg = sum(english_scores) / len(english_scores)

            # 找出最高分和最低分的学生
            chinese_max_students = [name for name, scores in student_scores.items() if scores['chinese'] == chinese_max]
            chinese_min_students = [name for name, scores in student_scores.items() if scores['chinese'] == chinese_min]

            math_max_students = [name for name, scores in student_scores.items() if scores['math'] == math_max]
            math_min_students = [name for name, scores in student_scores.items() if scores['math'] == math_min]

            english_max_students = [name for name, scores in student_scores.items() if scores['english'] == english_max]
            english_min_students = [name for name, scores in student_scores.items() if scores['english'] == english_min]

            # 输出统计结果
            print("===== 班级成绩统计 =====")
            print(f"语文 - 最高分: {chinese_max}, 最低分: {chinese_min}, 平均分: {chinese_avg:.2f}")
            print(f"     最高分学生: {chinese_max_students}")
            print(f"     最低分学生: {chinese_min_students}")

            print(f"数学 - 最高分: {math_max}, 最低分: {math_min}, 平均分: {math_avg:.2f}")
            print(f"     最高分学生: {math_max_students}")
            print(f"     最低分学生: {math_min_students}")

            print(f"英语 - 最高分: {english_max}, 最低分: {english_min}, 平均分: {english_avg:.2f}")
            print(f"     最高分学生: {english_max_students}")
            print(f"     最低分学生: {english_min_students}")
            print("========================")
        case "7":  # 退出系统
            print("Bye ~")
            break
        case _:  # 匹配其他所有情况
            print("非法操作, 不支持!!!")
