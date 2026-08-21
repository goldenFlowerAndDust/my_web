"""
    采用面向对象编程思想完成如下需求：
        采用面向对象的编程思想，完成教务管理系统的开发。教务管理系统可以管理在校学生的成绩信息，
        通过控制台菜单与用户交互，具体的功能如下：
            1.添加学生成绩：根据输入的学生姓名、语文成绩、数学成绩、英语成绩，记录在系统中
            2.修改学生成绩：根据输入的学生姓名，修改对应的学生成绩
            3.删除学生成绩：根据输入的学生姓名，删除对应的学生成绩
            4.查询指定学生成绩：根据输入的学生姓名，查找对应的学生成绩，并输出
            5.展示全部学生成绩：展示出系统中所有学生的成绩


"""


# 要求使用面向对象知识，先建立一个学生类:class
class Student:
    # 实例化对象
    def __init__(self):
        """
            使用：__init__，初始化实例属性。
            主要用于存储学生信息，用字典存储：{name:{chinese:score,math:score,english:score}}
        """
        self.OS = {}

    # 写入第一个功能：1.添加学生成绩：根据输入的学生姓名、语文成绩、数学成绩、英语成绩，记录在系统中
    def add(self, name, *args: str | float) -> bool | None:
        """
            该实例方法用于，添加学生信息，并且放入实例对象：self.OS中

        :param name: 学生姓名
        :param args: 学生成绩不定长参数，目前为：Chinese、math、English
        :return: 添加成功返回：True，否则返回：None
        """
        # 列出科目，作为后续：zip的一部分
        subjects = ['语文', '数学', '英语']

        # 添加输入成绩限制
        if len(args) != 3:
            print("成绩必须有三项")
            return None

        # 先判断，成绩是否合法 （0~100）之间
        try:
            subject_score = [abs(float(s)) for s in args]
            if any(s > 100 for s in subject_score):
                print("成绩应是0~100以内")
                return None
        except ValueError:
            print("成绩应是数字类型")
            return None

        # 将学生信息组成字典
        subject_dict = dict(zip(subjects, subject_score))

        # 将学生信息存放入实例对象：OS
        self.OS[name] = subject_dict
        print(f'学生：[{name}] 添加成功')
        return True

    # 2.修改学生成绩：根据输入的学生姓名，修改对应的学生成绩
    def revise(self, name, chinese: str | float | None = None, math: str | float | None = None,
               english: str | float | None = None) -> bool | None:
        """
            该方法用于修改学生信息：额外功能，默认None，不修改

        :param name: 需要修改的学生姓名
        :param chinese: 需要修改的学生语文成绩
        :param math: 需要修改的学生数学成绩
        :param english: 需要修改的学生英语成绩
        :return: 修改成功返回:True 否则返回：None
        """
        # 先判断，None的情况
        # 判断用户输入的成绩是否合法
        try:
            if chinese is not None:
                chinese = abs(float(chinese))
            if math is not None:
                math = abs(float(math))
            if english is not None:
                english = abs(float(english))
            if any(s > 100 for s in (chinese, math, english) if s is not None):  # None不能比较大小
                print("成绩应在0~100之间")
                return None
        except ValueError:
            print("成绩必须是数字")
            return None

        student = {
            '语文': self.OS[name]['语文'] if chinese is None else chinese,
            '数学': self.OS[name]['数学'] if math is None else math,
            '英语': self.OS[name]['英语'] if english is None else english
        }

        # 将新的学生信息进行替换
        self.OS[name] = student
        print(f"学生 [{name}] 信息替换完成")
        return True

    # 3.删除学生成绩：根据输入的学生姓名，删除对应的学生成绩
    def remove(self, name) -> bool | None:
        """
            该方法用于删除学生信息：
        :param name: 需要删除学生的姓名
        :return: 删除成功返回：True，否则返回：None
        """
        if name not in self.OS.keys():
            print(f"学生 [{name}] 未录入")
            return None

        del self.OS[name]
        print(f"学生 [{name}] 信息删除")
        return True

    # 4.查询指定学生成绩：根据输入的学生姓名，查找对应的学生成绩，并输出
    def refer(self, name) -> bool | None:
        """
            该函数主要用于查询单个学生信息
        :param name: 需要查询信息的学生
        :return: 查询成功：True，否则：None
        """
        # 判断学生是否存在
        if name not in self.OS.keys():
            print(f"学生 [{name}] 未录入")
            return None

        score = self.OS[name]
        print(f"{name}", end=':')
        for subject, score in score.items():
            print(f"{subject}:{score}分", end=' ')
        print('', end='\n')
        return True

    # 5.展示全部学生成绩：展示出系统中所有学生的成绩
    def student(self) -> bool | None:
        """
            该函数用于，查询所有的学生信息
        :return: 如果有学生信息：True，否则返回:None
        """
        if not self.OS:
            print("占位录入任何学生")
            return None
        for name, stu in self.OS.items():
            print(f"{name}", end=':')
            for subject, score in stu.items():
                print(f"{subject}:{score}", end=' ')
            print('', end='\n')

        return True


