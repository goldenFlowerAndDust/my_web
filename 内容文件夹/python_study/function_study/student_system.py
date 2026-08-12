def triangle(bed, height):
    """
     计算三角形面积：area = (bed * height) / 2
     包含异常处理
     :param bed: 底
     :param height: 高
     :return : 实参均为数字且不为零，则输出面积，否则返回None
     """
    try:
        bed, height = [abs(float(s)) for s in (bed, height)]
        if any(s == 0 for s in (bed, height)):
            return None

        area = round((bed * height) / 2, 1)
        return area
    except ValueError:
        return None





def vowels(word):
    """
    统计实参，元音字母个数。元音字母：aeiou,AEIOU
    :param word:实参
    :return :返回元音个数
    """
    # 求和生成器写法：sum(被加数 for v in iteration if v 条件)
    # 执行逻辑：当 If 返回值是 True ，则将被加数放入sum求和池
    # 条件不是必须的，被加数必须是数字。否则：typeError:
    # sum()只有一个参数。
    return sum(1 for v in word if v in ('a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'))





# 成绩管理器：增、删、改、查、退出
# 其中查包括：班级(最高分、最低分)包括姓名、平均分(保留一位小数)、某班级某学生、班级所有学生、全校所有学生、查询所有班级
# 提示：有不同的班级。班级——>姓名——>成绩

