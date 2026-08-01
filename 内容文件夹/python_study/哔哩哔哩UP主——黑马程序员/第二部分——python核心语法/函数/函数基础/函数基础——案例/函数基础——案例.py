# 基础函数案例
"""
    1. 定义一个函数：根据传入的底和高计算三角形面积的函数（S三角形 = (底 * 高) / 2）
    2. 定义一个函数，计算传入的字符串中原因字母的个数 （原因字母位 aeiouAEIOU）
    3. 定义一个函数：计算传入的班级学员高考成绩列表中成绩的最高分、最低分、平均分(保留1位小数)，并返回
    提示：高考科目：数学、语文、英语、物理、化学、生物
"""


# 计算三角形面积
def shan_jiaoXing_area(bed, height):
    """
        该函数主要判断用户输入的数据，以及计算面积
        :param bed : 底
        :param height: 高
        :return : 数据合法，返回面积计算值，否则，返回None
    """
    try:
        bed, height = float(bed), float(height)
        if any(n == 0 for n in (bed, height)):
            raise ValueError("不能位零")
        area = round((bed * height) / 2, 1)
        return area
    except ValueError:
        return None


bed_input, height_input = input("请输入三角形的底(正数，负数取绝对值)，bed="), input(
    "请输入三角形的高(正数，负数取绝对值), height=")
result = shan_jiaoXing_area(bed_input, height_input)
if result:
    print(f"三角形的底是：{bed_input}cm, 高是：{height_input}cm，面积是：{result}cm²")
else:
    print("请输入非零数字")


# 计算原因字母的个数，元音字母：aeiouAEIOU

def count_yuanYin(word):
    """
        该函数主要统计单词中的元音个数
        :param word : 单词
        :return : 返回元音单词个数
    """
    # 元组tuple()只能传一个参数、可以是单个元素，也可以是一个可迭代容器
    yuanYin = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']  # 判断的是字符串，并非变量，要加引号
    return len(tuple(n for n in word if n in yuanYin))


word_input = input("请输入一个单词，word=")
result = count_yuanYin(word_input)
print(f"单词：{word_input}，其中原因有：{result}个")


# 计算班级学员最高分，最低分，平均分

class StudentSystem:
    """
        学生成绩管理系统
        数据结构：self.data = {
            “班级A”：{
                    "学生1"：{成绩}
                    "学生2"：{成绩}
            },
            “班级B”：{
                    "学生1"：{成绩}
                    "学生2"：{成绩}

        }

    """

    # 创建实例对象
    def __init__(self):
        self.data = {}  # 班级————>学生————>成绩

    # 创建添加函数
    def add(self, name, cls, score):
        """
        添加学生成绩
        :param name:学生姓名
        :param cls : 班级名称
        :param score: 各科成绩
        :return: 录入成功返回True,录入失败返回None
        """
        # subjects 学科
        subjects = ["数学", "语文", "英语", "物理", "化学", "生物"]

        # 添加检查机制
        try:
            score_list = [float(s) for s in score]  # 列表推到式，返回转型的数字，当无法转型会被expect ValueError捕获

            # 校验成绩合法性：
            if any(s > 100 or s < 0 for s in score_list):
                print("成绩应在0~100之间")
                return None

            # 构建成绩字典 使用zip——拉链  将subjects 与 score_list 两个容器，合并为元组，同时生成字典。
            # zip : 多个容器，同一个索引，组成一个元组
            score_dict = dict(zip(subjects, score_list))

            # 如果班级不存在则创建班级
            if cls not in self.data:
                self.data[cls] = {}

            # 添加学生到班级
            self.data[cls][name] = score_dict
            print(f"学生 {name} 录入成功")
            return True
        except ValueError:
            print("成绩应为数字")
            return None

        # 第一部分完成，整体来说还行：
        # 重点：使用zip创建元组，转字典，清晰外层，中层，内层关系。避免：{cls:{name:{score}}}自己写多层嵌套，避免错误，效率巨大提升

    def max_min_avg_score(self):
        """
            具体功能：目标：列出每个班级各科最高分，最低分以及对应姓名，每个班级的每个科目的平均分
            :param self:实例对象
            :return ：默认None
        """

        # 计算最高分以及最低分，对应姓名
        subjects = ["数学", "语文", "英语", "物理", "化学", "生物"]
        result = {}  # 统计最终结果

        # 1. 遍历每个班级
        for cls_name, students in self.data.items():

            # 初始化该班级，各科分数收集器
            cls_subjects_score = {sub: [] for sub in subjects}  # 字典表达式，批量生成容器，键由定义好的学科容器遍历获得，默认空列表

            # 2.遍历每个班级的学生
            for stu_name, score in students.items():
                for subj in subjects:
                    cls_subjects_score[subj].append(score[subj])  # 完美的定义变量，subjects比我想象的作用还大

            # 求出每个班级，各科最高分
            cls_result = {}
            for subj, score_list in cls_subjects_score.items():
                if score_list:
                    cls_result[subj] = {
                        "最高分": max(score_list),
                        "最低分": min(score_list),
                        "平均分": round(sum(score_list) / len(score_list), 1)
                    }
                else:
                    cls_result[subj] = {"最高分": None, "最低分": None, "平均分": None}

            result[cls_name] = cls_result

        # 打印结果(格式化为易读形式)
        print("\n" + "=" * 50)
        print("各班级成绩统计")
        print("=" * 50)
        for cls_name, cls_result in result.items():
            print(f"\n 【班级：{cls_name}】")
            for subj, starts in cls_result.items():
                print(f" {subj}:最高 {starts['最高分']}, 最低 {starts['最低分']}, 平均分 {starts['平均分']}")
        return result


def students_os():
    """
    获取用户输入数据，以及创建实例对象
    """

    # 创建实例对象
    student = StudentSystem()

    # 循环，添加学生信息
    while True:
        print("=============================欢迎使用学生管理系统===============================")
        print("""1.添加学生信息    2.查询班级，各科最高分、最低分、平均分     3.退出管理系统 """)
        count = input("请输出你要执行的操作(1~3): 操作=")

        match count:
            case '1':
                name = input("请输入学生姓名, name=")
                cls = input(f"请输入[{name}]所在班级名称,class=")
                math = input(f"请输入[{name}]的数学成绩，math=")
                chinese = input(f"请输入[{name}]的语文成绩，chinese=")
                english = input(f"请输入[{name}]的英语成绩，english=")
                physics = input(f"请输入[{name}]的物理成绩，physics=")
                chemistry = input(f"请输入[{name}]的化学成绩，chemistry=")
                biology = input(f"请输入[{name}]的生物成绩，biology=")

                result = student.add(name, cls, (math, chinese, english, physics, chemistry, biology))
                if result is None:
                    continue

            case '2':
                student.max_min_avg_score()

            case '3':
                print("退出学生管理系统，欢迎下次使用")
                break
            case _:
                print("请输入合法操作")


students_os()