# 控制台
def students():
    # 创建实例对象
    stus = Student()

    # 循环，重复添加
    while True:
        print("=========欢迎使用教务系统================")
        print("""
                        请按以下指令操作
                1.增加学生          2.修改学生
                3.删除学生          4.查询单个学生
                5.查询全部学生       6.退出教务系统
        """)
        give_the_orders = input("请输入要操作的指令，orders=")
        match give_the_orders:
            case '1':
                # 获取用户输入的信息
                while True:
                    name = input('请输入学生的姓名(回车结束输入)：name=')
                    if name == '':
                        break

                    # 判断用户是否存在
                    if name in stus.OS.keys():
                        print(f'学生 [{name}] 已录入')
                        continue

                    chinese = input(f"请输入 [{name}] 的语文成绩，Chinese=")
                    math = input(f"请输入 [{name}] 的数学成绩，math=")
                    english = input(f"请输入 [{name}] 的英语成绩，English=")
                    stus.add(name, chinese, math, english)
            case '2':
                name = input('请输入需要修改学生的姓名：name=')
                # 先判断学生是否存在
                if name not in stus.OS.keys():
                    print(f"学生 [{name}] 未录入信息")
                    continue

                # 显示学生当前成绩
                stus.refer(name)

                chinese = input(f"请输入 [{name}] 的语文成绩(回车则默认原成绩)，Chinese=")
                math = input(f"请输入 [{name}] 的数学成绩(回车则默认原成绩)，math=")
                english = input(f"请输入 [{name}] 的英语成绩(回车则默认原成绩)，English=")
                result = stus.revise(name, chinese if chinese != '' else None,
                                     math if math != '' else None,
                                     english if english != '' else None)
                if result is None:
                    continue
            case '3':
                name = input('请输入需要删除学生的姓名：name=')
                result = stus.remove(name)
                if result is None:
                    continue
            case '4':
                name = input('请输入需要查询学生的姓名：name=')
                result = stus.refer(name)
                if result is None:
                    continue
            case '5':
                stus.student()
            case '6':
                print('已经退出教务系统，欢迎下次使用')
                break
            case _:
                print("请输入合法指令")


# 测试使用方法：__name__='__main__'

if __name__ == '__main__':
    # 测试1——添加功能
    stu = Student()
    stu.add('小红', 50, 100, 30)
    stu.add('小明', 10, 0, 100)
    print(stu.OS)

    # 测试2——修改功能
    stu.revise('小红', None, 30, '-50')
    stu.revise('小兰', 50, 40, 60)
    print(stu.OS)

    # 测试3——删除功能
    stu.remove('小红')
    print(stu.OS)
    stu.remove('小红')

    # 测试4——单个查询
    stu.refer('小红')
    stu.refer('小明')
    print("==================")

    # 测试5——查询全部
    stu.student()
    stu.add('大名', 50, 80, 40)
    stu.student()
    stu.remove('小明')
    stu.remove('大名')
    stu.student()

    students()