# 定义类，通过实例对象，方便管理方法
class Students:
    # 定义方法 __init___ 暂时不知道它具体干啥
    def __init__(self):
        # 定义字典容器，方便后续添加键值对
        self.data = {}

    # 定义增方法：add()
    def add(self, name, cls, course):
        """
        该函数用于，增操作，增加学生信息，进self.data字典存储
        :param name:学生姓名
        :param cls :学生所在班级
        :param course:学生各科成绩，元组
        :return: 添加成功则返回True，否则返回None
        """
        subjects = ["数学", "语文", "英语", "物理", "化学", "生物"]
        # 单词补充：数学：math、语文：chinese、英语：english
        # 物理：phycics、生物：Biology、化学：chemistry
        # 学科：subjects

        # 验证成绩合法性，暂定 均 0~100
        try:
            course = [abs(float(s)) for s in course]

            if any(s > 100 or s < 0 for s in course):
                print("成绩应在0~100之间，负数取绝对值")
                return None
        except ValueError:
            print("成绩包含非法字符")
            return None

        # 先定义内层字典——成绩 通过zip()快速生成
        score_dict = dict(zip(subjects, course))

        # 当班级不存在，则创建班级
        if cls not in self.data:
            self.data[cls] = {}

        # 生成整个字典 班级——姓名——成绩
        self.data[cls][name] = score_dict
        print(f"学生 [{name}] 信息录入成功")
        return True

    # 定义改方法：revise
    def revise(self, cls, name, math_score=None, chinese_score=None, english_score=None, physics_score=None,
               chemistry_score=None, biology_score=None):
        """
        改方法执行改操作：更改学生信息
        :param cls:需要更改学生所在的班级
        :param name:需要更改学生的姓名
        :param math_score:新数学成绩，未传值则不更改
        :param chinese_score:新语文成绩，未传值则不更改
        :param english_score:新英语成绩，未传值则不更改
        :param physics_score:新物理成绩，未传值则不更改
        :param chemistry_score:新化学成绩，未传值则不更改
        :param biology_score:新生物成绩，未传值则不更改
        :return : 修改成功执行True，否则返回None
        """
        # 先检查班级、学生是否存在
        if cls not in self.data:
            print(f"班级 [{cls}] 不存在")
            return None

        if name not in self.data[cls]:
            print(f"学生 [{name}] 不在班级 [{cls}] 内")
            return None

        # 获取当前学生的成绩字典
        current = self.data[cls][name]

        score = [math_score, chinese_score, english_score, physics_score, chemistry_score, biology_score]

        # 需要更新的科目映射
        updates = {
            "数学": score[0],
            "语文": score[1],
            "英语": score[2],
            "物理": score[3],
            "化学": score[4],
            "生物": score[5]

        }
        # 遍历更新
        for subject, new_score in updates.items():
            if new_score is not None:  # 只有传入新值才会,更改
                try:
                    val = abs(float(new_score))

                    if val > 100 or val < 0:
                        print("分数在0~100之间")
                        return None
                    current[subject] = val
                except ValueError:
                    print("成绩包含非数字")
                    return None
        print(f"{cls}:学生 [{name}] 成绩替换完成")
        return True

    # 定义删方法:
    def remove(self, cls, name):
        """
        主要删除某班具体学生信息
        :param cls: 需要删除的学生所在班级
        :param name: 需要删除学生的姓名
        :return: 删除成功则返回True,失败则返回:None
        """

        # 判断班级是否存在
        if cls not in self.data:
            print(f"班级 [{cls}] 不存在")
            return None

        # 判断学生是否在班级内
        if name not in self.data[cls]:
            print(f"学生 [{name}] 不在班级: [{cls}] 内")
            return None

        # 删除某班具体学生
        del self.data[cls][name]

        # 当删除后,班级没有学生,则删除班级
        if not self.data[cls]:
            del self.data[cls]
        print(f"{cls} 的学生 [{name}] 信息已经删除")
        return True

    # 查操作-查询某班级,某学生信息
    def see_about_stu(self, cls, name):
        """
        查询单个学生信息
        :param cls:需要查询学生所在的班级
        
        :param name:需要查询学生的姓名
        
        :return:查询成功返回True,否则返回:None
        """
        # 判断班级是否存在
        if cls not in self.data:
            print(f"班级 [{cls}] 不存在")
            return None

        # 判断学生是否在班级内
        if name not in self.data[cls]:
            print(f"学生 [{name}] 不在班级: [{cls}] 内")
            return None

        # 显示该学生信息
        # 获取成绩字典
        choice_stu = self.data[cls][name]
        print(
            f"学生 [{name}], 所在班级: [{cls}],数学:[{choice_stu['数学']}]分, 语文:[{choice_stu['语文']}]分, 英语:[{choice_stu['英语']}]分, 物理:[{choice_stu['物理']}]分, 化学:[{choice_stu['化学']}]分, 生物:[{choice_stu['生物']}]分")
        return True

    def see_about_cls(self):
        """
        查询所有班级
        :return:有班级则返回True,否则返回None
        """

        if not self.data:
            print("当前未添加任何班级")
            return None

        clss = list(self.data.keys())

        print(f"目前所有班级：{','.join(map(str, clss))}")
        return True

    # 查操作-查询某班级的所有学生
    def see_about_cls_stu(self, cls):
        """
        查询某班级所有学生
        :param cls:需要查询的班级
        :return:查询成功返回True,否则返回None
        """

        # 判断班级是否存在
        if cls not in self.data:
            print(f"班级 [{cls}] 不存在")
            return None

        print("\t\t学生\t\t\t数学\t\t\t语文\t\t\t英语\t\t\t物理\t\t\t化学\t\t\t生物\t\t\t平均分")
        stu = {n: [] for n in self.data[cls].keys()}
        for name, student in self.data[cls].items():
            stu[name] = list(student.values())

        for name in stu.keys():
            score = stu[name]
            avg = sum(score) / len(score)
            print(
                f"{name}\t\t{score[0]}\t\t{score[1]}\t\t{score[2]}\t\t{score[3]}\t\t{score[4]}\t\t{score[5]}\t\t\t {avg:.2f}")

        print(f"班级:{cls},所有学生检索完毕")
        return True

    # 统计-班级(最高分、最低分)包括姓名、平均分(保留一位小数)
    def count_max_min_avg(self):
        """
        统计-班级(最高分、最低分)包括姓名、平均分(保留一位小数)
        :return: 学生管理内部有信息，返回True,否则返回None
        """
        # 先获取,每个班级的所有学生,即成绩

        subjects = ["数学", "语文", "英语", "物理", "化学", "生物"]
        result = {}

        # 遍历每个班级
        for cls_name, students in self.data.items():

            # 初始化该班级,各分数收集器
            cls_subjects_score = {n: [] for n in subjects}

            for name, score in students.items():

                for sub in subjects:
                    cls_subjects_score[sub].append(score[sub])  # 是每个学生成绩逐个添加进收集器对应科目键

            # 求出每个班级,各科最高分
            cls_result = {}
            for subj, score in cls_subjects_score.items():
                if score:
                    max_subj = max(score)
                    min_subj = min(score)
                    max_subj_name = [name for name, score in students.items() if score[subj] == max_subj]
                    min_subj_name = [name for name, score in students.items() if score[subj] == min_subj]
                    cls_result[subj] = {
                        "最高分": max_subj,
                        "最高分获得者": max_subj_name,
                        "最低分": min_subj,
                        "最低分获得者": min_subj_name,
                        "平均分": round(sum(score) / len(score), 1)
                    }
                else:
                    cls_result[subj] = {"最高分": None, "最低分": None, "平均分": None}
                    return None

            result[cls_name] = cls_result

        # 打印结果(格式化为易读形式)
        print("\n" + "=" * 50)
        print("各班成绩统计")
        print("=" * 50)
        for clss_name, cls_result in result.items():
            print(f"\n 【班级：{clss_name}】")
            for subj, starts in cls_result.items():
                print(f"{subj}:\n最高 {starts['最高分']}——{starts['最高分获得者']}\n"
                      f"       最低 {starts['最低分']}——{starts['最低分获得者']}\n"
                      f"       {subj}全班平均分{starts['平均分']}")
        return True


def students():
    # 创建实例对象
    student = Students()

    print("=================欢迎使用，学生管理系统，一下是具体的功能，请按下对应的功能，再执行操作=================")
    while True:
        print("""
            #####################################################################################################
            #                                        学生管理系统功能如下                                          #
            #       1.添加学生信息                                        2.修改学生信息                            #                         
            #       3.删除学生信息                                        4.查询全部班级信息                         #                      
            #       5.查询班级全部学生信息                                 6.查询班级单个学生信息                      #
            #       7.统计：各班各科成绩最高分、最低分以及对应的学生           8.退出学生管理系统                         #
            ######################################################################################################
            """)
        count = input("请输入您需要的操作：count=")
        match count:
            case '1':
                name = input("请输入需要添加的学生姓名：name=")
                clss = input(f"请输入学生 [{name}] 的班级，class=")
                math, chinese, english, physics, chemistry, biology = input(f"请输入【{name}】数学成绩，math="), input(
                    f"请输入【{name}】语文成绩，Chinese="), input(f"请输入【{name}】英语成绩，English="), input(
                    f"请输入【{name}】物理成绩，physics="), input(f"请输入【{name}】化学成绩，chemistry="), input(
                    f"请输入【{name}】生物成绩，biology=")
                subjects = math, chinese, english, physics, chemistry, biology
                result = student.add(name, clss, subjects)
                if result is None:
                    continue

            case '2':
                name = input("请输入需要修改信息的学生姓名(按回车，默认原成绩), name=")
                cls = input(f"请输入该学生 [{name}] 所在的班级，class=")
                math, chinese, english, physics, chemistry, biology = input(f"请输入【{name}】数学成绩，math="), input(
                    f"请输入【{name}】语文成绩，Chinese="), input(f"请输入【{name}】英语成绩，English="), input(
                    f"请输入【{name}】物理成绩，physics="), input(f"请输入【{name}】化学成绩，chemistry="), input(
                    f"请输入【{name}】生物成绩，biology=")
                result = student.revise(cls, name, math if math else None, chinese if chinese else None,
                                        english if english else None, physics if physics else None,
                                        chemistry if chemistry else None, biology if biology else None)
                if result is None:
                    continue

            case '3':
                name = input("请输入需要删除信息的学生姓名， name=")
                clss = input(f"请输入学生 [{name}] 所在的班级, class=")
                result = student.remove(clss, name)
                if result is None:
                    continue

            case '4':
                result = student.see_about_cls()
                if result is None:
                    continue

            case '5':
                clss = input("请输入需要查询全部学生信息的班级，class=")
                result = student.see_about_cls_stu(clss)
                if result is None:
                    continue

            case '6':
                name = input("请输入需要查询的学生姓名，name=")
                clss = input(f"请输入学生 [{name}] 所在的班级, class=")
                result = student.see_about_stu(clss, name)
                if result is None:
                    continue

            case '7':
                result = student.count_max_min_avg()
                if result is None:
                    continue

            case '8':
                print("学生管理系统已经退出，欢迎下次使用")
                break

            case _:
                print("请输入规定的操作")

if __name__ == "__main__":

    # 注意缩进，下面的代码不在函数内部
    bed_input, height_input = input("请输入三角形的底(不能为零，负数取绝对值)：bed="), input(
        "请输入三角形的高(不能为零，负数取绝对值)：height=")

    result = triangle(bed_input, height_input)

    if result is None:
        print("包含非法数字，或数字为零")
    else:
        print(f"三角形：高:{height_input}cm，底:{bed_input}cm，面积为：{result}cm²")

    word_input = input("请输入一串单词：word=")
    print(f"单词：{word_input}\n 元音字母有：{vowels(word_input)}个")

    students()




