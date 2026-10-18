## D:\GitHub\my_web\内容文件夹\python_study\__init__.py



## D:\GitHub\my_web\内容文件夹\python_study\function_study\__init__.py



## D:\GitHub\my_web\内容文件夹\python_study\function_study\student_system.py

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






## D:\GitHub\my_web\内容文件夹\python_study\关于pip install 安装包的位置\关于安装包位置装入虚拟环境.html

**Title:** 关于安装包位置装入虚拟环境

关于安装包位置装入虚拟环境

关于安装包位置装入虚拟环境(<span>非常建议以后，将包安装在虚拟环境，项目之间包隔开，防止冲突</span>)

具体步骤

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>关于安装包位置装入虚拟环境</h1>
    </header>
    <section id="section_1">
        <div class="div_table">
            <table>
                <thead>
                <tr>
                    <th colspan="2"><h2>
                        关于安装包位置装入虚拟环境(<span>非常建议以后，将包安装在虚拟环境，项目之间包隔开，防止冲突</span>)
                    </h2></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td colspan="2"><h3>检查与确认环境</h3></td>
                </tr>
                <tr>
                    <td>命令</td>
                    <td>作用</td>
                </tr>
                <tr>
                    <td><code>dir</code></td>
                    <td>查看<span>当前项目下的文件和文件夹，确认是否有虚拟环境文件夹(如 <code>venv</code>)</span></td>
                </tr>
                <tr>
                    <td><code>pip list</code></td>
                    <td><span>列出当前激活环境下已安装的所有<span class="span">包</span></span></td>
                </tr>
                <tr>
                    <td><code>pip show 包名</code></td>
                    <td><span>查看指定包的详细信息，<span
                            class="span">尤其是安装路径(<code>Location</code>)</span></span></td>
                </tr>
                <tr>
                    <td><code>where python</code></td>
                    <td>
                        <span>查看当前终端使用的是哪个<code>python</code>解释器(<span>确认是全局还是虚拟环境</span>)</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><h3>创建虚拟环境</h3></td>
                </tr>
                <tr>
                    <td>命令</td>
                    <td>作用</td>
                </tr>
                <tr>
                    <td><code>python -m venv venv</code></td>
                    <td>
                        <span>在当前目录下创建一个名为<code>venv</code>的虚拟环境(<span
                                class="span">可以自定义名称，如 myvenv</span>)</span>
                    </td>
                </tr>
                <tr>
                    <td><code>python -m venv myenv</code></td>
                    <td><span>创建名为 <code>myenv</code>的虚拟环境(<span
                            class="span">其他名称同理</span>)</span></td>
                </tr>
                <tr>
                    <td><code>dir</code></td>
                    <td><span>创建后再次查看，<code>venv</code>文件夹已经生成</span></td>
                </tr>
                <tr>
                    <td colspan="2"><h3>激活虚拟环境</h3></td>
                </tr>
                <tr>
                    <td>命令</td>
                    <td>作用</td>
                </tr>
                <tr>
                    <td><code>.\venv\Scripts\Activate</code></td>
                    <td><span><code>Windows</code>下激活 venv 虚拟环境（注意 .\ 和首字母大写 Activate）</span></td>
                </tr>
                <tr>
                    <td><code>source venv/bin/activate</code></td>
                    <td><span>macOS / Linux 下激活虚拟环境</span></td>
                </tr>
                <tr>
                    <td><code>deactivate</code></td>
                    <td><span>退出当前环境，回到全局<code>python</code></span></td>
                </tr>
                <tr>
                    <td colspan="2"><h3>管理包(安装与卸载)</h3></td>
                </tr>
                <tr>
                    <td>命令</td>
                    <td>作用</td>
                </tr>
                <tr>
                    <td><code>pip install 包名</code></td>
                    <td><span>安装指定包</span>在激活虚拟后安装，会装到当前环境里</td>
                </tr>
                <tr>
                    <td><code>pip install 包名1 包名2 ...</code></td>
                    <td><span>可以同时安装多个包</span></td>
                </tr>
                <tr>
                    <td><code>pip uninstall 包名</code></td>
                    <td><span>卸载指定包(<span class="span">会提示确认</span>)</span></td>
                </tr>
                <tr>
                    <td><code>pip uninstall 包名 -y</code></td>
                    <td><span>卸载指定包(<span class="span">跳过确认，直接卸载</span>)</span></td>
                </tr>
                <tr>
                    <td><code>pip uninstall 包名1 包名2 ... -y</code></td>
                    <td><span>可以同时卸载多个包，跳过确认</span></td>
                </tr>
                <tr>
                    <td colspan="2"><h3>验证与检查</h3></td>
                </tr>
                <tr>
                    <td>命令</td>
                    <td>作用</td>
                </tr>
                <tr>
                    <td><code>pip show 包名</code></td>
                    <td><span>查看指定包的安装路径，确认是否安装到虚拟环境（路径里包含 venv 就是成功了）</span></td>
                </tr>
                <tr>
                    <td><code>pip list</code></td>
                    <td><span>列出当前环境下所有已安装的包，用来确认包是否已经卸载或安装成功</span></td>
                </tr>
                <tr>
                    <td colspan="2"><h3>清理全局环境</h3></td>
                </tr>
                <tr>
                    <td>命令</td>
                    <td>作用</td>
                </tr>
                <tr>
                    <td><code>pip uninstall 包名 -y</code></td>
                    <td>在全局环境下卸载包，清理全局环境里误装的包（<span>确保先 deactivate 退出虚拟环境</span>）</td>
                </tr>
                <tr>
                    <td><code>pip list</code></td>
                    <td><span>再次查看全局环境，确认已清理干净</span></td>
                </tr>
                </tbody>
            </table>
            <div>
                <h2>具体步骤</h2>
                <ul>
                    <li>先确认环境：用 pip show 包名 确认装到了哪里。

清理误装：在全局环境下执行 pip uninstall，去掉误装的包。

创建虚拟环境：用 python -m venv venv 创建项目专属环境。

激活虚拟环境：用 .\venv\Scripts\Activate 进入环境。

安装包：在激活的环境里执行 pip install。

验证：再次用 pip show 确认路径包含 venv。

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——非学勿扰\UP主非学勿扰——公开课python教程_html\002_python运行环境搭建\python运行环境搭建.html

**Title:** 002_python运行环境搭建

为什么要安装python的运行环境

安装python运行环境

不管用什么工具开发python程序，都必须安装python的运行环境
            <br>该UP主以Windows系统为主，同时python版本在3.X版本为主

•python有许多版本，单击下载对应的版本即可

进入python官网(python.org)下载python安装包

安装下载好的python.exe(因为以前下过python别的版本，我就下载了最新版本做演示)

步骤一:打开下载的python.exe文件

步骤二：设置安装路径(建议自定义安装，默认在C盘)，以及勾选Add python.exe to PATH(一定要勾选上)

步骤三：选择自定义安装的往后，建议全选上

步骤四：勾选默认的就可以了，但一定要更改安装路径，最后单击install开始安装

检测安装成功

方法一：在终端运行python检测

方法二：在终端运行python --version检测

输入第一行代码——print("hello word")

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——非学勿扰\UP主非学勿扰——公开课python教程_html\002_python运行环境搭建\python运行环境搭建.md

# python环境配置

## 为什么要安装python的运行环境

1. 不管用什么工具开发python程序，都必须安装python的运行环境
2. 该UP主以Windows系统为主，同时python版本在3.X版本为主



## 安装python运行环境

1.  进入python官网(python.org)下载python安装包

    •python有许多版本，单击下载对应的版本即可

    [python版本下载
    ![python下载官网](素材存放区/python下载官网.png)](https://www.python.org/downloads/windows/)

2.  安装下载好的python.exe(因为以前下过python别的版本，我就下载了最新版本做演示)
    - 步骤一:打开下载的python.exe文件
      ![python安装------步骤一](素材存放区/python安装——步骤一.png)
    - 步骤二：设置安装路径(建议自定义安装，默认在C盘)，以及勾选Add python.exe to PATH(一定要勾选上)
      ==**Add python.exe to PATH复选框，勾选后，安装程序就会自动将python的路径加到PATH环境变量中==**
      ![python安装------步骤二](素材存放区/python安装——步骤二.png)
    - 步骤三：选择自定义安装的往后，建议全选上
      ![python安装------步骤三](素材存放区/python安装——步骤三.png)
    - 步骤四：勾选默认的就可以了，但一定要更改安装路径，最后单击install开始安装
      ![python安装------步骤四](素材存放区/python安装——步骤四.png)
    
3.  检测安装成功
    - 方法一：在终端运行python检测
      ==**按windows+R键打开运行框，输入cmd，打开终端再，输入python并回车，出现当前界面，表示成功了。==**
      ![终端------python检测](素材存放区/终端——python检测.png)
    - 方法二：在终端运行python \--version检测
      
      - **==这个方法会显示安装python的版本==**
        ![python\--version检测](素材存放区/终端——python --version检测.png)
    
4.  输入第一行代码------print("hello word")
    
    - 注意：所有的字符都是英文，中文会报错
    - print：输出的意思，就是将结果输出到控制台 ]{.mark}
      ![终端----第一行代码.png](素材存放区/终端—-第一行代码.png)



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——非学勿扰\UP主非学勿扰——公开课python教程_html\003_VScode开发环境搭建\VScode开发环境搭建.html

**Title:** VScode开发环境搭建

第一步：进入VScode官网下载安装包

具体安装步骤

第二步：打开已经安装好的VScode

第三步：安装插件

第四步：配置python解释器

第五步：验证配置是否成功

在python开发领域中，Visual Studio Code(简称VScode)凭借着轻量级、高扩展性
                和强大的社区支持，已经称为开发者首选的编辑器之一。
                <br>(如pycharm、Jupyter Notebook),VScode不仅具备代码高亮、智能提示、调试支持等基础功能、还能通过丰富的插件生态
                实现虚拟环境管理，Jupyter交互式编程、Git版本控制等高级功能
                <mark>当然我还是用pycharm</mark>

可能是因为我在电脑安装了，没有卸载，没有出现更改路径这个选项(默认安装到了D盘)，<mark>如果安装能更改路径，尽量更改到别的盘符。</mark>

打开VScode，设置简体中文，在扩展商店，搜索Chinese，安装简体中文或繁体中文插件，然后重启即可。

首先，搜索python，单击安装，我因为安装过了，会显示卸载选项

过一会，软件会自动搜索，安装的python版本，我的是3.11.4，点击添加即可

1.新建立一个文件夹
                2.在文件夹当中，新建一个.py文件
                3.输入print("Hello word")，并运行。

注意:一定要先保存再运行(当文件，右边的小白点小时，即是保存成功)

保存好后，在空白处右击，找到[运行python]，选择在终端运行

最后的显示结果

步骤一：将下载好的安装程序，右击，再单击

步骤二：单击同意协议，并单击下一步

步骤三：单击创建桌面快捷方式复选框，其他默认即可，并单击下一步

步骤四：单击安装

注意：

简体中文插件

python扩展

按Ctrl+Shift+P打开命令面板

输入python:Select lnterpreter

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——非学勿扰\UP主非学勿扰——公开课python教程_html\003_VScode开发环境搭建\VScode开发环境搭建.md

# 在VScode安装开发环境
- 在python开发领域中，Visual Studio Code(简称VScode)凭借着轻量级、高扩展性和强大的社区支持，已经称为开发者首选的编辑器之一。
- (如pycharm、JupyterNotebook),VScode不仅具备代码高亮、智能提示、调试支持等基础功能、还能通过丰富的插件生态实现虚拟环境管理，Jupyter交互式编程、Git版本控制等高级功能
- (当然我还是用pycharm)



## 第一步：进入VScode官网下载安装包

[[VScode官网]{style="font-size: 25px"}](https://code.visualstudio.com/)

### 具体安装步骤

1.  步骤一：将下载好的安装程序，右击，再单击
    ![步骤一](素材存放区/步骤1.png)

2.  步骤二：单击同意协议，并单击下一步
    ![步骤二](素材存放区/步骤二：单击同意协议，并单击下一步.png)

3.  步骤三：单击创建桌面快捷方式复选框，其他默认即可，并单击下一步
    ![步骤三](素材存放区/步骤三：单击创建桌面快捷方式复选框，其他默认即可，并单击下一步.png)

4.  步骤四：单击安装
    ![步骤四](素材存放区/步骤四：单击安装.png)

5.  注意：

    可能是因为我在电脑安装了，没有卸载，没有出现更改路径这个选项(默认安装到了D盘)，[如果安装能更改路径，尽量更改到别的盘符。]{.mark}

### 第二步：打开已经安装好的VScode

![打开VScode](素材存放区/打开VScode.png)

### 第三步：安装插件

- 简体中文插件

  打开VScode，设置简体中文，在扩展商店，搜索Chinese，安装简体中文或繁体中文插件，然后重启即可。

  ![安装中文插件](素材存放区/安装中文插件.png)

- python扩展

  首先，搜索python，单击安装，我因为安装过了，会显示卸载选项

  ![安装python插件](素材存放区/安装python插件.png)

### 第四步：配置python解释器

1.  按Ctrl+Shift+P打开命令面板
    ![打开命令面板](素材存放区/打开命令面板.png)

2.  输入python:Select lnterpreter

    ![添加python解释器](素材存放区/添加python解释器.png)
    ![添加python解释器_界面](素材存放区/添加python解释器—界面.png)

    - 过一会，软件会自动搜索，安装的python版本，我的是3.11.4，点击添加即可

    ![添加python解释器---添加](素材存放区/添加python解释器—添加.png)

### 第五步：验证配置是否成功

1. 新建立一个文件夹 
2. 在文件夹当中，新建一个.py文件 
3. 输入print(\"Hello
   word\")，并运行。

- 注意:一定要先保存再运行(当文件，右边的小白点小时，即是保存成功)

![VScode写入第一个代码](素材存放区/VScode写入第一个代码.png)

- 保存好后，在空白处右击，找到\[运行python\]，选择在终端运行

**==需要注意的是：设置的文件路径不要太复杂了，运行可能会报错==**
![出问题了](素材存放区/出问题了.png)

- 最后的显示结果

![最后的结果](素材存放区/VScode写入第一个代码—结果.png)


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——非学勿扰\UP主非学勿扰——公开课python教程_python\002_python运行环境搭建.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——非学勿扰\UP主非学勿扰——公开课python教程_python\003_VScode开发环境搭建.py

print("Hello word")

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\__init__.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\笔记通用模板.html

**Title:** Title



以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\其他知识\import——random\import——random.html

**Title:** 其他知识——random模块

其他知识——random模块

随机数模块 · JavaScript vs Python

区间规则速查

记忆口诀

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="random">
<main>
    <header>
        <h1>其他知识——random模块</h1>
    </header>
    <section id="section_1">
        <h2>随机数模块 · JavaScript vs Python</h2>
        <div class="div_table">
            <table>
                <thead>
                <tr>
                    <th>对比维度</th>
                    <th>JavaScript</th>
                    <th>Python</th>
                </tr>
                </thead>
                <tbody>

                <!-- 模块导入 -->
                <tr>
                    <td><strong>模块/对象</strong></td>
                    <td>全局对象 <code>Math</code>（无需导入）</td>
                    <td><code>random</code> 模块（需导入）<br>
                        <code>import random</code>
                    </td>
                </tr>

                <!-- 基础随机数 -->
                <tr>
                    <td><strong>生成 [0, 1) 浮点数</strong></td>
                    <td><code>Math.random()</code><br>
                        返回 <code>0 ≤ x &lt; 1</code>
                    </td>
                    <td><code>random.random()</code><br>
                        返回 <code>0.0 ≤ x &lt; 1.0</code>
                    </td>
                </tr>

                <!-- 指定范围整数 -->
                <tr>
                    <td><strong>生成指定范围整数</strong></td>
                    <td>需手动计算：<br>
                        <code>Math.floor(Math.random() * (max - min + 1)) + min</code><br>
                        含两端，需配合 <code>Math.floor()</code>
                    </td>
                    <td><code>random.randint(min, max)</code><br>
                        含两端，直接返回整数<br>
                        例：<code>random.randint(1, 100)</code> → 可拿到 100
                    </td>
                </tr>

                <!-- 指定范围浮点数 -->
                <tr>
                    <td><strong>生成指定范围浮点数</strong></td>
                    <td><code>Math.random() * (max - min) + min</code><br>
                        含左不含右（近似）
                    </td>
                    <td><code>random.uniform(min, max)</code><br>
                        理论含两端（浮点精度影响）
                    </td>
                </tr>

                <!-- 随机选取 -->
                <tr>
                    <td><strong>从序列中随机选一个</strong></td>
                    <td>需手动计算索引：<br>
                        <code>arr[Math.floor(Math.random() * arr.length)]</code>
                    </td>
                    <td><code>random.choice(arr)</code><br>
                        一行搞定
                    </td>
                </tr>

                <!-- 随机选取多个 -->
                <tr>
                    <td><strong>随机选多个（不重复）</strong></td>
                    <td>需手动实现（洗牌或抽选逻辑）</td>
                    <td><code>random.sample(arr, k)</code><br>
                        返回 k 个不重复元素
                    </td>
                </tr>

                <!-- 打乱顺序 -->
                <tr>
                    <td><strong>打乱列表顺序（洗牌）</strong></td>
                    <td><code>arr.sort(() => Math.random() - 0.5)</code><br>
                        ⚠️ 不严谨，分布不均匀
                    </td>
                    <td><code>random.shuffle(arr)</code><br>
                        原地打乱，真随机洗牌
                    </td>
                </tr>

                <!-- range 风格 -->
                <tr>
                    <td><strong>类 range 随机整数</strong></td>
                    <td>无原生方法，需手动 <code>Math.floor()</code></td>
                    <td><code>random.randrange(start, stop[, step])</code><br>
                        左闭右开，同 <code>range()</code> 规则<br>
                        例：<code>randrange(1, 100)</code> → 取不到 100
                    </td>
                </tr>

                <!-- 种子 -->
                <tr>
                    <td><strong>随机种子（可复现）</strong></td>
                    <td>不支持（无原生种子机制）</td>
                    <td><code>random.seed(a)</code><br>
                        设置种子后，随机序列可复现
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="div_table">
            <h2>区间规则速查</h2>
            <table>
                <thead>
                <tr>
                    <th>函数</th>
                    <th>区间规则</th>
                    <th>示例</th>
                    <th>是否包含右边界</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td><code>Math.random()</code> (JS)</td>
                    <td>[0, 1)</td>
                    <td><code>Math.random()</code></td>
                    <td>❌ 不包含</td>
                </tr>
                <tr>
                    <td><code>random.random()</code> (Py)</td>
                    <td>[0.0, 1.0)</td>
                    <td><code>random.random()</code></td>
                    <td>❌ 不包含</td>
                </tr>
                <tr>
                    <td><code>random.randint(a, b)</code> (Py)</td>
                    <td><strong>全闭</strong> [a, b]</td>
                    <td><code>randint(1, 100)</code></td>
                    <td>✅ 包含</td>
                </tr>
                <tr>
                    <td><code>random.randrange(start, stop)</code> (Py)</td>
                    <td><strong>左闭右开</strong> [start, stop)</td>
                    <td><code>randrange(1, 100)</code></td>
                    <td>❌ 不包含</td>
                </tr>
                <tr>
                    <td><code>random.uniform(a, b)</code> (Py)</td>
                    <td>[a, b]（理论全闭，浮点精度影响）</td>
                    <td><code>uniform(1.5, 2.5)</code></td>
                    <td>⚠️ 理论包含，实际近似</td>
                </tr>
                <tr>
                    <td><code>Math.floor(Math.random() * (max - min + 1)) + min</code> (JS)</td>
                    <td><strong>全闭</strong> [min, max]</td>
                    <td>手动实现</td>
                    <td>✅ 包含</td>
                </tr>
                </tbody>
            </table>
        </div>
        <h2>记忆口诀</h2>
        <ul>
            <li><strong>Python：</strong><br>
                · 要整数 → <code>randint</code>（全闭）<br>
                · 要范围步长 → <code>randrange</code>（左闭右开）<br>
                · 要随机选 → <code>choice</code> / <code>sample</code> / <code>shuffle</code>

<strong>JavaScript：</strong><br>
                · 只有 <code>Math.random()</code>（左闭右开）<br>
                · 整数、选元素、洗牌 → 全部手动封装

<strong>核心区别：</strong><br>
                · Python 功能丰富，自带种子、洗牌、抽样<br>
                · JavaScript 只有基础随机数，其他需自己实现

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\其他知识\import——random\import——random.py

import random
random_number = random.randint(1,100)
while True:
    try:
        num = int(input("请输入整数(1~100)，number="))
        if num <= 0 or num > 100:
            raise ValueError
    except ValueError:
        print("请输入1~100之间的整数")
        continue
    if num > random_number:
        print("猜大了")
        continue
    elif num < random_number:
        print("猜小了")
        continue
    else:
        print(f"恭喜猜成功了，你的幸运数字是：{random_number}")
        brea

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\导学\第一节——python+AI导学\笔记——html\第一节——python+AI导学课.html

**Title:** python+AI导学课

python+AI导学课

共分六个部分

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

</head>
<body>
<main>
    <header>
        <h1>python+AI导学课</h1>
    </header>
    <section id="section_1">
        <h2>共分六个部分</h2>
        <ul>
            <li>
                <h3>第一部分——python启航</h3>
                <ol>
                    <li>python<span>初识</span>

python<span>解释器</span>

python<span>开发工具</span>

python<span>入门程序</span>

<h3>第二部分——python核心语法</h3>
                <ol>
                    <li><span>数据存储与运算</span>

<span>流程控制语句</span>

<span>数据存储容器</span>

<span>函数</span>

<span>面向对象基础</span>

<span>..........</span>

<h3>第三部分——python实战——AI应用</h3>
                <ol>
                    <li><span>AI大模型基础</span>

<span>HTTP协议</span>

<span>接入DeepSeek</span>

<span>prompt工程</span>

<span>AI伴侣项目(Streamlit、文件....)</span>

<span>python<span>大模型开发学习指南</span></span>

<h3>第四部分——python实战——爬虫</h3>
                <ol>
                    <li><span>爬虫入门(<span class="span">入门、合规性</span>)</span>

<span>HTML网页结构</span>

<span>正则表达式</span>

<span>爬虫项目实战(豆瓣电影TOP榜....)</span>

<span>多线程、线程池</span>

<span>python<span>爬虫学习指南</span></span>

<h3>第五部分——python实战——数据分析</h3>
                <ol>
                    <li><span>数据分析初体验</span>

<span>Jupyter、Notebook</span>

<span>pandas</span>

<span>Matplotlib</span>

<span>数据分析与可视化案例</span>

<span>python<span>数据分析学习指南</span></span>

<h3>第六年部分——python实战——Web应用</h3>
                <ol>
                    <li><span>面向对象高级</span>

<span>FastAPI</span>

<span>web应用案例</span>

<span>python<span>装饰器</span></span>

<span>python<span>web学习指南</span></span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第一部分——python启航\第三节——环境准备——python安装\代码——python\hello.py

import sys

print("hello python")
print(f'python当前解释器：{sys.version}')

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第一部分——python启航\第三节——环境准备——python安装\笔记——html\第三节——环境准备——python安装.html

**Title:** 环境准备——python安装

环境准备——python安装

安装python解释器

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

</head>
<body>
<main>
    <header>
        <h1>环境准备——python安装</h1>
    </header>
    <section id="section_1">
        <h2>安装python解释器</h2>
        <ul>
            <li>解释器：<span>将用户代码，翻译成，计算机能识别的二进制形式</span>

<h3>安装过程</h3>
                <ol>
                    <li>注意：安装的时候，最好 <span>安装的同时，自动配置环境变量，<span
                            class="span">避免后续，自行添加，增加工作量</span></span>

<img src="image/安装路径以及环境变量选择.png"
                             alt="安装路径以及环境变量选择"
                             title="安装路径以及环境变量选择" style="display: block">

<span>请确保：安装路径没有中文或空格</span>

<h4>当安装了多个python版本，可以使用命令(<code>windows+R————→cmd</code>)：</h4>
                        <ul>
                            <li><code>py --list：</code><span>查看安装的所有python版本</span>

<code>py -*：</code>[*]是：<span
                                    class="span">需要使用的python版本</span>，<span>该方法，用于执行运行python版本</span>

<code>py --version：</code><span>查找默认的python安装版本。</span>

<code>sys.version：</code><span>返回值是当前运行文件的解释器版本，<span
                                    class="span">前提是需要 <code>import sys</code>导入sys模块</span></span>

<video src="image/Python完整安装过程，以及模糊的环境变量添加.mp4" controls
                               style="display: block"></video>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第一部分——python启航\第二节——初识python\笔记——html\第二节——初识python.html

**Title:** 初识python

初识python

python初识

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

</head>
<body>
<main>
    <header>
        <h1>初识python</h1>
    </header>
    <section id="section_1">
        <h2>python初识</h2>
        <ul>
            <li><code>python</code>是荷兰计算机科学家<span>吉多·范罗苏姆(<code>Guido van Rossum , <span
                    class="span">龟叔</span></code>)在 <code>1991</code>发布的一门语法简单、容易上手的编程语言</span>

语言：<span>是人类进行沟通交流的主要表达方式</span>

编程语言：<span>是人类与计算机之间进行信息交流的一种特殊的语言</span>

python：<span>是一门语法简单、容易上手且应用非常广泛的<span class="span">编程语言</span></span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第一部分——python启航\第四~八节[4~7配置环境忽略]——入门程序剖析\代码\小作业——打印图形.py

a = '白日依山尽'
b = '黄河入海流'
c = '欲穷千里目'
d = '更上一层楼'

Array = [a, b, c, d]

width = 10
height = 6
for i in range(height):  # i = 0 开始
    if i == 0 or i == height - 1:  # 因为 i 从零开始，所以需要 -1 // 定义外层
        print(f"{'*  ' * width}")  # 外层 符号与空格各占1字符，总结就是外层长度：10*2 = 20个字符
    elif i == 1:  # 定义内层
        print(
            f"* {' ' * (2 * 2 - 1)} {'  '.join(a)}  {' ' * (2 * 2 - 1)}*")  # 一个中文占2个字符，去掉首尾2个*号，左右个3个空格，剩下汉字+两个空格共4个字符，所以：
    elif i == 2:  # 定义内层
        print(f"* {' ' * (2 * 2 - 1)} {'  '.join(b)}  {' ' * (2 * 2 - 1)}*")  # 最后内部长度为：2 + 3*2 + 4*4 = 20个字符
    elif i == 3:  # 定义内层
        print(f"* {' ' * (2 * 2 - 1)} {'  '.join(c)}  {' ' * (2 * 2 - 1)}*")  # 与外层相同，所以能对齐。
    elif i == 4:  # 定义内层
        print(f"* {' ' * (2 * 2 - 1)} {'  '.join(d)}  {' ' * (2 * 2 - 1)}*")


def draw_diamond(n):
    # n 必须是奇数
    if n % 2 == 0:
        print("n必须为奇数")
        return
        # 自动调整为奇数，或者直接报错
    for i in range(n):  # n为行数  i从0开始
        stars = 2 * min(i, n - 1 - i) + 1  # i 是当前行数  n 是总的行数  ，该表达式主要作用：获取每个行数
        """ starts
            i = 0 min = 1
            i = 1 min = 3
            i = 2 min = 5
            i = 3 min = 7
            i = 4 min = 9
            i = 5 min = 11
            i = 6 min = 9
            i = 7 min = 7
            
        """
        remove2 = stars - 2
        spaces = (n - stars) // 2
        if stars == 1 :
            print(" " * spaces + "*")
        else :
            print(" "*spaces + "*" + " " * remove2 + '*')
# 调用示例
draw_diamond(15)

# height = 9
# for i in range(height):
#     if i == 0 or i == height - 1:
#         print(f"{' ' * height}*")
#     elif i == 1 or i == height -2 :


"""
         spaces:
         (11 - 1) = 5
         (11 - 3) = 4
         (11 - 5) = 3
         (11 - 7) = 2
         (11 - 9) = 1
         (11 - 11) = 0
         (11 - 9) = 1
         (11 - 7) = 2
         (11 - 5) = 3
         (11 - 3) = 4
         (11 - 1) = 5
     """

def  square_diamond(g) :
    for i in range(g):
        stars = g
        if i == 0 or i == g - 1:
            print("*  " * stars)
        else:
            print("*" + " " * (3*g -4)+ "*")
square_diamond(10)

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第一部分——python启航\第四~八节[4~7配置环境忽略]——入门程序剖析\笔记\第四~八节[4~7配置环境忽略]——入门程序剖析.html

**Title:** 入门程序剖析

入门程序剖析

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>入门程序剖析</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>
                <img src="../笔记/image/pyCharm自动配置文件的意义.png"
                     alt="pyCharm自动配置文件的意义"
                     title="pyCharm自动配置文件的意义">

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\__init__.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\python基础——异常处理\代码\异常处理.py

def judgment_number(a, b, c):
    try:
        int(a)
        float(b)
        int(float(c))
        float(D)
    except ValueError:
        print("只能是数字或数字字符串、a只能是整数字符串")
        return None
    except NameError:
        print('包含未定义的变量')

    return a, b, c


result = judgment_number('50', 30, '15.6')  # 调用1
if result: print(result)
result2 = judgment_number('50.6', 30, '15.6')  # 调用2
if result2 is not None: print(result2)


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\python基础——异常处理\笔记\异常处理.html

**Title:** 异常处理

异常处理

当用户输入的数据不符合规定，为了避免程序报错，而终止程序运行怎么办

<span><code>python</code>常见异常类型速查表</span>

异常处理——异常传递

扩展——主要是工具和规范

额外补充——<code>SyntaxError</code>具体指的是什么

实例

实例

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>异常处理</h1>
    </header>
    <section id="section_1">
        <h2>当用户输入的数据不符合规定，为了避免程序报错，而终止程序运行怎么办</h2>
        <ul>
            <li><span>这时就可以通过<span class="span">异常处理</span>来提前预测——<span
                    class="span">也叫防御性编程</span></span>

常见用到异常处理的地方：<span>[<code>int()，float()</code>]，已知它们传参只能是：数字或数字字符串。<span
                    class="span">当传入数字字符串时，便会报错</span>，且<code>int()</code>只能是整数字符串或浮点数、整数</span>

语法：<code>try:自认为有风险代码块-except:发生错误执行内代码块</code>

<span><code>try-except</code>的作用是：当 <code>try</code> 块中的代码出错时，程序不会崩溃，而是跳转到 <code>except</code> 执行。<span
                    class="span_warn">但不要把整个主程序都塞进 try 里，那样会掩盖错误的具体位置，不利于调试。</span>
                只把‘可能出错的那几行’（比如类型转换、文件打开、字典取值）放进去即可。</span>

<h3>以上面：<code>int()、float()</code>为例</h3>
                <code>
                    <br># 异常处理
                    <br>def judgment_number(a, b, c):
                    <br>&nbsp;&nbsp;try:
                    <br>&nbsp;&nbsp; &nbsp;&nbsp;int(a)
                    <br>&nbsp;&nbsp; &nbsp;&nbsp;float(b)
                    <br>&nbsp;&nbsp; &nbsp;&nbsp;int(float(a))
                    <br>&nbsp;&nbsp;except:
                    <br>&nbsp;&nbsp; &nbsp;&nbsp;print('应为数字或非数字字符串，a必须是整数字符串')
                    <br>&nbsp;&nbsp; &nbsp;&nbsp;return None
                    <br>&nbsp;&nbsp;
                    <br>&nbsp;&nbsp;return a,b,c
                    <br>result = judgment_number('50',30,'15.6') # 调用1
                    <br>if result : print(result)
                    <br>result2 = judgment_number('50.6',30,'15.6') # 调用2
                    <br>if result2 is not None : print(result2)
                </code>
                <ol>
                    <li>
                        调用1结果：<span>传入的参数均符合预期，所以在：<code>try</code>内正常执行，
                        最后通过<code>return</code>输出结果：<code>(50,30.0,15)</code></span>

调用2结果：<span>传入的第一个参数不符合预期，int()参数不能是非整数字符串，所以在：<code>except</code>内的代码块，
                        先打印：'应为数字或非数字字符串，a必须是整数字符串',最后通过<code>return</code>退出函数：返回值是：None，if条件不执行</span>

提醒：<span><code>int(float())</code>向零取整，直接截断小数部分</span>

上面案例就写了：<span><code>except</code>，它涵盖了所有运行时异常类型（比如 TypeError、ValueError 等）。<span
                    class="span_warn">但需要注意：语法错误（<code>SyntaxError</code>）无法被 try 捕获，因为它在程序运行前就已经被检测到了。</span></span>

因为：<code>except</code>涵盖所有异常类型。实际开发应是：
                <code style="display:block;">
                    try:
                    <br> &nbsp;&nbsp;代码块
                    <br>except 具体异常类型:
                    <br> &nbsp;&nbsp;代码块
                </code>

<span>异常传递的其实就是：<span class="span_warn">函数嵌套知识扩展</span></span>

<span>栈模型：<span class="span_warn">先进后出，出栈时，将返回值返回给下一个栈帧，依次类推</span></span>

<span>异常传递，只是将返回值替换为异常结果，逐层传递，直到最后出栈也没有异常捕获，则直接终止程序，显示错误。<span
                        class="span"></span></span>

<h3>栈模型1——异常处理用这个理解</h3>
                <img src="../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——异常处理/笔记/image/入栈出栈模型1.png"
                     alt="入栈出栈模型1" class="item">

说白了：<span>内层的异常，向上报，当最外层也处理不了，就报错</span>

<span class="span_warn">因为是异常地方开始，所以，报错总是能指出错误的路径</span>

建议：<span>小项目——可以单独设置异常处理</span>、<span>大型项目——建议在主程序，异常处理，减少代码冗余。</span>

<h3>栈模型2——该模型以递归为主(主要解释的是递归运行逻辑)</h3>
                <img src="../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——异常处理/笔记/image/入栈出栈模型2.png"
                     alt="入栈出栈模型2" class="item">

<h3>正常项目——指定捕获特定异常类型</h3>
                <ol>
                    <li>已知：<span>裸的 <code>except</code>: 会捕获所有运行时异常（<code>SyntaxError 及其子类除外</code>），但实际开发中应避免使用。</span>，<span
                            class="span_warn"><a
                            href="../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——异常处理/笔记/异常处理.html/#异常类型结构扩展"
                            onclick="loadContent(this,'container-异常处理3','#异常类型结构扩展'); return false">但也不是很专业的写法</a></span>
                        <div id="container-异常处理3"></div>

但是正常项目不会单独使用：<code>except</code>，而是指定异常类型，每一种异常类型，一个提示

原因：<span class="span">裸的 except: 会捕获包括 KeyboardInterrupt（用户按 Ctrl+C）在内的所有异常，可能会让程序在应该退出的时候“卡住”。所以实际开发中总是指定具体的异常类型</span>

意义：<span>可以针对不同类型的错误做不同处理，而不是笼统地提示</span>

语法：<code>try-except 具体异常类型</code>

<h4>实例</h4>
                        <code style="display:block;" class="code_instancing">
                            try:
                            <br> &nbsp;&nbsp;int('abc')
                            <br>except ValueError:
                            <br> &nbsp;&nbsp;print('正常数据类型，但是参数不支持非数字字符串')
                            <br>except NameError:
                            <br> &nbsp;&nbsp;print('变量/函数/类未定义')
                        </code>

可见：<span>可以给单个异常处理，添加不一样的错误提示</span>

<span>也是在正常开发中极其常见的写法，规范</span>

<span class="span_warn">不要直接使用；<code>except</code>，直接定义多个错误提示</span>

<h3>进阶语法——获取异常对象本身</h3>
                <ul>
                    <li>意义：<span>可以获取<code>python</code>给出的原始错误信息，用于调试或记录日志</span>

语法：<code>try-except 具体异常类型 as 收集错误字面量</code>

<h4>实例</h4>
                        <code style="display:block;" class="code_instancing">
                            try:
                            <br> &nbsp;&nbsp;int('abc')
                            <br>except ValueError as e:
                            <br> &nbsp;&nbsp;print(f'错误信息：{e}')
                        </code>

<span class="span_warn">通常搭配：<code><a
                                href="../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——异常处理/笔记/异常处理.html/#BaseException"
                                onclick="loadContent(this,'container-异常处理4','#BaseException');return false">BaseException</a>、<a
                                href="../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——异常处理/笔记/异常处理.html/#Exception"
                                onclick="loadContent(this,'container-异常处理4','#Exception');return false">Exception</a></code>使用，用于捕获所有异常(一般情况：<code>SyntaxError</code>除外)</span>
                        <div id="container-异常处理4"></div>

可以：<span>可以通过 <code>as 收集错误字面量</code> 将原本错误信息，赋值给字面量，用于打印</span>

<h3>进阶语法——else子句：没有异常时执行</h3>
                <ul>
                    <li>意义：<span>区分“<span class="span_warn">异常处理逻辑</span>”和“<span
                            class="span_warn">正常执行逻辑</span>”，代码更清晰。</span>

语法：<code>try-except 具体异常类-else</code>

<h4>实例</h4>
                        <code style="display:block;" class="code_instancing">
                            try:
                            <br> &nbsp;&nbsp;int('abc')
                            <br>except ValueError as e:
                            <br> &nbsp;&nbsp;print(f'错误信息：{e}')
                            <br>else:
                            <br> &nbsp;&nbsp;print('没有异常')
                        </code>

注意：<span>是当所有：<code>except</code>语句没有执行，才会执行：<code>else</code>语句</span>

<h3>进阶语法——finally子句：无论是否异常，始终执行</h3>
                <ul>
                    <li><span>一般用于：<span class="span_warn">清理资源(<span class="span">关闭文件、释放连接</span>)，保证无论是否出错都会执行</span></span>

语法：<code>try-except 具体异常类-finally</code>

<h4>实例</h4>
                        <code style="display:block;" class="code_instancing">
                            try:
                            <br> &nbsp;&nbsp;f = open('data.text','r')
                            <br> &nbsp;&nbsp;data = f.read()
                            <br>except FileNotFoundError:
                            <br> &nbsp;&nbsp;print('文件不存在')
                            <br>finally:
                            <br> &nbsp;&nbsp;if f:
                            <br> &nbsp;&nbsp;&nbsp;&nbsp; f.close() # 无论是否出错，都会关闭文件
                        </code>

注意：<span>是不管是否执行：<code>except</code>语句，都会执行：<code>finally</code>语句</span>

<span>还需要注意：<code>finally</code>内，使用 <code>return</code>会覆盖原本错误提示，所以应避免在 <code>finally</code>使用：<code>return</code></span>

<h3>进阶语法——抛出异常：<code>raise</code></h3>
                <ul>
                    <li>
                        <span>当自己检测到错误条件，可以主动抛出异常</span>

语法1：<code>raise 异常类型(抛出内容)</code>

语法2:：<code>raise 新异常类型() from 旧异常类型</code>

语法2：<span>语义是：新异常类型报错的原因是，就异常类型</span>

<span>最后的输出结果是：<span>两种异常信息合并，同时打印</span></span>

<span class="span_warn">不是必须在<code>try-except</code>内写入</span>

<h4>分三种情况</h4>
                        <ol>
                            <li>
                                <h5>在：<code>try-except</code>内的<code>try</code>写入</h5>
                                <ul>
                                    <li><span class="span_warn">功能一致，抛出对应异常类型的异常</span>

<span>但是会被：<code>except</code>捕获</span>

所以有：<code>except</code>兜底，不会终止整个程序的运行

<p>实例</p>
                                        <code style="display:block;" class="code_instancing">
                                            try:
                                            <br> &nbsp;&nbsp;float('abc')
                                            <br> &nbsp;&nbsp;raise ValueError('请输入数字或数字字符串')
                                            <br>except ValueError as e:
                                            <br> &nbsp;&nbsp;print(f'错误信息是：{e}') # 当热这是多次一举的写法，只是为了方便演示
                                        </code>

<span class="span_warn">主要特点：抛出的异常会被<code>except</code>捕获，所以并不会终止程序的运行</span>

<h5>在：<code>try-except</code>内的<code>except</code>写入</h5>
                                <ul>
                                    <li><span class="span_warn">功能一致，抛出对应异常类型的异常</span>

<span>因为在：<code>except</code>内，若内部没有<code>try-except</code>，会直接报错</span>

所以有：<code>except</code>会终止整个程序的运行

<span>常与语法2(<code class="code_instancing">raise 新异常 from 旧异常</code>)搭配使用：</span>

<h4>语法2：实例</h4>
                                        <code>
                                            try:
                                            <br> &nbsp;&nbsp;int('15.6')
                                            <br>except ValueError as e:
                                            <br> &nbsp;&nbsp;raise TypeError('转换失败') from e # 因为在except
                                            内，所以会直接中断程序
                                        </code>

<span
                                            class="span_warn">主要特点：旧异常会被<code>except</code>捕获并命名，在<code>except</code>内抛出异常，通常与语法2搭配使用</span>

<h5>在：<code>try-except</code>外写入</h5>
                                <ul>
                                    <li><span class="span_warn">功能一致：抛出对应异常类型的异常</span>

<span>但是没有<code>except</code>捕获异常</span>

<span>所以会立刻终止程序运行，并输出终止的原因。</span>

<p>实例</p>
                                        <code style="display:block;" class="code_instancing">
                                            def set_age(age):
                                            <br>if age < 0:
                                            <br> &nbsp;&nbsp;raise ValueError('年龄不能为负数') # 会直接终止后续程序执行，并输出报错提示
                                            <br>elif age < 18:
                                            <br> &nbsp;&nbsp;print('未成年')
                                            <br> &nbsp;&nbsp;return True
                                            <br>else:
                                            <br> &nbsp;&nbsp;print('成年')
                                            <br> &nbsp;&nbsp;return True
                                        </code>

<span class="span_warn">主要特点：抛出的异常没有<code>except</code>捕获，直接终止后续所有程序运行，输出报错原因</span>

<h3>进阶语法——自定义异常类</h3>
                <ul>
                    <li><span>二级考试不要求，但是实际项目中常用</span>

语法：<code>class 类名(Exception):自定义异常类</code>

<h4>实例</h4>
                        <code style="display:block;" class="code_instancing">
                            class MyError(Exception):
                            <br>&nbsp;&nbsp;pass
                            <br>raise MyError('自定义错误')
                        </code>

<span class="span_warn">暂时理解写法即可，后续用到在说</span>

<h3>扩展——异常处理嵌套</h3>
                <ul>
                    <li><span>异常处理是可以嵌套的，且同一个作用也可以是多个异常处理</span>

<code style="display:block;" class="code_instancing">
                            def judge_num(num,num2,num3):
                            <br>&nbsp;&nbsp;try:
                            <br>&nbsp;&nbsp; &nbsp;&nbsp;int(num)
                            <br>&nbsp;&nbsp;except Exception as e:
                            <br>&nbsp;&nbsp; &nbsp;&nbsp;raise TypeError('转换错误') from e
                            <br>&nbsp;&nbsp; &nbsp;&nbsp;try:
                            <br>&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;int(num2)
                            <br>&nbsp;&nbsp; &nbsp;&nbsp;except Exception as e:
                            <br>&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;print('num,num2,必须是数字或整数字符串')
                            <br>&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;return None
                            <br>
                            <br>&nbsp;&nbsp;try:
                            <br>&nbsp;&nbsp; &nbsp;&nbsp;float(num3)
                            <br>&nbsp;&nbsp;except ValueError:
                            <br>&nbsp;&nbsp; &nbsp;&nbsp;print('num3必须是数字或数字字符串')
                        </code>

<span>只是为了方便演示，正常项目写的会通顺一点，只要理解可以<span
                                class="span_warn">同级写异常处理、子集嵌套即可</span></span>

<span><code>SyntaxError（语法错误）</code>：“Python 看不懂你这行字。”</span>

<span><code>运行时异常（ValueError 等）</code>：“Python 看懂了，但执行到这一步时发现数据有问题。”</span>

<h3>大部分是：<code>python</code>语法层面的硬性规则</h3>
                <ol>
                    <li>说白了：<span><code>python</code>运行程序，需要解释器、硬性规则是程序运行底线，发生此错误，<code>try-except</code>根本来不及运行，就已经报错</span>

<h4>缩进问题</h4>
                        <ul>
                            <li><span>忘记缩进，或则混用<code>Tab</code>和空格，导致<code>python</code>找不到代码块</span>

<code><span>例</span>：if True:\nprint('hi')（<span class="span_warn"></span>）</code>

<h4>关键字错误命名</h4>
                        <ul>
                            <li><span>把 Python 的保留关键字（如 <code>class、if、def</code>）用作变量名</span>

<span>例：<code>class = 1</code>（<span
                                    class="span_warn">报错，因为 class 是创造类的硬性关键词</span>）。</span>

<h4>
                            <a href="../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/数据存储与运算/标识符/笔记/标识符.html#标识符的规范"
                               onclick="loadContent(this,'container-异常处理2','#标识符的规范');return false">无效的标识符命名（非法字面量命名）</a>
                        </h4>
                        <ul>
                            <li><span>变量名以数字开头，或者包含不允许的特殊符号（除了 _）。</span>

例：1a = 10（报错，变量名不能以数字开头）。

<div id="container-异常处理2"></div>

<h4>缺少必要的语法符号</h4>
                        <ul>
                            <li><span>忘记写冒号 :（if True 后面没写冒号）。</span>

<span>括号、引号不匹配（print("Hello 缺少右引号）</span>

<span>要想捕获所有异常(<code>SyntaxError</code>除外)，应该是：<code>try-except Exception</code></span>

<h4>Exception</h4>
                <ol id="Exception">
                    <li><span
                            class="span_warn"><code><a
                            href="../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——异常处理/笔记/异常处理.html/#Exception1">Exception</a></code>包含非：<code>SystemExit、KeyboardInterror、GeneratorExit</code>外所有异常类型</span>

<span>注意：<code>SyntaxError</code> 虽然继承自 <code>Exception</code>，但它发生在代码运行之前，所以无法被运行时的 <code>except</code> 捕获。</span>

<span class="span_warn"
                      id="BaseException">异常类型的基类：<code>BaseException</code>，包含所有异常类型</span>

<code>BaseException</code>
                <ol>
                    <li><code>SystemExit</code>

<code>KeyboardInterrupt</code>

<code>GeneratorExit</code>

<code>Exception</code> —— 所有常规异常的父类
                        <ul>
                            <li><code>StopIteration</code>

<code>StopAsyncIteration</code>

<code>ArithmeticError</code>
                                <ol>
                                    <li><code>FloatingPointError</code>

<code>OverflowError</code>

<code>ZeroDivisionError</code>

<code>AttributeError</code>

<code>BufferError</code>

<code>EOFError</code>

<code>ImportError</code>
                                <ol>
                                    <li><code>ModuleNotFoundError</code>

<code>LookupError</code>
                                <ol>
                                    <li><code>IndexError</code>

<code>KeyError</code>

<code>MemoryError</code>

<code>NameError</code>
                                <ol>
                                    <li><code>UnboundLocalError</code>

<code>OSError</code>

<code>ReferenceError</code>

<code>RuntimeError</code>
                                <ol>
                                    <li><code>RecursionError</code>

<code>SyntaxError</code>
                                <ol>
                                    <li><code>IndentationError</code>

<code>SystemError</code>

<code>TypeError</code>

<code>ValueError</code>
                                <ol>
                                    <li><code>UnicodeError</code>
                                        <ul>
                                            <li><code>UnicodeEncodeError</code>

<code>UnicodeDecodeError</code>

<code>UnicodeTranslateError</code>

<code>ZeroDivisionError</code>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\python基础——文件读写与操作\with语句以及扩展方法\代码\with语句以及扩展方法.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\python基础——文件读写与操作\with语句以及扩展方法\笔记\with语句以及扩展方法.html

**Title:** with语句以及扩展啊方法

with语句以及扩展啊方法

with语句

扩展方法

文件处理方法扩展

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>with语句以及扩展啊方法</h1>
    </header>
    <section id="section_1">
        <h2>with语句</h2>
        <ul>
            <li><span>已知每次用<code>open()</code>都需要使用<code>close()</code>关闭释放资源</span>

<span><code>with</code>主要作用是省略<code>close()</code>步骤</span>

<span>语法：<code>with open('文件地址',mode='',encodeing='') as 字面量</code></span>

<span>字面量存储文件对象</span>

<div id="seek">
                    <h4>扩展方法——seek()</h4>
                    <ol>
                        <li><code>指定光标位置</code>

语法：<code>seek(偏移量,whence)</code>

偏移量：<span>正整数：向右/向后/向文档末尾方向移动。负整数：向左/向前/向文档首方向移动。0：不移动</span>

偏移量参数不能是：<span>字符串、浮点数，否则会报错：<code>TypeError</code></span>

<span>起始位置三个参数固定：<code>whence</code> 参数：<code>0</code>（默认，相对于文件开头）、<code>1</code>（相对于当前位置）、<code>2</code>（相对于文件末尾）。在文本模式下，建议只使用 whence=0，避免因编码问题导致光标位置错乱。</span>

第二参数除：<span>【<code>0、1、2</code>】均报错，<code>TypeError</code></span>

<span><code>seek(0,1)</code>一般很少用，主要搭配：<a
                                href="../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——文件读写与操作/with语句以及扩展方法/笔记/with语句以及扩展方法.html/#tell"
                                onclick="loadContent(this,'container3','#tell');return false">tell()</a>、输出光标坐标</span>
                            <div id="container3"></div>

<span>seek() 以 字节 为单位移动光标。在文本模式下，建议只使用 seek(0)（移到开头）或 seek(0, 2)（移到末尾），避免移动到非 ASCII 字符中间导致解码错误。</span>

<div id="tell">
                    <h4>扩展方法——tell()</h4>
                    <ol>
                        <li><code>返回当前光标的位置</code>

语法：<code>tell()</code>

<span>不能传参，否则：<code>TypeError</code></span>

<span>会受到：<code>seek()</code>影响</span>

<h4>扩展方法——readlines()</h4>
                <ol>
                    <li><span>将读取的文本/二进制转成列表，以换行符为基准，每一行代表一个元素</span>

语法：<code>readlines(size)</code>

注意：<span>readlines() 适用于文件不大且需要随机访问各行的场景。如果文件很大，建议用 for line in f: 逐行读取，更节省内存。</span>

常用于：筛选等等

<span>size：可选参数且只能传整数参数，只能传一个参数。<span
                            class="span_warn">意思是：size：，表示读取大约 size 个字节的数据，然后返回这些数据中包含的所有行（不精确，一般不建议传参）</span></span>

<span>所以一般不建议传参、直接获取整行组成列表即可</span>

<span>多行读取</span>

<h4>扩展方法——readline()</h4>
                <ol>
                    <li><span>读取光标所在的那一行的文本</span>

语法：<code>readline(size)</code>

<span>返回值是字符串，而不是：<code>readines()</code>返回的是列表</span>

<span>size：可以传整数参数，且只能传一个参数。<span
                            class="span_warn">意思是：readline(size) 表示“读取当前行的前 size 个字节”。由于中文字符可能占多个字节，建议不要依赖这个参数来精确按字符读取。</span></span>

<span><code>readline()</code> 读取到末尾时返回空字符串 <code>''</code>，不是 <code>None</code>。这个在写“逐行处理”时很关键，</span>

<span>光标由：<code>seek()</code>控制，光标是以字节移动，正常情况，无法准确识别每行字符个数，所以光标位置不可控</span>

所以一般使用：<code>seek()</code>控制光标位置

而是使用：<span><code>for i in range(n-1) : return f.readline()</code>提前提过前面的行数，只打印需要的行数</span>

<span>单行读取</span>

<h4>扩展方法——writelines()</h4>
                <ol>
                    <li><span>将指定的字符串或二进制，写入文件(注意：不会自动添加符号)。</span>

语法：<code>writelines(可迭代对象（如列表、元组、生成器等)</code>

注意：<span>不会自动添加符号，需要自行写：换行：<code>\n</code>、制表：<code>\t</code>...</span>

<span><code>r</code>：光标在最前面、<code>w</code>：光标在最前面、<code>a</code>：光标在最后面</span>



<span><code>writelines()</code> 只接受一个参数，必须是一个可迭代对象（比如列表、元组、生成器），每个元素是要写入的一行内容。不能同时传入多个独立的字符串。</span>

<span>注意写入没有：<code>writeline()</code></span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\python基础——文件读写与操作\读写、写入、追加操作-open-read-write-close解析\代码\读写、写入、追加操作-open-read-write-close解析.py

def read1():
    with open('测试.txt', 'rt', encoding='utf-8') as f:
        print(f.read())


def student_note():
    while True:
        name = input("请输入学生姓名(回车结束录入)，name=")
        if name == '':
            break
        cls = input("请输入学生班级,class=")
        age = input("请输入学生年龄,age=")

        students = f"姓名：{name},班级：{cls},年龄：{age}\n"
        with open('学生系统文件.txt', 'at', encoding='utf-8') as f:
            f.write(students)

        print(f'学生 {name} 录入成功')

    print('学生信息录入结束')


def read2():
    with open('学生系统文件.txt', 'rt', encoding='utf-8') as f:
        print(f.read())


# 案例三：将文件姓名为：颤三 学生删除
def removes(del_name):
    # 先读取文件
    with open('学生系统文件.txt', 'rt', encoding='utf-8') as f:
        lines = f.readlines()  # 返回列表每一行元素

    # 备份文件进其他文件
    with open('学生系统文件备份.txt', 'at', encoding='utf-8') as f:
        f.writelines(lines)
    # 过滤掉要删除的行
    new_list = []
    for line in lines:
        if f'姓名：{del_name},' in line:
            continue
        new_list.append(line)

    # 重新打开文件，这一次mode=w  # 将过滤掉的行数，列表转字符串，并覆盖原文件
    with open('学生系统文件.txt', 'wt', encoding='utf-8') as f:
        f.writelines(new_list)

    print(f'已经删除姓名为 {del_name} 的学生')


if __name__ == '__main__':
    # 案例1 ———— 读取文件内容并打印出来
    # read1()

    # 案例2 —————— 制作简易录入学生信息
    student_note()

    # 读取案例2 —————— 文件内容并打印
    read2()

    # 案例三：将文件姓名为：颤三 学生删除
    name = input("请需输入需要删除学生的姓名，name=")
    removes(name)


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\python基础——文件读写与操作\读写、写入、追加操作-open-read-write-close解析\笔记\读写、写入、追加操作-open-read-write-close解析.html

**Title:** 读写、写入、追加操作-open-read-write-close解析

读写、写入、追加操作-open-read-write-close解析

回顾读模式

open()、read()、write()、close()

读写（r+、rb+、rt+）

写入（w、wt、wb）

追加（a、at、ab）

读写 (w+、wt+、wb+、a+、at+、ab+)

建议

扩展——异常类型：TypeError 和 ValueError

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>读写、写入、追加操作-open-read-write-close解析</h1>
    </header>
    <section id="section_1">
        <h2>回顾读模式</h2>
        <ul>
            <li>只读文本：<code>r,rt</code>、读取原始二进制：<code>b,rb</code>

共同特点：<span>当文件不存在或路径写错，会报错：<code>FileNotFoundError</code></span>

<h3>open()</h3>
                <ol>
                    <li>主要作用：<span>返回一个'文件对象'(<code>File Object</code>)</span>

可以理解为：<span>链接到这个文件的遥控器/管道</span>

<h4>内含</h4>
                        <ul>
                            <li><span>文件在操作系统中的 <span class="span_warn">句柄</span>[也叫编号]</span>

<span>当前的<span class="span_warn">读写位置</span>(光标/指针)</span>

以及编码着指定的：<span>编码规则(encoding)和读写模式(<span
                                    class="span_warn">读、写、追加</span>)</span>

<h3>read()</h3>
                <ol>
                    <li>主要作用：<span>只读取文件对象所指文件内容</span>

语法：<code>字面量 = 文件对象.read()</code>

扩展：<span>只可以传一个参数，指向的文档开头开始，读取与参数相同数量的字符</span>

所以：<span>参数必须是整数，如果是浮点数或字符串，会报错：<code><a
                            href="../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——文件读写与操作/读写、写入、追加操作-open-read-write-close解析/笔记/读写、写入、追加操作-open-read-write-close解析.html/#TypeError与ValueError"
                            onclick="loadContent(this,'container','#TypeError与ValueError');return false">TypeError</a></code></span>
                        <div id="container"></div>

<span>如果参数为负数，读取整个文件内容，等价于：<code>文件对象.read()</code></span>

<h3>write()</h3>
                <ol>
                    <li>主要作用：<span>可以写入操作</span>

语法：<code>字面量 = 文件对象.write('内容')</code>

扩展：<span>只可以传一个参数，具体内容</span>

具体内容有什么限制由：<code>mode</code>决定

<span>如果写入的数据与 <code>mode</code>不匹配，则会报错，<code>TypeError</code></span>

<h3>close()</h3>
                <ol>
                    <li>主要作用：<span>关闭文件、销毁文件对象，释放资源</span>

语法：<code>字面量 = 文件对象.close()</code>

注意：<span>不能传参</span>

<span>如果传参则报错：<code>TypeError</code>,原因：操作数类型不匹配</span>

<span>r+：可读可写，文件必须存在，光标在开头，写入时会覆盖原有内容</span>

模式：<span>r+、rb+</span>

语法：<code>open(文件地址,mode='模式',encoding='解码器')</code>

注意：<span>先读后写，所以 <span
                    class="span_warn">文件必须真是存在，否则报错：<code>FileNotFoundError</code></span></span>

<h3>运行过程</h3>
                <ol>
                    <li><code>r+/rb+/rt+</code> <span class="span_warn">打开文件时，光标位于文件开头。写入时从光标位置开始覆盖（<span>写几个字符就覆盖几个字符</span>），不会自动清空原文件。读取操作会从当前光标位置开始读取。</span>

<code>r+/rt+</code>写入必须是字符串、<code>rb+</code>写入必须是：二进制。不会自动将<code>Unicode</code>字符转为<code>bytes</code>

不懂二进制要想写入二进制可以采用：<code>b'字符串'</code>的形式，自动转为二进制写入

文本写入模式：<code>w、wt</code>

<span>文本写入，所以：<code>write()</code>必须是字符串</span>，否则报错：<code>TypeError</code>

二进制写入：<code>wb</code>

<span>二进制写入，所以：<code>write()</code>必须是二进制</span>,否则报错：<code>TypeError</code>

<h3>共同特点</h3>
                <ol>
                    <li><span>文件不存在，自动创建。</span>

清空原文件内容，新内容覆盖

<code>w</code>等价于<code>wt</code>

注意：<span>文本写入/二进制写入，<code>write()</code>，传参是字符串/二进制</span>

文本追加模式：<code>a、at</code>

<span>文本写入，所以：<code>write()</code>必须是字符串</span>，否则报错：<code>TypeError</code>

二进制写入：<code>ab</code>

<span>二进制写入，所以：<code>write()</code>必须是二进制</span>,否则报错：<code>TypeError</code>

<h3>共同特点</h3>
                <ol>
                    <li><span>文件不存在，自动创建。</span>

保留原文件内容，且指针在文件在最后面，新内容在指针后面追加

<code>a</code>等价于<code>at</code>

注意：<span>文本写入/二进制写入，<code>write()</code>，传参是字符串/二进制</span>

顾名思义：<span>可读可写</span>

<span><code>w</code>:覆盖写入、<code>a</code>：结尾追加、<code>t</code>：字符串、<code>b</code>：二进制，<span
                    class="span_warn">概念完全相同</span></span>

注意：<span><code>w</code>是覆盖写入，打开文件，内容就已经清空了、如果确实需要读，必须先 <code>write()</code> 写入新数据，再 <code>seek(0)</code> 才能读到。直接 <code>read()</code> 读到的永远是空字符串。</span>

注意：<span><code>a</code>是追加写入，打开文件，内容就存在，但是光标在结尾、要想读取，需要将光标移动至最前面。使用方法：<code><a
                    href="../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——文件读写与操作/with语句以及扩展方法/笔记/with语句以及扩展方法.html/#seek"
                    onclick="loadContent(this,'container2','#seek');return false">seek(0,0)</a></code>，写的时候又要重新将光标移动至最后，<code>seek(0,2)</code></span>
                <code><a
                        href="../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/python基础——文件读写与操作/with语句以及扩展方法/笔记/with语句以及扩展方法.html/#tell"
                        onclick="loadContent(this,'container2','#tell');return false">tell()</a></code>
                <div id="container2"></div>

注意：<span>与 <code>r+、rb+、rt+</code> 不同，<code>w+、wt+、wb+、a+、at+、ab+</code> 在文件不存在时不会报错(<code>FileNotFoundError</code>)，而是新建文件。</span>

<span class="span_warn">所以除非有特殊目的，最好还是读写分开</span>

<code>open()——打开、read()——读取、write()——写、close()——关闭</code><span>是文件处理的方法、是本质。</span>

<code
                    class="code_instancing">r、b、rt、rb、w、wt、wb、a、at、ab</code>是<code>open()</code><span>内的：<code>mode</code>的值</span>
                <span class="span_warn">控制的是模式。只读、读写、写入、追加</span>

<span class="span_warn"><code>open</code>返回的是文件对象，包含模式</span>

<span class="span_warn"><code>read</code>返回的是文件内容，只要是提取内容都需要它</span>

<span class="span_warn"><code>write</code>没有返回值，只要是写入内容都需要它</span>

<span class="span_warn"><code>close</code>没有返回值，每个文件打开，必须要关闭，避免浪费资源、避免内容泄露损失</span>

注意：<span><code>r、rt、rb、b</code>模式打开的文件，只能读：<code>read()、readlines()</code>，使用：<code>write()、writelines()</code>
                会报错(<code>io.UnsupportedOperation： not writeable</code>)</span>

注意：<span><code>w、wt、wb、a、at、ab</code>模式打开的文件，只能写：<code>write()、writelines()</code>，使用：<code>read()、readlines()</code>
                会报错(<code>io.UnsupportedOperation： not readable</code>)</span>

注意：<span><code>r+、rb+、w+、wt+、wb+、a+、at+、ab+</code>模式打开的文件，可读可写：<code>write()、writelines()、read()、readlines()、</code>
                不会报错(<code>io.UnsupportedOperation： not readable(<span>或</span>not writeable)</code>)</span>

<h3>TypeError</h3>
                <ol>
                    <li><code>TypeError</code>: <span>'操作数'的类型本身不匹配（类型错误）</span>

操作数：<span>传参的实参、运算符号两边的字符</span>

类型：<span>可以是运算时数据类型错误、传参时数据类型错误、传参数量错误</span>

<h4>比如</h4>
                        <code class="code_instancing">open("info.txt", mode=123)，
                            <span>这里面<code>mode</code>必须是字符串，类型错误，所以：<code>TypeError</code></span></code>

<h3>ValueError</h3>
                <ol>
                    <li><code>ValueError</code>: <span>'操作数'的类型本身匹配（类型错误），但是结果/值错误</span>

操作数：<span>传参的实参、运算符号两边的字符</span>

类型：<span>可以是运算时数据类型错误、传参时数据类型错误、传参数量错误</span>

<h4>比如</h4>
                        <code class="code_instancing">int('abc')，<span>int()方法支持传字符串，但是实参是非数字字符串，值错误，所以：<code>ValueError</code></span></code>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\python基础——文件读写与操作\读文件及注意事项\代码\读文件及注意事项.py

name = '你好'
data = name.encode('gbk')
print(data)

result = data.decode('gbk')
print(result)

# t = open('info.text','r',)
# print(t.read())

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\python基础——文件读写与操作\读文件及注意事项\笔记\读文件及注意事项.html

**Title:** 读文件及注意事项

读文件及注意事项

文件操作

读取文件

以上内容总结

以上知识均是学习笔记来源于哔哩哔哩UP主——python大王艾雷克斯

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>读文件及注意事项</h1>
    </header>
    <section id="section_1">
        <h2>文件操作</h2>
        <ul id="编码区别">
            <li>在学习文件操作之前，需要先回顾编码与数据类型相关的知识

<h3>字符串类型</h3>
                <ol>
                    <li><span>字符串类型(<code>str</code>)：在程序中用于表示文档信息，本质上是：<code>Unicode</code>编码中的二进制</span>

如：<code class="code_instancing">name = 'YLH'</code>

<h4>字节类型</h4>
                <ol>
                    <li><span>
                        字节类型(<code>bytes</code>):可表示文字信息，本质上是：<code>utf-8/gbk</code>等编码的二进制，<span
                            class="span_warn">[对 <code>Unicode</code>进行压缩，方便文件存储和网络传输]</span>
                    </span>

<code class="code_instancing" style="display:block;">
                            <br>name = '你好'
                            <br>
                            <br>data = name.encode('utf-8') <span
                                class="span_warn"># encode 将Unicode编码压缩成对应编码</span>。
                            <br>
                            <br>print(data) <span class="span_warn"> # 输出结果是： b'\xe4\xbd\xa0\xe5\xa5\xbd'</span>
                            <br>
                            <br>result = data.decode('utf-8') <span
                                class="span_warn"># decode 将其他编码，转为Unicode编码</span>
                            <br>
                            <br>print(result) <span class="span_warn"># 输出结果是：你好</span>
                        </code>

<span>可表示原始二进制(<span class="span">图片、文件等信息</span>)</span>

以上案例：<span><code>encode</code>:将<code>Unicode</code>编码压缩成对应编码,
                        <br><code>decode</code>将其他编码，转为<code>Unicode</code>编码</span>

先要了解：<span class="span_warn">绝对地址与相对地址</span>

<h3>绝对地址</h3>
                <ol>
                    <li><span>绝对地址：<span class="span_warn">从本地盘符开始，直到文件的地址</span></span>

好处：<span>一步到位，直接复制可用</span>

坏处：<span>一但定义，当文件移动位置，原本路径失效，需要自行再次更改</span>

<span>常用于本地读取，上传到：<code>GitHub</code>等静态托管会出大问题</span>

<h3>相对地址</h3>
                <ul>
                    <li>
                        <span>相对地址：通过 <code>./（当前目录）</code>、<code>../（上级目录）</code>或直接写文件夹名来定位文件。例如：./data/file.txt 表示当前目录下的 data 文件夹中的 file.txt。</span>

好处：<span>一但定义，当文件移动位置，原本路径会跟着改变，无需后续再次更改</span>

坏处：<span>坏处：当脚本的运行目录发生变化时（例如被其他位置的脚本调用），相对路径的基准会改变，可能导致文件找不到。项目内嵌套过深时，路径可读性会下降。</span>

<span>自认为这是最好的写法，一劳永逸，上传网页也不会出大问题</span>

<a href="../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/模块/模块与包/笔记/模块与包.html/#模块引用与文件地址引用区别"
                   onclick="loadContent(this,'container-读文件及注意事项','#模块引用与文件地址引用区别');return false">需要注意的是：模块引用地址与文件引用地址有区别</a>
                <div id="container-读文件及注意事项" class="div_table"></div>

<h3>打开文件方式</h3>
                <ol>
                    <li>
                        打开文件：<span>使用<code>open(路径,mode='读取模式',encoding='解码类型')</code>的方式打开文件</span>

<span class="span_warn"><code>rb</code>：表示读取文件原始二进制</span>

<span class="span_warn"><code>r,rt</code>：表示读取文件文本，最好需要通过：<code>encoding</code>指定解码类型</span>

<span><code>b</code>：二进制：<code class="code_instancing">binary:</code>，单写一个'b',不会报错，等价于'rb'</span>

<span>使用<code>open</code>打开文件，默认解码与操作系统挂钩，<code>Windows</code>默认是：<code>GBK</code>,<code>Linux</code>默认是：<code>utf-8</code></span>

<h4>也就是设文件以：<code>utf-8</code>存储：</h4>
                        <ol>
                            <li><span class="span_warn"><code>Windows</code>:必须写：<code>encding='utf-8'</code></span>

<span class="span_warn">Linux</span>：可以不写：<code>encoding='utf-8'</code>

当文件存储是：<code>GBK</code>：则 <code>Windows</code>不需要、<code>Linux</code>需要

其余任何编码格式都需要：<span>写：<code>encoding('解码类型')</code></span>

未指定解码类型则报错：<code>UnicodeDecodeError</code>

<h4>文件的整个过程</h4>
                        <ol>
                            <li>所有模式(<code>r,rb,rt</code>)<span>最开始都是读取硬盘上的原始二进制</span>

<span><code>rb</code>模式：<span
                                    class="span_warn">直接输出原始二进制，不会进行后续解码</span></span>

其他模式：<span class="span_warn">后续会自动解码，默认解码器与操作系统挂钩</span>

Windows默认：<code>GBK</code>、Linux默认：<code>utf-8</code>

其实最好的写法是：<span>都写<code>encoding</code>指定解码类型</span>,默认有这个概念即可

最重要的是：过程

注意：<span>当文件路径不存在或输入错误，会报错：<code>FileNotFoundError</code></span>

<h3>读文本文件</h3>
                <ol>
                    <li>可以用：<code>rb</code>，<span class="span_warn">但是后续需要自行：<code>decode()</code>转成字符串</span>

<code class="code_instancing" style="display:block;">
                            <br>file_object = open('info.txt',mode='rb') <span
                                class="span_warn"># 打开文件，指定模式为只读二进制</span>
                            <br>
                            <br>data = file_object.read() <span class="span_warn"># 读取文件，并赋值给 data</span>
                            <br>
                            <br>file_object.close()
                            <span># 当文件操作结束后，用 <code>close()</code>关闭文件，释放资源</span>
                            <br>print(data) <span class="span_warn"># 打印的是压缩的编码</span>
                            <br>text = data.decode('utf-8') <span
                                class="span_warn"># 通过decode('utf-8')，重新转成字符串</span>
                            <br>
                            <br>print(text) <span>打印读取的文件</span>
                        </code>

以上方法极其麻烦：<span>当只要读取文本，因为：open()在Windows默认是GBK解码，当不是GBK编码文件，后续要通过：decode()，转成可见的字符串</span>

所以读文件一般用：<code>r,rt</code>

<code class="code_instancing" style="display:block;">
                            <br>file_object = open('info.txt',mode='rt',encoding='utf-8') <span class="span_warn"># 打开文件，并指定模式，只读，原始二进制、还是后续的写入</span>
                            <br>
                            <br>data = file_object.read() <span class="span_warn"># 读取文件，并赋值给 data</span>
                            <br>
                            <br>file_object.close()
                            <span># 当文件操作结束后，用 <code>close()</code>关闭文件，释放资源</span>
                            <br>
                            <br>
                            <br>print(data) <span>打印读取的文件</span>
                        </code>

<h3>读图片等非文本内容</h3>
                <ol>
                    <li><span class="span_warn">读非文本文内容必须：<code>rb</code></span>

<code class="code_instancing" style="display:block;">
                            <br>file_object = open('info.png',mode='rb') <span class="span_warn"># 打开文件，并指定模式，只读，原始二进制、还是后续的写入</span>
                            <br>
                            <br>data = file_object.read() <span class="span_warn"># 读取文件，并赋值给 data</span>
                            <br>
                            <br>file_object.close()
                            <span># 当文件操作结束后，用 <code>close()</code>关闭文件，释放资源</span>
                            <br>
                            <br>
                            <br>print(data) <span>打印读取的文件</span>
                        </code>



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\JavaScript函数与python函数对比表\JavaScript函数与python函数对比表.html

**Title:** JavaScript函数与python函数对比表

JavaScript函数与python函数对比表

一、<span>函数定义方式</span>

二、<span>参数系统</span>

三、<span>返回值</span>

五、<span>特殊函数类型</span>

六、<span>函数调用与 <code>this</code> / <code>self</code></span>

七、<span>⚠️ 特别提醒（初学者最容易踩的坑）</span>

🎯 最终总结：Python 函数 vs JavaScript 函数

其他需要注意事项

概述

以下为编程中常见的特殊函数类型，涵盖 <strong>Python</strong> 与 <strong>JavaScript</strong>
                        中的对应实现。

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>JavaScript函数与python函数对比表</h1>
    </header>
    <section id="section_1">
        <div class="div_table">
            <table>
                <tr>
                    <th colspan="4"><h2>一、<span>函数定义方式</span></h2></th>
                </tr>
                <tr>
                    <td>对比维度</td>
                    <td><code>python</code></td>
                    <td><code>JavaScript</code></td>
                    <td>核心差异</td>
                </tr>
                <tr>
                    <td>声明式定义</td>
                    <td><code>def 函数名(参数):</code></td>
                    <td><code>function 函数名(参数){ }</code></td>
                    <td><span><code>python</code>用冒号 + 缩进，<code>JavaScript</code>用花括号</span></td>
                </tr>
                <tr>
                    <td>赋值式定义</td>
                    <td><code>函数名 = lambda 参数: 返回值(<span>仅限单表达式</span>)</code></td>
                    <td><code>const 函数名 = function(参数){ }</code></td>
                    <td><span><code>JavaScript</code>支持完整函数体，<code>python lambda</code>只能写一行</span></td>
                </tr>
                <tr>
                    <td>匿名函数</td>
                    <td><code>lambda 参数: 返回值</code></td>
                    <td><code>function(参数) { }</code>或<code>(参数) => { }</code></td>
                    <td><span><code>python lambda</code>天生匿名，<code>JavaScript</code>匿名函数需要赋值给变量或作为回调函数使用</span>
                    </td>
                </tr>
                <tr>
                    <td>箭头函数(<code>ES6</code>)</td>
                    <td>❌ 无（lambda 是类似但功能受限）</td>
                    <td><code>(参数) => {函数体}</code></td>
                    <td><span>箭头函数没有自己的<code>this</code>，<code>lambda</code>也没有<code>self</code>概念</span>
                    </td>
                </tr>
                <tr>
                    <td>类中方法</td>
                    <td><code>def 方法名(self,参数):</code></td>
                    <td><code>方法名(参数) { }</code></td>
                    <td>
                        <span><code>python</code>必须显式写<code>self</code>,<code>JavaScript</code>不用(但是在类中可用<code>this</code>)</span>
                    </td>
                </tr>
                <tr>
                    <td>内置函数</td>
                    <td><code>print()、len()、input()、max()、min()...</code></td>
                    <td><code>console.log()、Math.max()、Array.map()...</code></td>
                    <td><span>python</span>内置函数在全局可用，<code>JavaScript</code>多在<code>Math、Array</code>等原型上
                    </td>
                </tr>
            </table>
        </div>
        <div class="div_table">
            <table>
                <tr>
                    <th colspan="4"><h2>二、<span>参数系统</span></h2></th>
                </tr>
                <tr>
                    <td>对比维度</td>
                    <td><code>python</code></td>
                    <td><code>JavaScript</code></td>
                    <td>核心差异</td>
                </tr>
                <tr>
                    <td>无参函数</td>
                    <td><code>def 函数名():</code></td>
                    <td><code>function 函数名() { }</code></td>
                    <td><span>写法相似，都是空括号</span></td>
                </tr>
                <tr>
                    <td>有参函数</td>
                    <td><code>def 函数名(a,b):</code></td>
                    <td><code>function 函数名(a,b) { }</code></td>
                    <td><span>写法相似，形参在括号内</span></td>
                </tr>
                <tr>
                    <td>默认参数</td>
                    <td><code>def 函数名(a, b=10):</code></td>
                    <td><code>function 函数名(a, b=10) { }</code></td>
                    <td><span><code>ES6+</code>支持默认参数，语法几乎一样</span></td>
                </tr>
                <tr>
                    <td>默认参数求值时机</td>
                    <td><span>定义时求值(<code>def</code>执行时)</span></td>
                    <td><span>调用时求值(<span class="span">每次调用重新计算</span>)</span></td>
                    <td><span>⚠️ <code>Python</code> 默认参数是单例模式，可变对象有坑</span></td>
                </tr>
                <tr>
                    <td>关键字参数</td>
                    <td><code>✅ 函数名(a=1, b=2)</code></td>
                    <td><span>❌ 不支持（只能传对象模拟）</span></td>
                    <td><span><code>Python</code> 独有，调用时可通过参数名传值</span></td>
                </tr>
                <tr>
                    <td>位置参数</td>
                    <td><code>函数名(1,2)</code></td>
                    <td><code>函数名(1,2)</code></td>
                    <td><span>两者都支持</span></td>
                </tr>
                <tr>
                    <td>不定长参数</td>
                    <td><code>*args(<span>元组</span>)、**kwargs(<span>字典</span>)</code></td>
                    <td><span><code>arguments</code>对象(类数组)或<code>...rest(<span>ES6真数组</span>)</code></span>
                    </td>
                    <td>
                        <span><code>JavaScript</code> 的 <code>...rest</code> 更接近 <code>Python</code> 的 <code>*args</code></span>
                    </td>
                </tr>
                <tr>
                    <td>实参个数校验</td>
                    <td><span>✅ 必须与形参个数匹配（默认参数除外）</span></td>
                    <td><span>❌ 实参可少于或多于形参，少的为 undefined，多的在 arguments 中</span></td>
                    <td><span>⚠️ Python 更严格，JS 更灵活（但容易出错)</span></td>
                </tr>
                <tr>
                    <td colspan="4">
                        <h3 style="text-align: left">名词解释(<code>python</code>为主)：</h3>
                        <ul>
                            <li>默认参数：<span>定义函数时，给形参定义的默认值，后续会被调用传入的实参覆盖，若后续形参未传参，则使用默认值，<span
                                    class="span">并且一定在，非默认形参之后</span></span>

如：
                                <code style="display:block;">
                                    <br>def num(a, b=10, c=20):
                                    <br> &nbsp;&nbsp;print(a, b, c)
                                    <br>num(10, 30) # 最后的结果是：10,30,20 因为没有给c 传实参，所以是默认值20
                                </code>

<h3 id="关键字参数">关键字参数：</h3>
                                <ul>
                                    <li><span>调用函数时，直接给形参赋值。</span>

<h4>规则</h4>
                                        <ol>
                                            <li>
                                                关键字参数一定在位置参数后面，<span>否则报错，语法错误：<code>SyntaxError</code></span>

传参顺序：<span>先匹配位置参数，再匹配关键字参数(<span class="span">关键字参数顺序可以打乱，但与位置参数无关</span>)</span>

<span>所以请确保：关键字参数的关键字，不与前面已被传参的形参重复，<span>否则报错，运行错误：<code>TypeError</code></span></span>

最好解决办法：<span>要么全部采用，关键字参数，要么定义函数的同时，将关键字形参放在最后面</span>

如：
                                <code style="display:block;">
                                    <br>def num(a, b, c, d):
                                    <br> &nbsp;&nbsp;print(a, b, c, d)
                                    <br>num(10, 50, c=20, b=30) # 最后的结果是：10,30,20,50 ，# 看顺序，位置参数在前，关键字参数在后
                                </code>

位置参数：<span>调用函数时，根据传入的实参顺序，逐个按顺序给形参赋值,一一对应</span>

如：
                                <code style="display:block;">
                                    <br>def num(a, b, c, d):
                                    <br> &nbsp;&nbsp;print(a, b, c, d)
                                    <br>num(10, 50, 20, 40) # 最后结果是：10, 50, 20, 40
                                    实参与形参数量一致，且没有关键字参数干预，则实参赋值给形参顺序一一对应
                                </code>

不定长参数：<span>当形参中定义了 <code>*args</code> 或 <code>**kwargs</code> 时，多余的实参会被打包。
                                <br><span>python中<code>*tuple[<span>主要是运算符<code>*</code></span>]</code>——打包元组</span>,<code>**dict[<span>主要是运算符<code>**</code></span>]</code>——打包字典</span>
                                <br><span>JavaScript中<code>arugments</code>——类数组,<code>...Array[<span>主要是运算符<code>...</code></span>]</code>——打包真数组</span>

<h3>所以</h3>
                                <ul>
                                    <li>
                                        <span>python中，当实参个数，多余形参个数，且形参没有定义：<span
                                                class="span">不定长参数</span>，直接报错，</span>

<span><code>python</code>，零容忍，实参超过形参个数</span>

<code>JavaScript</code>则没那么多规矩，
                                        <br>&nbsp;&nbsp;<span>实参个数多余形参个数：则，多余的参数，放入对象：<code>arguments</code>
                                        </span><br>&nbsp;&nbsp;<span>实参个数少于形参个数，则，未被传参的形参，默认为<code>undefined</code></span>

收集多余关键字实参

<span>键值对与实参一致，<code>a = 10 则 键值对 ：{'a':10}</code></span>

<span>实参必须是：<code>变量 = 值</code>形式，<span
                                    class="span">最后打包，变量为键，值为字典的值</span></span>

展开字典作为关键字参数

其中：<span>键对应形参，值对应实参</span>

<span>当函数形参没有(**)，请确保，键有对应形参，否则报错</span>

因为采取的是：关键字参数，需要放在位置参数后面，规则与：<a
                                    href="#关键字参数">关键字参数一致</a>

<h2>概述</h2>
                    <p>以下为编程中常见的特殊函数类型，涵盖 <strong>Python</strong> 与 <strong>JavaScript</strong>
                        中的对应实现。</p>

<div class="div_table">
                        <table>
                            <tr>
                                <th>类型</th>
                                <th>定义</th>
                                <th>特征</th>
                                <th>作用</th>
                                <th>示例</th>
                            </tr>

                            <!-- 1. 递归函数 -->
                            <tr>
                                <td><strong>递归函数</strong></td>
                                <td>函数在其定义中<strong>调用自身</strong></td>
                                <td>
                                    <ul>
                                        <li>必须设置<strong>终止条件</strong>（基线条件）

每次调用会创建新的栈帧

Python 默认递归深度 <code>1000</code>

编码者定义，<strong>由其他函数</strong>触发执行

常用于<strong>异步</strong>或<strong>事件驱动</strong>场景

形参固定，实参由调用方注入

以函数为<strong>一等公民</strong>的语言特性

典型代表：<code>map</code>、<code>filter</code>、<code>reduce</code>

<strong>单表达式</strong>，不能写多条语句

Python: <code>lambda</code>；JS: 箭头函数 <code>() => {}</code>

通常作为<strong>临时</strong>回调或高阶函数的参数

内部函数“<strong>记住</strong>”了外部作用域的变量

Python 修改外部变量需 <code>nonlocal</code>

常用于<strong>工厂函数</strong>、<strong>装饰器</strong>

<strong>惰性求值</strong>：每次调用 <code>next()</code> 才执行

Python: <code>def func(): yield ...</code>

JS: <code>function* func() { yield ... }</code>

Python: <code>async def func(): await ...</code>

JS: <code>async function func() { await ... }</code>

返回 <strong>Promise</strong> 或 <strong>协程</strong>对象

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——介绍\代码\函数基础——介绍.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——介绍\笔记\函数基础——介绍.html

**Title:** 函数基础——介绍

函数基础——介绍

函数分类

函数的返回值 —— <code>return</code>

Python 参数进阶（基础）

形参（Parameter）与 实参（Argument）—— 区别与联系

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="函数介绍">
<main>
    <header>
        <h1>函数基础——介绍</h1>
    </header>
    <section id="section_1">
        <ul>
            <li><span>函数是组织好的，可重复使用的、用来实现特定功能的代码片段</span>

定义函数：<code>def 函数名(形参)</code>

实参个数：<span>内置函数由函数决定</span>、<span
                    class="span">自定义函数由编码者决定</span>、<code>实参个数 = 形参个数</code>

<h2>函数分类</h2>
                <ol>
                    <li>
                        <h3>内置函数</h3>
                        <ul>
                            <li><code>python</code>自带的函数

<span>提前定义好的</span>

<span>可以重复使用</span>

<span>实现特定功能</span>

比如：<code>input()、print()、max()、min()、len()、sum()、...</code>

函数调用：<code>函数名(传参)</code>

<span>参数的具体个数，传什么，由函数决定，编码者无法自行更改</span>

<h3>自定义函数</h3>
                        <ul>
                            <li><span>用户通过关键字(<code>def</code>)定义的函数</span>

<span>与内置函数不同，函数功能由编码者自定义</span>

<span>非提前定义好的</span>

<span>可以重复使用</span>

<span>实现特定功能(<span class="span">编码者自定义</span>)</span>

<h4>编码者自定义的函数有两种</h4>
                                <ol>
                                    <li>
                                        <h5>无参函数</h5>
                                        <ul>
                                            <li>定义：<code>def 函数名()</code>

特点：<span>不写形参</span>

调用方式：<code>函数名()</code>、<span>注意无参函数，不用传实参</span>

<h5>有参函数</h5>
                                        <ul>
                                            <li>定义：<code>def 函数(形参,形参...)</code>

特点：<span>需要写形参</span>，形参个数自定义

形参的作用：<span>调用时，传入参数——<span
                                                    class="span">另一个名字实参</span>，函数内部可以通过传入的实参，在内部进行操作</span>

调用方式：<code>函数名(实参,实参...)</code>、实参个数由函数决定，<code>实参个数
                                                == 形参个数（默认参数除外，默认参数可以不传）</code>

<h3>函数作用域</h3>
                        <ul>
                            <li>在<code>python</code>中，<span>函数会生成作用域</span>

作用域：<span>函数内部的代码片段、函数内部的变量，外部无法直接访问</span>

<div class="div_table">
                                    <table>
                                        <tr>
                                            <th colspan="3"><h4><span>函数内部变量与外部变量之间关系</span></h4></th>
                                        </tr>
                                        <tr>
                                            <td>操作</td>
                                            <td>是否可行</td>
                                            <td>说明</td>
                                        </tr>
                                        <tr>
                                            <td><span>函数内部读取外部变量</span></td>
                                            <td>✅ 可以</td>
                                            <td>
                                                <ul>
                                                    <li>直接使用即可

<code style="display: block">
                                                            <br>x = 20
                                                            <br>def num():
                                                            <br> &nbsp;&nbsp;print(x) # 内部未定义变量，可访问外部变量
                                                            <br>num() # 值为20
                                                        </code>

否则会创建局部变量

如：<code style="display: block">
                                                        <br>x = 10
                                                        <br>def num():
                                                        <br> &nbsp;&nbsp;# 需要先使用关键字声明
                                                        <br> &nbsp;&nbsp;global x
                                                        <br> &nbsp;&nbsp;x = 20
                                                        <br>print(x) # 结果为20
                                                    </code>

不使用关键字：<code style="display: block">
                                                        <br>x = 10
                                                        <br>def num():
                                                        <br>&nbsp;&nbsp;# 不声明关键字，就是在函数内部重新创建变量
                                                        <br>&nbsp;&nbsp;x = 20
                                                        <br>print(x) # 结果为10
                                                    </code>

<span>局部变量只在函数内部有效</span>

<code style="display: block">
                                                            <br>def num():
                                                            <br> &nbsp;&nbsp;x = 20
                                                            <br>print(x) # 如果外部没有变量x，则会直接报错
                                                        </code>

可以通过<span>return</span>关键字传回返回值<code
                                                            style="display: block">
                                                        <br>def num():
                                                        <br> &nbsp;&nbsp;x = 20
                                                        <br> &nbsp;&nbsp;return x
                                                        <br>print(num()) # 结果为 20
                                                        <br># 尽管使用<span>return</span>关键字将值传到外部，但是变量名始终外部无法访问
                                                    </code>

仅适用于嵌套函数

<code style="display: block">
                                                            <br>def num():
                                                            <br> &nbsp;&nbsp;x = 10 # 初次赋值为 10
                                                            <br> &nbsp;&nbsp;def num2():
                                                            <br> &nbsp;&nbsp; &nbsp;&nbsp;# 声明关键字 nonlocal 更改外层变量的值
                                                            <br> &nbsp;&nbsp; &nbsp;&nbsp;nonlocal x
                                                            <br> &nbsp;&nbsp; &nbsp;&nbsp;x = 20 # 重新赋值为20
                                                            <br> &nbsp;&nbsp;return x # return 关键字：传函数返回值
                                                            <br>print(num()) # 最后的结果是 20
                                                        </code>

不使用关键字<code style="display: block">
                                                        <br>def num():
                                                        <br> &nbsp;&nbsp;x = 10 # 初次赋值为 10
                                                        <br> &nbsp;&nbsp;def num2():
                                                        <br> &nbsp;&nbsp; &nbsp;&nbsp;# 不声明关键字 nonlocal
                                                        <br> &nbsp;&nbsp; &nbsp;&nbsp;x = 20 # 重新定义变量，赋值为20
                                                        <br> &nbsp;&nbsp; &nbsp;&nbsp;return x
                                                        <br> &nbsp;&nbsp;return x # return 关键字：传函数返回值
                                                        <br>print(num()) # 最后的结果是 10 num2()在 num()内部，无法直接访问
                                                    </code>

<span><code>return</code> 用于将函数内部的计算结果“传回”到函数外部</span>

<h3>Python 与 JavaScript 返回值对比</h3>
                <div class="div_table">
                    <table>
                        <tr>
                            <th>特性</th>
                            <th>Python</th>
                            <th>JavaScript</th>
                        </tr>
                        <tr>
                            <td><span>无 <code>return</code></span></td>
                            <td>默认返回 <code>None</code></td>
                            <td>默认返回 <code>undefined</code></td>
                        </tr>
                        <tr>
                            <td><span>返回单个值</span></td>
                            <td><code>return 10</code></td>
                            <td><code>return 10</code></td>
                        </tr>
                        <tr>
                            <td><span>返回多个值</span></td>
                            <td>自动打包成 <strong>元组</strong><br><code>return a, b</code> → <code>(a, b)</code></td>
                            <td>需要手动包成 <strong>对象/数组</strong><br><code>return {a, b}</code> 或 <code>return
                                [a, b]</code></td>
                        </tr>
                        <tr>
                            <td><span><code>return</code> 执行后</span></td>
                            <td colspan="2"><span>函数立即终止，后续代码不再执行</span></td>
                        </tr>
                    </table>
                </div>
                <ul>
                    <li>Python 示例：<code style="display: block">
                        <br>def calc(a, b):
                        <br>&nbsp;&nbsp;return a + b, a - b  # 返回 (和, 差)
                        <br>result = calc(10, 5)
                        <br>print(result) # (15, 5)
                        <br>print(result[0]) # 15
                    </code>

JS 类比：<code style="display: block">
                        <br>function calc(a, b) {
                        <br> &nbsp;&nbsp;return [a + b, a - b]; // 返回数组
                        <br>}
                        <br>const result = calc(10, 5);
                        <br>console.log(result); // [15, 5]
                    </code>

<h3>默认参数</h3>
                <ul>
                    <li>定义时给形参赋默认值，调用时若未传实参，则使用默认值

<code>def greet(name="游客"): print(f"你好，{name}")</code>

调用：<code>greet()</code> → 你好，游客 &nbsp;&nbsp;|&nbsp;&nbsp; <code>greet("小明")</code> →
                        你好，小明

<span>⚠️ 默认参数必须放在普通形参的 <strong>后面</strong></span>，如 <code>def func(a,
                        b=10)</code> ✅ &nbsp;&nbsp; <code>def func(a=10, b)</code> ❌

JS 类比：<code>function greet(name = "游客") { ... }</code>，语法几乎一样

<h3>位置实参 vs 关键字实参（调用时）</h3>
                <ul>
                    <li><span>位置实参</span>：按形参定义的顺序一一对应传值，如 <code>add(3, 5)</code>

<span>关键字实参</span>：指名道姓传值，顺序可打乱，如 <code>add(b=5, a=3)</code>

<span>⚠️ 混用时，位置实参必须 <strong>在前</strong>，关键字实参在后</span>，如 <code>add(3,
                        b=5)</code> ✅ &nbsp;&nbsp; <code>add(a=3, 5)</code> ❌

JS 中没有关键字实参，只能传对象模拟：<code>add({ a: 3, b: 5 })</code>

<span>返回值：</span>Python 用 <code>return</code>，无则返 <code>None</code>；多个值自动打包元组

<span>默认参数：</span>定义时赋值，必须放在普通形参后面

<span>传参方式：</span>位置实参按顺序，关键字实参按名字，混用时位置在前

<span>与 JS 最大不同：</span>Python 支持关键字实参，且多返回值自动打包

<span>💡 <strong>记忆口诀</strong>：</span>
                    <strong>“形参是空位，实参是值；定义时摆空位，调用时填值”</strong>

<span>⚠️ <strong>与 JavaScript 的差异</strong>：</span>
                    JS 函数调用时，<strong>实参个数可以少于形参</strong>（未传的形参自动为 <code>undefined</code>）；<br>
                    Python <strong>必须实参个数 = 形参个数</strong>（除非使用了默认参数），否则会报 <code>TypeError</code>。

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数定义\代码\函数基础——函数定义.py

# 定义无参函数
def num():
    print(f"我是无参函数")


num()  # 无参函数，调用的时候，无需传参


# 定义有参函数
def num(a, b, c):
    print(a, b, c)
    print(a + b + c)
    print(f"我是有参函数")


num(10, 30, 5)  # 有参函数需要传参，当没有默认参数和无定长参数都不存在的时候，实参个数 严格等于 形参个数


# 默认参数 ： 定义函数时，规定，形参默认值，当定义默认参数的形参未被传参，取默认值，否则覆盖默认值
def num(a, b, c=30):  # 注意，默认参数必须在不同参数之后
    print("a, b, c默认值为 30")
    print(f"传参后：{a, b, c}")


num(10, 20)  # 当传入的参数小于形参个数，且有默认参数的存在，未被传参的形参，值为默认值，同样采取位置参数规则


# 关键字参数：调用函数时：当传入的参数的同时给形参赋值。 关键字参数放在位置参数后面，且关键字不能与位置参数匹配的形参重复
def num(a, c, d=30):
    print(f"a, b, d默认值为 30")
    print(f"传参后：{a, c, d}")


num("a", c=20)  # 关键字参数就是，调用时，直接赋值，但是请注意：因为会无视顺序，最好传参的时候写在最后面


# 位置参数：一般情况下，不管是普通参数、默认值参数、无定长参数的调用都存在。
# 说白了就是：传入的实参与形参位置一一对应，除了关键字参数，会打乱顺序，但是写在最后面，可以避免带来的副作用
def num(a, b, c):
    print(f"位置参数：{a, b, c}")


num(10, 20, 50)  # 位置一致：a = 10, b = 20, c = 50。非默认参数与无定长参数下，传入的实参个数 严格等于 形参个数


# 无定长参数：通过扩展运算符，接收超过形参的所有实参，进行打包，* ———— 打包成元组 ** ———— 打包成字典
def num(a, c, *number):
    print("a, b, *number为无定长参数")
    print(f"普通参数被出传参：{a, c}")
    print(f"无定长参数被传参：{number}")
    print(f"通过f-string输出后，会重新组包成元组，{a, c, number}")  # 因为 f-string 英文逗号，会隐式打包成元组


num(10,  *[70, 50, 100, "我超出实际形参了个数了"])


def num(a, b, c, **keys):
    print(a, b, c)
    print(keys)


num(**{'a': 10, 'b': 50, '无定长参数': '**', '将多余键值对': '打包成字典'}, c = 50)


# 总结：
# 位置参数：一一对应、优先级最高
# 关键参数：调用函数，通过形参关键字直接赋值，再位置参数后面，确保关键字有对应的形参，或存在无定长参数(**)。
# 默认参数：定义函数时，给形参赋值的默认值，可被后来传参覆盖。需要放在普通形参后面，否则报错。
"""
    无定长参数：
        * : 多余的单个元素实参，打包成元组。
       ** : 多余的键值对或key = value形式，打包成字典。
"""

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数定义\笔记\函数基础——函数定义.html

**Title:** 函数基础——函数定义

函数基础——函数定义

定义函数与调用函数

课堂小结——函数使用的注意事项

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="函数定义">
<main>
    <header>
        <h1>函数基础——函数定义</h1>
    </header>
    <section id="section_1">
        <ul>
            <li><h2>定义函数与调用函数</h2>

<h3>定义函数(<span>有参函数</span>)</h3>
                <code>
                    <br>def 函数名(参数列表):
                    <br> &nbsp;&nbsp;函数体
                    <br> &nbsp;&nbsp;......
                    <br> &nbsp;&nbsp;return 返回值
                    <br>
                    <br># 调用函数
                    <br>函数名(参数)
                </code>

<h3>定义函数(<span>无参函数</span>)</h3>
                <code>
                    <br>def 函数名():
                    <br> &nbsp;&nbsp;函数体
                    <br> &nbsp;&nbsp;......
                    <br>
                    <br># 调用函数
                    <br>函数名()
                </code>

<h3><code>return</code>关键字</h3>
                <ol>
                    <li>作用：<span>退出函数，并返回结果，唯一途径</span>

特征：<span>return后面代码，均不会被执行</span>

语法：<code>return 返回值</code>

返回值：<span>可以是一个单独的数字、也可以是变量、也可以是容器</span>

<span>同样也可以，多个变量、容器同时返回，用英文逗号隔开，<span
                            class="span">会组包成元组，后续需要(<span>遍历、下标、切片、解包</span>)按需处理....</span></span>

<span>若没有关键字(<code>return</code>)或只写(return)</span>，函数默认返回值是<code>None</code>

<span class="span">因为退出函数这个特性，当函数内部出现多层循环，因为关键字<code>break、continue</code>
                            都是只对最近一个循环分支起效，所以想要退出怎个循环，非常麻烦，<span>但是使用 <code>return</code>，
                            直接退出函数，会强制退出整个循环，不管嵌套的有多深</span>
                        </span>

<span>💡 <strong>补充说明</strong>：</span>
                        <code>return</code> 的本职是<span class="span">“退出函数并返回结果”</span>，<br>
                        利用它跳出多层循环只是“副作用”。如果函数内还有其他代码需要执行，用 <code>return</code> 就不合适了。

<span>一个函数，在未使用条件分支语句(<code>if、match-case</code>)，
                        只能出现一次<code>return</code>，因为<code>return</code>后续所有代码，均不会被执行</span>

<h3>注意</h3>
                <ol>
                    <li><span>函数定义时的参数列表与返回值语句是<span class="span">可有可无的(由需求确定)</span>、函数必须先定义后调用执行(<span
                            class="span">函数定义时，内部代码未执行，在调用时才执行</span>)</span>

<span>🔍 Python 是“运行时解析”语言：函数定义语句被执行后，函数名才会被创建。
                            因此必须 <strong>先定义，后调用</strong>，否则报 <code>NameError</code></span>

<span>先定义，后调用是<code>python</code>的规则、<span class="span">JavaScript
                        </span>的声明式函数，可以先调用，后定义(<span>专业术语叫：声明提升</span>)</span>

<span>函数必须先定义，在调用</span>

<span>函数定义，并不会执行，只有在调用函数时，函数体的逻辑才会运行</span>

<span>函数中通过缩进来描述归属关系</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数嵌套调用\代码\函数基础——函数嵌套调用.py

import math


#  不适用嵌套：

def judge_number(*num):
    """
    判断实参是否均为数字
    :param num: 无定长参数，接收传入实参
    :return: 如果均为数字，返回无定长参数，否则None
    """
    try:
        return tuple(float(n) for n in num)
    except ValueError:
        return None


def input_number():
    """
    接收用户输入的实参
    :return: 返回用户输入的实参
    """
    a, b, c, y = input("请输入二次项系数(数字)，a="), input("请输入一次项系数(数字)，b="), input(
        "请输出常数项(数字)，c="), input(
        "请输出函数值(数字)，y=")
    return a, b, c, y


def judge_prove(a, b, c):
    """
    判断函数类别：二次函数(是否有解)、一次函数

    动态码：

        一次函数(a = 0) : 0, None

        二次函数误解(Δ < 0): 3, None

        二次函数一个解(Δ = 0): 1, Δ ** 0.5

        二次函数两个解(Δ > 0): 2, Δ **0.5
    :param a: 二次项系数
    :param b: 一次项系数
    :param c: 常数项
    :return: 返回动态码
    """
    if a == 0:
        return 0, None
    drt = b ** 2 - 4 * a * c
    if drt < 0:
        return 3, None
    sqrt_drt = math.sqrt(drt)
    if drt == 0:
        return 1, sqrt_drt
    else:
        return 2, sqrt_drt


def quadratic_formula():
    """
    求二次函数解：

    通过函数：judge_number、input_number实现用户输入以及判断，judge_prove判断函数是什么函数、是否有解

    最后该函数统一计算结果，以及输出结果

    :return: 返回值为None，所有结果均在函数内部输出
    """
    result = judge_number(*input_number())  # 获取用户输入的值，并判断是都为数字
    if result:
        a, b, c, y = result
        result2, drt = judge_prove(a, b, c)
        if result2 == 0:
            if b == 0:
                if y == c:
                    print("恒等式，有无数个解")
                else:
                    print("无解或有无数个解")
            else:
                x = round((y - c) / b, 2)
                print(f"该一次函数的解是：{x}")
        elif result2 == 3:
            print(f"该二次函数，无实数解")
        elif result2 == 1:
            x = round(-b / (2 * a))
            print(f"该二次函数，有一个实数解：{x}")
        else:
            x1 = round((-b + drt) / (2 * a),2)
            x2 = round((-b - drt) / (2 * a),2)
            print(f"该二次函数有两个实数解：x1={x1}, x2={x2}")
    else:
        print(f"包含非数字")


quadratic_formula()

a  = 10
b = 10
print(a == b)

a = [10, 50, 30]
b = [10, 50, 30]

print(a == b)

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数嵌套调用\代码\IDLE第一次敲代码.py

def judge_number(*num):
    try:
        return tuple(float(num) for num in num)
    except ValueError: return None

def input_number():
    a, b, c, y = input("请输入二次项系数，a="), input("请输入一次项系数, b="), input("请输出常数项, c="), input("请输入值, y=")
    return a, b, c, y
    
def judge_prove(a, b, c, y):
    if a == 0:
        return 0,None
    drt = b ** 2 - 4 * a * (c-y)
    if drt < 0:
        return 3,None
    import math
    sqrt_drt = math.sqrt(drt)
    if drt == 0:
        return 1,sqrt_drt
    else:
        return 2,sqrt_drt

def qurdratic_formula():
    reslut = judge_number(*input_number())
    if reslut:
        a, b, c, y = reslut
        reslut2,sqrt_drt = judge_prove(a,b,c,y)
        if reslut2 == 0:
            if b == 0 and c == y:
                print("恒等式，有无数个解")
            elif b != 0:
                x = round((y-c)/b,2)
                print(f"该一次函数的解是：{x}")
            else:
                print("无解，或有无数个解")
        elif reslut2 == 3:
            print("该函数无实数解")
        elif reslut2 == 1:
            x = round(-b/(2*a) ,2)
            print(f"函数只有一个解：x={x}")
        else:
            x1 = round((-b + sqrt_drt)/(2*a) ,2)
            x2 = round((-b - sqrt_drt)/(2*a) ,2)
            print(f"函数有两个解，x1={x1}, x2={x2}")
    else:
        print("所有参数均为数字")
qurdratic_formula()


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数嵌套调用\笔记\函数基础——函数嵌套调用.html

**Title:** 函数嵌套调用

函数嵌套调用

<code>JavaScript</code>与<code>python</code>：栈(<code>Stack</code>)与堆<code>Heep</code>完全对比表

因为<code>JavaScript</code>与<code>python</code>的栈与堆有区别，引出值比较与地址比较区别

例如

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>函数嵌套调用</h1>
    </header>
    <section id="section_1">
        <ul id="函数嵌套调用">
            <li>顾名思义：<span>嵌套调用指的是在一个函数中，又调用了另外一个函数</span>

<span>函数调用遵循栈结构，最后被调用的函数最先返回LTFO(<span
                    class="span"><code>Last In First Out</code>，后进先出</span>)</span>

<div class="div_table" id="python栈与JavaScript栈对比">
                    <table>
                        <tr>
                            <th colspan="3"><h2>
                                <code>JavaScript</code>与<code>python</code>：栈(<code>Stack</code>)与堆<code>Heep</code>完全对比表
                            </h2></th>
                        </tr>
                        <tr>
                            <td>对比维度</td>
                            <td><code>JavaScript</code></td>
                            <td><code>python</code></td>
                        </tr>
                        <tr>
                            <td>栈(<code>Stack</code>)长什么样？</td>
                            <td>
                                <ul>
                                    <li>一块紧凑的<span>内存区域</span>

用于存放<span>基本类型(<code>number、string、Boolean、undefined</code>)</span>

和 <span>对象引用地址(<span class="span">指针</span>)</span>

一块紧凑的<span>内存区域</span>

用于存放<span>所有变量的引用(<span
                                            class="span">因为python中一切皆对象</span>)</span>

<span>栈里村的都是指向<span>堆</span>中对象的"指针"</span>

一块<span>松散的大内存</span>

用于存放
                                        <span>复杂数据类型(<code>对象{}、数组[]、函数function</code>)的实际数据</span>

一块<span>松散</span>的大内存

用于存放
                                        <span>所有对象</span>的实际数据(<code>数字int、字符串str、列表[]、字典{}、实例等</code>)

基本数据类型：<span>变量直接存储值(<span class="span">值在栈里</span>)</span>

引用类型：<span>变量存储地址(<span>栈里存地址</span>)，通过地址在堆里去找真正的数据</span>

所有类型：<span>变量存的是"对象的引用"(<span class="span">地址在栈里</span>)，数据本体全在堆里</span>

✅ 有

<code>number、string、boolean、undefined、null、Symbol</code>等基本数据类型，是值类型(<span>存栈</span>)

<code>数组、字典、集合</code>等复杂数据类型(<span>也叫，引用类型</span>)，<span>存堆</span>

❌ 没有这个分类

<span>Python 统一视为“对象”</span>

<span>只是不可变对象（<code>int、str、tuple</code>）</span>

<span>可变对象（<code>list、dict、set</code>）</span>

<span>在修改时的行为表现不同。</span>

<img src="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/函数/函数基础/函数基础——函数嵌套调用/笔记/image/python栈的定义.png"
                     alt="python栈的定义"
                     title="python栈的定义">

<h2>因为<code>JavaScript</code>与<code>python</code>的栈与堆有区别，引出值比较与地址比较区别</h2>
                <div class="div_table">
                    <table>
                        <tr>
                            <th colspan="5"><h3>JavaScript与python，<span>值对比与地址对比区别</span></h3></th>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <span>JavaScript的基本数据类型，不会创建地址，都存在栈中、复杂数据类型(数组、对象...)会创建地址</span>
                            </td>
                            <td colspan="2"><span>python</span>所有数据，均被创建地址，每个数据都会有一个地址</td>
                        </tr>
                        <tr>
                            <td>比较场景</td>
                            <td><code>JavaScript</code>代码</td>
                            <td>结果</td>
                            <td><code>python</code>代码</td>
                            <td>结果</td>
                        </tr>
                        <tr>
                            <td>基本类型比较</td>
                            <td>
                                <ul>
                                    <li><code>1 == '1'</code>

<code>1 === '1'</code>

<code>true</code>，字符串: <code>'1'</code>隐式转换为数字1

<code>false(<span>类型不同</span>)</code>

<code>{a:1} == {a:1}</code>

<code>{a:1} === {a:1}</code>

<code style="display:block;">
                                            <br>object1 = {a:1}
                                            <br>object2 = {a:1}
                                            <br>object1 === object2 或 object1 == object2
                                        </code>

<code style="display:block;">
                                        <br>object1 = {a:10}
                                        <br>object2 = object1
                                        <br>object1 === object2 或 object1 == object2
                                    </code>

false：<span>因为，<code>object1</code>与<code>object2</code>不同地址，所以其中一个变化，另一个并不会改变</span>

true：<span>因为 <code>object2</code>拿到的是<code>object1</code>的地址，<br>指向同一地址，便是指向同一数据，其中一个更改，另一个也会更改</span>

<code>
                                            obj1 = {'a':1}
                                            obj2 = {'a':1}
                                            obj1 is obj2
                                        </code>

<code>
                                            obj1 = {'a':1}
                                            obj1 = obj2
                                            obj1 is obj2
                                        </code>

False：<span>与JavaScript一致，两个不同对象，一方更改，另一方不会改变</span>

True：<span>与JavaScript一致，<code>obj2</code>拿的是<code>obj1</code>的地址，一方更改，另一方同样更改</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数的参数与返回值\代码\函数基础——函数的参数与返回值.py

# 计算圆的面积
import math


def circle_area(radius):
    try:
        radius = float(radius)
        area = math.pi * radius ** 2
        return area
    except ValueError:
        return False

radius_input = input(f"请输出圆的半径，radius=")
result = circle_area(radius_input)
if result:
    print(f"半径为{radius_input}，的圆形面积是：{result:.2f}cm²") # 字符串不能 :.f
else:
    print("半径应为数字")



# 计算长方形面积

def rectangle_area(width, length):
    try:
        width = float(width)
        length = float(length)
        return width * length
    except ValueError:
        return False


width_input, length_input = input("请输入宽度，width="), input("请输入长度，height=")
result = rectangle_area(width_input, length_input)
if result:
    print(f"长为{length_input}，宽为{width_input}，长发形面积是：{result:.2f}cm²")
else:
    print("长或宽，应为数字")

# 计算圆的面积、周长
def circle_area_perimeter(radius):
    try:
        radius = float(radius)
        area = math.pi * radius ** 2
        perimeter = 2 * math.pi * radius
        return area , round(perimeter,2) # round(值，小数位数)函数：四舍五入
    except ValueError:
        return None

radius_input = input(f"请输出园的半径，radius=")
result = circle_area_perimeter(radius_input)
if result:
    print(f"半径为：{radius_input}，圆的周长为：{result[1]}cm，面积为：{result[0]:.2f}cm²")
else:
    print(f"半径应为数字")

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数的参数与返回值\笔记\函数基础——函数的参数与返回值.html

**Title:** 函数基础——函数的参数与返回值

函数基础——函数的参数与返回值

函数的参数种类

课堂注意事项

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="函数的参数与返回值">
<main>
    <header>
        <h1>函数基础——函数的参数与返回值</h1>
    </header>
    <section id="section_1">
        <h2>函数的参数种类</h2>
        <ul>
            <li>
                <h3><span>位置参数</span></h3>
                <ol>
                    <li><span>函数的传递参数是有顺序的，<span class="span">位置参数</span>优先级最高</span>

在定义函数的时候：<code>def num(a, b, c, d)</code><span>其中，<code>a, b, c, d</code>这个整体就是位置参数<span
                            class="span">传入实参的顺序，严格按照定义顺序</span></span>

在调用函数的时候：<code>num(10, 50, 100,
                        "hello")</code>，<span>其中，<code>10, 50, 100, "hello"</code>这个整体就是位置参数 <span
                            class="span">传入实参的顺序，严格遵守定义形参的顺序</span></span>

<h3><span>默认参数</span></h3>
                <ol>
                    <li>顾名思义：<span>定义函数的时候，形参的默认值</span>

<code>def num(a, b, c=10):</code><span>其中，<code>c的默认值是10</code>,
                        <code>c = 10</code>这个整体就是一个默认参数——形参</span>

特点：<span>只在定义函数有此概念，且永远在<span class="span">位置参数后面</span>，后续会被传入的实参覆盖，未被传入实参，则取默认值</span>

<span>因为有默认参数兜底，只要<code>实际传参数量 <= 形参数量</code>，就不会报错</span>

一但：<code>实际传参数量 > 形参数量</code>，照样报错

<h3><span id="关键字参数">关键字参数</span></h3>
                <ol>
                    <li>在调用函数的时候有此概念，<span>直接指定关键字(形参)，然后为其赋值</span>

<span>位置参数优先级最高，会先匹配<span>位置参数</span>，然后匹配<span>关键字参数</span></span>

<code>python</code>规则：<span>已经被传参的形参，不能再次被传参，<span
                            class="span">所以关键字避免与被传参的形参一致</span></span>

<span>关键字参数始终在<span
                            class="span">位置参数后面，且顺序可以打乱(<span>只是关键字参数可以打乱，前面的位置参数不能</span>)</span></span>

关键字参数的形式：<span>键值对、<code>key = value</code>表达式，除此之外均是位置参数</span>

<code style="display:block;">
                            <br>def num(a, b, c, d):
                            <br>&nbsp;&nbsp;return
                            <br>num(10, 50, d=30, c=10) <br># 先匹配位置参数 a = 10 , b =50, 然后匹配关键字参数，c = 10 ,
                            d = 30
                            <br><br>错误示范1：num(10, d=30, 30, c=10) <br># <span>位置参数必须在关键参数之前</span>，10，30为位置参数，键值对或key
                            = value形式为关键字参数，报错：语法错误：<code>SyntaxError</code>
                            <br><br>错误示范2：num(10, 30, b=50, c=10) <br># 先位置参数赋值，a = 10, b=30, 然后关键字参数，
                            请注意：<span>b已经被传入过实参，后面的 <code>b = 50</code>，重新赋值，python不支持，报错：运行错误：<code>TypeError</code><code></code></span>
                        </code>

提醒：<span>最好全部使用关键字参数，<span
                            class="span">或定义函数时，将需要传关键字参数的形参放在后面</span>,能有效避免，重复传参而报错</span>

<h3><span>无定长参数</span></h3>
                <ol>
                    <li><span>在定义函数的时，收集多余实参组包成容器的形参</span>

<h4><span class="span">无参函数(<code>*</code>)</span></h4>
                        <ul>
                            <li><span>多余<span class="span">位置参数</span> ，打包成元组</span>

写在形参内部：<code>*字面量</code>

<code style="display:block;">
                                    <br>def num(a, b, c, *tuples):
                                    <br>&nbsp;&nbsp;return
                                    <br>num(10, 50, 100, 30, *[30, 40, 50], *(60, 70, 80), *{60, 70, 80}, *"hello")
                                    <br># <span>原本定义的形参是：<code>a, b, c</code>共三个，但是传参明显超过三个</span>
                                    <br>按照python规则：<code>在实际传参数量 > 形参数量</code>，直接报错
                                    <br><span>🍊🍊🍊🍊因为有：无定长参数：<code>*tuples</code>的存在，多余的非关键字参数，会被收集，打包成元组，赋值给tuple这个字面量</span>
                                    <br><span>🍊🍊🍊🍊不难看出，<code>*</code>在当前案例有两个作用，<span class="span">在形参中作用：组包成元组</span>，在调用函数中作用：解包，展开容器</span>
                                </code>

<h5>以上案例，具体的执行流程</h5>
                                <ol>
                                    <li>先解包，每个容器元素单独领出来：<code>num(10, 50, 100, 30, 30, 40, 50, 60, 70, 80,
                                        60, 70, 80, "h", "e", "l", "l", "o")</code>

然后先赋值位置参数：<code>a = 10 , b = 50, c = 100</code>

多余的其他位置参数，会被重新打包成元组，赋值给字面量：<code>tuples = (30, 30, 40,
                                        50, 60, 70, 80,
                                        60, 70, 80, "h", "e", "l", "l", "o")</code>

<span>说白了：就是将多余的，非<span class="span">键值对、key = value</span>表达式，重新打包成元组，并赋值给字面量</span>

<h5>注意事项</h5>
                                <ol>
                                    <li><span>一个函数只能出现，一次，<code>*</code></span>

<span>位置不固定，但是在，<code>*</code>后面的参数，全部会被转化为：<span
                                            class="span">强制关键字参数</span></span>

强制关键字参数：<span>被转化为强制关键字参数，意味着，该形参只能接收关键字参数，不能接收位置参数</span>

<span>正常使用<code>*</code>，为多余的位置参数兜底</span>：<code>def num(a, b,
                                        *tuples):</code>

<span>使用位置参数 + 关键字参数组合：<code>def num(a, *tuple, b, c):</code>
                                        <br>&nbsp;&nbsp;b, c 都被强制关键字参数，只能接收关键字参数,所以对应的传参是：<code>num(10, *(50, 100, 30, 40), {'b':50}, c=40)</code><span>注意：关键字不能与已传参形参相同</span></span>

<span>多余<span class="span">关键字参数</span> ，打包成字典</span>

写在形参内部：<code>**字面量</code>

<a href="#关键字参数">关键字参数</a>：<code>key =
                                value</code>表达式中，<span><code>key</code> 对应 字典的键,<code>value</code>对应字典的值</span>

写法：<code>def num(a, b, *dicts):</code>

<h5>注意事项</h5>
                                <ol>
                                    <li><span>一个函数只能出现一次，且只能在最后一个形参</span>

<span>只会打包关键字参数：<code>键值对，key = value</code>表达式</span>

<div class="div_table">
                            <table>
                                <tr>
                                    <th colspan="3"><h4>关于无定长参数，合法与不合法</h4></th>
                                </tr>
                                <tr>
                                    <td>定义方式</td>
                                    <td>是否合法</td>
                                    <td>说明</td>
                                </tr>
                                <tr>
                                    <td><code>def f(a, *b):</code></td>
                                    <td>✅ 合法</td>
                                    <td>只有一个</td>
                                </tr>
                                <tr>
                                    <td><code>def f(a, **b):</code></td>
                                    <td>✅ 合法</td>
                                    <td>只有一个</td>
                                </tr>
                                <tr>
                                    <td><code>def f(a, *b, **c):</code></td>
                                    <td>✅ 合法</td>
                                    <td>经典组合，顺序正确</td>
                                </tr>
                                <tr>
                                    <td><code>def f(a, *, b, **c):</code></td>
                                    <td>✅ 合法</td>
                                    <td>带有强制关键字分隔符</td>
                                </tr>
                                <tr>
                                    <td><code>def f(a, *b, *c):</code></td>
                                    <td>❌ 报错</td>
                                    <td>两个 * 冲突</td>
                                </tr>
                                <tr>
                                    <td><code>def f(a, **b, *c):</code></td>
                                    <td>❌ 报错</td>
                                    <td>顺序反了</td>
                                </tr>
                            </table>
                        </div>

最后补充参数优先级规则：<code>位置参数 > 默认参数 > * > 强制关键字 > **</code>

<a href="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/函数/函数基础/函数基础——函数定义/笔记/函数基础——函数定义.html/#return关键字"
                   style="font-size: 3.2rem"
                   onclick="loadContent(this,'container-函数参数与返回值','#return关键字');return false">关键字return</a>

<span>函数定义时，如果有多个参数，多个参数之间使用英文逗号(<code>,</code>)分隔</span>

<span><code>return</code>语句只有返回功能，没有输出打印的功能，如果要输出，需要结合<code>print()</code>函数来实现。</span>

形参（形式参数）：<span>函数定义时括号里的参数，只能在函数内使用(<span class="span">局部变量</span>)</span>

实参（实际参数）：<span>函数调用时括号内的参数，通常给形参赋值</span>

<span>实参与形参顺序一一对应，位置参数</span>

<span>多个返回值，用英文逗号，结果会组包成元组。<</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数说明文档\代码\函数基础——函数说明文档.py

# 计算圆的面积
import math


def circle_area(radius):
    """
    function : 该函数，用于求圆的面积：area = math.pi * radius ** 2

    judge ：使用了异常处理语句，判断传入的参数是否数字

    :param radius: 圆的半径
    :return: 当参数为数字，则返回计算后的面积，否则返回None
    """
    try:
        radius = float(radius)
        area = math.pi * radius ** 2
        return area
    except ValueError:
        return False


radius_input = input(f"请输出圆的半径，radius=")
result = circle_area(radius_input)
if result:
    print(f"半径为{radius_input}，的圆形面积是：{result:.2f}cm²")  # 字符串不能 :.f
else:
    print("半径应为数字")


# 计算长方形面积

def rectangle_area(width, length):
    """
    该函数用于计算矩形的面积：area = width * length
    :param width: 矩形的宽
    :param length: 矩形的长
    :return: 当所有参数均为数字，返回值为面积计算后结果，否则返回值是None
    """
    try:
        width = float(width)
        length = float(length)
        return width * length
    except ValueError:
        return False


width_input, length_input = input("请输入宽度，width="), input("请输入长度，height=")
result = rectangle_area(width_input, length_input)
if result:
    print(f"长为{length_input}，宽为{width_input}，长发形面积是：{result:.2f}cm²")
else:
    print("长或宽，应为数字")


# 计算圆的面积、周长
def circle_area_perimeter(radius):
    """
    该函数计算圆(circle)的面积(area)，周长(perimeter)
    :param radius: 圆的半径
    :return: 实参为数字，同时返回面积与周长，组包成元组，否则返回None
    """
    try:
        radius = float(radius)
        area = math.pi * radius ** 2
        perimeter = 2 * math.pi * radius
        return area, round(perimeter, 2)  # round(值，小数位数)函数：四舍五入
    except ValueError:
        return None

help(circle_area_perimeter)
radius_input = input(f"请输出园的半径，radius=")
result = circle_area_perimeter(radius_input)
if result:
    print(f"半径为：{radius_input}，圆的周长为：{result[1]}cm，面积为：{result[0]:.2f}cm²")
else:
    print(f"半径应为数字")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——函数说明文档\笔记\函数基础——函数说明文档.html

**Title:** 函数基础——函数说明文档

函数基础——函数说明文档

查看函数说明文档：

例如

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="函数说明文档">
<main>
    <header>
        <h1>函数基础——函数说明文档</h1>
    </header>
    <section id="section_1">
        <ul>
            <li><span>函数的说明文档(<code>Docstring</code>)是写在函数开头，用三个引号包裹的字符串，
                用户解释函数的功能、参数、返回值等信息，方便调用者清楚函数的具体作用及细节</span>

<span>主要用于，解释函数功能、参数、返回值</span>

<h2>查看函数说明文档：</h2>
                <ul>
                    <li><span>使用<code>help</code>函数：<code>help(函数名)</code></span>

<span>鼠标悬浮在函数上，自动展示(<span class="span">推荐</span>)</span>

注意：<span>好的文档，能让你的代码更容易理解、使用和维护！！</span>

<h2>例如</h2>
                <code style="display:block;">
                    <br>def judge_number(num):
                    <br>"""
                    <br> &nbsp;&nbsp;该函数用于判断，数据类型是否为数字
                    <br> &nbsp;&nbsp;:num:为需要判断的数据
                    <br> &nbsp;&nbsp;:return:是数字，返回原数据，不是则返回None
                    <br>"""
                    <br> &nbsp;&nbsp;try:
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;num = float(num)
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;return num
                    <br> &nbsp;&nbsp;expect ValueError:
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;return None
                    <br>num = 20
                    <br>fault = judge_number(num)
                    <br>if fault：
                    <br> &nbsp;&nbsp;print(f"{num}是数字")
                    <br>else:
                    <br> &nbsp;&nbsp;print(f"{num}不是数字")
                </code>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——案例\函数基础——案例-第二次写.py

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


# 注意缩进，下面的代码不在函数内部
bed_input, height_input = input("请输入三角形的底(不能为零，负数取绝对值)：bed="), input(
    "请输入三角形的高(不能为零，负数取绝对值)：height=")

result = triangle(bed_input, height_input)

if result is None:
    print("包含非法数字，或数字为零")
else:
    print(f"三角形：高:{height_input}cm，底:{bed_input}cm，面积为：{result}cm²")


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


word_input = input("请输入一串单词：word=")
print(f"单词：{word_input}\n 元音字母有：{vowels(word_input)}个")


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


students()


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——案例\函数基础——案例.html

**Title:** 函数基础——案例

函数基础——案例

整个案例，运用到的知识

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>函数基础——案例</h1>
    </header>
    <section id="section_1">
        <h2>整个案例，运用到的知识</h2>
        <div class="div_table">
            <table>
                <tr>
                    <th colspan="4"><h3><span>案例知识体系全景表</span></h3></th>
                </tr>
                <tr>
                    <td>知识点分类</td>
                    <td>具体内容</td>
                    <td>新/老状态</td>
                    <td>在案例中的具体应用</td>
                </tr>
                <tr>
                    <td><h4><span>异常处理</span></h4></td>
                    <td><code>try... except ValueError[<span>捕获非数字输入</span>]</code></td>
                    <td>老知识(<span>强化：<code>raise</code>使用</span>)</td>
                    <td>三角形面积计算：<span class="span">拦截用户输入的非数字和零值</span></td>
                </tr>
                <tr>
                    <td><h4><span>条件判断</span></h4></td>
                    <td><code>if/elif/else</code>分支逻辑</td>
                    <td>老知识</td>
                    <td>成绩合法性校验(<span class="span">0~100范围</span>)</td>
                </tr>
                <tr>
                    <td><h4><span>逻辑运算符</span></h4></td>
                    <td><code>all()/any()</code>的区别与使用场景</td>
                    <td>老知识(<span>提升</span>)</td>
                    <td><span
                            class="span">用<code>any()</code>检查成绩是否越界，避免误用<code>all()</code>导致校验</span>
                    </td>
                </tr>
                <tr>
                    <td><h4><span>循环结构</span></h4></td>
                    <td><code>for</code>循环遍历列表、字典、字符串</td>
                    <td>老知识</td>
                    <td>遍历学科列表、遍历学生字典、遍历成绩列表</td>
                </tr>
                <tr>
                    <td><h4><span>字符串操作</span></h4></td>
                    <td><code>in</code>成员判断</td>
                    <td>老知识</td>
                    <td>元音字母统计</td>
                </tr>
                <tr>
                    <td><h4><span>列表推导式</span></h4></td>
                    <td><code>[float(s) for s in score]</code></td>
                    <td>老知识(<span>提升</span>)</td>
                    <td><span>将输入成绩字符串转为浮点数列表，用于后续校验和存储</span></td>
                </tr>
                <tr>
                    <td><h4><span>字典推导式</span></h4></td>
                    <td><code>{sub:[] for sub in subjects}</code></td>
                    <td><span>新知识</span></td>
                    <td><span class="span">批量生成各科成绩的"空容器"骨架，避免手动逐个写<code>{}</code></span></td>
                </tr>
                <tr>
                    <td><h4><span><code>zip()</code>函数</span></h4></td>
                    <td><code>dict(zip(subjects,score_list))</code></td>
                    <td><span>新知识</span></td>
                    <td><span class="span">用<code>zip</code>将“学科名列表”和“分数列表”压缩成元组，并直接生成字典，消除手动循环赋值的冗余代码</span>
                    </td>
                </tr>
                <tr>
                    <td><h4><span>字典构造</span></h4></td>
                    <td>
                        <ul>
                            <li>使用<code>score_dict = dict(zip(....))</code>

取代：<code>{subjects[i]: score_list[i] for i in range(...)}</code>

<code>all</code> 误用 → 发现后改为 <code>any()</code>

判断元音时，将字符串未加引号————>错误使用变量进行成员判断、导致未定义变量产生错误

<code>max(score_list)</code>

<code>min(score_list)</code>

<code>sum(score_list) / len(score_list)</code>

<code>max(s for s in score_list)</code>

<code>sum(1 for n in word if n in yuanYin)</code>

<code>max(score[subj] for score in students.values())</code>

<code>sum(score["数学"] for score in students.values())</code>

<span>惰性：只有被 <code>for</code>或 <code>sum()...方法</code>消费时才逐个产生</span>

<span>没有元组推导式，可以使用：<code>tuple(s for s in iteration)</code>，强制转元组</span>

内存占用：<span>极小(<span class="span">只存一个元素</span>)</span>

<span>列表推导式：</span><code>[s for s in iteration (if ...)可选]</code>

<span>集合推导式：</span><code>{s for s in iteration (if ...)可选}</code>

<span>字典推导式：</span><code>{s:default for s in iteration (if ...)可选}</code>

<span>急性：<span class="span">立即生成全部</span></span>

<span>内存占用：<span class="span">巨大（存一百万个元素）</span></span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——案例\函数基础——案例.py

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


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数基础\函数基础——案例\函数基础——课后作业.py

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


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数的结尾案例\函数的结尾案例.py

# 案例电商订单计算器

"""
    定义一个函数，用于根据传入的一批商品信息(商品名、价格、数量)、
    优惠(优惠卷、积分抵扣)、运费信息计算订单的总金额

    具体规则如下：
        1.优惠券需要商品金额满5000才可以使用，且优惠券金额打八折。
        2.积分抵扣：100 积分抵扣1元(且抵扣金额不能超过商品总价，积分只能整百抵扣)

"""


class Shooping:
    def __init__(self):
        self.data = {}

    def add(self, name, price, count):
        """
            该函数主要用于添加商品信息

            :param name:商品姓名
            :param price:商品单价
            :param count: 商品数量
            :return：商品信息添加成功则，返回True，否则返回None
        """
        information = ["价格", "数量"]
        try:
            information_infact = [price, count]
            information_infact = [abs(float(p)) for p in information_infact]
            information_dict = dict(zip(information, information_infact))
            self.data[name] = information_dict
            return True
        except ValueError:
            print("实参应为数字类型")
            return None

    def calc(self, freight, loyalty_card='0'):
        """
            该函数计算总价，包括优惠后的价格
            
            :param freight:运费
            :param loyalty_card:账户积分
            :return:返回付款金额,实参非数字，返回None
        """
        try:
            freight, loyalty_card = abs(float(freight)), abs(float(loyalty_card))
            loyalty_card = loyalty_card // 100
            total = 0
            for name, sums in self.data.items():
                total += sums["价格"] * sums["数量"]
            if total >= 5000:
                if loyalty_card > total:  # 当积分多余总金额时v
                    total2 = (total * 0.8) - total + freight  # 我勒个零元购
                    print(f"商品总金额：{total}元，有八折优惠券，减去积分抵扣，应付：{total2}元")
                else:
                    total2 = (total * 0.8) - loyalty_card + freight
                    print(f"商品总金额：{total}元，有八折优惠券，减去积分抵扣，应付：{total2}元")

            return True
        except ValueError:
            print("实参应为数字")
            return None


def shop():
    shops = Shooping()

    print("===============欢迎使用购物车计算器=================")
    while True:
        print("1.添加商品============2.计算应付金额==========3.退出")
        count = input("请输入需要的操作")
        match count:
            case '1':
                name = input("请输入添加商品姓名：name=")
                price = input(f"请输入 【{name}】 单价，price=")
                counts = input(f"请输入 【{name}】 购买数量，counts=")
                result = shops.add(name, price, counts)
                if result is None:
                    continue
            case '2':
                freight = input("请输入运费，freight=")
                loyalty_card = input("请输入账户积分，loyalty_card=")
                if loyalty_card == "":
                    result = shops.calc(freight)
                    if result is None:
                        continue
                else:
                    result = shops.calc(freight, loyalty_card)
                    if result is None:
                        continue
            case '3':
                print("退出计算器，欢迎下次使用")
                break
            case _:
                print("请输入现有功能")


shop()

# 案例电商订单计算器
class Shopping:
    def __init__(self):
        self.data = {}  # {商品名: {"价格": price, "数量": count}}

    def add(self, name, price, count):
        """添加商品"""
        try:
            price = abs(float(price))
            count = abs(float(count))
            if price == 0 or count == 0:
                print("价格和数量不能为0")
                return None
            self.data[name] = {"价格": price, "数量": count}
            print(f"✅ 商品 [{name}] 添加成功")
            return True
        except ValueError:
            print("价格和数量必须是数字")
            return None

    def calc(self, freight, points='0'):
        """
        计算订单总金额
        :param freight: 运费
        :param points: 账户积分（可选）
        :return: 应付金额，失败返回 None
        """
        try:
            freight = abs(float(freight))
            points = abs(float(points))

            # 1. 计算商品总价
            total = 0
            for name, info in self.data.items():
                total += info["价格"] * info["数量"]
            print(f"商品总价：{total:.2f} 元")

            if not self.data:
                print("购物车为空，请先添加商品")
                return None

            # 2. 判断是否满 5000
            if total >= 5000:
                # 优惠券：打八折（优惠20%）
                coupon_discount = total * 0.2
                print(f"✅ 满5000，可使用优惠券，优惠：{coupon_discount:.2f} 元")

                # 积分抵扣：100 积分 = 1元
                point_discount = (points // 100) * 1
                # 积分抵扣不能超过“优惠后金额”
                max_point_discount = total - coupon_discount
                if point_discount > max_point_discount:
                    point_discount = max_point_discount
                print(f"积分抵扣：{point_discount:.2f} 元（{points // 100 * 100} 积分）")

                # 优惠后金额
                after_discount = total - coupon_discount - point_discount
            else:
                print("未满5000，无优惠")
                # coupon_discount = 0
                # point_discount = 0
                after_discount = total

            # 3. 加运费
            final_amount = after_discount + freight
            print(f"运费：{freight:.2f} 元")
            print(f"应付金额：{final_amount:.2f} 元")
            return final_amount

        except ValueError:
            print("运费和积分请输入数字")
            return None


def shop():
    cart = Shopping()

    while True:
        print("\n=============== 购物车计算器 ===============")
        print("1. 添加商品")
        print("2. 计算应付金额")
        print("3. 退出")
        count = input("请输入操作编号：")

        match count:
            case '1':
                name = input("商品名：")
                price = input("单价：")
                count_num = input("数量：")
                cart.add(name, price, count_num)

            case '2':
                if not cart.data:
                    print("购物车为空，请先添加商品")
                    continue
                freight = input("请输入运费：")
                points = input("请输入积分（可不填）：")
                if points == "":
                    cart.calc(freight)
                else:
                    cart.calc(freight, points)

            case '3':
                print("退出成功，欢迎下次使用！")
                break

            case _:
                print("请输入 1、2 或 3")


shop()


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数的结尾案例\函数的结尾案例第二次写.py

# 电商订单计算器

"""
    定义一个而函数，用于根据传入的一批商品信息(商品名、价格、数量)
    优惠(优惠券、积分抵扣)
    运费信息计算订单的总金额
    具体规则如下：
        优惠券需要商品金额满5000才可以使用，且优惠券金额不能超过商品总价（打七折）
        积分抵扣需要商品总金额满5000才可以使用，100 积分 = 1元，
            抵扣金额不能超过商品总价，积分只能整百抵扣
"""


class SHopping:
    """
        创建实例对象：存储商品信息
    """

    # 创建实例对象
    def __init__(self):
        self.data = {}  # 必须放在最上面

    # 添加商品

    def add(self, name, price, quantity='1'):
        """
            该函数用于添加商品：

            :param name: 商品名称
            :param price:商品价格
            :param quantity: 商品购买数量
            :return: 添加成功返回True , 失败则返回None
        """
        # 创建商品信息：键为后续拉链做准备
        information = ["价格", "数量"]
        # 价格与数量应为数字，数量应为整数
        try:
            price = abs(float(price))
            quantity = abs(int(quantity))
        except ValueError:
            print("价格与数量应为数字类型，且数量为整数。")
            return None

        # 创建内层字典：价格、数量
        information_dict = dict(zip(information, [price, quantity]))

        # 添加商品信息
        self.data[name] = information_dict

        print(f"商品 [{name}] 添加成功")
        return True

    # 计算应付款
    def calc(self, freight='0', coupon='0'):
        """
            该函数用于计算各种优惠后，应付金额

            :param freight:运费价格
            :param coupon: 账户积分
            :return:成功计算则返回True，否则返回None

        """

        # 运费与积分应是数字类型
        try:
            freight = abs(float(freight))
            coupon = abs(float(coupon))

        except ValueError:
            print("运费与积分应是数字类型")
            return None

        # 整体运算步骤：计算总金额——优惠券——积分抵扣——运费

        # 计算总金额：sums = 价格 * 数量
        # total = 0
        # for name, information in self.data.items():
        #     total += information["价格"] * information["数量"]

        total = sum(s["价格"] * s["数量"] for s in self.data.values())

        # 计算优惠券后的金额 总金额大于5000才能，优惠券打七折
        if total > 5000:
            total_coupon = total * 0.7

            # 计算积分抵扣后的金额。100 积分 = 1元，且不大于总金额。

            # 计算总抵扣积分
            sums_coupon = (coupon // 100) * 1

            # 计算抵扣后的金额
            if sums_coupon >= int(total_coupon):
                sums_coupon = int(total_coupon)
                total_coupon = total_coupon - sums_coupon
                # 使用积分
                coupon_rest = sums_coupon * 100
                coupon = coupon - coupon_rest

                # 添加进运费
                total_coupon = total_coupon + freight

            else:
                total_coupon = total_coupon - sums_coupon
                coupon = coupon - sums_coupon * 100  # 计算剩余积分

                # 添加进运费

                total_coupon = total_coupon + freight



        else:
            total_coupon = total + freight
            coupon = f"{coupon} 未使用积分"

        # 打印结果

        # 打印所有物品
        for name, information in self.data.items():
            print(f"商品：{name},价格：{information['价格']}，数量：{information['数量']}")

        # 打印应付结果
        print(f"应付金额：{total},实收金额：{total_coupon}，包含运费：{freight}，剩余积分：{coupon}")
        print("具体优惠过程：总金额 > 5000 则：优惠七折 + 积分抵扣 + 运费，总金额 < 5000 则：总金额 + 运费")

        return True


# 制作用户交互菜单
def shop_ing():
    # 创建实例对象
    shop = SHopping()

    print("欢迎使用，购物车计算器")

    # 创建用户菜单
    while True:
        print("==========1.添加商品============2.查询实付金额===========3.退出计算器")
        count = input("请输入您要执行的操作：")

        match count:
            case '1':
                name = input("请输入您要添加的商品：name=")
                price = input(f"请输入 【{name}】的价格：price=")
                quantity = input(f"请输入 【{name}】的购买数量(默认1，回车即时默认),quantity=")
                if quantity == '':
                    result = shop.add(name, price)
                else:
                    result = shop.add(name, price, quantity)
                if result is None:
                    continue

            case '2':
                freight = input("请输入运费价格：freight=")
                coupon = input("请输入现有积分：coupon=")
                if freight == '' and coupon == '':
                    result = shop.calc()
                elif freight == '':
                    result = shop.calc(coupon = coupon)
                elif coupon == '':
                    result = shop.calc(freight=freight)
                else:
                    result = shop.calc(freight,coupon)
                if result is None:
                    continue

            case '3':
                print("计算器已退出，欢迎下次使用")
                break

            case _:
                print("请输入支持的功能")


shop_ing()

"""
    写代码遇到的问题：
        非常严重的知识误区：在for循环内解包 values()\\keys()   int(float()) 是完全可行的，截断小数  int(str()) 就需要判断 如果是非整数数字类型，其他均报错
"""


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——传参方式\代码\函数进阶——传参方式.py

# 传参方式——————>位置参数

def number(num1, num2, num3):
    return num1, num2, num3


# 2.传参方式——————>关键字参数

def name(name1, name2, name3):
    return name1, name2, name3


# 3.传参方式——————>默认参数+位置参数+强制关键字参数
def student(names, age, cls="软件三班", *, subject):
    return names, age, subject, cls


# 5.传参方式————————>无定长参数
def test(*args, **kwargs):
    print("位置元组:", args)
    print("关键字字典:", kwargs)


if __name__ == "__main__":
    print("""
        ==========================程序指定运行系统===============================
        #                   1.传参方式——————>位置参数                           #
        #                   2.传参方式——————>关键字参数                         #
        #                   3.传参方式——————>默认参数+位置参数+强制关键字          #
        #                   4.传参方式————————>无定长参数                       #
        =====================================================================
    """)
    count = input("请输入要运行的代码，count=")
    match count:
        case '1':
            number_input = []
            for i in range(1, 4):
                number_input.append(input(f"请输入第{i}个实参："))
            result = number(*number_input)
            print(f"输入的实参依次是：{','.join(result)}")
        case '2':
            name_input = []
            for i in range(1, 4):
                name_input.append(input(f"请输入学生姓名(关键字传参，传参顺序会被打乱)："))
            n = ["name3", "name1", "name2"]
            result = name(**dict(zip(n, name_input)))
            print(f"传入的学生姓名有：{','.join(result)}")
        case '3':
            student_input = []
            while True:
                name_input = input("请输入学生姓名(回车则结束输入), ：name=")
                if name_input == "":
                    break
                age_input = input(f"请输入 【{name_input}】 的年龄，age=")
                subject_input = input(f"请输入 [{name_input}] 专业名=：")
                cla_input = input(f"请输入 [{name_input}] 所在的班级(默认：软件三班)：class=")
                if cla_input == "":
                    student_input.append(student(name_input, age_input, subject=subject_input))
                else:
                    student_input.append(student(name_input, age_input, cla_input, subject=subject_input))
            for i in student_input:
                print(f"{i[0]} {i[1]}岁 {i[3]} 学习：{i[2]}专业")
        case '4':
            test(1, 2, 3, name="张三", age=18)
        case _:
            print("请输入可测试的代码")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——传参方式\代码\无定长参数——课程练习.py

# 定义一个函数，根据传入的数据，计算这批数据种的最小值、最大值、平均值

def judge(*num):
    """
        用于输入用户输入的数据最大值，最小值，平均值
        
        :param num:用户输入的数字容器，通过不定长参数收集
        :return:是数字，输出结果，包含非数字类型，输出None
    """
    try:
        num = [float(n) for n in num]
        return max(num),min(num),round(sum(num)/len(num),2)
    except ValueError:
        return None

num_list = []
while True:
    num = input("请输入数字(直接按回车结束输入)：number=")
    if num == "":
        break
    num_list.append(num)
    
result = judge(*num_list)
if result is None:
    print("包含非数字类型")
else:
    print(f"所输出数据最大值：{result[0]}，最小值：{result[1]}，平均值：{result[2]}")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——传参方式\笔记\函数进阶——传参方式.html

**Title:** 传参方式 - 总结

传参方式 — 总结

传参方式总览

合法定义方式（速查）

详细笔记（含完整示例）

课后总结

本页只列要点，详细示例请参阅下方链接。

<a href="../../../../../../../python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/函数/函数基础/函数基础——函数的参数与返回值/笔记/函数基础——函数的参数与返回值.html/#函数的参数与返回值"
                       onclick="loadContent(this,'container-传参方式','#函数的参数与返回值');return false">👉
                        点击查看完整笔记《函数基础——函数的参数与返回值》</a>

以上知识均为学习笔记，详细内容请参阅基础笔记。

<span>我采用 Python 语法与 JavaScript 语法类比的方式记录。</span>

</head>
<body id="函数传参方式">
<main>
    <header>
        <h1>传参方式 — 总结</h1>
        <p style="font-size: 1.8rem; color: #666;">本页只列要点，详细示例请参阅下方链接。</p>
    </header>
    <section id="section_1">
        <ul>
            <li>
                <h2>传参方式总览</h2>
                <ul>
                    <li><span>位置参数</span>：按形参定义顺序一一对应传入。

<span>默认参数</span>：定义时给形参赋默认值，调用时可省略。

<span>关键字参数</span>：调用时指名道姓赋值，顺序可打乱。

<span>不定长参数</span>：
                        <ul>
                            <li><code>*args</code> —— 收集多余位置参数，打包为元组。

<code>**kwargs</code> —— 收集多余关键字参数，打包为字典。

<span>强制关键字参数</span>：在 <code>*</code> 或 <code>*args</code> 之后的形参只能通过关键字传参。

<span>参数优先级</span>：<code>位置参数 > 默认参数 > * > 强制关键字 > **</code>

<h2>合法定义方式（速查）</h2>
                <ul>
                    <li><code>def f(a, *b):</code> ✅

<code>def f(a, **b):</code> ✅

<code>def f(a, *b, **c):</code> ✅

<code>def f(a, *, b, **c):</code> ✅

<code>def f(a, *b, *c):</code> ❌（两个 * 冲突）

<code>def f(a, **b, *c):</code> ❌（顺序反了）

<h2>详细笔记（含完整示例）</h2>
                <p>
                    <a href="../../../../../../../python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/函数/函数基础/函数基础——函数的参数与返回值/笔记/函数基础——函数的参数与返回值.html/#函数的参数与返回值"
                       onclick="loadContent(this,'container-传参方式','#函数的参数与返回值');return false">👉
                        点击查看完整笔记《函数基础——函数的参数与返回值》</a>
                </p>
                <div id="container-传参方式"></div>

<h3>位置参数</h3>
                <ol>
                    <li><span>调用函数时，传入的实参的顺序与定义函数形参的顺序完全一致</span>

<h3>关键字参数</h3>
                <ol>
                    <li><span>调用函数时，通过 <code>"形参名 = 值"</code>的形式传递参数，顺序没有要求</span>

<span class="span">如果同时存在位置参数与关键字参数，位置参数在前，关键字参数在后</span>

<h3>默认值参数</h3>
                <ol>
                    <li>默认值参数也称为缺省参数，用于在定义函数时，为参数提供默认值，调用函数时，可以不传递有默认值的参数

<span>默认值参数必须放在没有默认值的参数列表的后面，一个函数可以设置多个默认值</span>

<span>函数调用时，如果默认参数传递了值。则会修改默认的参数值，如果没有传递参数，则直接使用默认值</span>

<h4>无定长参数</h4>
                <ol>
                    <li>不定长参数也叫 <span>可变参数</span>，用于函数定义及调用时参数个数不确定(<span>零或多个</span>)的场景

类型一(<span>无定长参数——位置参数</span>)：<code>*args</code>，多余<span>位置参数收集</span>，组包成元组，然后赋值给形参。位置不固定，但是符号后面，均为<span>强制关键字参数</span>。

类型二(<span>无定长参数——关键字参数</span>)：<code>**kwargs</code>,多余<span>关键字参数收集</span>，组包成字典，然后赋值给形参，位置固定最后一个

优先级：<code>* > 强制关键字 > **</code>

<span>无定长参数——关键字参数 <span class="span">一定在</span>无定长参数——位置参数 <span
                            class="span">后面</span></span>

<h5>无定长参数——关键字参数(<span>附加规则</span>)</h5>
                        <ul>
                            <li>一般字典的键名：<span>必须是可哈希的(<span class="span">不可变对象</span>)、数字、字符串、元组均是可以作为键名的</span>

但是无定长参数：<span>添加一条硬性规则：<span class="span">键名必须是字符串</span></span>

<h3>传参方式的适用场景</h3>
                <ol>
                    <li><span>一切以代码结构清晰为主(<span>可读性</span>)、便于维护(<span>维护性</span>)为目标</span>

如果参数比较少(<span>不超过三个</span>)，<span>可直接使用位置参数</span>

<span>如果参数数量较多，建议使用关键字参数。</span>

<code>*args</code>适用于处理数量不确定的数据

<code>**kwargs</code>适用于处理数量不确定的选型(<span>函数的配置参数，用来定制函数的行为</span>)

<span>额外注意事项：<span class="span">只要多出数据被无定长参数收集，要么是元组，要么是字典。
                <br>也就是说：尽管是一个位置参数，同样是元组。
                <br>一个关键字参数，同样是字典。</span></span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——匿名函数\代码\函数进阶——匿名函数.py

sqrt = lambda x: 30 ** 0.5
print(sqrt(10))

# 任务(必须使用lambda)：
# 1.按成绩从高到低排序，并打印出所有学生的姓名和成绩。
# 2.筛选出成绩大于等于 80 分的学生，并打印他们的姓名。
students = [
    {"name": "小明", "score": 85},
    {"name": "小红", "score": 92},
    {"name": "小兰", "score": 78},
    {"name": "小刚", "score": 88},
    {"name": "小丽", "score": 95},
]

# 按成绩从高到低排序
students.sort(key=lambda x: x["score"], reverse=True)
print("按成绩大小排序，从高到低：")
for s in students:
    print(f"{s["name"]} : {s["score"]}")

# 筛选出成绩大于等于 80 分的学生
name = []
for s in filter(lambda x: x["score"] >= 80, students):
    name.append(s["name"])
print(f"成绩 >= 80的学生有：{','.join(name)}")

# 给每个学生实际成绩提升 5 分 # subscriptable 数字不能使用方括号访问
# for s in map(lambda x: x["score"] + 5, students):
#     print(f"{s['name']} : {s['score']}")
# s是数字，不能使用中括号法，访问键

for s in map(lambda x: {"name": x["name"], "score": x["score"] + 5}, students):
    print(f"{s['name']} : {s['score']}")


# 使用def + sort ，将成绩从低到高排序，且不更改原容器
def sort_score(x):
    return x["score"]


students = sorted(students, key=sort_score)
print("从低到高排序")
for s in students:
    print(f"{s['name']} : {s['score']}")

# 课堂练习
# 1.打印一个分割线
divide = lambda: "|" * 50
print(divide())

# 2.求n个数的合
result = lambda *args: sum([float(n) for n in args])  # 局限性：不能包含语句：异常处理、if-elif-else
print(result(100, 500, 60, 80, 70))

# 案例三：完成如下列表的排序操作，按字符串字符个数排序，从小到达
data_list = ["C++", "C", "python", "jack", "PHP", "java", "go", "JavaScript", "Rust"]
result = sorted(data_list, key=lambda x: len(x))
print(data_list)
print(list(result))


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——匿名函数\笔记\函数进阶——匿名函数.html

**Title:** 匿名函数

匿名函数

特点

匿名函数与方法之间的联系

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="匿名函数">
<main>
    <header>
        <h1>匿名函数</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>
                什么是匿名函数：<span>没有名字的函数，需要通过 <code>lambda</code>表达式来声明函数，可以简化简单函数的缩写(单行表达式)</span>

<span>含参数(<span class="span">可以是多个，英文逗号间隔</span>)</span>语法：<code>sqrt = lambda 参数:
                函数体</code>

<span>不含参数</span>语法：<code>sqrt = lambda : 函数体</code>

<span>字面量接收的是函数对象，不能直接<code>print(字面量)</code></span>

无参调用：
                <code style="display:block;">
                    result = lambda :'|'*50
                    <br>print(result()) # 调用无参函数
                </code>

有参调用：
                <code style="display:block;">
                    result = lambda x,y,z:(x+y+z) ** 0.5
                    <br>print(result(10,50,30)) # 调用有参函数,需要传参
                </code>

直接打印字面量：
                <code style="display:block;">
                    result = lambda x,y,z:(x+y+z) ** 0.5
                    <br>print(result) # 打印的是函数对象，一串地址。
                </code>

<h2>特点</h2>
                <ol>
                    <li><span>没有函数名，只有关键字<code>lambda</code></span>

<code>lambda 参数:函数体</code>

<span>不需要<code>return</code>关键字，传递返回值，本身就可以</span>

<span>可以字面量接收返回值，或直接调用</span>

<span>只能一行写完，有点类似于：<span class="span">元组生成器的函数版本</span></span>

局限性：<span>不能写语句：<span
                            class="span"><code>try-except，if-elif-else，for...</code></span></span>

但是可以内部调用函数和方法：<code>print()、len()、自定义函数、...</code>

<code>list.sort(key=lambda x: x["score"],reverse = True)</code>

<code>new_list = sorted(list,key=lambda x: x["score"])</code>

知识回顾：<code>sort(key=None,reverse=False)</code>

<span>key默认None,reverse默认False(<span class="span">升序</span>)</span>

<span>注意：<code>key</code>接收的是函数对象，而不是函数调用结果</span>

新知识(<code>sorted</code>)：<code>sorted(iteration,key=None,reverse)</code>

<span>与<code>sort</code>不同，它有返回值，不更改原容器</span>

主要作用：<span>指定排序依据，不改变元素结构(<span class="span">只排序</span>)</span>

<span>筛选符合条件的元素，返回<span class="span">迭代器</span>，想要正确显示结果需要转成容器，或遍历</span>

<span>只是筛选，返回值是原容器数据类型</span>

<span>映射原列表，并通过函数，更改原容器数据</span>

<span>映射新容器，不会更改原容器，需要字面量接收返回值(<span
                                    class="span">迭代器</span>)</span>

<span>返回数据类型，以函数更改的数据类型为主(<span
                                    class="span">可以理解为以返回值类型为主</span>)。</span>

<span>所以需要注意：到底需要<code>map</code>返回什么？</span>

<span>推导式是"<span class="span">批量生成</span>"</span>

<span>与生成器：<code>(x for i in range(5))</code>都是"输出一个结果"</span>

<span>与生成器的区别：<span class="span"><code>lambda</code> 是函数对象，生成器是惰性迭代器</span></span>

<span>与生成器不同的是：<span
                                    class="span">它没有惰性与急性之分，在定义匿名函数的时候，对象就一直生成，等待调用执行</span></span>

<span>但是会受到：<code>filter()/map()</code>等高阶函数，影响是惰性的，
                                <br>因为 <code>filter()/map()</code>只有在被遍历或打印才会操作</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——变量作用域\代码\函数进阶——变量作用域.py

x = 20


def num():
    return x


def num2():
    global x
    x = 50


def num3():
    y = 40

    def num4():
        nonlocal y
        y = 100

    num4()
    print(y)


if __name__ == '__main__':
    # 测试代码
    print("================测试代码程序====================")
    print("""
        ===========================目前测试功能=========================
        #       1.访问无需关键字     2.使用关键字global修改全局变量值      #
        #       3.使用关键nonlocal修改外层函数定义变量值                 #
        ============================================================
    """)
    count = input("请输入你要测试的代码：count=")
    match count:
        case '1':
            # 1.访问无须关键字
            print(num())
        case '2':
            # 2.使用关键字global 修改全局变量值，一般并不建议用
            num2()
            print(x)
        case '3':
            # 3.使用关键字nonlocal 修改外层函数定义变量值
            num3()
        case _:
            print("请输入合法功能")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——变量作用域\笔记\函数进阶——变量作用域.html

**Title:** 变量作用域

变量作用域

全局作用域

局部作用域

注意

作用域核心对比

🎯 一句话总结

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="作用域">
<main>
    <header>
        <h1>变量作用域</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>变量的作用域指的是：<span>变量的作用范围(<span
                    class="span">标识这个变量在哪里可以使用，在哪里不能使用</span>)</span>

<span>说白了，就是变量的存活周期</span>

<ol>
                    <li>
                        <h2>全局作用域</h2>
                        <ul>
                            <li>全局作用域也叫：<span>全局变量</span>

全局变量：<span>在函数之外定义的变量，称之为全局变量</span>

特点：<span>存活周期：整个文件(<span class="sapn">包括函数内</span>)都可以使用(<span
                                    class="span">全局变量始终在顶层</span>)</span>

<h2>局部作用域</h2>
                        <ul>
                            <li>局部作用域也叫：<span>局部变量</span>

局部变量：<span>在函数内部定义的变量，称之为局部变量</span>

特点：<span>存活周期：只在函数才能使用的变量</span>

<h2>注意</h2>
                        <ul>
                            <li><span>变量有严格的作用域划分</span>

<span>局部变量，外部绝对无法访问</span>

<h3>函数访问变量的坑</h3>
                                <ol>
                                    <li><span>函数内部，可以访问，全局变量，<span
                                            class="span">正常情况只是能访问，不能修改</span></span>

<h4>函数修改外部变量的方法</h4>
                                        <ul>
                                            <li><span>修改全局变量：使用关键字：<code>global</code></span>

<code style="display:block;">
                                                <br>x = 10
                                                <br>def num():
                                                <br> &nbsp;&nbsp;global x
                                                <br> &nbsp;&nbsp;x = 20
                                                <br>num()
                                                <br>print(x) # 最后结果为 20
                                            </code>

<span>内层函数修改外层函数变量的局部变量：使用关键字：<code>nonlocal</code></span>

<code style="display:block;">
                                                    <br>def num1():
                                                    <br> &nbsp;&nbsp;x = 50
                                                    <br> &nbsp;&nbsp;def nun2():
                                                    <br> &nbsp;&nbsp;&nbsp;&nbsp;nonlocal x
                                                    <br> &nbsp;&nbsp;&nbsp;&nbsp;x = 30
                                                    <br> &nbsp;&nbsp;num2()
                                                    <br> &nbsp;&nbsp;print(x)
                                                    <br>num1() 最后的输出结果是 30
                                                </code>

<h4>自己画的<code>python</code>作用域</h4>
                                <img src="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/函数/函数进阶/函数进阶——变量作用域/笔记/image/变量作用域.png"
                                     alt="python变量作用域"
                                     title="python变量作用域" style="display:block;">
                                <span>注意：1.全局作用域可以有多个函数作用域</span>
                                <br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.每个函数作用域都有嵌套的多个函数作用域</span>

<h4>自己画的<code>JavaScript</code>作用域</h4>
                                <img src="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/函数/函数进阶/函数进阶——变量作用域/笔记/image/JavaScript变量作用域.png"
                                     alt="JavaScript变量作用域"
                                     title="JavaScript变量作用域" style="display:block;">
                                <span>注意：1.全局作用域可以有多个函数作用域</span>
                                <br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.每个函数作用域都有嵌套的多个函数作用域</span>
                                <br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.每个函数作用域都可能出现块级作用域</span>
                                <br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.全局作用域只有一个块级作用域</span>
                                <br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5.块级作用域内可以有函数作用域、块级作用域</span>

<strong>全局作用域</strong>（Global）

<strong>函数作用域</strong>（Function）

<strong>块级作用域</strong>（Block，ES6+，由 <code>let</code>/<code>const</code> 创建）

<strong>全局作用域</strong>（Global）

<strong>函数作用域</strong>（Function）

<span>❌ 没有块级作用域</span>（<code>if</code>、<code>for</code> 等不创建作用域）

<code>var</code> 声明的变量会<strong>提升</strong>（Hoisted），初始化前值为
                                <code>undefined</code>

<code>let</code>/<code>const</code> 也会提升，但进入<strong>暂时性死区</strong>（TDZ），声明前访问报错

<strong>函数声明</strong>会整体提升（函数体也提升）

❌ 没有变量提升

变量必须<strong>先定义后使用</strong>，否则报 <code>NameError</code>

函数定义（<code>def</code>）在运行时执行，必须先定义后调用

在全局声明的变量，在函数内部<strong>可直接修改</strong>（无需关键字）

如果函数内部使用 <code>var</code>/<code>let</code>/<code>const</code>
                                重新声明同名变量，则创建局部变量，不影响全局

在函数内部<strong>读取</strong>全局变量无需关键字

在函数内部<strong>修改</strong>全局变量需使用 <code>global</code> 关键字

否则会在函数内部创建新的局部变量

在嵌套函数中，直接修改外层函数的变量<strong>无需关键字</strong>

但如果在外层作用域中<strong>重新声明</strong>同名变量，则会遮蔽外层变量

闭包会“记住”外层变量

在嵌套函数中，<strong>读取</strong>外层函数变量无需关键字

在嵌套函数中，<strong>修改</strong>外层函数变量需使用 <code>nonlocal</code> 关键字

否则会在当前函数内部创建新的局部变量

函数内部的局部变量（<code>var</code>/<code>let</code>/<code>const</code>）外部无法访问

但可通过 <strong>返回值</strong>、<strong>闭包</strong> 或 <strong>全局变量</strong> 间接暴露

函数内部的局部变量外部无法访问

但可通过 <strong>返回值</strong> 或 <strong>闭包</strong> 间接暴露

无法通过全局变量暴露（除非显式声明 <code>global</code>）

<strong>作用域链</strong>：当前作用域 → 外层作用域 → 全局作用域 → 报错

没有类似 LEGB 的官方缩写，但逻辑一致

<strong>LEGB 规则</strong>：

Local → Enclosing → Global → Built-in

ES6+ 中，<code>let</code>/<code>const</code> 在 <code>{}</code> 内创建块级作用域

<code>var</code> 忽略块级作用域，只受函数作用域限制

❌ <code>if</code>、<code>for</code>、<code>while</code> 等<strong>不创建</strong>作用域

在块内定义的变量，在块外依然可访问

<code>"use strict"</code> 禁止隐式全局变量，避免意外创建全局变量

其他影响：禁止重复参数名、禁止 <code>with</code> 等

Python 默认就是“严格”的，没有隐式全局变量（赋值即声明）

函数内部赋值未声明的变量会创建局部变量，而非全局

浏览器环境：<code>window</code>（或 <code>globalThis</code>）

Node.js 环境：<code>global</code>

在全局作用域声明的变量会成为全局对象的属性

Python 没有“全局对象”的概念

全局变量存储在内置的 <code>globals()</code> 字典中，但一般不直接操作

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——可传参参数类型\代码\函数进阶——可传参参数类型.py

def add(*args):
    try:
        args = [float(s) for s in args]
        return sum(args)
    except ValueError:
        print("包含非数字！！！")


def subtracts(*args):
    try:
        args = [float(s) for s in args]
    except ValueError:
        print("包含非数字！！！")
    subtract = 0
    for i in range(len(args)):
        if i == 0:
            subtract = args[0]
        else:
            subtract -= args[i]
    return subtract


def calc(oper, *args):  # 计算器：具体执行什么运算由，传参决定
    if len(args) == 1 and isinstance(args[0], (list, tuple, set)):
        data = args[0]
    elif any(isinstance(arg, (list, tuple, set)) for arg in args):
        return None
    else:
        data = args
    return oper(*data)  # 注意需要展开元组


number = [100, 80, 50, 60, 70]
result = calc(add, number)
result2 = calc(subtracts, 10, 50, 60, 100, 5)
if result is None:
    print("参数只能是多个元素或只能是一个容器")
else:
    print(result)

if result2 is None:
    print("参数只能是多个元素或只能是一个容器")
else:
    print(result2)


def calc_iter(n):
    n = int(n)
    while n > 0:
        if n >= 1000:

            n -= 5
        elif n >= 500:
            n -= 4
        elif n >= 100:
            n -= 1
        else:
            n -= 1
        print(n)
    return True


print(calc_iter(3000))

def calc_rec(n):
    n = int(n)
    if n <= 0:
        return True   # 终止条件
    # 确定递减步长
    if n >= 1000:
        n -= 5
    elif n >= 500:
        n -= 4
    elif n >= 100:
        n -= 1
    else:
        n -= 1
    print(n)
    return calc_rec(n)   # 递归调用 说白了，就是return 函数自身

print(calc_rec(400))

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——可传参参数类型\笔记\函数进阶——可传参参数类型.html

**Title:** 可传参参数类型

可传参参数类型

例如

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="可传参参数类型">
<main>
    <header>
        <h1>可传参参数类型</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>普通参数：<span>数字、布尔、字符串、列表、元组、集合、字典等</span>

特殊参数：<span>函数</span>

<span>说白了：<span class="span">就是将函数名作为参数传给另一个函数作为实参</span></span>

<h2>例如</h2>
                <code style="display:block;">
                    <br>def add(*args):
                    <br>try:
                    <br> &nbsp;&nbsp;args = [float(s) for s in args]
                    <br> &nbsp;&nbsp;return sum(args)
                    <br>except ValueError:
                    <br>print("包含非数字！！！")
                    <br>
                    <br>
                    <br>
                    <br>def subtracts(*args):
                    <br> &nbsp;&nbsp;try:
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;args = [float(s) for s in args]
                    <br> &nbsp;&nbsp;except ValueError:
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;print("包含非数字！！！")
                    <br> &nbsp;&nbsp;subtract = 0
                    <br> &nbsp;&nbsp;for i in range(len(args)):
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;if i == 0:
                    <br> &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;subtract = args[0]
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;else:
                    <br> &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;subtract -= args[i]
                    <br> &nbsp;&nbsp;return subtract
                    <br>
                    <br>
                    <br>def calc(oper, *args): # 计算器：具体执行什么运算由，传参决定
                    <br> &nbsp;&nbsp;if len(args) == 1 and isinstance(args[0], (list, tuple, set)):
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;data = args[0]
                    <br> &nbsp;&nbsp;elif any(isinstance(arg, (list, tuple, set)) for arg in args):
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;return None
                    <br> &nbsp;&nbsp;else:
                    <br> &nbsp;&nbsp; &nbsp;&nbsp;data = args
                    <br> &nbsp;&nbsp;return oper(*data) # 注意需要展开元组
                    <br>
                    <br>
                    <br>number = [100, 80, 50, 60, 70]
                    <br>result = calc(add, number)
                    <br>result2 = calc(subtracts, 10, 50, 60, 100, 5)
                    <br>if result is None:
                    <br> &nbsp;&nbsp;print("参数只能是多个元素或只能是一个容器")
                    <br>else:
                    <br> &nbsp;&nbsp;print(result)
                    <br>
                    <br>if result2 is None:
                    <br> &nbsp;&nbsp;print("参数只能是多个元素或只能是一个容器")
                    <br>else:
                    <br> &nbsp;&nbsp;print(result2)
                </code>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——递归\代码\函数进阶——递归.py

def subtract(num):
    try:
        num = float(num)
        print(f"当前 num: {num}")
        if num >= 1000:
            return subtract(num - 10)
        elif num >= 500:
            return subtract(num - 5)
        elif num >= 200:
            return subtract(num - 3)
        elif num > 0:
            return subtract(num - 1)
        else:
            return num
    except ValueError:
        return "请输入数字类型"


# print(subtract(1000))

# 案例：定义一个函数，根据传入的数字，计算该数字阶乘的结果
# 阶乘：n**n + n**(n-1)+.....+n**(n-n)

def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result


print(factorial(50))


def factorial_return(n):
    if n == 1:
        return 1
    return n * factorial_return(n - 1)

result = factorial_return(5)
print(result)
"""
    先入栈：列出所需所有函数
    def factorial_return(5): # n * factorial_return(4) # 出栈：5 * 24 = 120 达到栈顶，返回最终结果，销毁栈帧
        def factorial_return(4): # n * factorial_return(3) # 出栈：4 * 6 = 24
            def factorial_return(3): # n * factorial_return(2) # 出栈：3 * 2 = 6
                def factorial_return(2): # n * factorial_return(1) # 出栈：2 * 1 = 2
                   def factorial_return(1): # 出栈：1
                         # n = 1，达到退出递归条件，停止递推
                         # 返回值1

"""

# 案例：用递归计算“数字的位数和” 如：sums(123) = 1+2+3 sums(4050) = 4 + 0 + 5 + 0
"""
    要求：
    必须用递归实现。
    不能在函数内部使用 str、list 等容器，只能使用数学运算（// 和 %）。
    写出递归终止条件和递归调用。
"""


# 正常运行逻辑
def sums(n):
    length = len(str(n))
    sum2 = 0
    n = str(n)
    for i in range(length):
        sum2 += int(n[i])
    return sum2


print(sums(123))


# 递归
def sums(n):
    if n <= 10:  # 个位数，递归停止
        return n
    return n % 10 + sums(n // 10)  # n % 10 获取最后一个数字  n // 10 获取剩余数字


print(sums(123))

"""
    递归过程： 同样先递归出所有的栈帧，然后栈顶开始计算，返回值给下一层，自身物理销毁，直到最外层（栈底），计算结果后，输出结果，然后物理销毁，函数周期结束
    入栈：
        sums(123): 出栈：123 % 10 = 3 + 3 = 6 返回最终结果：6，并物理销毁，函数周期结束。
            sums(12): # sums(123//10 = 12) 出栈：12 % 10 + 1 = 2 + 1 = 3
                sums(1): # sums(12//10 = 1) 出栈：返回值1
                    n < 10 个位数停止递归
                    返回值 1
                

"""


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\函数\函数进阶\函数进阶——递归\笔记\函数进阶——递归.html

**Title:** 递归

递归

注意事项

过程：(<code style="font-size: 3.5rem">递归 = 入栈挂起 + 出栈计算 + 逐层传递</code>)

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="递归">
<main>
    <header>
        <h1>递归</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>递归：<span>就是函数返回值是函数自身</span>

与常规函数区别：<code>return 自身</code>

<h2>注意事项</h2>
                <ol>
                    <li>重点：<span><code>return 自身</code></span>

<span>必须写入退出递归的条件：<code>return 非自身</code></span>

<code>python</code><span>默认递归上限：1000次</span>

<code style="display:block;">
                            <br>def subtract(num):
                            <br>try:
                            <br> &nbsp;&nbsp;num = float(num)
                            <br> &nbsp;&nbsp;print(f"当前 num: {num}")
                            <br> &nbsp;&nbsp;if num >= 1000:
                            <br> &nbsp;&nbsp; &nbsp;&nbsp;return subtract(num - 10) # return 自身 递归
                            <br> &nbsp;&nbsp;elif num >= 500:
                            <br> &nbsp;&nbsp; &nbsp;&nbsp;return subtract(num - 5) # return 自身 递归
                            <br> &nbsp;&nbsp;elif num >= 200:
                            <br> &nbsp;&nbsp; &nbsp;&nbsp;return subtract(num - 3) # return 自身 递归
                            <br> &nbsp;&nbsp;elif num > 0:
                            <br> &nbsp;&nbsp; &nbsp;&nbsp;return subtract(num - 1) # return 自身 递归
                            <br> &nbsp;&nbsp;else:
                            <br> &nbsp;&nbsp; &nbsp;&nbsp;return num # return 非自身 结束递归
                            <br>except ValueError:
                            <br> &nbsp;&nbsp;return "请输入数字类型"
                            <br>print(subtract(600))
                        </code>

递归本身简单，主要是要考虑：<span>递归想干什么，什么情况下结束递归</span>

<h3>自行总结：递归整个过程(以上案例为主)</h3>
                        <ol>
                            <li><span>入栈过程(<span class="span">递推</span>)：<span class="span">无法完成完整计算，因为当前函数需要等待子调用的返回值。这个过程实际上是在“列出所有需要被执行的函数”。</span></span>

<span>出栈过程（<span class="span">回调</span>）：<span>计算从最上层（栈顶，即最内层）开始，逐层向下（向栈底）推进，直到到达栈底（最外层）。</span></span>

<span>栈底计算出最终结果后，按照正常函数的流程返回，并在返回时依次销毁栈帧。</span>

<img src="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/函数/函数进阶/函数进阶——递归/笔记/image/阶乘递归过程.png"
                                     alt="阶乘递归过程"
                                     title="阶乘递归过程" style="display:block;">

<img src="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/函数/函数进阶/函数进阶——递归/笔记/image/递归过程——python.png"
                                     alt="递归过程——python"
                                     title="递归过程——python" style="display:block;">

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\字符串进阶\代码\字符串进阶.py

name = ("g"
        "o"
        "l"
        "d"
        "e"
        "n")
age = ('2'
       '0')
like = """
    敲代码
    听音乐
"""
print(name)
print(age)
print(like)

image = """
        *
       * *
      *   *
     *     *
      *   *
       * *
        *
"""
print(image)

image2 = """
        |               |   __________          |                       |                               ________________
        |               |   |        |          |                       |                               |              |
        |               |   |        |          |                       |                               |              |
        |   ——————————  |   |————————|          |                       |                               |              |
        |               |   |                   |                       |                               |              |
        |               |   |____________       |_____________          |_________________________      |______________|
"""

print(image2)
#
# image3 = 'hello 'hello' "hello" word' # 外层单引号，内层单引号报错，内层双引号不报错
#
#
# image4 = "hello "hello" 'hello' word" # 外层双引号 ，内层双引号报错，内层单引号不报错
#
# image5 = """
#         hello
#         """hello"""
#         '''hello''''
#         word
# """ # 外层三双引号，内层三双引号报错，内层三单引号不报错
#
# like = "敲代码"
# image5 = "hello 'myname 'age "like"  20' golen' word" # 放入变量也会报错



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\字符串进阶\代码\字符串拼接案例.py

# 根据自己的实际情况，输出个人详细信息，具体结构如下：
# "大家好，我叫XXX，今年X岁，学习的专业是：XXX，爱好：XXX"

name = "繁花与尘埃"
age = 20
specialty = "软件技术"
hobby = "python、JavaScript、MySQL、HTML、CSS"

print("大家好，我叫" + name + "，今年：" + str(age) + "岁" + "，学习的是：" + specialty + "专业" + "，爱好是：" + hobby)
print("大家好，我叫%s，今年：%s岁，学习的是：%s专业，爱好是：%s" % (name,age,specialty,hobby))

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\字符串进阶\笔记\字符串进阶.html

**Title:** 字符串进阶

字符串进阶

字符串的三种定义方式

注意事项

注意事项：引号嵌套规则

常见转义字符

字符串的拼接

字符串的格式化

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>字符串进阶</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>字符：<span>是文本世界的基本单位，一个字母，一个数字，一个标点符号，一个汉字等都是 <span
                    class="span">都是一个字符</span></span>

<h2>字符串的三种定义方式</h2>
                <ol>
                    <li>第一种：<span>双引号包裹</span>

第二种：<span>单引号包裹</span>

第三种：<span>三引号包裹(<span class="span">同样有单/双之分，但是效果一致</span>)</span>

注意：<span>正常来说：单/双引号包裹的字符串，<span class="span">只在一行有效</span>，但是IDE在换行的时候会自动创建，单/双引号</span>
                        <br>尽管会自动换行，但是输出结果也是在一行

注意：三引号<span>在不赋值给变量的时候，可以当注释使用，因为它的换行特性，<span class="span">最主要的是：输出的形式与字符串形式一致</span></span>

<img src="./image/字符串三种创建方式.png"
                             alt="字符串三种创建方式"
                             title="字符串三种创建方式">

<h2>注意事项</h2>
                <ul>
                    <li>字符串三种方法，可以混在一起使用，<span>但是最外层的方法不能重复使用</span>

<h2>注意事项：引号嵌套规则</h2>
                        <ul>
                            <li><span>最外层的引号决定了字符串的边界，内层不能出现相同引号，否则会提前结束字符串。</span>

✅ 正确：<code>name = "外层双引号，内层可以使用'单引号'或\"转义双引号\""</code>

❌ 错误：<code>name = "外层双引号，内层"再写双引号"就会报错"</code>

<span>最佳实践：避免多层嵌套，必要时使用转义符 <code>\</code> 或换一种外层引号。</span>

<img src="./image/字符串三种创建方式——注意事项.png"
                                     alt="字符串嵌套示例"
                                     title="字符串嵌套示例">

<h2>常见转义字符</h2>
                        <div class="div_table">
                            <table>
                                <thead>
                                <tr>
                                    <th>转义字符</th>
                                    <th>名称</th>
                                    <th>作用</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><code>\'</code></td>
                                    <td>单引号</td>
                                    <td>表示单引号 <code>'</code></td>
                                </tr>
                                <tr>
                                    <td><code>\"</code></td>
                                    <td>双引号</td>
                                    <td>表示双引号 <code>"</code></td>
                                </tr>
                                <tr>
                                    <td><code>\n</code></td>
                                    <td>换行符</td>
                                    <td><span>开始新的一行(<span class="span">换行</span>)</span></td>
                                </tr>
                                <tr>
                                    <td><code>\t</code></td>
                                    <td>制表符</td>
                                    <td><span>增加缩进，缩进一个制表符(<code>tab</code>)的大小</span></td>
                                </tr>
                                <tr>
                                    <td colspan="2">注意没有 <code>\"""</code></td>
                                    <td>但是可以：<code>\"\"\"或\'\'\'</code>代替</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

第一种：<span>多个字符串字面量自动拼接</span>

第二种：<span>跟<code>JavaScript</code>一样，可以使用运算符<code>+</code>号，进行拼接</span>

注意：运算符 <code>+</code>号，无法将非字符串与字符串进行拼接(<span>非字符串类型需要转为字符串类型</span>)

<span>这就是 <code>python</code>与 <code>JavaScript</code>的不同，python不具备隐式转换的形式 <span
                    class="span"><br>&nbsp;&nbsp;JavaScript只要一边是字符串，另一边会隐式转换成字符串，进行拼接
                    <span><br>&nbsp;&nbsp;python不会隐式转换，需要自己手动的将非字符串类型转为字符串，最后再拼接，这也为后续运算符的区别埋下伏笔</span></span></span>

<a href="../代码/字符串拼接案例.py">字符拼接案例</a>

<h3>方法一：<code>%s</code>占位符</h3>
                <ol>
                    <li>通过 <code>%s占位符</code>的形式完成字符串和变量的快速拼接

其中 <code>%</code>表示我要占位，<code>s</code>表示将变量转为字符串放入占位的位置

<span>注意：s是小写，不是大写</span>

语法：<code style="display: inline"><br>s1 = "繁花与尘埃"<br>print("大叫好，我叫 %s，现在再学python"
                        % s1)</code>

<span>尤其注意：结尾需要 <code>% 变量</code>，变量是需要拼接的变量名，字符串内 <code>%s</code>固定搭配</span>

<span>可以多个占位符一起使用，字符串内占位符数量，与后续的<span>变量名</span>数量一致，占位顺序一一对应，且需要英文括号括起来</span>

<img src="./image/字符串的格式化.png"
                             alt="字符串的格式化"
                             title="字符串的格式化">

<span>由图可见，使用字符串的格式化，比使用运算符 <span>+</span>号可读性更好</span>

<h3>字符串格式化——f-string</h3>
                <ol>
                    <li>
                        <div class="div_table">
                            <table>
                                <thead>
                                <tr>
                                    <th colspan="3">JavaScript的模板字符串与python的<code>f-string</code></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>语言</td>
                                    <td>语法</td>
                                    <td>示例</td>
                                </tr>
                                <tr>
                                    <td><code>JavaScript</code></td>
                                    <td><code>`${变量名}`</code></td>
                                    <td style="text-align: left">
                                        <code style="display: inline">
                                            let name = "繁花与尘埃"
                                            <br>console.log(`大家好。我叫${name}`)
                                        </code>
                                    </td>
                                </tr>
                                <tr>
                                    <td><code>python</code></td>
                                    <td><code>f"{变量名}"</code></td>
                                    <td style="text-align: left">
                                        <code style="display: inline">
                                            name = "繁花与尘埃"
                                            <br>print(f"大家好，我叫{name}")
                                        </code>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            <table>
                                <thead>
                                <tr>
                                    <th colspan="3">它们之间的区别</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>特性</td>
                                    <td><code>JavaScript</code>模板字符串 <code>`${}`</code></td>
                                    <td><code>python</code>f-string <code>f"{}"</code></td>
                                </tr>
                                <tr>
                                    <td>变量</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td>算术运算</td>
                                    <td>✅<code>`${a + b}`</code></td>
                                    <td>✅<code>f"{a + b}"</code></td>
                                </tr>
                                <tr>
                                    <td>函数调用</td>
                                    <td>✅<code>`${fn()}`</code></td>
                                    <td>✅<code>f"{fn()}"</code></td>
                                </tr>
                                <tr>
                                    <td>对象/数组特性</td>
                                    <td><code>`${obj.prop}`、`${arr[0]}`</code></td>
                                    <td>✅<code>f"{obj.prop}"、f"{arr[0]}"</code></td>
                                </tr>
                                <tr>
                                    <td>方法调用</td>
                                    <td>✅<code>`${str.toUpperCase()}`</code></td>
                                    <td>✅<code>f"{str.upper()}"</code></td>
                                </tr>
                                <tr>
                                    <td>列表/字段推导</td>
                                    <td>❌不能直接写推导式，但可以先定义变量</td>
                                    <td>✅<code>f"{[x*2 for x in range(5)]}"</code></td>
                                </tr>
                                <tr>
                                    <td>三元表达式</td>
                                    <td>✅<code>`${cond ? a : b}`</code></td>
                                    <td>✅<code>f"{'a' if cond else 'b'}"</code></td>
                                </tr>
                                <tr>
                                    <td>转义字符</td>
                                    <td>✅支持反斜杠</td>
                                    <td>❌大括号内不允许反斜杠，需要变量中转</td>
                                </tr>
                                <tr>
                                    <td>嵌套模板</td>
                                    <td>✅<code>`${`${nested}`}`</code></td>
                                    <td>❌不能嵌套f-string，但可调用格式化函数</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\字面量(数据类型初步认识)_变量_注释\代码\变量案例.py

# 案例：1.现有两个变量，分别为：a = 10, b = 20 ,现需要将这个变量值交换，然后输出到控制台

# 方法一：通过变量的方式。
a, b = 10, 20  # 采用同时赋值的格式
print(f"交换前：a:{a}, b:{b}")
c = a
a = b
b = c
print(f"交换后：a:{a}, b:{b}")
# 原理：新建一个变量(容器)c，存储a或b的值，我是存储a的值，所以，先将b 的值 赋值给a，再将c 的值 赋值给a，最后完成交换。说白了，就是弄一个中间人。

# 方法二：通过交换格式的方式：a,b = b,a
a, b = b, a
print(f"使用方法二再次交换：a:{a}, b:{b}")
# 案例一 结尾

print("案例二：===============================================")
#  案例二：现在在有三个变量，分别为：a_A = 100, b_B = 200 , c_C = 300
# 要求：将这三个变量值进行交换，将a_A , b_B , c_C的值 分别 赋值给 c_C , a_A , b_B，将结果输出在控制台

# 先建立容器存储原始数据
a_A, b_B, c_C = 100, 200, 300
print(f"交换前：a_A:{a_A}, b_B:{b_B}, c_C:{c_C}")
# 方法一：使用中间人的方法
d = a_A     # 中间人1——获取 a_A 的值
e = b_B     # 中间人2——获取 b_B 的值
a_A = c_C   # 将 c_C 的值赋值给       a_A
b_B = d     # 将 a_A 的原始值 赋值给   b_B
c_C = e     # 将 b_B 的原始值 赋值给   c_C
print(f"交换后：a_A:{a_A}, b_B:{b_B}, c_C:{c_C}")
# 方法二 ：使用交换格式方法 a, b, c = c, a, b
a_A, b_B, c_C = c_C , a_A , b_B
print(f"使用方法二再次交换：a_A:{a_A}, b_B:{b_B}, c_C:{c_C}")
# 案例二 结尾


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\字面量(数据类型初步认识)_变量_注释\代码\数据存储与运算——字面量与变量.py

# 整数类型 int
Int = 10

# 浮点数 float
Float = 3.14

# 布尔 bool  本质也是整数类型，它是int类型的子类，进行数学运算，自动以True为1，False为0
bool2 = True
bool3 = False

# 字符串 str
name = "繁华与尘埃"

# 空值 None

# print(None)

# 单行注释
"""
    多
    行
    注
    释
"""

# 变量
Myname = "繁花与尘埃"
age = 20
gender = "男"

# print(f"你好！我叫{Myname}，今年{age}岁，{gender}")

# 变量结尾，作业

"""
    ·课程基础播放量：20.7万
    ·每月新增播放量：50万
    ·求出未来两个月，每个月的总播放量
"""

# 基础播放量
basisViews = 20.7  # basis(基础) views(播放量)
# 新增播放量
addViews = 50


# 第一个月播放总量
oneMonthViews = basisViews + addViews

# 第二个月播放总量
twoMonthViews = oneMonthViews + addViews


print(f"基础播放量：{basisViews}万，第一个月播放量：{oneMonthViews}万，第二个月播放量：{twoMonthViews}万")

# 查询字面量，数据类型
print(type([10,"hello"]))

# 判断是否为既定数据类型
print(isinstance([],list))

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\字面量(数据类型初步认识)_变量_注释\笔记\字面量(数据类型初步认识)_变量_注释.html

**Title:** 数据存储与运算

数据存储与运算

目录

学习笔记

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

<style>
        .contents {
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            padding: 0;
            list-style: none;
        }
    </style>
</head>
<body>
<main>
    <header>
        <h1>数据存储与运算</h1>
    </header>
    <section id="section_1">
        <article>
            <h2 id="目录">目录</h2>
            <ul class="contents">
                <li><a href="#字面量与变量">字面量</a>

<a href="#常见的数据类型">常见数据类型</a>

<h3><a href="#目录">字面量与变量</a></h3>
                    <ol>
                        <li>
                            <h4>字面量</h4>
                            <ul>
                                <li>字面量：<span>指程序中，直接书写的固定值(数据),就称为<span class="span">字面量</span></span>

字面量有许多种类，每个种类的写法不同

<h5 id="常见的数据类型">字面量的种类以及写法</h5>
                                    <div class="div_table">
                                        <table>
                                            <thead>
                                            <tr>
                                                <th colspan="3">字面量类型书写格式</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td rowspan="2">数字类型</td>
                                                <td>整数(<code>int</code>)</td>
                                                <td style="text-align: left">例子：<code>10 18 -5 0</code></td>
                                            </tr>
                                            <tr>
                                                <!--<td></td>-->
                                                <td>浮点数/小数(<code>float</code>)</td>
                                                <td style="text-align: left">例子：<code>8.5 3.14 1.0 -3.5</code></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    布尔(<code>bool</code><span>JavaScript叫(<code>boolean</code>)</span>)
                                                </td>
                                                <td><span>表达现实生活中的逻辑。真或假</span></td>
                                                <td style="text-align: left">
                                                    <span>
                                                        1.python(<span>大写</span>)：</span><code>True/False</code><span>
                                                        <br>2.JavaScript(<span>小写</span>)：<code>true/false</code>
                                                        <br>3.与JavaScript一致，<code>True/true <===> 1</code><br><code>False/false <===> 0</code>
                                                        <br>4.<span>但是 <code>python</code>布尔是(<code>int</code>)类型的子类，它们就是 <code>1/0</code>另外一种写法</span>
                                                        <br>5.<span>而 <code>JavaScript</code>是通过 <span class="span">隐式转换而成 <code>1/0</code></span></span>
                                                        <br>6.这就引出了后续运算符的：
                                                            <br>&nbsp;&nbsp;1)<span>进行数学运算，自动 <code>True 为 1</code>，<code>False 为 0</code></span>
                                                            <br>&nbsp;&nbsp;2)<span>python的<code>==</code>与JavaScript的<code>===/==</code>的区别</span>
                                                     </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    字符串(<code>str</code>)<span>JavaScript叫(<code>String</code>)</span>
                                                </td>
                                                <td><span>描述文本的一种数据类型</span></td>
                                                <td style="text-align: left">
                                                    <code>1.例子："人生苦短，我用python"</code>
                                                    <br>2.<span>所有双引号或单引号包裹的均是 <code>str/String</code>类型</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>空值(<code>NoneType</code><span>注意：与JavaScript的
                                                    <code>undefined/null</code>并不完全相似</span>)
                                                </td>
                                                <td><span>表示空或无值，仅包含一个值 <code>None</code></span></td>
                                                <td style="text-align: left">
                                                    <code>1.None</code>
                                                    <br>2.Python的<span>None</span>更像是<span>null（人为的空）</span>，<br>但
                                                    JavaScript还有<code>undefined（未定义）</code>，<span>None 没有这种双重性</span>。
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>数据容器</td>
                                                <td><span>存储多项数据的容器</span></td>
                                                <td style="text-align: left">
                                                    <span>
                                                            1.列表<code>list</code>：<br><span
                                                            class="span">类似JavaScript的：<code>Array</code>数组</span>
                                                        <br>2.元组<code>tuple</code>：<br><span
                                                            class="span">类似JavaScript的：<code>object.freeze()</code>冻结的数组</span>
                                                        <br>3.集合<code>set</code>：<br><span
                                                            class="span">类似JavaScript的：<code>new Set()</code>无序、元素唯一的数组</span>
                                                        <br>4.字典<code>dict</code>：<br><span
                                                            class="span">类似JavaScript的：<code>object</code>对象</span>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>重要：<span>输出字面量的数据类型发放</span></td>
                                                <td style="text-align: left">
                                                    <code>python</code>：
                                                    <br>1.方法一：<code>type(字面量)</code>，返回值是：<span>该数据的类型，不包括数据自身</span>
                                                    <br>2.方法二：<code>isinstance(数据,类型)</code>,返回值是：<span>布尔值</span>
                                                    <br>3.注意：<span>方法二：有两个参数，第一个为 <span
                                                        class="span">数据</span>，第二位要判断的 <span
                                                        class="span">数据类型</span></span>
                                                    <br>4. <span>python没有 <code>JavaScript</code>需要多个方法配合,<span
                                                        class="span">它的方法可以直接返回具体数据类型和判断</span></span>
                                                </td>
                                                <td style="text-align: left">
                                                    1.在 <code>JavaScript</code>中，输出字面量数据类型
                                                    <span>不是方法也不是属性</span>
                                                    <br>2.<span
                                                        class="span">是一个一元运算符,写法是：<code>typeof 字面量</code>，注意要空格</span>
                                                    <br>3.<span>当然写 <code>typeof(字面量)</code>也不会出问题，但是建议使用第一种</span>
                                                    <br>4.
                                                    <code>typeof</code>，<span>只能解析基本数据类型，但不包括 <code>null</code></span>
                                                    <br>&nbsp;&nbsp;&nbsp;&nbsp;对于
                                                    <code>null、Array、Set、object...</code><span>均返回object</span>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>

<h5>注释</h5>
                                    <div class="div_table">
                                        <table>
                                            <thead>
                                            <tr>
                                                <th colspan="5">注释写法</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>语言</td>
                                                <td colspan="2">单行注释</td>
                                                <td colspan="2">多行注释</td>
                                            </tr>
                                            <tr>
                                                <td><code>python</code></td>
                                                <td><code>#</code></td>
                                                <td style="text-align: left">
                                                    1.例子：<code># 学习python</code>
                                                    <br>2.总结：<span>就是在符号后，当前行内，为注释(不能换行)</span>
                                                </td>
                                                <td><span>三单引号或三双引号</span></td>
                                                <td style="text-align: left">
                                                    1.例子：<code>"""学习python"""或'''学习python'''</code>
                                                    <br>2.总结：<span>只要在符号内，均是注释，可以换行</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><code>JavaScript</code></td>
                                                <td><code>//</code></td>
                                                <td style="text-align: left">
                                                    1.例子：<code>// 学习JavaScript</code>
                                                    <br>2.总结：<span>就是在符号后，当前行内，为注释(不能换行)</span>
                                                </td>
                                                <td><code>/* */</code></td>
                                                <td style="text-align: left">
                                                    1.例子：<code>/* 学习JavaScript */</code>
                                                    <br>2.总结：<span>只要在符号内，均是注释，可以换行</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><code>MySQL</code></td>
                                                <td><code>--</code></td>
                                                <td style="text-align: left">
                                                    1.例子：<code>-- 学习MySQL</code>
                                                    <br>2.<span>注意符号后面必须要有一个空格</span>
                                                    <br>3.总结：<span>就是在符号后，当前行内，为注释(不能换行)</span>
                                                </td>
                                                <td><code>/* */</code></td>
                                                <td style="text-align: left">
                                                    1.例子：<code>/* 学习MySQL */</code>
                                                    <br>2.总结：<span>只要在符号内，均是注释，可以换行</span>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>

<h4>变量</h4>
                            <ul>
                                <li>变量：<span>程序中用来存储<span class="span">单个数据的容器</span>，通常会把<span
                                        class="span">经常发生变化的数据存储在变量中</span></span>

注意：<span>变量是指存储数据的容器(<span class="span">空间</span>)，而不是容器里面存储的数据(<span
                                        class="span">字面量</span>)</span>

<h5>变量的格式</h5>
                                    <div class="div_table">
                                        <table>
                                            <thead>
                                            <tr>
                                                <th colspan="7">变量的格式</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>语言</td>
                                                <td colspan="2">变量格式(<span>单个赋值</span>)</td>
                                                <td colspan="2">变量格式(<span>同时赋值多个变量</span>)</td>
                                                <td colspan="2">交换</td>
                                            </tr>
                                            <tr>
                                                <td><code>python</code></td>
                                                <td>格式：<code>变量名 = 变量值(<span>可以理解为字面量</span>)</code>
                                                </td>
                                                <td style="text-align: left">
                                                    1.例子：<code>name = "繁花与尘埃"</code>
                                                    <br>2.注意：与<code>JavaScript</code>不同的是：<span>它不需要声明</span>
                                                    <br>3. 具体流程是：<span>等号右边的值，赋值给左侧变量名</span>
                                                    <br>4. <span>可以通过重新赋值，更改容器内的数据</span>
                                                    <br>5. <span>当然也可以通过<span class="span">变量名</span>，访问容器内的数据</span>
                                                    <br>6.
                                                    <span>是动态类型语言，一个变量可以<span
                                                            class="span">赋值不同类型的字面量</span>
                                                            <br>但是：在一个项目中，不建议，一个变量存储不同类型字面量，最好新建变量存储。
                                                    </span>
                                                    <br><img src="image/变量/变量演示.png"
                                                             alt="变量演示"
                                                             title="变量演示">
                                                </td>
                                                <td>格式：
                                                    <br>1.<code>变量名,变量名,... = 变量值,变量值,...</code><span>同时赋值多个变量</span>
                                                </td>
                                                <td style="text-align: left">
                                                    1.例子：<code>name,age = "繁花与尘埃",20</code>
                                                    <br>2. <span>赋值顺序与变量名一一对应，如上：<code>name = "繁花与尘埃"，age = 20</code></span>
                                                    <br>3. <span>每一个变量名与变量值，用逗号隔开</span>
                                                </td>
                                                <td style="text-align: left">格式：<code>变量1,变量2 = 变量2,变量1</code>
                                                    <br><span>前提是：变量已赋值</span></td>
                                                <td>例子：<code>a,b = 100,20 <span>[交换==>]</span>a,b = b,a</code></td>
                                            </tr>
                                            <tr>
                                                <td><code>JavaScript</code></td>
                                                <td>格式：<code>声明 变量名 =
                                                    变量值(<span>可以理解为字面量</span>)</code></td>
                                                <td style="text-align: left">
                                                    1.例子：<code>let name = "繁花与尘埃"</code>
                                                    <br>2. 注意：JavaScript声明关键字有3个：<code>let/const/var</code>
                                                    <br>3. 与 <code>python</code>的区别是：<span>他需要先声明</span>
                                                    <br>4. 具体流程是：<span>等号右边的值，赋值给左侧变量名</span>
                                                    <br>5. <span>可以通过重新赋值，更改容器内的数据</span>
                                                    <br>6. <span>当然也可以通过<span class="span">变量名</span>，访问容器内的数据</span>
                                                    <br>7. <span>是动态类型语言，一个变量可以<span class="span">赋值不同类型的字面量</span></span>
                                                </td>
                                                <td style="text-align: left">格式：
                                                    <br>1.<code>声明 [name,age] =
                                                        ["繁花与尘埃",20]</code><span>称为：数组解构</span>
                                                    <br>2.<code>声明 {name,age} = {name:"繁花与尘埃,age:20}</code><span>称为：对象解构</span>
                                                </td>
                                                <td style="text-align: left">
                                                    例子：
                                                    <br>1.<code>let [name,age] = ["繁花与尘埃",20]</code>
                                                    <br>2.<code>let {name,age} = {name:"繁花与尘埃,age:20}</code>
                                                    <br>注意：
                                                    <br>1) <span><code>JavaScript</code>并没有像<code>python</code>一样的创建多个变量的同时分别赋值</span>
                                                    <br>但是：<span>SE6新增了，<span class="span">解构赋值</span>这个概念，使用它可以达到类似的效果</span>
                                                    <br>2)
                                                    常见的解构赋值有：<span>数组解构，对象解构，函数解构，字符串解构，Set解构，Map解构....</span>
                                                </td>
                                                <td style="text-align: left">
                                                    格式：<code>[a,b] = [b,a]</code>
                                                    <br><span>前提是：变量已赋值</span>
                                                </td>
                                                <td style="text-align: left">
                                                    例子：<code>[name,age] = [20,"繁花与尘埃"]<span><br>交换==></span>[name,age]
                                                    = [age,name]</code>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\标识符\代码\数据存储与运算——标识符.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\标识符\笔记\标识符.html

**Title:** 数据存储与运算——标识符

数据存储与运算——标识符

命名规则

补充知识

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>数据存储与运算——标识符</h1>
    </header>
    <section id="section_1">
        <ul id="标识符的规范">
            <li>标识符：<span>是程序员在代码中为变量、函数、类等元素所起的名字</span>

<h2>命名规则</h2>
                <ul id="命名规则">
                    <li>
                        <h3>命名规则——<span>规定</span></h3>
                        <ol>
                            <li>规定：<span>必须遵守，不遵守，会报错</span>

<span>该规定与 <code>JavaScript</code>一致</span>

<ul>
                                    <li><span>最好包含字母(<code>a~z，A~Z</code>)、数字(0~9)、下划线(<code>_</code>)</span>

<span>不能以数字开头</span>

<span>不能使用关键字，如python：<code>(True、False、None、and、or、if、else、elif、for、while....)</code></span>

<span>严格区分大小写，比如：age、Age以及AGE它们都是不同的变量(容器)</span>

建议：<span>不必严格遵守，不遵守，不会报错</span>

<ul>
                                    <li><span>尽量不要中文命名</span>

需要做到：<span>见名知意</span>

<div class="div_table" id="命名开发者约定">
                                            <table class="div_table" style="border-collapse: collapse;">
                                                <thead>
                                                <tr>
                                                    <th colspan="4">开发着社区约定"<span>行规</span>"</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr>
                                                    <td colspan="4">
                                                        <b>同样不必严格遵守——<span>但是开发当中，为了更好的团队协作，建议遵守</span></b>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>命名对象</td>
                                                    <td><code>python(PEP 8)</code></td>
                                                    <td><code>JavaScript</code></td>
                                                    <td>示例</td>
                                                </tr>
                                                <tr>
                                                    <td>变量、函数、方法、模块</td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            蛇形命名法(<code>snake_case</code>)：
                                                            <br>全部小写，单词间用下划线连接
                                                        </span>
                                                    </td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            小驼峰命名法(<code>camelCase</code>):
                                                            <br>首单词小写，后续单词首字母大写
                                                        </span>
                                                    </td>
                                                    <td style="text-align: left">
                                                       <span>
                                                            python：<code>user_name</code>
                                                            <br>JavaScript：<code>userName</code>
                                                       </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>类(<code>Class</code>)</td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            大驼峰/帕斯卡命名法(<code>PascalCase</code>):
                                                            <br>每个单词首字母大写
                                                        </span>
                                                    </td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            大驼峰/帕斯卡命名法(<code>PascalCase</code>):
                                                            <br>每个单词首字母大写
                                                        </span>
                                                    </td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            python：<code>MyNewClass</code>
                                                            <br>JavaScript：<code>MyNewClass</code>
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>常量(<code>Constant</code>)</td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            全大写下划线分割(<code>CONSTANT_CASE</code>):
                                                            <br>全部大写，单词间下划线分割
                                                        </span>
                                                    </td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            全大写下划线分割(<code>CONSTANT_CASE</code>):
                                                            <br>全部大写，单词间下划线分割
                                                        </span>
                                                    </td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            python：<code>MAX_VALUE</code>
                                                            <br>JavaScript：<code>MAX_VALUE</code>
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><span class="span">私有属性/方法</span></td>
                                                    <td>
                                                        <span>
                                                            前缀单下划线(<code>_internal</code>)
                                                        </span>
                                                    </td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            前缀单下划线(<code>_internal</code>):
                                                            <br>社区参考：<code>TypeScript</code>
                                                        </span>
                                                    </td>
                                                    <td style="text-align: left">
                                                        <span>
                                                            python：<code>_private</code>
                                                            <br>JavaScript：<code>_private</code>
                                                        </span>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>



关键字：<code>Error</code><span>表示错误(长见于输出控制台)</span>

关键子：<code>SyntaxError</code><span>表示语法错误</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\输入与输出\代码\输入与输出.py

# 计算自身的BMI值
# BMI  = 体重(公斤) / 身高(米)的平方

# weight = input("请输入体重(公斤)：")
# height = input("请输出身高(米)：")
#
# BMI = float(weight) / float(height) ** 2
#
# print(f"您的身高是：{height}米，体重是：{weight}公斤，BMI值是：{BMI:.2f}")

# 案例2： 需求:小智的银行卡中有10000元，现在到ATM进行取钱操作，请根据输入的金额进行取钱操作
# 要求：取钱完毕后，展示其银行卡余额


money = 10000
password = None
while True:
    if password is None:
        password = input("请输入初始取款密码：")
    else:
        psd = input("请输入取款密码：")
        if password == psd:
            withdraw = input("请输入取款金额：")
            if money < float(withdraw):
                print(f"当前存款：{money}￥，取款：{withdraw}￥，超额，请重新取款")
            else:
                balance = money - float(withdraw)
                print(f"原存款：{money}￥,取款：{withdraw}￥，余额：{balance:.4f}￥")
                break
        else:
            print("取款密码不对，请重新输入密码！！！！")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\输入与输出\笔记\输入与输出.html

**Title:** 输入与输出

输入与输出

输入

输出

JavaScript复习

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>输入与输出</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>
                <h2>输入</h2>
                <ol>
                    <li>输入：<span>将用户输入的数据，存放进一个容器</span>

语句：<code>变量(容器) = input("提示用户输入的内容")</code>

返回值是：<span>用户输入的内容，<span
                            class="span">默认是字符串，所以要进行数学运算，需要转成数字类型(
                            <code>int/float</code>)</span></span>

<h2>输出</h2>
                <ol>
                    <li>输出：<span>将容器(变量)存储的数据，输出到控制台</span>

语句：<code>print()</code>

返回值是：<code>None</code>

注意：<span>输出的只能是字符串，<span
                            class="span">也就说，括号内只能是字符串以及转型成字符串的变量</span></span>

<h3>案例(<span>计算BMI值</span>)</h3>
                <img src="./image/输入输出案例.png"
                     alt="输入输出案例"
                     title="输入输出案例">

<h3>案例(<span>求取款后余额(<code>balance</code>)</span>)</h3>
                <img src="./image/输入输出案例2.png"
                     alt="输入输出案例2"
                     title="输入输出案例2">

<h3>案例(<span>求取款后余额(<code>balance</code>)</span>)——扩展</h3>
                <img src="./image/输入输出案例2——扩展.png"
                     alt="输入输出案例2——扩展"
                     title="输入输出案例2——扩展">

<div class="div_table">
                    <table>
                        <thead>
                        <tr>
                            <th colspan="3">python数据类型之间的转换</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>数据类型</td>
                            <td>语法</td>
                            <td>注意</td>
                        </tr>
                        <tr>
                            <td>字符串(<code>str</code>)类型</td>
                            <td colspan="2">语法：<code>str()</code></td>
                        </tr>
                        <tr>
                            <td>整型(<code>int</code>)</td>
                            <td>语法：<code>int()</code></td>
                            <td><span>当强制转换的是非数字类型，且是浮点型的时候，直接报错</span></td>
                        </tr>
                        <tr>
                            <td>浮点型(<code>float</code>)</td>
                            <td>语法：<code>float()</code></td>
                            <td style="text-align: left"><span>当强制转换的是非数字类型，直接报错(<span
                                    class="span"><br>也就是说：如果是整型不会报错，会自动转成浮点型</span>)</span></td>
                        </tr>
                        <tr>
                            <td>布尔(<code>bool</code>)</td>
                            <td>语法：<code>bool()</code></td>
                            <td>
                                <span>正常情况都会强制转换成<code>True</code></span>
                                <br>遇到一下情况转成<code>False</code>: <code>None、False、零值、空容器</code>
                                <br>但是会通过：<span><code>__bool__</code>或 <code>__len__</code>改变行为</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <span>以上的方法，都是将非对应方法的数据类型，强制转换成对应方法的数据类型</span></td>
                        </tr>
                        </tbody>
                    </table>
                    <table>
                        <thead>
                        <tr>
                            <th colspan="3"><code>JavaScript</code>与<code>python</code>对于<span>整数强转的区别</span></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>输入</td>
                            <td>JavaScript(<code>parseInt()</code>)</td>
                            <td>python(<code>int()</code>)</td>
                        </tr>
                        <tr>
                            <td>浮点数(如 <code>3.14</code>)</td>
                            <td>3</td>
                            <td>3</td>
                        </tr>
                        <tr>
                            <td>字符串(如：<code>"3.14"</code>)</td>
                            <td>3</td>
                            <td>❌ 报错</td>
                        </tr>
                        <tr>
                            <td>字符串(如：<code>"3"</code>)</td>
                            <td>3</td>
                            <td>3</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\运算符\代码\算术运算符.py

# 加法
print("5 + 3 = ", 5 + 3)
print("hello" + "word")
# print("hello" + 5) 报错

# 减法
print("5 - 3 = ", 5 - 3)
# print("5 - 3 = ", "5" - "3") 报错——数值运算，操作数应该是数值类型需要用到 int() 或 float()
print("5 - 3 = ", int("5") - int("3"))

# 乘法
print("5 * 3 = ", 5 * 3)  # 同样操作数必须是数值类型，int() 或 float() 用途： 数值运算
print(" * " * 5)  # 该方法表示，打印 5 个 * ，用途 重复

# 真除 (结果浮点数)
print("5 / 3 = ", 5 / 3)  # 同样操作数必须是数值类型，int() 或 float() 用途： 数值运算

# 整除 (python写法：//) MySQL写法 : DIV()  JavaScript写法：Math.trunc()
# 向下取整(python独有) MySQL、JavaScript 向零取整
print("5 // 3 = ", 5 // 3)  # 同样操作数必须是数值类型，int() 或 float() 用途： 数值运算

# 取余  余数 = 被除数 - 除数 * 商 (同样操作数必须是数值类型，int() 或 float() 用途： 数值运算)
# python向下取整(正数去掉小数，负数整数部分进一位)，正负看除数、MySQL(独有：MOD())、JavaScript向零取整，正负看被除数
print("5 % -3 = ", 5 % -3)  # 商 =  被除数 / 除数
# 商 = 5 / -3 = -1.6666666 向下取整为 -2  向零取整为 -1
# 则 python取余 = 5 - (-3 * -2) = -1 除数为负
# 则 mysql、JavaScript取余 = 5 - (-3 * -1) = 2 被除数为正
print("-5 % 3 = ", -5 % 3)
# 商 向下取整 为 -2 向零取整 为 -1
# 则 python取余 = -5 - (3 * -2) = 1 除数为正
# 则 MySQL、JavaScript取余 = -5 - (3 * -1) = -2 被除数为负
print("5 % 3 = ", 5 % 3)
# 商 = 5 / 3 = 1.6666666 向下取整为 1  向零取整为 1
# 则 python取余 = 5 - (3 * 1) = 2 除数为正
# 则 MySQL、JavaScript取余 = 5 - (3 * 1) = 2 被除数为正
# 结论：被除数与除数同为正，MySQL、JavaScript、python取余结果一致

# 幂运算
print(" 5 ** 3 = ", 5 ** 3)  # 同样操作数必须是数值类型，int() 或 float() 用途： 数值运算

# 赋值 (右边的值赋值给左边的变量)
a = 10
b = "hello"
c = True
d = False
print("a: %s 、 b:%s 、 c:%s 、 d:%s" % (a, b, c, d))  # %s表示占位

# > 、 >= (结果为布尔值，正确为True、否则为False) 严格匹配数据类型，数据类型不一致则为False
print("5 > 5 结果为：", 5 > 5)
print("5 >= 5 结果为：", 5 >= 5)

# < 、 <= (结果为布尔值，正确为True、否则为False) 严格匹配数据类型，数据类型不一致则为False
print("5 < 5 结果为：", 5 < 5)
print("5 <= 5 结果为：", 5 <= 5)

# 相等比较 ==
print('"5" == 5 结果为：', "5" == 5)
print('5 == 5 结果为：', 5 == 5)

# 不相等 !=
print('"5" != 5 结果为：', "5" != 5)
print('5 != 5 结果为：', 5 != 5)

# 身份比较 is，is not 在JavaScript理解为栈 和堆 ，栈负责储存变量——堆负责储存数据，他们之间有内存地址相连。
# 在python中 None是全局唯一，内存地址确定，所以用is，is not判断是否为 None
a = 10
print("a = 10 所以 a is None 的结果为：", a is None)
print("a = 10 所以 a is not None 的结果为：", a is not None)

# and、or 、not(返回结果始终是布尔值) and\or始终与比较运算符以及条件配合，单独使用，按数据本身真值或假值输出
a, b, c, d = 10, 5, 6, 30
print(a > b and a > d)  # 等价于 True and False 通过 逻辑与特性，返回第一个False，所以返回值是False
print(a > d or a > b or a > c)  # 等价于 False or True or True 通过 逻辑或特性，返回第一个True，所以返回值是True
print(not (a > d or a > b or a > c)) # 在 False的基础上取反，结果为True

# in,not in 结果为布尔值
# 检查元素是否在列表或序列中
Array_1 = [1,"hello","10"]

print(f"列表(Array)：[{','.join(map(str, Array_1))}]则50 in Array：{50 in Array_1}")
print(f"列表(Array)：[{','.join(map(str, Array_1))}]则50 in Array：{50 not in Array_1}")

# & 、 | 、 ^ 、~
# & 按位与：二进制：两者都为 1 时结果为 1，否则为 0 集合:交集(多个集合相同元素所组成的新集合)
# | 按位或：二进制：存在1既是1，否则0 集合:并集(多个集合所有元素所组成的新集合(自动去重))
# ~ 按位取反：二进制：1为0，0为1 ~ 不能用于集合（会报错）
# ^ 按位异或：二进制：相同为0，不同为1 集合:对称差集(所有集合中出现奇数次的元素元素所组成的新集合)
# 注意：集合：{}（元素非键值对，而是单个元素） 空列表：set()表示，只能传一个参数，必须是一个可迭代对象。
# 可以通过方法：add()、update()追加元素，add只能单个添加、update()，同样只能传一个参数，必须是可迭代对象。
# 字典(dict)：{key:value}(集合元素为键值对，就是字典)、空字典：{}
# 列表(list)：[1] 空列表：[]
set_1 = {50,30,60,100}   # 注意：位运算符只支持集合，切记不要使用列表、字典
set_2 = {110,50,60,80}  # 注意：位运算符只支持集合，切记不要使用列表、字典
set_3 = {130,5,6,8}  # 注意：位运算符只支持集合，切记不要使用列表、字典
# &
an_wei_yu = 15 & 3 # 15 : 1111 3 : 0011 所以 15 & 3 = 0011 = 3
an_wei_yu_set = set_1 & set_2 & set_3 # 交集
# |
an_wei_huo = 15 | 3 # 1111 = 15
an_wei_huo_set = set_1 |set_2 | set_3
# ^
an_wei_yihuo = 15 ^ 3 # 1100
an_wei_yihuo_set = set_1 ^ set_2 ^ set_3
# ~ 集合没有取反
an_wei_qufan =  ~ 3 # ~3 = -3 - 1
print(an_wei_yu)
print(f"{','.join(map(str,an_wei_yu_set))}")
print(an_wei_huo)
print(','.join(map(str,an_wei_huo_set)))
print(an_wei_yihuo)
print(','.join(map(str,an_wei_yihuo_set)))
print(an_wei_qufan)



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\运算符\代码\运算符案例.py

import math


# 封装函数，判断用户输入的值
def get_float(value):
    while True:
        try:
            number = float(input(value))
            return number
        except ValueError:
            print(f"不是数值类型，请重新输入!!!")


# 案例1：要求输入两个数x与y，分别输出x+y 与 x-y
x = get_float("请输入一个数字，X=")
y = get_float("请输入一个数字，Y=")
print(f"x + y = {x + y}")
print(f"x - y = {x - y}")

# 精度损失：由于计算机底层是基于二级制进行数据的存储和处理，二级制是无法准确的表示所有的小数
# 因此涉及到浮点数的运算，可能会损失精度

# 案例2：计算输入的三个整数的平均数
# 无敌的新发现：同时赋值+input+try-except 可以实现用户每个输入数据的判断。避免重复if-elsif
x = get_float("请输入一个整数，X=")
y = get_float("请输入一个整数，Y=")
z = get_float("请输入一个整数，Z=")
print(f"{x}, {y}, {z} 的平均数 = {(x + y + z) / 3}")

# 案例2：要求输入梯形的上低、下底、高，然后计算梯形的面积
# S梯 = (上底 + 下底) * 高 / 2
upper_base = get_float("请输入一个整数，upperBase=")
lower_base = get_float("请输入一个整数，lowerBase=")
height = get_float("请输入一个整数，height=")
print(
    f"梯形的上底为：{upper_base}cm,下底为：{lower_base}cm,高为：{height}cm,面积为：{(upper_base + lower_base) * height / 2}cm²")

# 案例3：要求输入圆的半径，然后计算圆的周长和面积
# C圆 = 2Πr  S圆 = Πr²
radius = get_float("请输入半径(整数), radius=")
print(f"圆的半径为{radius}cm,C圆 = {2 * math.pi * radius}cm,S圆 = {math.pi * radius ** 2}cm²")

# 案例4：身体质量指数BMI的计算
# BMI = 体重(kg) / 身高(m)²
bmi_weight, bmi_height = get_float("请输入体重(kg)，weight="), get_float("请输入身高(m)：height=")
print(f"您的身高为{bmi_height}m,体重为{bmi_weight}kg,BMI值为{bmi_weight / bmi_height ** 2:.2f}")

# 赋值运算符的示例
num = 10  # 10
num += 10  # 20
num -= 10  # 10
num *= 10  # 100
num /= 10  # 10.0
num //= 10  # 1.0
num %= 10  # 1.0
num **= 10  # 1.0
print(num)


# 案例5：判断一个术是否为偶数 使用 == 运算符
def judge_even():
    even_number = get_float("请输入一个数字：number=")
    if even_number % 2 == 0:
        return f"{even_number}是一个偶数"
    else:
        return f"{even_number}是一个奇数"


print(judge_even())

# 思考1：电商项目的支付功能业务，需要判断银行卡余额是否足够，使用那个关系运算符？ 答：>=
# 思考1：电商项目的购买商品业务，需要判断货物的库存是否足够，使用那个关系运算符？ 答：>=
# 思考1：点餐项目的筛选商品业务，需要不超过100元的，使用那个关系运算符？ 答：<=


# 案例6：键盘输入一个数字，判断这个数字是否在10~20之间
judge_num = get_float("请输入数字,number=")
if 10 < judge_num < 20:
    print("数字在10~20之间")
else:
    print("数字不在10~20之间")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据存储与运算\运算符\笔记\运算符.html

**Title:** 运算符

运算符

算术运算符

赋值运算符

比较运算符

身份运算符

逻辑运算符

成员运算符

位运算符

拓展

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="运算符">
<main>
    <header>
        <h1>运算符</h1>
    </header>
    <section id="section_1">
        <article>
            <div class="div_table">
                <table>
                    <thead>
                    <tr>
                        <th colspan="6" style="font-size: 2.5rem;text-align: left">
                            python没有隐式转换，JavaScript、MySQL有。但是最终，只有<span>操作数均为数值类型</span>
                            才能<span>进行数学运算(<span>请注意：整张表以python为主</span>)</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>运算符</td>
                        <td>作用</td>
                        <td>规则</td>
                        <td>示例</td>
                        <td>结果</td>
                        <td>区别</td>
                    </tr>
                    <tr>
                        <td colspan="6"><h2 style="font-size: 2.5rem;text-align: left">算术运算符</h2></td>
                    </tr>
                    <tr>
                        <td>【<code>+</code>】</td>
                        <td>加法/拼接</td>
                        <td>
                            <ul>
                                <li>两侧同类型：数字相加，字符串拼接

不同类型报错(<code>TypeError</code>)

<a href="#拓展——JavaScript运算特殊规则">拓展——JavaScript运算特殊规则</a>

<a href="#JavaScript隐式转换">JavaScript隐式转换</a>

<a href="#MySQL运算符规则速查表">MySQL运算符规则速查表</a>

<a href="#MySQL隐式转换规则速查表">MySQL隐式转换规则速查表</a>

<span>JavaScript没有取整运算符，但是可以用方法：<code>Math.trunc()</code></span>

同样求余数：<span>-5 % 3 = </span><code>-5 - (3 * ( -5 / 3[<span>向零取整</span>])) =
                                    -5-( 3 * -1) = -2</code>

同样求余数：<span>5 % -3 = </span><code>5 - (-3 * ( 5 / -3[<span>向零取整</span>])) =
                                    5-( -3 * -1) = 2</code>

<span>数值相乘</span>

<span>字符串 * 整数 = 重复</span>

<span>进行字符串重复，必须是整数，否则报错</span>

<span><code>JavaScript</code>的重复运算符不是乘号，而是方法：<code>repeat(数值/纯数字字符串)</code></span>

<span>JavaScript同样只能是整数，但是会隐式转换，小数部分直接截断，相当于方法：<code>Math.trunc()</code>【取整】</span>

<code>3 * 4</code>

<code>'ab' * 3</code>

<span>12</span>

<span>'ababab'</span>

<code>5 // 2</code>

<code>-5 // 2</code>

<span>2</span>

<span>-3(<b>向下取整</b>)</span>

<code>-5 % 3</code>

<code>5 % -3</code>

<code>余数 = 被除数 - 除数*商</code>

<span>注意：python余数符号与除数一致，因为(<b>商向下取整</b>)</span>

<span>JavaScript与MySQL余数正负由被除数决定，因为(<b>商向零取整</b>)</span>

但是：<span>被除数与除数同为正，MySQL、JavaScript、python取余结果一致</span>

<code>-5 % 3 = -5 - (3 ( -5 / 3[<span>向上取整</span>])) = -5 - ( 3 * -2) = 1</code>

<code>5 % -3 = 5 - (-3 (5 / (-3)[<span>向上取整</span>])) = 5 - (-3 * -2) =
                                    -1</code>

<code>5 > 3</code>

<code>2 > 3</code>

<span>True</span>

<span>False</span>

<code>5 > 5</code>

<code>5 >= 5</code>

<span>False</span>

<span>True</span>

<code>5 < 3</code>

<code>2 < 5</code>

<span>False</span>

<span>True</span>

<code>5 < 5</code>

<code>5 <= 5</code>

<span>False</span>

<span>True</span>

左边与右边相等，则返回[<code>True</code>]，否则[<code>False</code>]

调用方法：<code>__eq__</code>

比较范围：<span>内容/值</span>

注意：<span>python没有严格相等符[<code>===</code>]</span>

<code>1 == True</code>

<code>0 == False</code>

<code>1 == 1.0</code>

<span>注意：True和False是int类型的子类</span>

<span>True</span>

<span>True</span>

<span>True</span>

左边与右边不相等，则返回[<code>True</code>]，否则[<code>False</code>]

调用方法：<code>_eq_</code>

比较范围：<span>内容/值</span>

注意：<span>python没有严格<span>不</span>相等符[<code>!==</code>]</span>

<code>1 != True</code>

<code>0 != False</code>

<code>1 != 1.0</code>

<span>False</span>

<span>False</span>

<span>False</span>

比较 <span>内存地址</span>是否相同

判断：<code>id()是否相等</code>

主要判断：<span>内存地址</span>请与比较运算符<code>==</code>区分

内存地址：在JavaScript理解为<span>栈</span>和<span>堆</span>

<span>栈负责储存变量，堆负责储存数据（简化理解，便于类比JS）</span>

在JavaScript中，只有非基本数据类型具备(<span>数组、对象.....</span>)

类似：<span>JavaScript的(<code>===</code>)</span>

<span><code>None</code>全局只有一个对象，用 <span
                                        class="span">身份运算符效果更好</span>，
                                    <br>避免重复建类(_eq_)欺骗，但是 <code>==</code>不会报错</span>

比较 <span>内存地址</span>是否<span>不</span>相同

判断：<code>id()是否<span>不</span>相等</code>

主要判断：<span>内存地址</span>请与比较运算符<code>==</code>区分

类似：<span>JavaScript的(<code>!==</code>)</span>

<span><code>None</code>全局只有一个对象，用 <span
                                        class="span">身份运算符效果更好</span>，
                                    <br>避免重复建类(_eq_)欺骗，但是 <code>!=</code>不会报错</span>

<span>短路求值，返回 <span>决定操作数的结果</span></span>

注意：<span>返回的是操作数而不是布尔值</span>

<code>and</code>两侧是本身是布尔值(<a href="#python的真值与假值">真值或假值</a>)

短路求值：<span>返回第一个假值(本身——操作数)</span>

<ol>
                                        <li>第一种情况：所有操作数<span>均为真</span>，<span
                                                class="span">返回最后一个操作数</span>

第二种情况：<span>存在操作数为假</span>，<span
                                                class="span">返回第一个假值</span>，后续短路(不执行任何操作)

第三种情况：所有操作数<span>均为假</span>，<span
                                                class="span">返回第一个操作数</span>，后续短路(不执行任何操作)

if判断流程：<span>逻辑运算符返回值——if判断真值还是假值——真值执行代码块<span
                                        class="span">/</span>假值继续判断(<code>else/elif</code>)</span>

<code>0 and 5</code>

<code>2 and 3</code>

<span>0</span>

<span>3</span>

<span>短路求值，返回 <span>决定操作数的结果</span></span>

注意：<span>返回的是操作数而不是布尔值</span>

<code>or</code>两侧是本身是布尔值(<a href="#python的真值与假值">真值或假值</a>)

短路求值：<span>返回第一个真值(本身——操作数)</span>

<ol>
                                        <li>第一种情况：所有操作数<span>均为真</span>，<span
                                                class="span">返回第一个操作数</span>

第二种情况：<span>存在操作数为真</span>，<span
                                                class="span">返回第一个真值</span>，后续短路(不执行任何操作)

第三种情况：所有操作数<span>均为假</span>，<span
                                                class="span">返回最后一个操作数</span>，后续短路(不执行任何操作)

if判断流程：<span>逻辑运算符返回值——if判断真值还是假值——真值执行代码块<span
                                        class="span">/</span>假值继续判断(<code>else/elif</code>)</span>

<code>0 or 5</code>

<code>2 or 3</code>

<span>5</span>

<span>2</span>

<span>返回布尔值<code>True/False</code></span>

执行取反操作，真值————>假值，假值——————>真值

注意区分：<span><code>and</code>与<code>or</code>是返回操作数</span>

<code>not 0</code>

<code>not "abc"</code>

<span><code>0</code>是假值(<code>False</code>)所以取反为真值<code>True</code></span>

<span><code>"abc"</code>是真值(<code>True</code>)所以取反为假值<code>False</code></span>

<span>检查元素是否在<span class="span">序列或集合中</span></span>

返回值是布尔值

<code>'a' in 'abc'</code>

<code>5 in [1,2,3]</code>

<span>True</span>

<span>False</span>

<span>检查元素是否<span>不</span>在<span class="span">序列或集合中</span></span>

返回值是布尔值

<code>'a' not in 'abc'</code>

<code>5 not in [1,2,3]</code>

<span>False</span>

<span>True</span>

整数位运算;集合取交集

二进制，单个比较，<span>两者都为 1 时结果为 1，否则为 0</span>

集合取相同部分

<code>5 & 3</code>

<code>{1,2} & {2,3}</code>

<span>5(d) ————>101(2)</span>

<span>3(d) ————>011(2)</span>

所以最后的结果是：<code>001 = 1</code>

<span>{1,2}————1 , 2 两个元素</span>

<span>{2,3}————2 , 3 两个元素</span>

所以最后的结果是：相同元素<code>{2}</code>

整数位运算;集合取并集

二进制，单个比较，<span>有<code>1</code>为<code>1</code>,否则为<code>0</code></span>

集合取所有部分，排除重复

<code>5 | 3</code>

<code>{1,2} | {2,3}</code>

<span>5(d) ————>101(2)</span>

<span>3(d) ————>011(2)</span>

所以最后的结果是：<code>111 = 7</code>

<span>{1,2}————1 , 2 两个元素</span>

<span>{2,3}————2 , 3 两个元素</span>

所以最后的结果是：取所有数，且去重<code>{1,2,3}</code>

整数位运算;集合取对称差集

二进制：<span>相同位0，不同为1</span>

对称差集，保留集合A与集合B，所有独自的元素，去掉相同的

<code>5 ^ 3</code>

<code>{1,2} ^ {2,3}</code>

<span>5(d) ————>101(2)</span>

<span>3(d) ————>011(2)</span>

所以最后的结果是：<code> 110 = 6</code>

<span>{1,2,4,5}————1,2,3,4,5 元素</span>

<span>{2,3.5,6,7}————2,3,5,6,7 元素</span>

所以最后的结果是：取出相同元素<code>{1,4,6,7}</code>

整数位运算，<span class="span">单目运算符</span>（只能有一个操作数，且写在符号右侧）

二进制：<span>0 变 1，1 变 0</span>

在 Python / JavaScript 中：<code>~x == -x - 1</code>（补码规则）

在 MySQL 中：结果按 <span>64 位无符号整数</span> 处理，返回巨大正数

<code>~5</code>

<code>~-3</code>

<code>~0</code>

<span>Python / JS：<code>-6</code></span>

<span>Python / JS：<code>2</code></span>

<span>Python / JS：<code>-1</code></span>

<span>MySQL：巨大无符号整数</span>

JavaScript的隐式转换分为<span>真值(<code>truthy</code>)与假值(<code>falsy</code>)</span>

falsy有：<code>null、undefined、""、0、-0、false、NaN</code>

<div class="div_table">
                        <table>
                            <thead>
                            <tr>
                                <th colspan="4"><span>算术运算中Falsy值的转换规则</span></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Falsy值</td>
                                <td>转换为数字</td>
                                <td>算术运算示例</td>
                                <td>结果</td>
                            </tr>
                            <tr>
                                <td>false</td>
                                <td>0</td>
                                <td><code>false * 10</code></td>
                                <td><span>0</span></td>
                            </tr>
                            <tr>
                                <td>0</td>
                                <td>0</td>
                                <td><code>0 * 10</code></td>
                                <td><span>0</span></td>
                            </tr>
                            <tr>
                                <td>-0</td>
                                <td>-0</td>
                                <td><code>-0 * 10</code></td>
                                <td>-0</td>
                            </tr>
                            <tr>
                                <td>""(<span>空字符串</span>)</td>
                                <td>0</td>
                                <td>"" * 10</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td>null</td>
                                <td>0</td>
                                <td><code>null * 10</code></td>
                                <td><span>0</span></td>
                            </tr>
                            <tr>
                                <td>undefined</td>
                                <td>NaN</td>
                                <td><code>undefined</code></td>
                                <td><span>NaN</span></td>
                            </tr>
                            <tr>
                                <td>NaN</td>
                                <td>NaN</td>
                                <td><code>NaN * 10</code></td>
                                <td><span>NaN</span></td>
                            </tr>
                            <tr>
                                <td colspan="4"><span>除以上Falsy值意外，均是【truthy】</span></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

布尔值本身：<code>False</code>

数字：<code>0、0.0、0j</code>

空字符串：<code>""</code>

<span>空容器：</span>
                                    <ol>
                                        <li>空列表：<code>[]</code>

空元组：<code>()</code>

空字典：<code>{}</code>

空集合：<code>set()</code>

<code>None</code>本身

二进制：
                                <li>二进制：<span>两者都为1时结果为1，否则为0</span>

集合：取交集：<span>集合A与集合B相同的元素，组成的集合</span>

至少两个操作数

二进制：<span>存在<code>1</code>即是<code>1</code>，否则为<code>0</code></span>

集合：取并集：<span>集合A与集合B所有元素，去重组成的集合</span>

至少两个操作数

二进制：<span>相同为<code>0</code>，不同为<code>1</code></span>

集合：取对称差集：<span>取集合A与集合B不相同的元素，组成的集合</span>

至少两个操作数

二进制：<span><code>1</code>为<code>0</code>，<code>0</code>为<code>1</code></span>

集合：取差集(<code>&~</code>)：<span>取集合A中集合B不相同的元素，组成的集合</span>

只有一个操作数，<span>且在符号右边</span>

注意：<span>多个操作数需要(<code>&、|、^</code>~)连接</span>

<span>数学意义：*2ⁿ</span>

编程里真正拿来干啥：<span>造位：把标志放到指定的二进制位</span>

经典场景：<span>权限定义、位掩码</span>

<span>数学意义：÷ 2ⁿ（向下取整）</span>

编程里真正拿来干啥：<span>拆解：把压缩的数据提取出来</span>

经典场景：<span>颜色值解析、协议解码</span>

<span>数学意义：无符号除法</span>

编程里真正拿来干啥：<span>消毒：保证结果是正数</span>

经典场景：<span>数组索引、哈希、数值规范化</span>

<span>就是按位取反的进阶操作</span>

<span>主要是先取反，然后选取需要的操作数，主要与集合搭配使用：
                                        <br>差集：只保留符号左边集合，但符合右边集合中没有的元素</span>

<code>(expressions.....)</code>

<code>[expressions.....]</code>

<code>{key:value.....}</code>

<code>{expressions.....}</code>

括号

列表

字典

集合显示

<code>x[index]</code>

<code>x[index:index]</code>

<code>x[arguments....]</code>

<code>x.attribute</code>

下标

切片

调用

属性访问

a[0]

boj.name

<code>in、not in</code>

<code>is、is not</code>

<code><、<=</code>

<code>>、>=</code>

<code>!=、==</code>

比较

身份

成员检查

x in y

x is None

5 > 3

(支持链式：a < b < c)【<span>python独有</span>】

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——元组tuple\数据容器——元组tuple-基本操作\代码\数据容器——元组tuple-基本操作.py

# 定义空元组
tuple1 = ()
tuple2 = tuple()

# 定义空列表
list1 = []
# list2 = list[] 不行

# 定义空字符串
str1 = ""
str2 = str()

tuple3 = (5, 20, 5, 6, 565, 254, 5, 1, 5, 6, 5, 2, 4, ["hello", "tuple"], {"你好": "数组"})
# 获取元组内的元素：
print(tuple3[-1:-3:-1])

# 反转元组
print(tuple3[::-1])

# 使用方法：count():  count(tuple,value)
print(f"5在元组中出现：{tuple3.count(5)}次")

# 使用方法：index(): index(tuple,value)
print(f"5在元组中，索引为：[{tuple3.index(5)}]第一次出现")

tuple4 = (100,)
tuple5 = ("hello",)
print(type(tuple4))
print(type(tuple5))
# 错误示范：

# tuple3[0] = 100  元组不能修改，不能重新赋值


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——元组tuple\数据容器——元组tuple-基本操作\笔记\数据容器——元组tuple-基本操作.html

**Title:** 元组tuple-基本操作

元组tuple-基本操作

元组概念

Python 元组 vs JavaScript 数组（模拟元组）完整对比表

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>元组tuple-基本操作</h1>
    </header>
    <section id="section_1">
        <h2>元组概念</h2>
        <ul>
            <li>列表特点：<span>元素可重复、有序、可以修改的</span>

字符串特点：<span>一个字符串内可以有多个字符，且能重复、有序、不可以修改、只能是字符、不能是其他数据容器</span>

元组介绍：<span>元组是<span class="span">不可变</span>的序列，类似于列表、但创建后不能修改</span>

<h3>元组特点</h3>
                <ol>
                    <li>可以存储不同类型的元素

元素可以：<span>重复、有序(<span class="span">支持索引访问、切片</span>)、不可以修改</span>

定义：列表：<code>列表名 = [元素1, 元素2, ...]</code>、元组：<code>元组名 = (元素1, 元素2,
                        ...)</code>

定义空元组：<code>元组名 = ()</code>，也可以：<code>元组名 = tuple()</code>

定义空列表：<code>列表名 = []</code>，但是列表没有：<code>列表名 = list[]</code>

定义空字符串：<code>字面量 = ""(<span>不要有空格</span>)，也可以：<code>字面量 =
                        str()</code></code>

方法一、<code>count(slef,value)</code>：<span>统计某元素在元组中出现的次数</span>

方法二、<code>index(self,value)</code>：<span>查找某个元素在元组中的索引位置(<span
                            class="span">第一次出现的位置</span>)</span>

方法两种形式：<code>字面量.count(value)</code>/<code>count(字面量,value)</code>

当定义元组且只有一个元素：<code>字面量 = (100)/ 字面量 = ("hello")</code>，这种写法，<span>定义不是元组，而是数据本身的数据类型</span>

解决上述问题,只需要在<span>元素后加一个英文逗号</span>即可：<code>字面量 = (100<code>,</code>)/
                        字面量 = ("hello"<code>,</code>)</code>

<img src="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/数据容器/数据容器——元组tuple/数据容器——元组tuple-基本操作/笔记/image/问你题-元素定义单个元素.png"
                             alt="问题-元素定义单个元素"
                             title="问题-元素定义单个元素" style="display: block">
                        <img src="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/数据容器/数据容器——元组tuple/数据容器——元组tuple-基本操作/笔记/image/解决：定义单个元素，数据容器问题.png"
                             alt="解决：定义单个元素，数据容器问题"
                             title="解决：定义单个元素，数据容器问题" style="display: block">

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——元组tuple\数据容器——元组tuple-案例\数据容器——元组tuple-案例.py

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


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——元组tuple\数据容器——元组tuple-组包与解包\代码\数据容器——元组tuple-组包与解包.py

# 定义列表，组包
lst1 = [50, 30, 60, 100]

# lst2 = 50, 30, 60, 100 这是定义元组的方式
# print(type(lst2))

# 列表解包
a, b, c, d = lst1
print(a, b, c, d)

# 使用扩展运算符解包：* ,兜底机制，将多余元素，重新组包成列表
x, *y, z = lst1
print(x, y, z)

e, *f = lst1
print(e, f)

*g, h = lst1
print(g, h)

# 定义字符串，组包
str1 = str("hello,python")
str2 = "H" + "E" + "L" + "O"  # 使用加号组成字符串，执行的拼接操作，而不是组包
print(str1, str2)

# 字符串——基础解包
text, text1, text2, text3 = str2
print(text, text1, text2, text3)

# 字符串解包——使用扩展运算符解包
i, *j, k = str2
print(i, j, k)

l, *m = str1
print(l, m)

*n, o = str1
print(n, o)

# 定义元组，组包
tuple1 = (10, 30, 50, 100)
tuple2 = 10, 50, 100, 30

# 基础解包
A, B, C, D = tuple1
print(A, B, C, D)

# 扩展运算符解包：
E, *F, G = tuple2
print(E, F, G)

H,*I = tuple1
print(H, I)

*J,K = tuple2
print(J, K)


"""
    总结：
        组包：  
            列表只有一种方法(字面量 = [元素1, 元素2, ...])、
            字符串只有一种(字面量 = "字符") 注意： 字面量 = "字符" + "字符" + ... 执行的是字符串拼接操作，不是组包
            元组有两种(字面量 = (元素1, 元素2, ...)) 和 字面量 = 值1, 值2, ...
        解包：
            所有容器通用：
                    基础解包：
              *扩展运算符解包：  
                        1.扩展运算符在字面量前面，那个字面量就会接收剩余所有元素，然后组包成列表
                        2.扩展运算符在最前面(*字面量, 字面量2 ... = 容器)：先分配(*)以外的字面量，容器元素从右往左按顺序字面量从右往左赋值，最后多余元素，重新组包成列表
                        3.扩展运算符在最中间(字面量, *字面量2, 字面量3 ... = 容器)：先分配(*)以外的字面量,以扩展运算符为中心，左边，容器元素从左往右按顺序字面从左往右赋值，右边，容器元素从右往左按顺字面量从右往左赋值，最后多余元素，重新组包成列表
                        4.扩展运算符在最后面(字面量, ..., *字面量2 = 容器)：先分配(*)以外的字面量，容器元素从左往右按顺序字面量从左往右赋值，最后多余元素，重新组包成列表
                        5.总结：
                            1.始终最后分配：先把其他变量分配完，* 再接收剩余的部分。
                            2.以 * 为基准：* 在左边，就从左往右取；* 在右边，就从右往左取。

"""

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——元组tuple\数据容器——元组tuple-组包与解包\笔记\数据容器——元组tuple-组包与解包.html

**Title:** 元组tuple-组包与解包

元组tuple-组包与解包

组包与解包概念

关于容器的组包操作

关于容器解包操作

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>元组tuple-组包与解包</h1>
    </header>
    <section id="section_1">
        <h2>组包与解包概念</h2>
        <ul>
            <li>组包(<code>Packing</code>)：<span>将多个值合并到一个容器(元组、列表)中</span>

解包(<code>Unpacking</code>)：<span>将容器(元组、列表)解开成独立的元素，分别赋值给多个变量</span>

解包高阶操作：<code>*</code>：<span>扩展运算符</span>

<a href="../../../数据容器——列表list/数据容器——列表list-解包/笔记/数据容器——列表list-解包.html">列表list-解包</a>

<img src="./image/解包与组包详解.png"
                     alt="解包与组包详解"
                     title="解包与组包详解">

列表只有一种方法(<code>字面量 = [元素1, 元素2, ...])</code>

字符串只有一种(<code>字面量 = "字符"</code>) <span>注意： <code>字面量 = "字符" + "字符" + ...</code>
                执行的是字符串拼接操作，不是组包</span>

元组有两种 (<code>字面量 = (元素1, 元素2, ...)</code>)和<code>字面量 = 值1, 值2, ...</code>

<h3>基础解包：</h3>
                <ol>
                    <li><code>字面量1, 字面量2, ... = 容器</code>

<span> 注意：字面量的数量 = 容器元素数量 否则报错</span>

<h3>扩展运算符(<code>[*]</code>)解包</h3>
                <ol>
                    <li><span>扩展运算符在字面量前面，那个字面量就会接收剩余所有元素，然后组包成列表</span>

<span>扩展运算符在最前面(<code>*字面量, 字面量2 ... = 容器</code>)：先分配(<code>*</code>)以外的字面量，容器元素从右往左按顺序<span
                            class="span">字面量从右往左赋值</span>，最后多余元素，重新组包成列表</span>

<span>扩展运算符在最中间(<code>字面量, *字面量2, 字面量3 ... = 容器</code>)：先分配(<code>*</code>)以外的字面量,以扩展运算符为中心，<span
                                class="span">左边，容器元素从左往右按顺序字面从左往右赋值</span>，右边，容器元素从右往左按顺字面量从右往左赋值，最后多余元素，重新组包成列表</span>

<span>扩展运算符在最后面(<code>字面量, ..., *字面量2 = 容器</code>)：先分配(<code>*</code>)以外的字面量，容器元素从左往右按顺序<span
                            class="span">字面量从左往右赋值</span>，最后多余元素，重新组包成列表</span>

<h4>总结</h4>
                        <ul>
                            <li><span>始终最后分配：先把其他变量分配完，<code>*</code> 再接收剩余的部分</span>

<span>以 * 为基准：<code>*</code> 在左边，就从左往右取；<code>*</code> 在右边，就从右往左取。</span>

<h3>解包与解包同时操作(<span>也叫合并</span>)</h3>
                <ol>
                    <li><code>c, b, a = a, b, c</code>

具体的工作流程：<code>a = 100, b = 200, c =300</code>
                        <br>
                        <code>
                            先组包：t = a, b, c # <span>那么：t = (100,200,300)</span>
                            <br>再解包: c, a, b = t # <span>对应的：c=100，a=200, b=300</span>
                            <br>那么成功的将：<code>a = c = 100, b = a = 200, c = b = 300</code>进行了交换
                            <br>既然都是t作为中间变量，其实可以省略为：<code>c, b, a = a, b, c</code>这即使组包与解包的合并
                        </code>

说白了就是：<span>先将右边的值，临时组包成元组，再解包赋值给左侧</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\对比表——list与Array具体区别\对比表——list与Array具体区别.html

**Title:** 对比表——list与Array具体区别

对比表——list与Array具体区别

<code>python</code>列表VS<code>JavaScript</code>数组 <span>完整对比表</span>

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>对比表——list与Array具体区别</h1>
    </header>
    <section id="section_1">
        <div class="div_table">
            <table>
                <tr>
                    <th colspan="3"><h2><code>python</code>列表VS<code>JavaScript</code>数组 <span>完整对比表</span>
                    </h2>
                    </th>
                </tr>
                <tr>
                    <td colspan="3"><h3>一、<span>类型与定义</span></h3></td>
                </tr>
                <tr>
                    <td>维度</td>
                    <td><code>python</code>列表</td>
                    <td><code>JavaScript</code>数组</td>
                </tr>
                <tr>
                    <td>本质</td>
                    <td>内置数据类型</td>
                    <td>内置对象(<code>Array</code>)</td>
                </tr>
                <tr>
                    <td>定义方式</td>
                    <td><code>lst = [1, 2, 3]</code></td>
                    <td><code>let arr = [1, 2, 3]</code></td>
                </tr>
                <tr>
                    <td>长度获取</td>
                    <td><code>len(lst)</code></td>
                    <td><code>arr.length</code></td>
                </tr>
                <tr>
                    <td>是否支持不同类型</td>
                    <td><span>✅ 支持混合类型</span></td>
                    <td><span>✅ 支持混合类型</span></td>
                </tr>
                <tr>
                    <td colspan="3"><h3>二、<span>索引机制</span></h3></td>
                </tr>
                <tr>
                    <td>维度</td>
                    <td><code>python</code>列表</td>
                    <td><code>JavaScript</code>数组</td>
                </tr>
                <tr>
                    <td>正向索引</td>
                    <td><span>✅ 从 0 开始</span></td>
                    <td><span>✅ 从 0 开始</span></td>
                </tr>
                <tr>
                    <td>反向索引</td>
                    <td><span class="span">✅ 支持（-1 表示最后一个）</span></td>
                    <td><span class="span">❌ 不支持（直接用 -1 会访问键名为 "-1" 的属性）</span></td>
                </tr>
                <tr>
                    <td>索引类型</td>
                    <td><span>必须是整数</span></td>
                    <td><span>自动转为字符串属性名(<span class="span">因为是对象</span>)</span></td>
                </tr>
                <tr>
                    <td>越界访问(<span>指的的是：访问不存在的索引</span>)</td>
                    <td>报错：<code>IndexError</code></td>
                    <td>返回：<code>undefined</code>，不报错</td>
                </tr>
                <tr>
                    <td colspan="3"><h3>三、<span>数据类型与存储</span></h3></td>
                </tr>
                <tr>
                    <td>维度</td>
                    <td><code>python</code>列表</td>
                    <td><code>JavaScript</code>数组</td>
                </tr>
                <tr>
                    <td>元素类型</td>
                    <td><span>任意类型混合</span></td>
                    <td><span>任意类型混合</span></td>
                </tr>
                <tr>
                    <td>索引本质</td>
                    <td><span class="span">整数位置偏移</span></td>
                    <td><span class="span">字符串属性名(<span>后台转换</span>)</span></td>
                </tr>
                <tr>
                    <td>内存结构</td>
                    <td><span>连续存储</span></td>
                    <td><span>对象 + 特殊<code>length</code>属性</span></td>
                </tr>
                <tr>
                    <td colspan="3"><h3>四、<span>可变性</span></h3></td>
                </tr>
                <tr>
                    <td>维度</td>
                    <td><code>python</code>列表</td>
                    <td><code>JavaScript</code>数组</td>
                </tr>
                <tr>
                    <td>元素可变</td>
                    <td>✅ 是</td>
                    <td>✅ 是</td>
                </tr>
                <tr>
                    <td>长度可变</td>
                    <td>✅ 是</td>
                    <td>✅ 是</td>
                </tr>
                <tr>
                    <td>赋值边界</td>
                    <td><span>索引必须存在，否则报错</span></td>
                    <td><span>索引不存在会自动扩展，中间补<code>empty</code></span></td>
                </tr>
                <tr>
                    <td colspan="3"><h3>五、<span>增操作</span></h3></td>
                </tr>
                <tr>
                    <td>操作</td>
                    <td><code>python</code>列表</td>
                    <td><code>JavaScript</code>数组</td>
                </tr>
                <tr>
                    <td>末尾添加单个元素</td>
                    <td>
                        <ul>
                            <li><code>append(x)</code>

<span>整体添加，可迭代对象为一个元素</span>

<span>更改原列表，无返回值</span>

<span>只能接收一个参数</span>

<code>push(item, item2...)</code>
                                <ul>
                                    <li><span>可以添加多个元素，均在末尾按顺序逐个添加</span>

<span>非展开添加，可迭代对象为一个元素</span>

<span>无返回值，更改原数组</span>

<code>push(...arr)</code>
                                <ol>
                                    <li><code>...</code>JavaScript的扩展运算符

与python的<code>*/**</code>类似

在这理解就是：<span>将可迭代对象拆开，然后逐个添加</span>

<span>更改原数组</span>

<code>insert(index, item)</code>

<span>整体添加，可迭代对象为一个元素</span>

<span>更改原列表</span>

<code>splice(start,deleteCount)</code>：
                                <br>&nbsp;&nbsp;&nbsp;&nbsp;<span>从<code>start</code>删除 <code>deleteCount</code>个元素</span>

<code>splice(start,deleteCount, item, item2...)</code>：
                                <br>&nbsp;&nbsp;&nbsp;&nbsp;<span>从<code>start</code>删除 <code>deleteCount</code>个元素,然后逐个添加元素<code>item</code></span>

<code>splice(start, 0, item, item2...)</code>：
                                <br>&nbsp;&nbsp;&nbsp;&nbsp;<span>从 <code>start</code>后，逐个插入元素<code>item</code>不删除元素</span>

<code>splice(start)</code>:
                                <br>&nbsp;&nbsp;&nbsp;&nbsp;<span>删除<code>start</code>后所有元素</span>

<span>一般情况，第二个参数 <code>deleteCount</code>不能忽略，但是<code>splice(start)</code>例外</span>

<span class="span">更改原数组</span>

<code>push(...arr)</code>更改原数组，无返回值

<code>concat()</code>创建新数组对象，不更改原数组，有返回值

start：<span>起始索引</span>

deleteCount：<span>需要删除元素的个数</span>

记住没有：<code>delete slice()</code>这个概念

升序：<code>sort()</code>(原地)数字排序，容器内必须是数字类型

降序：<code>sort(reverse = True)</code>(原地)数字排序，容器内必须是数字类型

升序：<code>sort((a, b) => a - b)</code>数字升序

降序：<code>sort((a, b) => b - a)</code>数字降序

<code>index(item)</code>

<span>只会返回第一个匹配值的索引。</span>

<code>indexOf(item, start)/findIndexOf(item. start)</code>

findIndexOf()：反向操作，从后往前查找

indexOf：<code>start</code>可以省略，主要是以索引(<code>start</code>)开始往后查找

findIndexOf：<code>start</code>可以省略，主要是以索引(<code>start</code>)开始往前查找

<span>只会返回第一个匹配值的索引。</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-介绍\代码\数据容器——列表list-介绍.py

score = [90, False, "hello", ["list2"], ("元组", "tuple"), {"集合", "set"}, {"字典": "dict"}, 80, True]
print(score[-9])
print(score[0])
print(score[-1])
print(score[8])

print("=" * 60)
# 可以遍历
for item in score:
    print(item)
    print(type(item))
    print("=" * 60)

del score[8]
print(score)




## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-介绍\笔记\数据容器——列表list-介绍.html

**Title:** 列表list——介绍

列表list——介绍

课堂笔记

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>列表list——介绍</h1>
    </header>
    <section id="section_1">
        <h2>课堂笔记</h2>
        <ul>
            <li>列表是<span>数据容器中的一类，是支持<span class="span">一次性存储多个数据(元素)</span></span>

定义(<span>语法</span>)：<code>列表名称 = [元素1, 元素2, 元素3, 元素4, 元素5...]</code>

具体示例：<code>score = [90, 100, 100, 90, 100, 80]</code>

<h3>特点</h3>
                <ol>
                    <li><span>可以存储不同类型的元素——包容已知所有数据类型(<code>str、int、float、bool、None、list、dict、set、tuple...</code>)</span>

<span>元素可重复，可更改，有序</span>

可重复：<span>可以存储相同的元素</span>

可更改：<span>可以通过方法，更改对应的元素</span>

有序(<span>理解为有索引[<span class="span">也叫下标</span>]概念</span>)：<span>意味者可以通过索引找到对应的值，顺序与存储的先后顺序一致，通常与方法配合执行(<span>增、删、改、查</span>操作)</span>

<span>正向索引从左到右，依次自增，从(<code>0</code>)开始</span>

<span>反向索引从右到左，依次自减，从(<code>-1</code>)开始</span>

<img src="./image/索引的正向与反向.png"
                             alt="索引的正向与反向"
                             title="索引的正向与反向">

重点：<span>容器中的元素按特定顺序排列的，可通过索引访问的容器类型称之为序列</span>

注意：<span>从前向后(正向索引)，下标从<code>0</code>开始，从后往前(反向索引)</span>，下表从
                        <code>-1</code>开始

<span>如果指定的索引值超出范围，将会报错</span>

访问元素办法：<code>列表名[下标]</code>

修改元素办法：<code>列表名[下标] = 新值</code>

删除元素办法：<code>del 列表名[下标]</code><span>注意空格</span>

<a href="#">增加列表元素</a>

<h4>遍历列表</h4>
                        <code>

                            ·score = [90, False, "hello", ["list2"], ("元组", "tuple"), {"集合", "set"}, {"字典":
                            "dict"}, 80, True]
                            <br>·for item in score:
                            <br>&nbsp;&nbsp;print(item)
                        </code>
                        <img src="./image/列表的改、查、删.png"
                             alt="列表的改、查、删"
                             title="列表的改、查、删">

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-切片\代码\数据容器——列表list-切片.py

list_1 = [90, False, "hello", ["list2"], ("元组", "tuple"), {"集合", "set"}, {"字典": "dict"}, 80, True]

# 获取列表总长度
lengs = len(list_1)
print(lengs)  # 9

# 切片 [-9:6]
print(list_1[-9:6])
# 按步骤来：[-9:6] = [0:6] 0 < 6 ，且步长为正，则切片不为空。从左往右，左闭右开
# [-9:6] = [0:6] = [90, False, "hello", ["list2"], ("元组", "tuple"), {"集合", "set"}]
# {"集合", "set"} 是一个集合(set)顺序可能会被打乱

# 切片 [6:-8:-1]
print(list_1[6:-8:-1])
# 按步骤来：[6:-8:-1] = [6:1:-1] 6 > 1 ，且步长为负数，则切片不为空，从右往左，左闭右开
# [6:-8:-1] = [6:1:-1] = [{"字典": "dict"}, {"集合", "set"}, ("元组", "tuple"), ["list2"], "hello"]
# {"集合", "set"} 是一个集合(set)顺序可能会被打乱

# 以上案例，步长相反，即是空切片
print(list_1[-9:6:-1])
# 按步骤来：[-9:6:-1] = [0:6] 0 < 6 ，且步长为负数，则切片为空
print(list_1[6:-8])
# 按步骤来：[6:-8] = [6:1:-1] 6 < 1 ，且步长为正，则切片为空


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-切片\笔记\数据容器——列表list-切片.html

**Title:** 列表list-切片

列表list-切片

课堂笔记

切片的作用

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="切片">
<main>
    <header>
        <h1>列表list-切片</h1>
    </header>
    <section id="section_1">
        <h2>课堂笔记</h2>
        <ul>
            <li>切片：<span>是对操作的数据截取其中一部分的操作。</span>

语法：<code>字面量 = 原容器[起始索引 : 结束索引 : 步长]</code>

与<code>range</code>一样，<span>包前不包后，左闭右开</span>

<span>开始索引未指定默认是<code>0</code></span>

<span>结束索引未指定默认是<span class="span">容器长度</span></span>

步长默认是：<code>1</code>，<span>当步长设置为<code>0</code>直接报错</span>

特殊写法：<code>::</code>、<code>0:</code>都表示切片整个列表，正向。<code>::-1</code>表示切片整个列表，并反向

可以切片的的容器必须是：<span>有序(支持下标)的</span>

所以可切片的容器有：<code>list、tuple、str、(以及 range
                等序列类型）</code>，不能切片的有：<code>dict、set(<span>无序的</span>)</code>

<h3>自行总结，关于切片的知识</h3>
                <ul>
                    <li>
                        <h4>步骤一：</h4>
                        <ol>
                            <li>
                                计算机关于切片的工作原理：<span>会先将起始索引和结束索引，转成正向索引，步长不变</span>

公式1：<span>正向索引 = 正向索引</span>

公式2：<span>正向索引 = 容器长度 + 反向索引</span>

<h4>步骤二(判断是否为空切片)：</h4>
                        <ol>
                            <li>
                                都理解为正向索引后：

<span>起始索引 > 结束索引，步长为正数，且切片不与原列表产生任何交集，则为空切片(<span
                                        class="span">切片容器与原容器一致</span>)</span>

<span>起始索引 < 结束索引，步长为负数，且切片不与原列表产生任何交集，则为空切片(<span
                                        class="span">切片容器与原容器一致</span>)</span>

当切片范围被裁剪后为空<code>即起始索引 == 结束索引</code> ）时，返回空列表。

<h4>步骤三(推算出切片内元素)：</h4>
                        <ol>
                            <li>
                                <span>起始索引 > 结束索引，且步长为为负数，则从起始索引开始往左按顺序，直到结束索引停止(<span
                                        class="span">注意左闭右开</span>)</span>

<span>起始索引 < 结束索引，且步长为为正数，则从起始索引开始往右按顺序，直到结束索引停止(<span
                                        class="span">注意左闭右开</span>)</span>

总结：<span>切片取值时，先裁剪索引到有效边界。如果裁剪后的范围不为空，则返回交集部分；如果裁剪后的范围为空，则返回空列表。</span>

<img src="./image/切片补充.png"
                     alt="切片补充"
                     title="切片补充">
                <img src="./image/切片运行.png"
                     alt="切片运行"
                     title="切片运行">

单纯使用切片，打印，结果是原列表被切的部分

当访问切片后，又重新赋值

情况一：<span>重新赋值的元素与切片元素，数量一致，则按顺序重新给切片依次重新赋值，[视觉效果(<span>原列表长度与原来一致</span>)]</span>

情况二：<span>重新赋值的元素与切片元素，数量不一致，完全替换，<br>多的情况[视觉效果(<span>原列表长度增加</span>)]、<br>少的情况[视觉效果(<span>原列表长度减少</span>)]</span>

<span>其实只要理解：<span class="span">切片重新赋值后，将完全替换原列表的切片部分</span></span>

<span>切片赋值会先删除切片范围内的元素，然后在同一位置插入新元素。 这也是为什么长度会变化的原因</span>

<span>重新赋值，更改原列表，没有返回值</span>

<span>切片取值：完全超出范围时返回空列表，不会报错。</span>

<span>切片赋值：如果切片范围完全超出列表边界，会报错（因为赋值操作会尝试在不存在的位置插入元素）。[<code>indexError: cannot assign to a slice that is completely out of bounds</code>]</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-列表推导式\代码\数据容器——列表list-列表推导式.py

# 案例一：
#   1.生成1-20的平方列表
#   2.从如下数字列表中提取所有偶数，并计算其平方，组成一个新的列表

num_list1 = [num ** 2 for num in range(1, 21)]
print(num_list1)
print([num ** 2 for num in num_list1 if num % 2 == 0])

# 案例二：
# 将下列多个列表合并为一个列表，并去重复元素，排好序(升序)后输出到控制台
# list1 = ['M', 'A', 'C', 'E', 'F', 'G', 'H', 'L', 'N', 'I', 'J', 'K', 'O']
# list1 = ['X', 'Z', 'T', 'Y', 'D', 'E', 'F', 'G']
# list1 = ['w', 'A', 'S', 'D']
list1 = ['M', 'A', 'C', 'E', 'F', 'G', 'H', 'L', 'N', 'I', 'J', 'K', 'O']
list1_2 = ['X', 'Z', 'T', 'Y', 'D', 'E', 'F', 'G']
list1_3 = ['W', 'A', 'S', 'D']

new_list = [*list1, *list1_2, *list1_3]
# new_list = [num for num  in new_list if num not in ] # 列表推导式不适合去重环境
new_list = list(dict.fromkeys(new_list))
new_list.sort()
print(new_list)

# 案例三：将如下列表中能被3 或 5 整除的元素提取出来，并获取这些数字对应的平方，组成一个新的列表
# list = [1, 2, 3, ..., 30 ]
num_list = [num for num in range(1, 31)]
new_list = [num ** 2 for num in num_list if num % 3 == 0 or num % 5 == 0]
print(new_list)

# 案例四：将如下列表中的正数提取出来，封装为一个新的列表
# num_list = [11, 2, 31, 4, -5, 15, 17, 28, 49, 10, -11, 16, 54, -14, 36, -16, 87, -39]
num_list = [11, 2, 31, 4, -5, 15, 17, 28, 49, 10, -11, 16, 54, -14, 36, -16, 87, -39]
print(f"原列表(正负混合)：\n{num_list}")
new_list = [num for num in num_list if num > 0]
new_list.sort(reverse=True)
print(f"过去负数后：\n{new_list}")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-列表推导式\笔记\数据容器——列表list-列表推导式.html

**Title:** 数据容器——列表list-列表推导式

数据容器——列表list-列表推导式

列表推导式

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>数据容器——列表list-列表推导式</h1>
    </header>
    <section id="section_1">
        <h2>列表推导式</h2>
        <ol>
            <li>语法：<code>[表达式 for x in 可迭代对象 if 条件]</code>

如：<code>[x ** 2 for x in list_1 if x % 2 == 0]</code>

等价于：
                <code style="display: block">
                    <br>list_1 = [30, 31, 50, 20, 40, 33, 11]
                    <br>list_2 = []
                    <br>for x in list_1:
                    <br>&nbsp;&nbsp;if x % 2 == 0:
                    <br>&nbsp;&nbsp; &nbsp;&nbsp;list_2.append(x ** 2)
                </code>

其中<span>表达式的结果就是列表的元素</span>

说白了，<span>就是将遍历、判断、输出结果压缩，一行写完</span>

比起单纯的<code>for</code>循环，<span>代码更简介、易懂</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-方法\代码\数据容器——列表list-方法-案例.py

# 将用户输入的10个数字，存储到一个列表中，
# 并将列表中的数字进行排序，输出其中的最小值、最大值和平均值

list_1 = []
for count in range(10): # 确定循环次数使用for-range()循环，不确定循环次数使用while循环
    try: # 异常处理：try-expect ValueError
        num = float(input(f"请输入第({count + 1})个数字，num="))
        list_1.append(num) # 将用户输入的数字，添加进列表，在try内确保输出的是数字
    except ValueError:
        print("请输入数字！！!") # 显示错误的原因
        continue # 输入错误，不终止循环。

if list_1:
    list_1.sort() # 升序排序
    sums = sum(list_1) # sum() : 求和方法
    print(f"输入的最小值是：{list_1[0]}，最大值是：{list_1[-1]}，平均值是：{sums/len(list_1):.2f}")

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-方法\代码\数据容器——列表list-方法.py

list_1 = [90, False, "hello", ["list2"], ("元组", "tuple"), {"集合", "set"}, {"字典": "dict"}, 80, True]

# 获取列表长度
leng = len(list_1)
print(f"原列表：\n    {list_1},\n    列表长度：{leng}")

print()
print("============================增删改查方法=====================")

# 改操作 :
# 1.索引赋值 ：访问索引，索引必须存在(否则报错)，重新赋值
list_1[0] = 80
print(f"执行改操作(将索引0重新赋值)：\n     {list_1}")
# 2.切片赋值：写入切片范围，
# 情况一：切片范围均在或部分在原列表内，则更改源列表内的元素：(部分在原列表内，则替换在原列表内的元素，超出部分直接忽略)
#       如果切片内的元素数量 = 重新赋值元素数量，则逐一替换，原列表长度不变
#       如果切片内的元素数量 < 重新赋值元素数量，则按顺序替换，未被替换部分直接删除，原列表长度减少
#       如果切片内的元素数量 > 重新赋值元素数量，则按顺序替换，多余部分直接插入原列表，原列表长度增加
# 情况二：切牌你范围均不在原列表内:
#       直接报错[indexError: cannot assign to a slice that is completely out of bounds]
list_1[-3:8] = [{"学习改操作": "切片赋值"}]
print(f"执行改操作(切片赋值：[-3:8],赋值元素少于切片元素)：\n    {list_1}，\n    原列表长度：{leng},现在列表长度：{len(list_1)}")

# 查操作：
# 1.索引查找：访问索引，索引必须存在(否则报错)，返回值就是索引对应元素，可以直接打印，或使用字面量接收
print(f"执行查操作(查找索引为0的元素)：\n    {list_1[0]}")
# 2.切片查找：定义切片范围，情况一：当定义的切片范围，一部分在原列表内，则只会查找在列表内的部分。情况二：切片范围完全不在列表内，则返回空切片。返回值是切片内所有元素，可以直接打印，或使用字面量接收
print(f"执行查操作(查找切片范围为：[-7:0,-1]内的元素)：\n    {list_1[-7:0:-1]}")

# 增操作：
# 方法一：append() 特点：列表末尾添加，传参是啥就是啥，不做任何改变吗，没有返回值，会更改原来列表
list_1.append(["Hello", "我使用方法：append()，执行增操作", "我们是一个整体，是一个列表", "我没有返回值", "会更改原列表"])
print(f"使用方法：append(),执行增操作：\n    {list_1},\n    原列表长度：{leng},现在列表长度：{len(list_1)}")
# 方法二：insert() 特点：指定元素之前添加，传参是啥就是啥，不做任何改变，没有返回值，会更改原来列表
list_1.insert(1,
              ["Hello", "我使用方法：insert()，执行增操作", "我们是一个整体，是一个列表", "我没有返回值", "会更改原列表"])
print(f"使用方法：insert(),执行增操作：\n    {list_1},\n    原列表长度：{leng},现在列表长度：{len(list_1)}")

# 方法三：extend() 特点：列表末尾添加，传参必须是可迭代对象，数字不是可迭代对象，先遍历，然后逐个末尾添加，没有返回值，会更改原来列表
list_1.extend(
    ["Hello", "我使用方法：extend()，执行增操作", "我们不是一个整体，原本是一个列表", "我没有返回值", "会更改原列表"])
print(f"使用方法：insert(),执行增操作：\n    {list_1},\n     原列表长度：{leng + 1},现在列表长度：{len(list_1)}")

leng = len(list_1)

# 删操作：
# 方法一：remove() 特点：删除第一个匹配传参的值，没有返回值，更改原列表，元素必须存在，否则报错
list_1.remove("hello")
print(f"使用方法：remove()——实参是'hello',执行删除操作：\n    {list_1},\n    原列表长度：{leng},现在列表长度：{len(list_1)}")

# 方法二： pop() 特点：删除指定索引的元素，如果不传参则默认删除最后一个元素，只能是索引，不能是切片，返回值是删除的元素，更改原列表
leng = len(list_1)
removes = list_1.pop(1)
print(
    f"使用方法：pop()——删除索引为1的元素,执行删除操作：\n    {list_1} \n    删除的元素是：{removes} \n    原列表长度：{leng},现在列表长度：{len(list_1)}")

# 方法三： del 索引 : 索引必须存在，否则报错 indexError
leng = len(list_1)
del list_1[0]
print(f"使用方法：del 删除索引为0的元素,执行删除操作：\n    {list_1} \n    原列表长度：{leng},现在列表长度：{len(list_1)}")

# 方法四：del 切片 ：删除切片范围内的元素。情况一：切片范围有部分在原列表内，则删除在原列表内的部分。
# 情况二：当切片范围完全不在原列表内，不会执行任何操作。
# 没有返回值，更改原列表
leng = len(list_1)
del list_1[-1:-6:-1]  # 正向切片相同写法 ：[11,6,-1]
print(f"使用方法：del 删除切片[-1:-6,-1]的元素,执行删除操作：\n    {list_1} \n    原列表长度：{leng},现在列表长度：{len(list_1)}")

# 方法五：clear() ：清除列表内的所有元素。原列表存在，变为空列表，没有返回值，更改原列表
leng = len(list_1)
list_1.clear()
print(f"使用方法：clear() 清除列表内所有的元素,执行删除操作：\n    {list_1} \n    原列表长度：{leng},现在列表长度：{len(list_1)}")

# 方法六：clear() : 直接删除列表，该列表永久消失
del list_1
# print(list_1) 直接报错：name 'list_1' is not defined. Did you mean: 'list'? 名字为 list_1 的列表未定义

print()
print()
print()

# 除增删改查以外的列表方法
num = [20, 60, 30, 40, 1, 60, 20, 60, 80, 60]
score = [{"语文": 100}, {"数学": 100}, {"英语": 100}]
print("============================除增删改查以外的列表方法==============================")
# 反转列表：无返回值，更改原列表
print(f"原列表：{score}")
score.reverse()
print(f"使用方法：reverse()，反转列表后 \n    {score}")

# 正序排序：无返回值，更改原列表
print(f"原列表：{num}")
num.sort()
print(f"使用方法：sort()，正序排序 \n    {num}")

# 反序排序：无返回值，更改原列表
num.sort(reverse=True)
print(f"使用方法：sort(reverse = True)，反序排序 \n    {num}")

# 计数 返回值为个数, 不更改原列表
count =  num.count(60)
print(f"使用方法，count()，计列表内60的个数： \n    列表{num} \n    60有{count}个")

# 某个元素第一次出现的索引
index = num.index(60)
print(f"使用方法，index()，查找元素60第一次出现的索引 \n    列表{num} \n    60第一次出现的索引是：{index}")

# 拷贝原列表：
num2 = num.copy()
print(f"原列表num:\n    {num} \n 拷贝列表num: \n    {num2}")
num2.clear()
print(f"原列表num:\n    {num} \n为拷贝列表使用方法：clear(): \n    {num2}，可见不会影响原列表")



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-方法\笔记\数据容器——列表list-方法.html

**Title:** 列表list——方法

列表list——方法

课堂笔记

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>列表list——方法</h1>
    </header>
    <section id="section_1">
        <h2>课堂笔记</h2>
        <ul>
            <li>列表的方法主要是：<span>列表的(<span class="span">增操作以及删操作</span>)</span>

列表的改操作和查操作已经学完：
                <br><span>改操作：(<code>列表名[索引] = 新值</code>[<span>索引必须小于容器长度，否则报错</span>])</span>
                <br><span>查操作1：(<code>列表名[索引]</code>[<span>索引必须小于容器长度，否则报错</span>])</span>
                <br><span>查操作2：(<code>列表名[切片]</code>[<span>具体返回值以切片决定</span>])</span>

<h3>关于增操作的方法</h3>
                <ol>
                    <li>
                        <h4>append()</h4>
                        <ul>
                            <li><span>在列表末尾<span class="span">添加一个元素</span></span>

语法：<code>列表名.append(元素)</code>

<h5>注意</h5>
                                <ol>
                                    <li>添加的是单个元素

<span>所以：如果传参的是：<span class="span">列表、字典、元组、集合</span>都视为一个元素，是一个整体放入列表末尾</span>

示例：
                                        <br><code>s = [50, 30, 60, 80]</code>
                                        <br><code>s.append([80,70])</code>
                                        <br><code>print(s)</code>
                                        <br>最后的结果是：<code>[50, 30, 60, 80, [80, 70]]</code>

<span>该方法没有返回值，是直接更改原列表。</span>

<h4>insert()</h4>
                        <ul>
                            <li><span>在指定索引位置<span class="span">插入一个元素</span></span>

语法：<code>列表名.insert(索引, 元素)</code>

<h5>注意</h5>
                                <ol>
                                    <li>添加的是单个元素

<span>所以：如果传参的是：<span class="span">列表、字典、元组、集合</span>都视为一个元素，是一个整体放入列表末尾</span>

与<code>append()</code>的唯一区别就是指定索引插入

示例：
                                        <br><code>s = [50, 30, 60, 80]</code>
                                        <br><code>s.insert(2,{"方法":“insert()”})</code>
                                        <br><code>print(s)</code>
                                        <br>最后的结果是：<code>[50, 30, 60, {"方法":“insert()”}, 80]</code>

<span>该方法没有返回值，是直接更改原列表。</span>

<h4>extend()</h4>
                        <ul>
                            <li><span>在末尾添加<span class="span">多个个元素</span></span>

语法：<code>列表名.extend(元素)</code>

<h5>注意</h5>
                                <ol>
                                    <li>可以添加多个元素

方法操作流程：<span>遍历元素，逐个末尾添加</span>

<span>所以：当传参的是：<span
                                                class="span">列表、字典、元组、集合... 任何可迭代对象时，就与<code>append()</code>有了本质区别</span></span>

<ul>
                                            <li>列表：<span>列表内元素被迭代，逐个插入指定列表</span>

字典：<span>字典迭代后返回值默认是：键，所以是键名逐个插入</span>

字符串：<span>字符串遍历后，单个字符逐个插入</span>

<span>元组和集合与列表一致</span>

提前接触字典方法：<code>values()<span>返回字典所有值</span>、keys()<span>返回字典所有键</span>、items()
                                                <span>返回所有键值对(<span
                                                        class="span">是不可变的元组</span>)</span>所以：</code>
                                                <ol>
                                                    <li><code>列表.extend(字典.keys()) → 逐个添加键</code>

<code>列表.extend(字典.values()) → 逐个添加值</code>

<code>列表.extend(字典.items()) →
                                                        逐个添加键值对（作为元组）</code>

示例：
                                        <br><code>s = [50, 30, 60, 80]</code>
                                        <br><code>s.extend([50, 60])</code>
                                        <br><code>print(s)</code>
                                        <br>最后的结果是：<code>[50, 30, 60, 80, 50, 60]</code>

<span>元素必须是可迭代对象(iterable)，<span
                                            class="span">数字不是可迭代对象，会直接报错(<code>TypeError: 'int' object is not iterable</code>)</span></span>

与<code>append()</code>的唯一区别就是
                                        <code>append</code>整体插入，<code>extend()</code>先遍历，再逐个插入

<span>该方法没有返回值，是直接更改原列表。</span>

<h3>关于删除操作</h3>
                <div class="div_table">
                    <table>
                        <tr>
                            <th colspan="2"><h4>列表删除元素方法：<code>del/clear()/remove()/pop()</code></h4></th>
                            <th colspan="2"><code>lst = [1, 2, 3, 4, 5]</code></th>
                        </tr>
                        <tr>
                            <td>操作</td>
                            <td>作用</td>
                            <td>示例</td>
                            <td>结果</td>
                        </tr>
                        <tr>
                            <td><code>del 列表[索引]</code></td>
                            <td>删除指定位置的索引</td>
                            <td><code>del lst[2]</code></td>
                            <td><code>[1, 2, 4, 5]</code></td>
                        </tr>
                        <tr>
                            <td><code>del 列表[切片]</code></td>
                            <td>删除指定范围内的元素</td>
                            <td><code>del lst[1:3]</code></td>
                            <td><code>[1, 4, 5]</code></td>
                        </tr>
                        <tr>
                            <td><code>列表.clear()</code></td>
                            <td>清空列表所有元素</td>
                            <td><code>lst.clear()</code></td>
                            <td><code>[]</code></td>
                        </tr>
                        <tr>
                            <td><code>del 列表</code></td>
                            <td>删除整个列表对象</td>
                            <td><code>del 列表</code></td>
                            <td>列表不再存在</td>
                        </tr>
                        <tr>
                            <td><code>列表.remove()</code></td>
                            <td>
                                <ul>
                                    <li>移除列表中第一个匹配的值

<span>注意会影响原容器长度[<span class="span">更改原列表</span>]</span>

<span>如果元素不存在，会抛出 ValueError</span>

删除列表中指定索引位置的元素

如果未指定索引，默认删除最后一个

注意：<span>会更改数组长度[<span class="span">更改原列表</span>]</span>

<span>只能是索引，不能是切片</span>

有返回值：<span>返回值是删除的元素</span>

<div class="div_table">
                    <table>
                        <tr>
                            <th colspan="5">关于列表方法进阶操作</th>
                        </tr>
                        <tr>
                            <td>方法</td>
                            <td>作用</td>
                            <td>返回值</td>
                            <td>是否改变原列表</td>
                            <td>注意事项</td>
                        </tr>
                        <tr>
                            <td><code>index(x)</code></td>
                            <td>查找元素 <code>x</code> 第一次出现的索引</td>
                            <td>整数（索引值）</td>
                            <td>❌ 不改变原列表</td>
                            <td>元素不存在时抛出 <code>ValueError</code></td>
                        </tr>
                        <tr>
                            <td><code>count(x)</code></td>
                            <td>统计元素 <code>x</code> 出现的次数</td>
                            <td>整数</td>
                            <td>❌ 不改变原列表</td>
                            <td>不存在时返回 <code>0</code>，不报错</td>
                        </tr>
                        <tr>
                            <td><code>sort()</code></td>
                            <td>对列表进行原地排序</td>
                            <td><code>None</code></td>
                            <td>✅ 改变原列表</td>
                            <td>
                                <ul>
                                    <li>元素类型必须可比较，否则报错

默认升序

降序：<code>列表.sort(reverse = True)</code>

按要求升序：<code>列表.sort(key=def,reverse = False)</code><span>key默认<code>None</code>，reverse默认<code>False</code></span>

按要求降序：<code>列表.sort(key=def,reverse =
                                        True)</code><span>key默认<code>None</code>，reverse默认<code>False</code></span>

<h3>综合实践</h3>
                <img src="./image/代码运行截图合并.png"
                     alt="代码运行截图合并"
                     title="代码运行截图合并">

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-解包\代码\数据容器——列表list-解包.py

# 案例：合并两个列表中的元素，并对合并的结果进行去重处理(去除列表中的重复元素)
# num_list1 = [19, 23, 54 ,64, 875, 20, 100, 232, 123, 54]
# num_list1 = [55, 80, 72, 35, 60, 123, 54, 54, 29, 91, 123, 19]
# 方法一：extend合并列表，缺点：更改原列表，无返回值 + set()方法去重
num_list1 = [19, 23, 54, 64, 875, 20, 100, 232, 123, 54]
num_list2 = [55, 80, 72, 35, 60, 123, 54, 54, 29, 91, 123, 19]

num_list1.extend(num_list2)
print(f"去重前：{num_list1}")
num_list1 = list(set(num_list1))  # set()将容器变为集合, 再list()变为列表，有返回值，需要变量接收
print(f"去重后：{num_list1}")

# 方法二：使用解包方法合并数组 好处：不更改原列表 ，有返回值，需要变量接受 + set()方法去重
num_list1 = [19, 23, 54, 64, 875, 20, 100, 232, 123, 54]
num_list2 = [55, 80, 72, 35, 60, 123, 54, 54, 29, 91, 123, 19]

num_list3 = [*num_list1, *num_list2]
print(f"去重前：{num_list3}")
num_list3 = list(set(num_list3))  # set()将容器变为集合, 再list()变为列表，有返回值，需要变量接收
print(f"去重后：{num_list3}")

# 方法三：使用for循环遍历合并数组，(非常不建议) + for循环和 not in 运算符手动去重
for nun in num_list2:
    num_list1.append(nun)

print(f"去重前：{num_list1}")

num_list3 = []
for num in num_list1:
    if num not in num_list3:  # 检查是否已经存在
        num_list3.append(num)  # 不存在才添加
print(f"去重后：{num_list3}")

# 方法四：使用解包合并列表 , 使用字典的键不能重复的规则去重
# 列表转字典，元素必须是呈现键值对的形式，否则报错
# 可以使用zip()序列方法，将两个列表，组成类似元组。
# zip() ：将两个容器内的元素进行索引匹配，形成元组(索引1，索引1),当一方索引到底时，停止匹配。
# 使用方法：fromkeys()，将容器内的所有元素，直接当作键处理
# 字典转列表：list(dict())——默认键为元素 list(dict.keys())——键为元素 list(dict.values())——值为元素 list(dict.item())——键与值组成的元组为元素
num_list1 = [19, 23, 54, 64, 875, 20, 100, 232, 123, 54]
num_list2 = [55, 80, 72, 35, 60, 123, 54, 54, 29, 91, 123, 19]

num_list3 = [*num_list1, *num_list2]
print(f"去重前：{num_list3}")
# num_list3 = list(dict(zip(num_list3,num_list3)))
num_list3 = list(dict.fromkeys(num_list3))
print(f"去重后：{num_list3}")

# 总结：
""""
    去重：
        如果顺序不重要 → 用 list(set(data))
        如果顺序重要 → 用 list(dict.fromkeys(data))
        如果是学习练习 → 用 for + not in
        其他变体（如 zip）可以了解，但不作为常规选择
"""
"""
    合并列表：
        方法：extend():更改原列表，无返回值。切记不要使用：append()与insert()
        解包：(*列表1，*列表2...) ：不更改原列表,有返回值需要变量接收，切记不能遗漏：*
        for循环：可以使用copy()+for循环的方式，达到不更改原列表合并的目的
"""


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——列表list\数据容器——列表list-解包\笔记\数据容器——列表list-解包.html

**Title:** 列表list-解包

列表list-解包

解包概念

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>列表list-解包</h1>
    </header>
    <section id="section_1">
        <h2>解包概念</h2>
        <ul>
            <li>解包本质：<span>将一个可迭代对象(如:列表、元组)中的元素，按位置————赋值给多个变量</span>

<h3>最简单的解包形式</h3>
                <ol>
                    <li>右侧的容器被"拆开"，里面的每个元素依次赋值给左侧的变量

<code style="display: block">如：
                            <br># 元组解包
                            <br>a, b, c = (1, 2, 3)
                            <br># a=1, b=2, c=3
                            <br>
                            <br># 列表解包
                            <br>x, y = [10, 20]
                            <br># x=10, y=20
                        </code>

<h4>左侧变量数量必须等于右侧容器元素数量，否则会报错</h4>
                        如：<code style="display: block">a, b = [1, 2, 3] # ValueError: too many values to unpack</code>

<h4>适用于任何可迭代对象：<span>列表、元组、字符串、集合、字典(<span class="span">解包的是键</span>)等</span>
                        </h4>
                        如：<code style="display: block">first, second, third = "abc" # first='a', second='b',
                        third='c'</code>

<h4><code>*</code>可以收集多余元素(<span>打包成列表</span>)</h4>
                        <br><span style="display: block">先将左右分配完，<code>*</code>左边就按正序分，<code>*</code>右边就按倒序分，*最后将剩余元素，重新打包成列表</span>
                        <br><span style="display: block">同一个解包，不能出现多个<code>*</code>不然会报错</span>
                        如：<code style="display: block">first, *middle, last = [1, 2, 3, 4, 5]
                        <br># first=1, middle=[2,3,4], last=5</code>

<div class="div_table">
                            <table>
                                <tr>
                                    <th colspan="3"><code>*</code>的两种用法</th>
                                </tr>
                                <tr>
                                    <td>位置</td>
                                    <td>用途</td>
                                    <td>示例</td>
                                </tr>
                                <tr>
                                    <td><span>左侧（解包赋值）</span></td>
                                    <td>收集剩余元素</td>
                                    <td><code>first, *middle, last = [1,2,3,4,5]</code></td>
                                </tr>
                                <tr>
                                    <td><span>右侧（列表/元组字面量）</span></td>
                                    <td>展开可迭代对象</td>
                                    <td><code>[*list1, *list2]</code></td>
                                </tr>
                                <tr><td colspan="3"><span>右侧的 * 在 Python 3.5+ 中引入，主要用于将多个列表合并成一个新列表。它的优势是保持原列表不变，同时可以灵活地插入多个元素</span></td></tr>
                            </table>
                        </div>

<h4>变量交换(无需中间变量)</h4>
                        如：<code style="display: block">a, b = b, a</code>

<h4>函数返回多个值</h4>
                        如：<code style="display: block">name, age = get_user_info()</code>

<h4>遍历字典(同时获取键和值)</h4>
                        如：<code style="display: block">for key, value in dict.items():
                        <br>&nbsp;&nbsp;print(key, value)</code>

解包本质就是"<span>批量赋值</span>"，它让代码更简洁，也让数据的提取和分配更直观。

<span>在处理列表、元组、字典频繁使用</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字典dict\数据容器——字典dict-介绍\代码\数据容器——字典dict-介绍.py

dict1 = dict()
dict2 = {}
print(type(dict1))
print(dict1)

print(type(dict2))
print(dict2)

dict3 = {20:"hello", (50,40):"word"}

print(dict3[(50,40)])

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字典dict\数据容器——字典dict-介绍\笔记\数据容器——字典dict-介绍.html

**Title:** 字典dict-介绍

字典dict-介绍

字典的特点

字典的注意事项

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>字典dict-介绍</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>现实字典本意：<span>通过[<span class="span">字/词语</span>]，找到对应的 [<span
                    class="span">解释</span>]</span>

在<code>python</code>中字典：<span>【字/词语】定义为 【<span class="span">键</span>】，【解释】定义为 【<span
                    class="span">值</span>】</span>

<span>所以，字典的元素称为 【<span class="span">键值对</span>】，通过 【<span class="span">键</span>】访问对应的【<span
                    class="span">值</span>】</span>

<h2>字典的特点</h2>
                <ol>
                    <li>定义字典：<code>字面量 = {key:value,key:value, ...}</code>

定义空字典：<code>字面量 = dict()<span>或</span>字面量 = {}</code>

字典存储的是：<span>键值对——<code>key:value</code>，<code>key</code>:键、<code>value</code>：值</span>

<span>通过键，访问对应的值</span>

<span>键值对存储、键不能重复、可修改、值可以是任何数据类型</span>

<span>键必须是唯一的，同一个字典，不能出现两个或多个完全相同的键</span>

<span>字典的键，必须是可(<span class="span">哈希的</span>)</span>

<span>哈希值：它是通过算法：<span class="span">哈希函数</span>计算出来的，哈希值是唯一的</span>

<span>每当定义一个键，就会执行一次函数，存储哈希值，<span class="span">每当访问一个键，会先将键转哈希值，然后通过哈希值，查找对应的值</span></span>

已知哈希值必须是不变的，所以可哈希的有：<span>字符串、元组(内部元素必须不可变)、数字</span>,不可哈希的有：<span>列表、集合</span>

值：<span>与变量值一致，可以是任何数据类型、容器</span>

总结来说：<span>键——哈希值：<span class="span">就是值的身份证</span>，通过身份证找到对应的值、而每个人的身份证都不一致，所以键——哈希值也是唯一，不能随意更改的</span>

<span>不能通过下标访问，字典没有序列</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字典dict\数据容器——字典dict-常规操作\代码\数据容器——字典dict-常规操作.py

# 定义空字典
dict1 = {}

dict2 = dict()
print(f"{dict1}")
# 增操作 字面量[key] = 值   注意：字典不是序列，但是有序
dict1["学习"], dict1["姓名"] = "字典", "小明"
print(f"执行增操作：{dict1}")

# 改操作  字面量[key] = 新值
dict1["姓名"] = "小红"
print(f"执行改操作：{dict1}")

# 删操作 字面量.pop(key) 注意：有返回值(键所对应的值)，需要字面量接收，或直接使用
remove = dict1.pop("学习")
print(f"使用(pop())方法删除：{dict1},返回值是：{remove}")

del dict1["姓名"]  # 删除指定键值对，直接删除，没有返回值
print(f"使用(del 字面量[key])：{dict1}")

# del dict 直接删除指定字典对象
del dict1
try:
    print(dict1)
except NameError:
    print("需要打印的对象：dict1 不存在")

# 查
new_dict = {"姓名": "小红", "班级": "21软件三班", "专业": "软件技术", "python": 85, "JavaScript": "89", "MySQL": 90}

# 方法一：字面量[key] 查找 ： 指定查找，当键不存在，会报错
print(f"myName is {new_dict["姓名"]}")

# 错误示范：new_dict["数学"]

# 方法二：字面量.get(key) 插值 ：指定查找，当键不存在返回None，不会报错
print(f"我的数学成绩是：{new_dict.get("数学")}")

# 方法三：字面量，keys() 查找 ： 查找所有键，特点：返回的是视图，原字典更新，视图也会实时更新
keys = new_dict.keys()
print(f"字典：{new_dict}\n所有的键是：\n\t{keys}")

# 方法四：字面量.values() 查找 : 查找所有值，特点：返回的是视图，原字典更新，视图也会实时更新
values = new_dict.values()
print(f"字典：{new_dict}\n所有的值是：\n\t{values}")

# 方法五：字面量.items() 查找 : 查找所有键值对，特点：返回的是视图，原字典更新，视图也会实时更新，类似数组：(keys,values)
items = new_dict.items()
print(f"字典：{new_dict}\n所有的键值对是：\n\t{items}")

# 其他方法

# 查询：键值对是否存在 ： 使用方法：setdefault(keys, default)查找键是否存在，是返回对应值，否则返回默认值-default
real = new_dict.setdefault("数学", "不存在")
print(f"使用方法：setdefault()查找键是否存在，\n数学键 ：{real}")

# 合并字典：update()，相同键被覆盖  字典1.update(字典2) 字典1 合并 字典2 字典1的键 会被 字典2相同键 覆盖
# 会更改原字典
new_dict2 = {"数学": 70, "英语": 75, "姓名": "宵夜"}

new_dict.update(new_dict2)
print(f"使用方法(update())合并字典：\n\t{new_dict}")

# 批量生成键，组成字典 ： dict.fromkeys(iterable, value) iterable必须是可迭代，容器内元素均为键，所以注意：可哈希。 默认值为：value
list_1 = [50, "姓名", "姓名", ("你好", "使用方法：dict,fromkeys创建字典")]
new_dict2 = dict.fromkeys(list_1, "默认值") # 可以利用字典键不可重复特性，去重
print(f"使用方法：dict.fromkeys()生成字典：\n\t{new_dict2}")

# 使用方法：popitem() 删除最后一个键值对，并返回对应的键值对 3.7+ 最后一个，之前随机
items = new_dict2.popitem()
print(f"使用方法：popitem()，删除最后一个键值对，\n\t删除后：{new_dict2} \n\t被删除的键值对是：{items}")

# 清空字典 ： clear()
new_dict2.clear()
print(f"使用方法：clear() 清空字典：{new_dict2}")

# 拷贝 ： copy()
new_dict2 = new_dict.copy()
print(f"使用方法：copy() 浅拷贝new_dict \n\t{new_dict2}")

# for循环遍历
for key, value in new_dict.items(): # 遍历所有键值对，通过解包赋值给多个变量
    print(f"{key}: {value}")


# 判断键是否在字典内 ： key in dict 返回值是布尔值
print(f"通过：in 判断键是否在字典内：\n'数学' in new_dict : {'数学' in new_dict}")

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字典dict\数据容器——字典dict-常规操作\笔记\数据容器——字典dict-常规操作.html

**Title:** 字典dict-常规操作

字典dict-常规操作

创建字典

字典的<span>增删改查</span>

其他知识点补充

Python 字典 vs JavaScript 对象 vs Map 完整对比表

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>字典dict-常规操作</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>
                <h2>创建字典</h2>
                <ol>
                    <li>非空字典：<code>字面量 = {key:value, key:value, key:value ...}</code>

空字典：<code>字面量 = {}</code>/ <code>字面量 = dict()</code>

往指定字典中添加<code>key-value</code>键值对

<span>键在原列表必须不存在，否则修改操作</span>

修改字典中指定的<code>key</code>对应的值

<span>键必须存在，否则就是添加操作</span>

<span>通过键访问(查询)对应的值</span>

注意：<span>键必须存在，否则报错</span>

<span>通过键访问(查询)对应的值</span>

注意：<span class="span">键不是必须存在，当键不存在不会报错</span>

<span>获取所有的键(<code>key</code>)，并返回动态视图</span>

动态视图<span>目前暂定理解为字典方法(<code>keys()、values()、items()</code>)存在</span>

动态视图(<code>keys()</code>)：<span>与字典的变化而产生变化，当原字典的<span>键</span>更改，动态视图会实时更新</span>

可以直接理解为：<span>实时查看所有键</span>

<span>获取所有的值(<code>values</code>)，并返回动态视图</span>

动态视图<span>目前暂定理解为字典方法(<code>keys()、values()、items()</code>)存在</span>

动态视图(<code>values()</code>):<span>与字典的变化而产生变化，当原字典<span class="span">值</span>更改，动态视图会实时更新</span>

可以直接理解为：<span>实时查看所有值</span>

<span>获取所有的键值对(<code>key:values</code>)，并返回动态视图</span>

动态视图<span>目前暂定理解为字典方法(<code>keys()、values()、items()</code>)存在</span>

动态视图(<code>values()</code>):<span>与字典的变化而产生变化，当原字典<span class="span">值、键</span>更改，动态视图会实时更新</span>

可以直接理解为：<span>实时查看所有键值对(<span class="span">但是是以元组形式：<code>(key,value)</code></span>)</span>

<span>元组本身无法修改，但是视图是字典的一个动态窗口，它会随字典的变化而实时更新。</span>

<span>字典不是序列，但是有序(<span class="span">与插入的顺序一致</span>)</span>

<div class="div_table">
                    <table>
                        <tr>
                            <th colspan="2">其他二级常考方法</th>
                        </tr>
                        <tr>
                            <td>方法</td>
                            <td>作用</td>
                        </tr>
                        <tr>
                            <td><code>dict.setdefault(key, default)</code></td>
                            <td><span>如果键存在，返回对应的值；<span
                                    class="span">如果不存在，插入键并设置默认值</span></span></td>
                        </tr>
                        <tr>
                            <td><code>dict1.update(dict2)</code></td>
                            <td><span>合并另一个字典到当前字典(<span class="span">有相同键则覆盖</span>)</span></td>
                        </tr>
                        <tr>
                            <td><code>dict_new = dict.romkeys(iterable, value)</code></td>
                            <td>
                                <ol>
                                    <li><span>从可迭代对象创建字典，所有键共享一个初始值:<code>value</code>，注意：iterable内的元素，均是键</span>

它是一个类方法，dict类中，必须是：<code>dict.fromkeys(keys, 默认值)</code>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字典dict\数据容器——字典dict-案例\数据容器——字典dict-案例.py

"""
    案例：开发一个购物车管理系统，实现商品信息的添加、修改、删除、查询功能。
        系统使用字典结构存储商品数据，通过控制台菜单与用户交互。具体功能如下。
"""


# 购物车信息：商品名称，数量，价格
class ShoppingCar:
    def __init__(self, wares, price, quantity):
        self.商品名称 = wares
        self.价格 = price
        self.数量 = quantity

    def add_shopping(self):
        shop_dict = {self.商品名称: {"价格": self.价格, "数量": self.数量}}  # 当前情况，最好使用二维字典。符合实际应用
        return shop_dict


def judge_number(num1, num2):
    try:
        num1, num2 = float(num1), float(num2)
        return num1, num2
    except ValueError:
        return None


shopping_list = []


def shopping():
    while True:
        print(
            f"\t本系统是一个购物车管理系统功能如下(按输入的编号使用对应功能，第一次添加商品，会默认执行一次添加商品操作)："
            f"\n\t\t1.添加商品\t2.修改商品\t3.删除商品\t4.查询购物车\t5.退出购物车")
        operation = input("请输出您要执行的操作：operation=")
        if operation == "1" or len(shopping_list) == 0:
            wares_add = input("请输入需要购买的商品：wares=")
            price_add = input("请输入商品价格， price=")
            quantity_add = input("请输入商品购买数量，quantity=")
            result = judge_number(price_add, quantity_add)
            if result:
                shopping_add = ShoppingCar(wares_add, *result)
                shopping_list.append(shopping_add.add_shopping())
            else:
                print("商品价格与金额，请输入数字！！！")
        elif operation == "2":
            revise_wares = input("请输入需要修改的商品名称：wares=")
            for shop in shopping_list:  # shop 是商品存储字典
                if revise_wares in shop:
                    revise_price = input("请输入修改后的价格, price=")
                    revise_quantity = input("请输入修改后的数量, quantity=")
                    rsult = judge_number(revise_price, revise_quantity)
                    if rsult:
                        new_dict = {revise_wares: {"价格": rsult[0], "数量": rsult[1]}}
                        shop.update(new_dict)
                        print(f"您的商品{revise_wares}修改完成！！！")
                        break
                    else:
                        print("价格、数量应该为数字")
                else:
                    print("您要更改的商品，未添加进购物车！！！")
        elif operation == "3":
            remove_wares = input("请输入需要删除的商品， wares=")
            found = False
            for shop in shopping_list:
                for key in shop.keys():
                    if remove_wares == key:
                        shopping_list.remove(shop)
                        print(f"商品{remove_wares}已移除购物车")
                        found = True
                        break
            if found is False:
                print("您要删除的商品，未添加进购物车")

        elif operation == "4":
            seeAbout_shop = input("请输入需要查询的商品，wares=")
            for shop in shopping_list:  # 字典 {商品：{价格,数量}}
                if seeAbout_shop in shop:
                    for key, value in shop.items():  # (商品，{价格，数量})
                        print(f"{key}: 价格：{value["价格"]}，数量：{value["数量"]}")
                        break
            else:
                print("您要查询的商品，未添加进购物车")
        elif operation == "5":
            print("购物清单")
            print("商品\t\t\t\t价格\t\t\t\t数量\t\t\t\t小计")
            for shop in shopping_list:
                for key, value in shop.items():
                    sum_shop_price = value["价格"] * value["数量"]
                    print(f"{key}\t\t\t{value['价格']:.2f}\t\t\t{value['数量']}\t\t\t\t{sum_shop_price:.2f}")
            return
        else:
            print("请输入，具体功能(1~5)")


shopping()


# 方式二：所有操作均在，；类 与 类方法内完成 AI 检查 ， 目前关于类的知识储备不足，后续回来理解
class ShoppingCart:
    """
    购物车类：管理一个购物车的所有操作
    一个实例就代表一个购物车
    """

    def __init__(self):
        # 实例属性：购物车数据，用字典存储 {商品名: {"价格": 价格, "数量": 数量}}
        self.cart = {}

    # ========== 增 ==========
    def add(self, name, price, qty):
        """
        添加商品到购物车
        参数：name(商品名), price(价格), qty(数量)
        返回：bool 添加成功返回True，否则返回False
        """
        # 1. 校验参数类型
        try:
            price = float(price)
            qty = float(qty)
        except ValueError:
            print("价格和数量必须是数字")
            return False

        # 2. 检查商品是否已存在
        if name in self.cart:
            print(f"商品'{name}'已存在，请使用修改功能")
            return False

        # 3. 添加到购物车
        self.cart[name] = {"价格": price, "数量": qty}
        print(f"✅ {name} 已添加")
        return True

    # ========== 改 ==========
    def update(self, name, price=None, qty=None):
        """
        修改购物车中的商品信息
        参数：name(商品名), price(新价格，可选), qty(新数量，可选)
        返回：bool 修改成功返回True，否则返回False
        """
        # 1. 检查商品是否存在
        if name not in self.cart:
            print(f"商品'{name}'不存在")
            return False

        # 2. 校验并更新价格
        if price is not None:
            try:
                price = float(price)
                self.cart[name]["价格"] = price
            except ValueError:
                print("价格必须是数字")
                return False

        # 3. 校验并更新数量
        if qty is not None:
            try:
                qty = float(qty)
                self.cart[name]["数量"] = qty
            except ValueError:
                print("数量必须是数字")
                return False

        print(f"✅ {name} 已修改")
        return True

    # ========== 删 ==========
    def remove(self, name):
        """
        从购物车中删除商品
        参数：name(商品名)
        返回：bool 删除成功返回True，否则返回False
        """
        if name not in self.cart:
            print(f"商品'{name}'不存在")
            return False

        del self.cart[name]
        print(f"✅ {name} 已删除")
        return True

    # ========== 查 ==========
    def search(self, name):
        """
        查询单个商品信息
        参数：name(商品名)
        返回：dict 商品信息，不存在返回None
        """
        if name not in self.cart:
            print(f"商品'{name}'不存在")
            return None

        item = self.cart[name]
        print(f"商品：{name}，价格：{item['价格']:.2f}，数量：{item['数量']}")
        return item

    # ========== 显示全部 ==========
    def show(self):
        """
        显示购物车所有商品及总计
        """
        if not self.cart:
            print("🛒 购物车为空")
            return

        print("\n" + "=" * 50)
        print("商品名称\t价格\t\t数量\t\t小计")
        print("-" * 50)

        total = 0
        for name, info in self.cart.items():
            subtotal = info["价格"] * info["数量"]
            total += subtotal
            print(f"{name}\t\t{info['价格']:.2f}\t\t{info['数量']}\t\t{subtotal:.2f}")

        print("-" * 50)
        print(f"总计：{total:.2f}")
        print("=" * 50 + "\n")

    # ========== 清空 ==========
    def clear(self):
        """清空购物车"""
        self.cart.clear()
        print("🛒 购物车已清空")


# ========== 主程序（交互界面） ==========
def main():
    # 核心：只创建一个购物车实例，所有操作都围绕这个实例进行
    cart = ShoppingCart()

    while True:
        print("\n1.添加商品  2.修改商品  3.删除商品")
        print("4.查询商品  5.查看购物车  6.清空购物车  7.退出")

        choice = input("请选择操作：")

        if choice == "1":
            name = input("商品名称：")
            price = input("价格：")
            qty = input("数量：")
            cart.add(name, price, qty)

        elif choice == "2":
            name = input("要修改的商品名称：")
            price = input("新价格（直接回车跳过）：")
            qty = input("新数量（直接回车跳过）：")
            cart.update(name, price if price else None, qty if qty else None)

        elif choice == "3":
            name = input("要删除的商品名称：")
            cart.remove(name)

        elif choice == "4":
            name = input("要查询的商品名称：")
            cart.search(name)

        elif choice == "5":
            cart.show()

        elif choice == "6":
            cart.clear()

        elif choice == "7":
            print("👋 退出购物车")
            break

        else:
            print("请输入1~7")


if __name__ == "__main__":
    main()

# 课堂知识：
# 1.使用字典嵌套方式：{商品:{价格:"", 数量:""}}
# 2.快捷键：Alt+Shift/按住鼠标滚轮也可以 可连续选中多行
# 3.非必要强制添加一件商品使用：match-case 模式匹配更好
# 4.三引号可以换行打印，且不会改变形式

open_btn = """
############购物车管理系统############
#           1.添加商品              #
#           2.修改商品              #
#           3.删除商品              #
#           4.查询购物车            #
#           5.退出购物车            #
###################################    
"""

# 1. 制作菜单
print("欢饮使用购物车管理系统 ~")




# 制作列表存储商品
shopping_list = []

while True:
    # 执行具体操作
    print(open_btn)
    choice = input("请选择要执行的操作(1~5), choice=")
    match choice:
        case "1":
            wares = input("请输入需要添加的商品，wares=")
            try:
                price = float(input(f"请输出({wares})的单价，price="))
                quantity = float(input(f"请输入({wares})购买数量="))
                shopping_list.append({wares: {"price": price, "quantity": quantity}})
                print(f"商品({wares})已添加到购物车")
            except ValueError:
                print("单价，数量应为数字")

        case "2":
            wares = input("请输入需要修改的商品, wares=")
            judge = True
            for item in shopping_list:
                if wares in item:
                    inner = item[wares]
                    while True:
                        try:
                            price, quantity = float(input("请输入修改后的单价，price=")), float(
                                input("请输入修改后的数量，quantity="))
                            inner["price"] = price
                            inner["quantity"] = quantity
                            print(f"商品({wares})修改完毕")
                            judge = False
                            break
                        except ValueError:
                            print("数量，单价应为数字")
            if judge:
                print(f"商品({wares})未添加进购物车")
        case "3":
            wares = input("请输入需要移除的商品, wares=")
            judge = True
            for item in shopping_list:
                if wares in item:
                    del item[wares]
                    print(f"商品(({wares}))已移除购物车")
                    judge = False
            if judge:
                print(f"商品({wares})未添加进购物车")

        case "4":
            print("""商品     单价      数量      小计""")
            for item in shopping_list:
                for key, value in item.items():
                    price = value['price']
                    quantity = value['quantity']
                    total = price * quantity
                    print(f"{key}\t\t{price} \t{quantity} \t\t{total:.2f}")
        case "5":
            print("已退出购物车，期待您的下一次购物")
            break
        case _:
            print("请输入具体操作：(1-5)")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字符串str\数据容器——字符串str-基本操作\代码\数据容器——字符串str-基本操作.py

string = "hello Python"
print(string[3])
print(string[0:5]) # 左闭右开
print(string[-1:-7:-1]) # # 左闭右开
print(string[::-1]) # 反转
print(string[::]) # 拷贝

string = "hH,eE,LLll,Oo" # 可遍历
string_2 = ""
for char in string:
    if char.isupper():
        string_2 += char
print(string_2)

# 注意：因为字符串不可变，所以没有推导式 "sr for sr string if 条件"写法不存在

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字符串str\数据容器——字符串str-基本操作\笔记\数据容器——字符串str-基本操作.html

**Title:** 字符串str-基本操作

字符串str-基本操作

<span>字符串和列表的主要区别</span>

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>字符串str-基本操作</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>
                字符串是字符的容器：<span>一个字符串中可以存放任意数量的字符。如：<code>"python"、'python'、"""python"""</code></span>

特点：<span>不可变性(<span class="span">无法修改</span>)、有序性(<span
                    class="span">可以索引访问</span>)、可迭代性(<span
                    class="span">可以遍历</span>)</span>

字符串中的每一个字符元素<span>都有对应的下标(<span>索引</span>),通过元素对应的索引，就可以获取对应的元素</span>

与列表一致：<span>同样有(<span class="span">正向索引和反向索引</span>)，同样支持<span
                    class="span">切片操作</span></span>

<img src="./image/字符串基本操作.png"
                     alt="字符串基本操作"
                     title="字符串基本操作" style="display: block">

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字符串str\数据容器——字符串str-重点-方法\代码\数据容器——字符串str-重点-方法.py

"""
在控制台输入一段英文文本（包含大写、小写字母和数字），要求：

统计该文本中数字字符的总个数。

将文本中所有大写字母转换为小写，并去除所有数字。

输出转换后的文本，并同时输出数字的个数。
"""

# 使用函数
string = input("请输入一段英文文本(包含大写、小写字符和数字)，string=")


# 统计该文本中数字字符的总个数。
def isdigit(str2):
    count = 0
    for num in str2:
        if num.isdigit():
            count += 1
    return count


# 将文本中所有大写字母转换为小写，并去除所有数字。
def lower(char):
    string_lower = ""
    for char in char:
        if not char.isdigit():
            string_lower += char
    return string_lower.lower()


print(f"输入的文本是：{string} \n 其中数字有：{isdigit(string)}个 \n 将所有大写转成小写并去除数字：{lower(string)}")

# 不适用函数
count = 0
string_2 = ""
for char in string:
    if char.isdigit():
        count += 1
    else:
        string_2 += char
string_2 = lower(string_2)
print(f"有{count}个数字")
print(f"全部转小写并去除数字：{string_2}")

# 案例2：
"""
题目：文本分析与格式化处理
题目描述：

1.从控制台输入一段英文文本（包含大小写字母、数字、标点符号和空格），需要对这段文本进行分析和清洗，最终输出一个格式化后的统计报告。

2.具体要求如下：

2.统计行数：文本可能包含多行（以换行符分隔）。统计输入文本的行数。

4.统计单词总数：按空白字符（空格、换行）拆分文本，统计单词总数。

5.统计字符总数：统计整个文本的总字符数（包括空格和换行）。

6.提取所有数字：将文本中所有的数字字符提取出来，组合成一个新字符串。

7.统一大小写：将文本中的所有字母统一转换为大写。

8.替换标点符号：将文本中的英文句号 .、逗号 , 替换为空格 。

9.去除首尾空白：清洗后的文本去除首尾空白字符。

"""
text = input("请输入一个文本(包含大小写字母、数字、标点符号和空格)，text=")

# 统计行数：文本可能包含多行（以换行符分隔）。统计输入文本的行数。
# 模拟多行情况
count = 0
text_2 = ""
leng = 0
row = 0  # 行数
for char in text:
    if count < 10:
        text_2 += char
        count += 1
    else:
        count = 0
        print(text_2)
        text_2 = ""
        row += 1
leng += 1
print(f"一共{row}行")
# 4.统计单词总数：按空白字符（空格、换行）拆分文本，统计单词总数。

# 遍历函数

text.split(" ")
English = 0
for char in text:
    if char.isalpha():
        English += 1
print(f"单词有{English}个")

# 5.统计字符总数：统计整个文本的总字符数（包括空格和换行）。
print(f"文本总字符有：{len(text)}个")

# 6.提取所有数字：将文本中所有的数字字符提取出来，组合成一个新字符串。
num = ""
for char in text:
    if char.isdigit():
        num += char
print(f"提取数字：\n{num}")

# 7.统一大小写：将文本中的所有字母统一转换为大写。
print(f"统一转大写：\n{text.upper()}")

# 8.替换标点符号：将文本中的英文句号 .、逗号 , 替换为空格 。
word = text.replace(".", " ")
word = word.replace("、", " ")
print(f"替换标点符号后：\n{word}")
# 9.去除首尾空白：清洗后的文本去除首尾空白字符。
print(f"去除首尾空白：\n{text.strip()}")

# 案例三、
"""
    题目：文本关键词定位与替换工具
题目描述：

1.从控制台输入一段英文文本（可包含大小写字母、数字、标点符号和空格），然后输入一个关键词（一个单词）。程序需要完成以下操作：

2.统计关键词首次出现的位置：使用 find() 方法查找关键词首次出现的起始索引，如果不存在则输出 -1。

3.统计关键词最后一次出现的位置：使用 rfind() 方法查找关键词最后一次出现的起始索引，如果不存在则输出 -1。

4.统计关键词出现的总次数：使用 count() 方法统计关键词在文本中出现的次数。

5.将关键词替换为指定内容：将文本中所有关键词替换为 "[已屏蔽]"，并输出替换后的文本。

6.提取关键词首次出现位置前后的字符：提取关键词首次出现位置的前 5 个字符和后 5 个字符（如果存在），并输出。

7.统一大小写：将原始文本中的所有字母转换为小写，并输出。

8.去除首尾空白：清洗后的文本去除首尾空白字符（假设输入可能包含首尾空格）。

"""

# 1.从控制台输入一段英文文本（可包含大小写字母、数字、标点符号和空格），然后输入一个关键词（一个单词）。程序需要完成以下操作：

text = input("请输入文本(可包含大小写字母、数字、标点符号和空格), text=")
key = input(f"请输入关键字：key(一个单词)=")

# 2.统计关键词首次出现的位置：使用 find() 方法查找关键词首次出现的起始索引，如果不存在则输出 -1。

index = text.find(key)
print(f"字符{key}，首次出现在下标为：{index}")
# 3.统计关键词最后一次出现的位置：使用 rfind() 方法查找关键词最后一次出现的起始索引，如果不存在则输出 -1。

rindex = text.rfind(key)
print(f"字符{key}，首次出现在下标为：{rindex}")
# 4.统计关键词出现的总次数：使用 count() 方法统计关键词在文本中出现的次数。

count = text.count(key)
print(f"字符{key}，一共出现了：{count}次")
# 5.将关键词替换为指定内容：将文本中所有关键词替换为 "[已屏蔽]"，并输出替换后的文本。

replace_text = text.replace(f'{key}', "[已屏蔽]")
print(f"字符{key}替换为'[已屏蔽]'后：\n{replace_text}")
# 6.提取关键词首次出现位置前后的字符：提取关键词首次出现位置的前 5 个字符和后 5 个字符（如果存在），并输出。
into = input(f'请输入查找关键字前或后n个字符，n=')
key_index = text.find(key)
print(
    f"关键字：{key}  首次出现在：{key_index},    他所在的前{into}个字符是：{text[key_index - int(into):key_index]},     它所在后{into}个字符是：{text[key_index + len(key):key_index + len(key) + int(into)]}")

# 7.统一大小写：将原始文本中的所有字母转换为小写，并输出。

print(f"统一小写：{text.lower()}")

# 8.去除首尾空白：清洗后的文本去除首尾空白字符（假设输入可能包含首尾空格）。

print(f"去首尾空白：\n{text.strip()}")

# 课程案例：
#   邮箱格式验证：用户输入一个邮箱，验证邮箱格式是否正确(包含一个@和至少一个.)，
#   如果输入正确，输出"邮箱格式正确",否则输出"邮箱格式错误"
Email = input("请输入一个邮箱(包含一个@和至少一个.), email=")
if Email.count("@") == 1 and '.' in Email:
    print("邮箱格式正确")
else:
    print("邮箱格式错误")

# 课程案例二：
# 输入一个字符串，判断该字符串是否回文(两边对称)——
# 如：黄山落叶松叶落山黄
# 如：上海自来水来自海上
# 就是正反字符串一致 ,单个字符永远回文
text = input("请输入一个字符串，str=")
if text == text[::-1]:
    print(f"字符串：{text}，回文(两边对称)")
else:
    print(f"字符串：{text}，不回文(两边对称)")


# 课程案例三：
# 将用户输入的10个字符串，反转后全部换成大写，然后记录在列表中，最后将列表内容，遍历输出出来
text = input("请输入一个字符串（10个字符），str=")
print(len(text))
if len(text) <= 10:
    text = text[::-1].upper()
    text.split() # split()不能传参空字符串
    for char in text:
        print(char)
else:
    text = text[0:10]
    text = text[::-1].upper()
    text.split()
    for char in text:
        print(char)



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——字符串str\数据容器——字符串str-重点-方法\笔记\数据容器——字符串str-重点-方法.html

**Title:** Python与JavaScript字符串方法对比表

Python 与 JavaScript 字符串方法完整对比表

一、<span>大小写转换</span>

二、<span>查找与索引</span>

三、<span>替换</span>

四、<span>拆分与合并</span>

五、<span>去除空白字符</span>

六、<span>填充与对齐</span>

七、<span>判断类型</span>

八、<span>编码与转换</span>

九、<span>其他常用方法</span>

十、<span>方法存在性对比</span>

以上知识均为学习笔记整理，结合 Python 与 JavaScript 官方文档。

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——概述\数据容器——概述.html

**Title:** 数据容器概述

数据容器概述

常见的五种数据容器

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>数据容器概述</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>已知，一个变量只能存储一个数据，<span>总结：存储多个数据，需要定义多个变量，非常麻烦</span>

这就需要数据容器：<span>一种可以容纳多份数据的数据类型(容器)，容纳的每一份数据称之为<code>一</code>个元素，<span
                    class="span">每一个元素都可以是任意类型的数据，如：字符串、数字、布尔等</span></span>

数据容器以：<span>是否支持重复元素、是否可以修改、是否有序分类</span>

常见的数据容器有：<span>列表(<code>list</code>)、字符串(<code>str</code>)、元组(<code>tuple</code>)、集合(<code>set</code>)、字典(<code>dict</code>)</span>

<span>他们都是可迭代对象，在<code>JavaScript</code>中，叫遍历</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——结尾-总结\数据容器——结尾-总结-综合案例.py

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


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——结尾-总结\数据容器——结尾-总结.html

**Title:** 数据容器——结尾-总结

数据容器——结尾-总结

数据容器总结与对比

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——集合set\数据容器——集合set-基本操作\代码\数据容器——集合set-基本操作.py

# 创建空集合
set_1 = set()
# set_1 = {} 错误，这是创建空字典

# 为集合添加元素

# 方法一：add() : 单个元素添加,参数视为整体增加
set_1.add("helloSet")
print(f"使用方法(add())添加元素：{set_1}")

# 方法二：update()：多个元素添加，先遍历参数，再逐个增加
# 因为自身：遍历再添加特性，如果参数为集合，则是集合运算中的并集
set_1.update([50, "只能传一个参数", ("这个参数必须是可迭代对象",), 40, 60, 30])
print(f"使用方法(update())添加元素：{set_1}")

# 为集合删除元素

# 方法一：remove() : 指定删除，当元素不存在，报错
set_1.remove(30)
print(f"使用方法(remove())删除元素：{set_1}")

# 方法二：discard() : 指定删除，当元素不存在，不报错
set_1.discard(50)
print(f"使用方法(discard())删除元素：{set_1}")

# 方法三：pop : 随机删除，返回值是被删除的元素
pop_element = set_1.pop()
print(f"使用方法(pop())删除元素：{set_1},其中被删除的元素是：{pop_element}")

# 清空集合 clear()
set_1.clear()
print(f"使用方法(clear())清空集合：{set_1}")

# 删除集合对象
del set_1
try:
    print(set_1)
except NameError:
    print("使用del删除集合：删除当前集合对象，永久删除，强制访问报错")
# print(set_1) 报错，因为这个对象不存在

# 新建两个集合，执行集合运算
set2 = {50, 60, 40, 30, 90,101}
set3 = {30, 40, 50, 60}
set4 = {70, 80, 90, 100}
print(f"set2: {set2}\nset3: {set3}\nset4: {set4}")

# 并集 ： 多个集合，所有元素，组成的集合

# 方法一 ： union() ：可以添加多个集合，取集合内所有元素，自动去重。
setUnion = set2.union(set3,set4) # 有返回值，需要字面量接收，不更改原集合
print(f"使用方法(union())求(set2、set3 以及 st4)并集：{setUnion}")

# 方法二：update() : 当参数为集合时
# set2.update(set3) # 无返回值，更改原集合

# 方法三：位运算符：| 或 ： 当位运算符两侧是集合时，执行并集
setUnion = set2 | set4
print(f"使用(位运算符[|])求(set2 与 set3)并集：{setUnion}")



# 交集 ： 多个集合，同时存在的元素，所组成的集合

# 方法一 ： intersection() : 可以添加多个集合，取所有集合内，相同的元素
setIntersection = set2.intersection(set3,set4) # 有返回值，需要字面量接收，不更改原集合
print(f"使用方法(intersection())求(set2、set3 以及 st4)交集：{setIntersection}")

# 方法二：intersection_update() : 当参数为集合时
# set2.intersection_update(set3) # 无返回值，更改原集合

# 方法三：位运算符：& 与 ： 当位运算符两侧是集合时，执行交集
setIntersection = set2 & set4
print(f"使用(位运算符[&])求(set2 与 set3)交集：{setIntersection}")



# 差集 ： 多个集合：首集合独一无二的元素，所组成的集合

# 方法一：difference() : 可以添加多个集合，取首集合独一无二的元素，组成的集合
setDifference = set2.difference(set3,set4) # 有返回值，需要字面量接收，不更改原集合
print(f"使用方法(difference())求(set2、set3 以及 st4)差集：{setDifference}")

# 方法二：difference_update() : 当参数为集合时
# set2.difference_update(set3) # 无返回值，更改原集合

# 方法三：使用减法运算 ： 当运算符两侧是集合时，执行差集
setDifference = set2 - set4
print(f"使用(运算符[-])求(set2 与 set4)差集：{setDifference}")



# 对称差集 ： 两个集合，每个集合，独一无二的元素，组成的集合
# 方法一：symmetric_difference() ： 只能添加一个集合，取每个集合独一无二的元素，组成的集合
setSymmetricDifference = set2.symmetric_difference(set3) # 有返回值，需要字面量接收，不更改原集合
print(f"使用方法(symmetric_difference())求(set2 与 set3)对称差集：{setSymmetricDifference}")

# 方法二：symmetric_difference_update() : 当参数为集合时
# set2.symmetric_difference_update(set4) # 无返回值，更改原集合

# 方法三：使用位运算符 ^ 异或 ： 当运算符两侧是集合时，执行对称差集
setSymmetricDifference = set2 ^ set4
print(f"使用(运算符[-])求(set2 与 set4)对称差集：{setSymmetricDifference}")

# 其他操作

# 判断元素是否再集合内
# 方法 ： if 元素 in set 或 if 元素 not in set
if 50 in set3:
    print("50在set3内")
else:
    print("50不在set3内")

if 50 not in set3:
    print("50不在set3内")
else:
    print("50在set3内")

# 遍历，集合所有元素 ： for item in set
for item in set3:
    print(item)



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——集合set\数据容器——集合set-基本操作\笔记\数据容器——集合set-基本操作.html

**Title:** 集合set-基本操作

集合set-基本操作

集合<code>set</code>概念

<code>python</code>集合常用方法

Python 集合 vs JavaScript Set 完整对比表

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>集合set-基本操作</h1>
    </header>
    <section id="section_1">
        <h2>集合<code>set</code>概念</h2>
        <ul>
            <li>集合：<span>同样是可以存储<span class="span">多个数据类型</span></span>

特点：<span>同一个集合内，<span class="span">元素不能重复</span></span>

不能重复：<span>同一种数据类型，且值相同</span>

<h3>概念</h3>
                <ol>
                    <li><span>集合(<code>set</code>)是一种<span class="span">无序的、不可重复、可修改的容器</span></span>

<span>既然无序，则不存在序列，也不能使用索引访问元素</span>

定义集合：<code>字面量 = {元素1, 元素2, ...}</code>

定义空集合：<code>字面量 = set()</code>，注意：<code>字面量 = {}</code>，是创建空字典，并不是空集合

<span>集合推导式(<span
                                class="span">不添加条件</span>)：<code>字面量 = {s for s in 可迭代容器}</code>
                        </span>

<span>集合推导式(<span
                                class="span">添加条件</span>)：<code>字面量 = {s for s in 可迭代容器 if 条件}</code>
                        </span>

<span>推导式都分为：<span class="span">无条件与有条件两种写法</span></span>

<h4>注意：</h4>
                        <ul>
                            <li>
                                方法：<code>set()</code>，只能传一个参数，这个参数可以是：<span>单个元素，也可以是一个可迭代对象</span>

<span>因为无法获取具体元素，所以修改元素值只能：<code>remove() + add()</code></span>

<span>删除集合这个对象</span>，永久删除，访问不存在的对象，报错

<span>关于<code>del</code>关键字，结论：<span
                                    class="span">万物皆可删除整个对象，但只有 <span
                                    class="span">可变序列才能删除其中的单个元素或切片</span></span></span>

<span>删除容器：<code>del list、del str、del tuple、del set、del dict、...</code></span>

<span>删除元素：<code>del container[索引]、del container[切片]</code>，<code>container</code>可变序列的容器</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\数据容器\数据容器——集合set\数据容器——集合set-案例\代码\数据容器——集合set-案例.py

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


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\模块\模块与包\代码\主程序——获取图形参数.py

import function_area_surfaceArea_volume_perimeter as go

from python_study.function_study import student_system

# 园的面积
def circle():
    print("欢迎使用计算圆面积、周长计算器")
    while True:
        radius = input("请输入圆的半径(只能是数字类型，非零，负数取绝对值[回车强制终止输入])单位cm：radius=")

        if radius == '':
            print("已经强制退出计算器")
            break

        result = go.circle(radius)
        if result is None:
            print("半径包含非数字类型，请重新输入")
            continue
        elif not result:
            print("半径不能为零，请重新输入")
            continue
        else:
            print(f"圆的周长为：{result[0]}cm，圆的面积为：{result[1]}cm²")
            break


# 矩形，正方形
def rectangle():
    print("欢迎使用矩形、正方形面积、周长计算器")
    while True:
        length = input("请输入长(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，length=")
        if length == '':
            break
        width = input("请输入宽(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，width=")
        if width == '':
            break

        result = go.rectangle(width, length)
        if result is None:
            print("包含非数字类型，请重新输入")
            continue
        elif not result:
            print("长宽不能为零，请重新输入")
            continue
        else:
            print(f"{result[0]}, 周长是：{result[1]}cm，面积是：{result[2]}cm²")
            break


def globular():
    print("欢迎使用球体：表面积、体积计算器")
    while True:
        radius = input("请输入球的半径(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，radius=")
        if radius == '':
            break

        result = go.globular(radius)
        if result is None:
            print("包含非数字字符，请重新输入")
            continue
        elif not result:
            print("半径不能为零，请重新输入")
            continue
        else:
            print(f"球体：表面积是：{result[0]}，体积是：{result[1]}")
            break


def cuboid():
    print("欢迎使用长方体、正方体表面积、体积计算器")
    while True:
        length = input("请输入长(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，length=")
        if length == '':
            break
        width = input("请输入宽(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，width=")
        if width == '':
            break
        height = input("请输入高(只能是非零数字类型或数字字符串，负数取绝对值【回车强制终止输入】)单位cm，height=")
        if height == '':
            break

        result = go.cuboid(width, length, height)

        if result is None:
            print("包含非数字类型，请重新输入")
            continue
        elif not result:
            print("长宽不能为零，请重新输入")
            continue
        else:
            print(f"{result[0]}, 表面积是：{result[1]}cm，体积是：{result[2]}cm²")
            break


if __name__ == "__main__":
    print(
        "============================================================控制台===========================================================================")
    while True:
        print(
            """==================1.圆计算器=========2.矩形/正方形计算器=========3.球体计算器=========4.长方体/正方体计算器=========5.学生管理系统==========6.退出控制台==================""")
        result2 = input("请输入要执行的操作：")

        match result2:
            case '1':
                circle()
            case '2':
                rectangle()
            case '3':
                globular()
            case '4':
                cuboid()
            case '5':
                student_system.students()
            case '6':
                print("已退出控台，欢迎下次使用")
                break
            case _:
                print("请输入合法操作")


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\模块\模块与包\代码\function_area_surfaceArea_volume_perimeter.py

import math


# 导入模块 math


# 圆形
def circle(radius: float | str) -> tuple[float, float] | None | dict:
    """
    该函数主要计算，园的面积和周长  知识补充 : 二维图形没有体积，只有面积和周长

    :param radius: 半径(非零数字或数字字符串)
    :return: 输入为数字，返回值：(周长,面积) ，若为零 返回 空字典 , 非数字类型 返回 None
    """

    try:
        radius = abs(float(radius))
        if radius == 0:
            return {}
        perimeter = round(2 * math.pi * radius, 1)
        area = round(math.pi * (radius ** 2), 1)
        return perimeter, area
    except ValueError:
        return None


# 矩形/正方形
def rectangle(width: float | str, length: float | str) -> tuple[str, float, float] | None | dict:
    """

    Parameters
    ----------
    width: float | int | str
          矩形/正方形宽度 (非零数字或数字字符串)
    length: float | int | str
         矩形/正方形长度 (非零数字或数字字符串)

    Returns
    -------
    tuple[str, float,float] | None]
        输入为数字，返回一个元组 (矩形/正方形, 周长, 面积)

        输入包含非数字字符，返回 None

        输入包含零， 返回 空字典
    """
    try:
        width, length = abs(float(width)), abs(float(length))
        if width == 0 or length == 0:
            return {}

        if width == length:
            perimeter = round(4 * width, 1)
            area = round(width ** 2, 1)
            return '正方形', perimeter, area
        else:
            # 周长计算
            perimeter = round(2 * (width + length), 1)
            # 面积计算
            area = round(width * length, 1)
            return '长方形', perimeter, area
    except ValueError:
        return None


# 球

def globular(radius: float | str) -> tuple[float, float] | None | dict:
    """
    该函数主要求球(globular)的表面积、体积  知识补充：三维图形没有周长和面积、只有表面积和体积

    球表面积：       S = 4Πr²

    求体积：：       V = 3/4Πr³

    :param radius: 球的半径(非零数字或数字字符串)
    :return:输入的是数字，返回一个元组：(表面积，体积) ，若为零 返回 空字典 , 非数字类型 返回 None
    """
    try:
        radius = abs(float(radius))
        if radius == 0:
            return {}
        surface_area = round(4 * math.pi * (radius ** 2), 1)
        volume = round((4 * math.pi * (radius ** 3)) / 3, 1)
        return surface_area, volume
    except ValueError:
        return None


# 长方体/立方体

def cuboid(length: float | str, width: float | str, height: float | str) -> tuple[str, float, float] | None | dict:
    """
    该函数主要计算：长方体/正方体的体积与表面积

    长方体体积： V = 长 * 宽 * 高

    长方体表面积： S = 2 * (长*宽 + 长*高 + 宽*高)

    正方体体积： V = 任意边长 ** 3

    正方体表面积： S = 6 * (任意边长 ** 2)

    :param length:  长(非零数字或数字字符串)
    :param width:   宽(非零数字或数字字符串)
    :param height:  高(非零数字或数字字符串)
    :return: 输入的边长是数字或数字字符串，返回一个元组：(表面积,体积) ，若为零 返回 空字典 , 非数字类型 返回 None
    """
    try:
        if any(float(s) == 0 for s in (length, width, height)):
            return {}
        length, width, height = [abs(float(s)) for s in (length, width, height)]

        if length == width == height:  # 判断正方体
            surface_area = round(6 * length ** 2,1)
            volume =  round(length ** 3,1)
            return '正方体', surface_area, volume
        else:  # 长方体
            surface_area = round(2 * (length * (width + height) + width * height),1)
            volume = round(length * width * height)
            return '长方体', surface_area, volume
    except ValueError:
        return None


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\模块\模块与包\笔记\模块与包.html

**Title:** 模块介绍

模块介绍

什么是模块

使用模块需要的注意事项

导入模块

<span>使用模块</span>

包机制

导入包

使用sys模块，使包/模块在任何文件被访问

其他模块知识

其他内容

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="模块与包">
<main>
    <header>
        <h1>模块介绍</h1>
    </header>
    <section id="section_1">
        <h2>什么是模块</h2>
        <ul>
            <li>引入：<span>当一个项目需要计算面积、周长，当其他文件内有计算结构的函数(<span
                    class="span">方法</span>)，我不想再写一次，想直接拿过来复用怎么办</span>

<span>模块定义：<code>python模块(module):</code>一个<code>.py</code>文件就是一个模块，模块是<code>python</code>程序的基本组织单位。</span>

在模块中<span>可以定义变量、函数、类，以及可执行的代码</span>

模块用法：<span>将其他文件内的数据，导入到当前文件，实现多个文件数据共享。</span>

<span>主要是实现：<span class="span">主程序与功能分离，提高代码质量，减少代码冗余。</span></span>

<span>命名：<span>与字面量的命名规则一致：硬性规则：<span class="span">不能以数字开头、只能包含：<code>A-Z、a-z、非数字开头数字、下划线、中文(<span>不建议用，虽然不会报错、但是运行可能会出BUG</span>)</code></span></span></span>

<span>模块的存储位置必须与导入模块为兄弟(<span
                    class="span">同一个文件夹内</span>)，否则获取不到</span>

<a href="../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/模块/模块与包/笔记/模块与包.html/#模块识别顺序"
                   onclick="loadContent(this,'container-模块与包s','#模块识别顺序');return false">模块识别顺序</a>
                <div id="container-模块与包s"></div>

<span>因为系统模块是最后查找的，所以自定义模块不能与系统自带模块重名，自定义模块会覆盖系统模块，导致功能出问题</span>

导入模块：<code>import</code>关键字

语法1：<code>import 模块名</code>

<span>直接导入整个模块，模块内的所有方法、类、变量...都存在模块名这个对象中，使用方式<code>模块名.需要的功能</code></span>

语法2：<code>from 模块名 import [方法、类、变量....]</code>

<span>显示指定导入，可以一次多个导入，中间用逗号分隔</span>

<h3>通配符导入，初学者不容易分辨</h3>
                <ul>
                    <li>语法3：<code>from 模块名 import *</code>

<span>通配符导入，受制于被导入文件的：<code>__all__ = [需要导入的功能]</code></span>

需要的功能可以是：<span>变量、函数、类...</span>

与语法1和语法2不同，<span>它导入的模块内如果有：<code>__all__ = [需要导入的功能]</code>，导入时只会导入指定的功能</span>

<span>如果被导入文件，写法是<code>__all__ = []</code>空列表，则不会导入任何字面量</span>

<span>如果被导入文件，没有<code>__all__</code>的同时使用通配符导入，则导入所有非下划线开头的字面量</span>

<span>所以非常不建议用，<span class="span">语法1和语法2，将所有需要的内容放入一个命名的袋子，要想使用就必须：<code>袋子名.需要的功能</code></span>
                        重根本上就杜绝了，污染全局字面量的可能</span>

<span>正常项目中，使用通配符导入的字面量，如果导入文件重名，会被导入文件覆盖，而且不会报错，完全是定时炸弹</span>

<span>综上所述：应该避免使用</span>

可以使用<code>as</code>关键字重命名，后面使用模块的时候，就用重命名，否则默认模块名字

语法：<code>import math as shuxue</code>

这样的话，模块名字就变成了，<code>shuxue</code>，往后使用就用新的名字，但是注意：<span class="span">功能与原模块一致，且不会更改原模块名字，只能作用于当前文件。</span>
        </ul>
        <div class="div_table" id="模块导入">
            <table>
                <tr>
                    <th colspan="4"><h2><span>使用模块</span></h2></th>
                </tr>
                <tr>
                    <td>导入形式</td>
                    <td>代码样例</td>
                    <td>调用方式</td>
                    <td>调用方式样例</td>
                </tr>
                <tr>
                    <td><code>import 模块名</code></td>
                    <td><span>import random</span></td>
                    <td>模块名.功能名</td>
                    <td><code>random.randint(10,100)</code></td>
                </tr>
                <tr>
                    <td><code>import 模块名 as 别名</code></td>
                    <td><span>import random as rd</span></td>
                    <td>别名.功能名</td>
                    <td><code>rd.randint(10,100)</code></td>
                </tr>
                <tr>
                    <td><code>from 模块名 import 功能名</code></td>
                    <td><span>from random import randint,choice</span></td>
                    <td>功能名</td>
                    <td><code>randint(10,100)</code></td>
                </tr>
                <tr>
                    <td><code>from 模块名 import 功能名 as 别名</code></td>
                    <td><span>from random import randint as ints</span></td>
                    <td>别名</td>
                    <td><code>ints(10, 100)</code></td>
                </tr>
                <tr id="模块通配符">
                    <td><code>from 模块名 import *</code></td>
                    <td><span>from random import *</span></td>
                    <td>
                        <ul>
                            <li>功能名

<span>受到被导入文件中：<code>__all__</code>的<span class="span">完全控制</span></span>

正常情况：<code>__all__ = [功能名]</code>，只会导入规定的功能名

正常情况2：<code>__all__ = []</code>，什么也不会导入

异常情况：被导入文件没有：<code>__all__</code>，导入所有<span>非下划线开头的字面量[公有字面量，<br><span
                                    class="span">以下划线开头的是私有字面量，外部无法访问</span>]</span>，污染全局作用域

<code>import 模块名</code>

<code>import 模块名 as 别名</code>

<code>from 模块名 import 功能名 as 别名</code>

<span>主要保证：功能名可控即可</span>

所谓的包就是：<span>将多个模块封装成一个文件夹，这个文件夹就叫包</span>

<span>主要作用是：使模块不那么碎片话，整理</span>

<span>在 Python 中，一个文件夹若要被视为常规包，通常需要包含 <code>__init__.py</code> 文件（内容可以为空），它的作用是告诉Python ‘这是一个包’。<span
                        class="span">虽然 Python 3.3+ 支持没有 __init__.py 的命名空间包，<span>但在考试和常规项目中，建议始终保留 __init__.py 以确保兼容性和清晰性。</span></span></span>

<span>包名可以是任何字符只要内部有：<code>__init__.py</code>文件即可，但是同样建议：<span>使用字面量命名规则：<code>A-Z，a-z，非数字开头数字，下划线，中文(正常项目同样不建议采用)</code></span></span>

<span><span class="span">默认</span>包必须与主程序(<span class="span">导入它的文件</span>)为兄弟关系，必须在同一个文件夹下。<span
                        class="span">即使是兄弟子文件夹内都是不行</span></span>

<span>后续可以使用：<code>sys.path(<span>中文名叫模块搜索路径</span>)</code>进行在所有文件夹下进行查询</span>

语法1[<span>导入包和模块</span>]：<code>from 包名 import 模块</code>

语法2[<span>导入包和模块的同时选择需要导入的内容</span>]：<code>from 包名.模块 import 内容</code>

<h3>通配符导入包，初学者容易出错</h3>
                <ul>
                    <li>语法3[<span>通配符导入</span>]：<code>from 包名 import *</code>

<span>注意导入的不是所有包内的模块，而是导入：<code>__init__.py</code>文件内，<code>__all__ = [需要导入的模块]</code>的模块</span>，<span
                            class="span">如果导入[]外的模块，尽管模块存在，同样报错</span>

<span>如果：<code>__init__.py</code>文件中 <code>__all__ = []</code>，<code>[]</code>是空列表，则什么都不会导入，且不会报错</span>

<span>如果：<code>__init__.py</code>文件中没有<code>__all__</code>，且使用通配符导入，则导入所有非下划线开头的模块</span>

<span>使用这种方法，也可以，对比模块的导入，不会污染全局字面量，但是为未写<code>__all__</code>,几乎一次导入所有模块，看情况写</span>

<code>from 包.模块 import *</code>

<span>与单纯的：<code>from 模块 import *</code>行为一致，污染全局字面量，应避免使用</span>

<span>内容可以是：<span>类、变量、函数...</span>，可以多个导入，之间用英文逗号隔开</span>

<code>my_fun.log_separator1()</code>

包通配符导入看的是包中的：<code>__init__.py</code>文件中的：<code>
                                __all__ = [模块名]</code>

当：<code>__all__ = [模块名]</code>，导入指定的模块名，若指定其他模块名，尽管在包中，同样报错

当：<code>__all__ = []</code>,空列表，不会执行导入操作

当：文件内没有：<code>__all__</code>，则导入全部公有模块(非下划线开头的模块)

与模块通配符导入不同，<span>包通配符导入不会将模块内部的函数/变量直接暴露到全局，只会导入模块对象本身（或 __all__ 指定的模块）</span>，因此污染风险远低于模块级通配符。
                                <br><span>而且还有一个非常实用的功能：一次导入所有公有模块(<span
                                    class="span">非下划线开头的模块</span>)</span>

<code>log_separtor1()</code>

与<a href="../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/模块/模块与包/笔记/模块与包.html/#模块通配符"
                                     onclick="loadContent(this,'container-模块与包2','#模块通配符');return false">模块通配符(单击链接显示具体内容)</a>导入一致，污染全局字面量，避免使用
                                <div id="container-模块与包2"></div>

<span>介绍模块：<code>sys</code>:本质是 <code>python</code>进程启动时初始化的<span
                    class="span">内存列表</span></span>

<span>使用它其中一个功能，就能实现包/模块任何地方被找到：先导入：<code>import sys</code>，然后再使用：<code>sys.path(<span>中文名叫模块搜索路径</span>).append(r'包的父目录')</code></span>

实现上面这两个操作后，就能正常导入：<code>from 包名 import
                模块</code>/ <code>import 模块</code>....<span>在IDE上，需要先写全，IDE才会识别</span>

整个过程：就是使用模块<code>sys</code>其中
                <code>sys.path(<span>中文名叫模块搜索路径</span>).append()</code>方法，
                为python插入一个锚点，让python在查询包的同时，在添加的锚点也查询一遍，实现任何地方都能使用包内的模块

<span>只有在控制台，<code>sys</code>才会执行，离开控制台，便会消失</span>
                <br><span class="span"><code>sys</code>的存活周期：运行文件(生命开始)————过程——————结束运行(或终止运行)【声明周期结束】</span>

<ul id="模块识别顺序">
                    <li><code>sys.path[0]————>sys.path[1:]————>sys.path[-1]——————均找不到会报错</code>

<span><code>sys.path[0]</code>:当前执行脚本所在的目录(<span
                            class="span">默认自动加入</span>)</span>

<span><code>sys.path[1:]</code>:环境变量<code>PYTHONPATH</code>或手动 <code>append、inset、extend</code>添加的路径</span>

<span><code>sys.path[-1]</code>:系统标准库路径(最后查找)</span>

<span>所有位置搜索均没有，模块，则报错，显示未定义</span>

<h3>调试：<code>if __name__ == "__main__":</code></h3>
                <ol>
                    <li><code>__name__</code><span>python内置的变量,<span class="span">表示当前模块的名字</span></span>

定义：<span>直接运行当前模块：<code>__name__ 的值为 "__main__"</code></span>

<span>当导入模块时：<code>__name__ 的值就是模块名字</code></span>

总结就是：<span>只有当该文件被直接运行时，<code>__name__ 的值才会等于 "__main__"</code>，该块内的代码才执行。</span>
                        <span>如果被导入，__name__ 的值是模块名，该块内的代码跳过不执行</span>

用处1(<span>被导入模块测试</span>)：可以使用条件分支语句，指定需要运行的代码。(
                        <span>前提是它上面没有运行的代码【提示：函数只有被调用才会执行】。</span>)

用处2（被导入模块的安全防护）：<span>将被导入模块中的测试代码或顶层调用放入 <code>if __name__ == "__main__":</code> 中，
                        确保模块被导入时不会意外执行这些代码，避免干扰导入方。</span>

<code>__init__</code>在包中叫包名初始化(<span>告诉：<code>python</code>这是一个包</span>)、在类中叫构造函数：<code>def
                __init__(self)</code>

<h3>__all__</h3>
                <ol>
                    <li><code>__all__ = [需要导入的功能]</code><span>
                        用来显式声明，当用户使用 <code>from math import *</code>时，默认导入哪些名称</span>

<span>当：<code>__all__ = []</code>为列表为空的时候，则什么都不会导入</span>

<span>当：没有 <code>__all__</code>的同时，使用通配符导入，则导入所有非下划线开头字面量/模块</span>

<span>__all__ 只在 <code>from 模块 import *</code> 或 <code>from 包 import *</code> 时生效，普通<code>import 和 from ... import 具体名称</code> 不受影响。</span>

<h3><span><code>pycharm</code>新建文件时，用 <code>/</code> 构建层级路径</span></h3>
                <ol>
                    <li><code>/</code> 前面的路径视为文件夹（若不存在则自动创建，支持多层嵌套）

<span><code>/</code> 最后一段是实际创建的内容（文件或文件夹）</span>

<span>注意：只有路径的最后一段可以是文件；文件不能作为“容器”继续往下嵌套。</span>

说白了：<span>路径中，<span>只有最后一个“节点”可以是文件</span>，前面的所有“节点”都<span>必须是文件夹</span><span
                            class="span">（如果不存在则自动创建）。一旦某个节点是文件，它后面就不能再跟 <code>/</code> 了。</span></span>

<span>常量：<span
                    class="span">不会产生变化的量，写法规范是字母全部大写</span>，如：<code>PI = 3.1414926</code></span>

<span>模块、方法显示异常问题、警告异常问题。主要是父文件夹包含非ASCII码字符。解决办法——重命名、删除.idea文件、重新配置解释器</span>

<span>导入模块问题：同级下import是直接文件名，文件名不能是：[<code>-</code>]连接。</span>

<span>导入模块没有提醒问题：虚拟环境背污染，解决办法：<a
                    href="../../../../../../../内容文件夹/python_study/关于pip%20install%20安装包的位置/关于安装包位置装入虚拟环境.html/#删除虚拟环境的方法"
                    onclick="loadContent(this,'container-模块与包','#删除虚拟环境的方法');return false">删除虚拟环境</a>，重装、重新配置解释器</span>

<div id="container-模块与包" class="div_table"></div>

<span>关于模块知识：导入关键字：import、重命名模块：as 名字，后续可以通过新定义的名字进行操作</span>

<span>只能从锚点开始，往'<span class="span">内层</span>'走(<span
                                        class="span">用<code>.</code>分隔</span>)</span>

<code>from 包.子包 import 模块</code>

不支持：<code>../或./</code>

<span>既可以往内，也可以往外（用 / 或 ../）。</span>

<code>✅ ./style.css（<span>当前目录</span>）</code>

<code>✅ ../style.css（<span>上级目录</span>）</code>

<code>✅ /style.css（<span>根目录</span>）。</code>

<h4><span>在一些强大的IDE中使用：<code>pycharm、VScode...</code></span></h4>
                                <ol>
                                    <li>
                                        因为：<code>sys.path</code>是运行当中，才会正确添加，这会导致，pyCharm的检查出问题：<span>比如：错误提示、使用模块不会提示模块内的变量、类、函数等。</span>

<span>所以，正常开发，将包的父文件夹设置为源根，或更上面设为源根，最后通过源根点到包名即可，这样 <code>pycharm不会报错，提示功能正常使用</code></span>

<h4><span>在一些比较基础的开放环境中使用：<code>IDLE...</code></span></h4>
                                <ol>
                                    <li><span>这类开发环境有一个共同特点：<span class="span">无法设置源根</span></span>

方法一：<span>老方法：<code>import sys</code>+<code>sys.path</code></span>

<span>坏处：每个文件都要导入</span>

方法二：<span>修改环境变量：<span
                                            class="span">在系统变量查找<code>PYTHONPATH(<span>如果没有自己创建一个</span>)</code>，添加需要导入包的绝对地址即可</span></span>

查找环境变量设置：<span>此电脑右键单击属性——找到高级系统设置——单击环境变量——知道系统变量——新建或双击<code>PYTHONPATH</code>然后添加即可</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\流程控制语句\for循环\代码\for循环.py

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

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\流程控制语句\for循环\笔记\for循环.html

**Title:** for循环

for循环

自行总结

python的 <code>for</code>循环的几种显示效果

JavaScript<code>for</code>循环回顾

python<code>for</code>循环总结

python<code>for</code>的辅助工具速查

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="for循环">
<main>
    <header>
        <h1>for循环</h1>
    </header>
    <section id="section_1">
        <h2>自行总结</h2>
        <article>
            <ul>
                <li>
                    <h3>关于JavaScript的 <code>for</code>循环几种形式</h3>
                    <ol>
                        <li>
                            <h4>默认形式</h4>
                            <ul>
                                <li>语法：for (初始化变量; 循环条件; 步长更新){代码块}

初始化变量：<span>声明变量并赋值。<span
                                        class="span">主要为后续循环条件与改变逻辑做参考</span></span>

循环条件：<span>退出循环的条件</span>

步长更新：<span>一般与初始化变量有关，<span class="span">主要与循环条件配合，步长更改变量值，
                                    变量值影响循环条件，最终达到循环条件，退出循环</span></span>

<h5>需要注意事项</h5>
                                    <ol>
                                        <li><span>三个参数，非必须写</span>

初始化变量可以是<span>外部变量</span>

循环条件：<span>省略不写/true</span>如果代码块内部没有<code>break</code>
                                            则陷入死循环

步长更新：<span>省略不写，或故意往循环条件反向更新</span>如果代码块内部没有<code>break</code>
                                            则陷入死循环

支持：<code>for (;;;){代码块}</code>写法，内部没有<code>break</code>同样死循环

所以最好：<span>循环条件为<code>true</code> + 内部<code>break</code>或则三个参数写全，从而避免死循环</span>

可以嵌套：
                                            <br><code>for (let i=0; i < 10 ; i++){
                                                <br>&nbsp;&nbsp;for (let j = 0; j < 10 ; j++){代码块)
                                                }</code>
                                            <br>通过嵌套可以解决多层问题，比如画一个三角形(分外层和内层，<span>这就需要用到双层循环</span>)....

<h4>for-in形式</h4>
                            <ul>
                                <li>语法：for (声明变量 in 需要迭代的容器){代码块}

声明变量：<span>声明变量不要赋值，<span
                                        class="span">主要用于接受索引，索引从<code>0</code>开始，随着迭代次数增加而自增</span></span>

需要迭代(<span>遍历</span>)的容器：<span>可以是数组、字符串、对象、Set()....</span>

<h5>需要注意事项</h5>
                                    <ol>
                                        <li>
                                            <span>声明变量是必须要操作的，不能忽略，主要用于计入索引，方便后续调用对象、字符串、数组</span>

<span><code>in</code>关键字不能忽略</span>

<span>迭代器必须存在</span>

默认<code>for</code>循环，需要步长更新，来规划循环次数，<code>for-in</code><span>不需要，他的循环次数由迭代容器的长度决定</span>

其实只要记住：<span><code>for-in</code>的返回值是索引，需要调用原迭代容器。</span>

<h4>for-of形式</h4>
                            <ul>
                                <li>语法：for (声明变量 of 需要迭代的容器){代码块}

声明变量：<span>声明变量不要赋值，<span class="span">主要用于接受每次迭代的元素</span></span>

需要迭代(<span>遍历</span>)的容器：<span>可以是数组、字符串、对象、Set()....</span>

<h5>需要注意事项</h5>
                                    <ol>
                                        <li>
                                            <span>声明变量是必须要操作的，不能忽略，主要用于临时存储，当前迭代次数的元素</span>

<span><code>of</code>关键字不能忽略</span>

<span>迭代器必须存在</span>

默认<code>for</code>循环，需要步长更新，来规划循环次数，<code>for-of</code><span>不需要，他的循环次数由迭代容器的长度决定</span>

其实只要记住：<span><code>for-of</code>的返回值是当前迭代的元素，可以直接使用</span>

python的<code>for</code>的循环没有<code>JavaScript</code>有那么多形式

<h3>第一种写法，标准写法(<code>for-in</code>)</h3>
                    <ol>
                        <li>标准写法：<code>for 变量 in 迭代容器</code>

变量：<span>变量不赋值，<span class="span">主要用于接收，迭代元素，迭代出的元素就是容器内的原数据类型(<code>list、dict、set、str......</code>)</span></span>

迭代容器：<span>可以是任何可迭代对象，<code>list、dict、set、str.....</code></span>

<h4>注意事项</h4>
                            <ul>
                                <li>在标准写法中，变量接收的是元素，而非索引

当迭代容器中，包含多种数据类型，如：<code>["hello",20,{"name":"张三"}]</code>，通过迭代，结果依次是：<code>str、int、dict</code>数据类型
                                    <br>当我们要对其中一个数据类型进行操作的时候，需要先判断数据类型，使用方法：<code>isinstance(变量,数据类型)</code>
                                    <br>第一个参数：需要判断的变量，第二个参数：需要判断的数据类型。
                                    <br>返回值是布尔值，符合条件返回 <code>True</code>，否则 <code>False</code>
                                    <br>可以同时判断多个数据类型：<code>isinstance(变量,(int,str,dict...))</code>，只要变量符合其中一种，就返回<code>True</code>

<h3>第二种写法：变体(<code>for-in-range()</code>)</h3>
                    <ol>
                        <li>写法：<code>for 变量 in range()</code>

该写法：<span>变量接收的是索引</span>

<ul>
                                <li>range(起始值,结束值,步长)

<span>起始值、步长非必要写，结束值必须写</span>

起始值：<span>顾名思义就是迭代过程中，开头值(<span class="span">能取到(默认为0)</span>)</span>

结束值：<span>顾名思义就是迭代过程中，结束的值(<span
                                        class="span">取不到，在当前值前一个值结束(必须写)</span>)</span>

步长：<span>就是每一次迭代值的变化，<span
                                        class="span">负数则递减，正数则递增，0则直接报错(默认为1)</span></span>

其实只要记住：<span>结束值必须写，值区间：左开右闭，步长不为零即可</span>

<span> for循环同样支持，<code>for-else</code>功能与<code>while-else</code>一致</span>

总结：<span>python的 <code>for</code>循环只有<code>for...in</code>一种形式</span>，
                            <br>具体的变化是，最后的辅助工具的不同，所迭代的结果不同，如：<code>range()</code>结果为索引
                            <br><a href="#循环辅助工具" style="font-size: 2rem">python<code
                                    style="font-size: 2rem">for</code>循环辅助工具</a>

属性名(字符串，也可以叫<span>键名</span>)，数组索引也以字符串形式返回

<span>记住返回的是字符串</span>

数组、字符串其实都是一个对象，<span>是对象，就会有键值对，数组、字符串的键就是索引，本质也是字符串</span>

平常写：<code>arr[0]</code>，这里面的 <code>0</code>在后台会转成字符串<code>"0"</code>，然后访问值

元素本身（字典为键，集合为元素）

在<code>python</code>中字典是通过键名查找值，本质与<code>JavaScript</code>的对象一致

在<code>python</code>中列表，字符串，集合都是通过数字索引直接提取对应元素，与<code>JavaScript</code>数组有本质区别

<span>python</span>不存在隐式转换，<span>JavaScript</span>数组是一个对象，键名是字符串，且会隐式转换，所以：

JavaScript：<code>arr["0"] <span>等价于</span>arr[0]</code>

python：<code>arr["0"] <span>不等于</span>
                                    arr[0]</code>，强行写会报错[<code>TypeError</code>]

<code>for i in range(起始值, 结束值, 步长):</code>

<code>for i in range(0, len(iterable), 2):</code>

左闭右开，从起始值开始，结束值前一位结束，步长不为零

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\流程控制语句\if条件分支语句\if基础语法\代码\if基础语法.py

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


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\流程控制语句\if条件分支语句\if基础语法\笔记\if基础语法.html

**Title:** if基础语法

if基础语法

形式一：

形式二：

<code>python</code>的条件分支与<code>JavaScript</code>条件分支的区别

python VS JavaScript 条件分支对照表

python专属特性(<span>JS没有</span>)

JS专属特性(<span>python没有</span>)

避坑指南(<span>从JS转python最容易踩的雷</span>)

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="if基础语法">
<main>
    <header>
        <h1>if基础语法</h1>
    </header>
    <section id="section_1">
        <ul>
            <li><span>正常情况，代码都是从上到下依次执行</span>

<span>if语法：可以理解为，开辟一个或多个分支，通过判断，运行具体分支</span>

<h2>形式一：</h2>
                <ol>
                    <li><code>if-else</code>

<span>先判断if内的条件，如果符合则，执行<code>if</code>内的代码块，否则执行<code>else</code>内的代码块</span>

当然 <code>else</code>并不是必须写的，当条件不成立，会跳过 if 内的代码块，继续向下执行

<code>if-elif-...-else</code>

<span>同样先判断<code>if</code>，然后依次判断<code>elif</code>，以上均不成立，则执行<code>else</code>内的代码块</span>

<span>同样，<code>else</code>不是必须的，以上条件均不成立，会跳过条件分支，继续向下执行</span>

多条件分支，<code>python</code>的写法是：<code>elif</code>，<code>JavaScript</code>的写法是：<code>else
                        if</code>

在<code>JavaScript</code>中每个独立分支都是一个作用域，作用域内的：除去<code>var</code>关键字声明的变量，只在作用域内有效

<code>python</code>的条件分支语句，没有作用域，条件分支内的变量，外部同样可以访问。

<code>JavaScript</code>存在第二种分支语句：<code>switch-case-default</code>，python并没有

<a href="../../../../../../../frontend——前端/JavaScript/哔哩哔哩UP主——Java基础/基础/第十九~二十二节——条件分支语句/第十九~二十二节——条件分支语句.html">JavaScript条件分支语句</a>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\流程控制语句\match模式匹配\代码\match模式匹配.py

# 案例一：实现一个计算器，可以实现+、-、*、/ 运算，用户输入运算的两个数以及运算符之后，就可以进行计算

def calculator(num1, num2, symbol):
    try:
        num1 = float(num1)
        num2 = float(num2)
    except ValueError:
        return None
    match symbol:
        case '+':
            return num1 + num2
        case '-':
            return num1 - num2
        case '*':
            return num1 * num2
        case '/':
            if num2 == 0:
                return False
            else:
                return num1 / num2
        case _:
            return None


print("===================只是简易计算器，只能输入两个参数=====================")
number_1 = input("请输入第一个数(必须是数值类型)：")
number_2 = input("请输入第二个数(必须是数值类型)：")
symbols = input("请输入要进行的运算(+、-、*、/)：")
result = calculator(number_1, number_2, symbols)
if result is None:  # None、False、True都是单例对象，可以使用 is 或 is not 进行身份匹配
    print("请输入数值类型或合法运算符")
elif result is False:
    print("除数不能为0")
else:  # 以后遇到多个假值尽量将输出结果放入else内。或直接在函数内部返回结果，就以：见名知意的字符串，或数字返回结果，直接使用 == 判断，更加清晰
    print(f"{number_1} {symbols} {number_2} = {result}")


# 写法二
def calculator(num1, num2, symbol):
    try:
        num1 = float(num1)
        num2 = float(num2)
    except ValueError:
        return None
    match symbol:
        case '+':
            return num1 + num2
        case '-':
            return num1 - num2
        case '*':
            return num1 * num2
        case '/' if num2 != 0: # 注意：match支持case + 守卫，但是返回边界模糊，最后用于只要结果的项目
            return num1 / num2
        case _:
            return None


# 案例二：编写一个游戏角色移动控制系统。根据玩家输入的不同指令，控制游戏角色执行相应的动作(输出控制台)
"""
    具体按键：
        玩家输入                                    对应动作
       上 / w / W                                角色向上移动
       下 / s / S                                角色向下移动
       左 / a / A                                角色向左移动
       右 / d / D                                角色向右移动
       '跳' | ' space' | 'SPACE'                 角色跳跃
       攻击 / j /J                               角色发动攻击
       退出 / esc / ESC                          角色退出游戏
"""
print("==================来玩个游戏吧==================")
print("""
    具体按键：
        玩家输入                                    对应动作
       上 / w / W                                角色向上移动
       下 / s / S                                角色向下移动
       左 / a / A                                角色向左移动
       右 / d / D                                角色向右移动
       '跳' | ' space' | 'SPACE'                 角色跳跃
       攻击 / j /J                               角色发动攻击
       退出 / esc / ESC                          角色退出游戏
""")
def game(key):
        match key:
            case '上' | 'w' | 'W':
                return 'on'
            case '下' | 's' | 'S':
                return 'downward'
            case '左' | 'a' | 'A':
                return 'forward'
            case '右' | 'd' | 'D':
                return 'backward'
            case '跳' | 'space' | 'SPACE':
                return 'jump'
            case '退出' | 'esc' | 'ESC':
                return 'exited'
            case _:
                return None
while True:
    keys = input("请输入键位, key=")
    result = game(keys)

    if result is None:
        print("请输入合法键位")
    elif result == 'on':
        print("角色向上移动")
    elif result == 'downward':
        print("角色向下移动")
    elif result == 'forward':
        print("角色向左移动")
    elif result == 'backward':
        print("角色向右移动")
    elif result == 'jump':
        print("角色跳跃")
    elif result == 'exited':
        print("角色退出游戏")
        break


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\流程控制语句\match模式匹配\笔记\match模式匹配.html

**Title:** match模式匹配

match模式匹配

自行总结

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="match模式匹配">
<main>
    <header>
        <h1>match模式匹配</h1>
    </header>
    <section id="section_1">
        <article>
            <h2>自行总结</h2>
            <ul>
                <li><span>在<code>JavaScript</code>存在第二个条件分支语句， <code>switch-case-default</code></span>

<span><code>python</code>功能类似：<code>match-case</code></span>

<h3>不同点</h3>
                    <ol>
                        <li><code>JavaScript</code>存在穿透效果，<code>case</code>必须由<code>break</code>结束

<h4>如：</h4>
                            <br><code>
                            <br>switch(要判断的变量){
                            <br>&nbsp;&nbsp;case 情况1:
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;代码块
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;break &nbsp;&nbsp; <span>// 因为有关键字 break
                            所以如果符合条件，执行完代码块，则退出switch</span>
                            <br>&nbsp;&nbsp;case 情况2:
                            <br>&nbsp;&nbsp;case 情况3:
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;代码块
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;break &nbsp;&nbsp;
                            <span>// 情况2与情况3之间没有关键字 break</span>
                            所以它们共用一个代码块。
                            <br>&nbsp;&nbsp;....
                            <br>&nbsp;&nbsp;default: &nbsp;&nbsp;
                            <span>// 类似于 else 当所有条件均不满足时，执行内部代码块</span>
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;上述情况均不满足执行代码
                            <br>}
                        </code>

<span>说到底，<code>JavaScript</code>必须由break退出，否则会一直穿透，直到最后，那样就没有任何意义了。</span>

<span><code>JavaScript</code>没有JavaScript的穿透效果，每个 <code>case</code>分支，都是退出条件，只要符合就退出<code>match</code></span>

<h4>如：</h4>
                            <br><code>
                            <br>match 需要判断的变量(如变量<code>day</code>):
                            <br>&nbsp;&nbsp;case 情况1:
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;代码块 &nbsp;&nbsp;
                            <span># 符合执行代码块，并退出match模式匹配</span>
                            <br>&nbsp;&nbsp;case 情况2: &nbsp;&nbsp;
                            <span># 符合执行代码块(没有照样执行)，并退出match模式匹配，不会穿透到下一个case</span>
                            <br>&nbsp;&nbsp;case 情况3 | 情况4: &nbsp;&nbsp; <span># <span>【|】</span>，match特有的，类似于逻辑或，多个条件满足一个即可</span>
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;代码块
                        </code>

<span>所到底，<code>python</code>case本身就是退出匹配关键字，不会由穿透效果，如果多个条件共享同一代码块，可以使用符号：<code>【|】</code></span>

<span>都是为了应对，同一个事件，多种状态的判断</span>

<h4>如：</h4>
                            <br><code>
                            match day:
                            <br>&nbsp;&nbsp;case 1:
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;print("新的星期开始了")
                            <br>&nbsp;&nbsp;case 2 | 3 | 4:
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;print("痛苦的上课")
                            <br>&nbsp;&nbsp;case 5:
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;print("明天就休息了")
                            <br>&nbsp;&nbsp;case 6:
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;print("愉快的休息")
                            <br>&nbsp;&nbsp;case 7:
                            <br>&nbsp;&nbsp;&nbsp;&nbsp;print("是个坏消息，明天要上课了")
                        </code>

<span>可以看到，都是以<code>day</code>这个关键变量开始的。</span>

使用 <code>【|】</code>组合：

如：<code>case "周六" | "周日":</code>

连续写 <code>case(<span>穿透</span>)</code>

<code style="display: block">
                                        如：
                                        <br>&nbsp;&nbsp;case "周六":
                                        <br>&nbsp;&nbsp;case "周日":
                                        <br>&nbsp;&nbsp;&nbsp;&nbsp;代码块
                                    </code>

✅ 支持 if：

case x if x > 0:

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\流程控制语句\while循环\代码\while循环.py

num = 0
while num <= 20:
    print(num)
    num += 1
else:
    print("循环结束")

# 案例一：使用while循环，打印 10遍 "人生苦短，我用python~"

count = 1
while count <= 10:
    print("人生苦短，我用python~")
    count += 1
else:
    print("打印完毕！！！")

# 案例二：计算1-100之间所有偶数的累加之和,使用while循环
num = 0
count = 2

while count <= 100:
        num += count
        count += 2
else:
    print(f"1-100之家偶数和是：{num}")

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\流程控制语句\while循环\笔记\while循环.html

**Title:** while循环

while循环

自己总结

AI总结

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="while循环">
<main>
    <header>
        <h1>while循环</h1>
    </header>
    <section id="section_1">
        <article>
            <h2>自己总结</h2>
            <ul>
                <li><code>python</code>的while循环与<code>JavaScript</code>的while循环基本一致

<h3>python写法</h3>
                    <ol>
                        <li>
                            <code style="display: block">
                                while 循环条件:
                                <br><span>&nbsp;&nbsp;# <span class="span">循环条件</span>可以设置为True(但是内部需要break退出，否则陷入死循环)，也可以自行设置边界，达到某个阈值便停止循环</span>
                                <br>&nbsp;&nbsp;代码块
                                <br>&nbsp;&nbsp;;break
                                <br><span>&nbsp;&nbsp# break是退出循环的一种方式</span>
                            </code>

<code style="display: block">
                                while 循环条件:
                                <br>&nbsp;&nbsp;代码块
                                <br>else: # <span>当while循环结束(<span class="span">不被break提前终止</span>)后，执行else内的代码块</span>
                                <br>&nbsp;&nbsp;代码块
                            </code>

<h3>总结：</h3>
                            <ol>
                                <li>循环顾名思义在某一个范围内重复执行代码块，停止有两种方法：

在写入循环条件时：<span>规定好边界，达到阈值退出循环</span>

循环条件写为：<code>True</code>，代码块内部由：<code>break</code><span>关键字退出循环</span>

python独有的：<code>while-else</code>结构，当循环不是被<code>break</code>关键字退出循环或死循环，则循环结束，执行else内代码块

<h3>JavaScript写法</h3>
                    <ol>
                        <li>
                            <code style="display: block">
                                while (循环条件){
                                <br><span>&nbsp;&nbsp;# <span class="span">循环条件</span>可以设置为True(但是内部需要break退出，否则陷入死循环)，也可以自行设置边界，达到某个阈值便停止循环</span>
                                <br>&nbsp;&nbsp;&nbsp;&nbsp;代码块
                                <br>&nbsp;&nbsp;&nbsp;&nbsp;break
                                <br><span>&nbsp;&nbsp;&nbsp;&nbsp;# break是退出循环的一种方式</span>
                                <br>&nbsp;&nbsp;}
                            </code>

<code style="display: block">
                                <br>num = 0 // <span>初始化变量</span>
                                <br>do { // <span>do-while，特性：不管条件是否成立，代码块都会执行一次</span>
                                <br>&nbsp;&nbsp;console.log(num)
                                <br>&nbsp;&nbsp;if (num === 20){
                                <br>&nbsp;&nbsp;&nbsp;&nbsp;break;
                                <br>&nbsp;&nbsp;}
                                <br>&nbsp;&nbsp;num++
                                <br>}while (循环条件)
                            </code>

<h3>总结：</h3>
                            <ol>
                                <li>同样循环停止有两种方法：

在写入循环条件时：<span>规定好边界，达到阈值退出循环</span>

循环条件写为：<code>True</code>，代码块内部由：<code>break</code><span>关键字退出循环</span>

JavaScript有但python没有：<code>do-while</code>结构，<span>不管循环条件是否成立，都会执行一次代码块</span>。

综上所述：<span>python的循环条件不需要括号，代码由缩进控制。JavaScript的循环条件小括号，代码块由大括号包裹</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\类型注释\函数的类型注释\函数的类型注释.html

**Title:** 函数的类型注释

函数的类型注释

语法

总结

扩展——不定长参数的注释

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>函数的类型注释</h1>
    </header>
    <section id="section_1">
        <ul id="函数的类型注解">
            <li>定义：<span>为函数的参数和返回值添加类型注解</span>

<h2>语法</h2>
                <code style="display:block;">
                    <br>def calc(score: list[int]) -> float: # <span>注释形参列表元素数据类型，<code>-> float</code>表示返回值的数据类型</span>
                    <br> &nbsp;&nbsp;return sum(score)/len(score)
                    <br>
                    <br>def calc_data(scores: list[int]) -> tuple[int,int,float]: <span><code>list[int]</code>注释列表元素数据类型，<code>-></code>注释返回值的数据类型</span>
                    <br> &nbsp;&nbsp;max_v = max(scores)
                    <br> &nbsp;&nbsp;min_v = min(scores)
                    <br> &nbsp;&nbsp;avg_v = sum(scores) / len(scores)
                    <br> &nbsp;&nbsp;return max_v, min_v, avg_v
                </code>

<h2>总结</h2>
                <ol>
                    <li>如上代码所见：<span>函数的注释主要在：<span class="span">参数注释、返回值注释(提醒)</span></span>

<span>参数注释与<a href="../类型注释——介绍/类型注释——介绍.html">普通注释一致</a></span>

<span>可以单个注释，也可以多个注释，多个注释用<code>|</code>隔开，或<code>Union[]</code>。</span>

<span>元组规则一致：逗号隔开：<span class="span">对应下标注释</span>、<span class="span"><code>|或Union[]</code>：对应下标元素多个数据类型注释、<code>...</code>后续元素匹配前一个数据类型</span></span>

<code>...</code>必须放在最后面，且只能出现一次

<span>返回值注释</span>：<span class="span">形参后面添加：<code>-> 普通注释</code></span>

注意：<span>默认参数类型推断机制，默认参数的字面量的类型注释就是值的数据类型</span>

<h3>不定长参数——位置参数</h3>
                <ol>
                    <li>常规注释：<code>def calc(*args: int) -> float</code>

含义：<span>每个多余的实参都应是 <code>int</code> 类型</span>

也可写成：<code>def calc(*args: tuple[int, ...]) -> float</code>（但不如上面的写法常用）

<span>同样：类型固定且多个可以用：<code>|或Union[]</code>，如果类型不固定可以用：<code>Any</code></span>

<h3>不定长参数——关键字参数</h3>
                <ol>
                    <li>常规注释：<code>def student(**kwargs: int) -> tuple[list[str], list[int]]</code>

<span>表示多余的关键字参数，键默认为<code>str</code>类型、值注释为<code>int</code>类型</span>

<span>Python 3.12+</span> <span class="span">可写成：<code>def student(**kwargs: dict[str, int]) -> ...</code></span>

<span>如果值类型不固定，用 <code>def student(**kwargs: Any)/def student(**kwargs:dict[str,Any])</code></span>

<span><span>也就是：类型固定且多个可以用：<code>|或Union[]</code>，如果类型不固定可以用：<code>Any</code></span>，但是仅限于值的注释，键必须是：<code>str</code>类型——<span class="span">不定长参数——关键字的硬性要求</span></span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\类型注释\函数的类型注释\函数的类型注释.py

def calc(*args: int) -> float:
    return sum(args) / len(args)


print(calc(50, 11, 30, 60, 70))


def student(**kwargs: int) -> tuple[list[str], list[int]]:
    names = list(kwargs.keys())
    scores = list(kwargs.values())
    return names, scores


name,score = student(**{'a': 50, 'b': 60, '大名': 'k'})
for name, score in zip(name, score):
    print(name, score)


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\类型注释\类型注释——介绍\类型注释——介绍.html

**Title:** 类型注解——价绍

类型注解——价绍

关于<code>...</code>的规范

注意事项

<code>python</code>——类型推断

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body>
<main>
    <header>
        <h1>类型注解——价绍</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>类型注解是：<span><code>python</code>的一种语法特征，用于(明确标识变量、函数参数和返回值的数据类型)，从而使代码<span
                    class="span">更清晰、更安全、更易维护</span></span>

语法结构(<span>变量</span>)：<code>字面量:数据类型 = 变量值</code>

语法结构(<span>容器[列表]</span>)：<code>字面量:list[数据类型] = 值</code>

语法结构(<span>容器[集合]</span>)：<code>字面量:set[数据类型] = 值</code>

语法结构(<span>容器[字典]</span>)：<code>字面量:dict[【键】数据类型,【值】数据类型] = 值</code>

语法结构(<span>容器[元组]</span>)：<code>字面量:tuple[下标1数据类型,下标2数据类型, ...] = 值</code>

<span>扩展：可以使用<span class="span">或运算符【<code>|</code>】</span>或 <span
                    class="span">导入模块[<code>from typing import Union</code>]，语法：<code>[Union[str,int,...]]</code></span></span>

<code>Any</code>关键字，关闭python类型检查，暂时理解为：<span class="span">所有数据类型都可以</span>

<h2>关于<code>...</code>的规范</h2>
                <ol>
                    <li>
                        <span><code>...</code>不能当作类型使用，要想规定元素可以是多种数据类型，只能单独列出来，<code>|</code>隔开，或 <code>Union()</code></span>

但是：<span><code>...</code>在<code>tuple</code>有特殊作用：<span class="span">表示后续所有元素，匹配符号前一个数据类型。</span></span>

注意：<span>其他容器没有<code>...</code>，要想定义所有数据类型用<code>Any</code></span>

<span><code>tuple</code>可以使用：<code>...</code>，<span
                            class="span">但是只能在最后一个，且只能出现一次</span></span>

<h2>注意事项</h2>
                <ol>
                    <li>
                        <span>所有结构都能使用：<span class="span">或运算符【<code>|</code>】或 <code>Union</code>达成一个元素可以是多种数据类型</span></span>

<span>包括键和值(<span class="span">同样是可以指定多个数据类型</span>)：<span class="span">但是注意键必须是可哈希的，必须是不可变的，比如：(<code>str、int、float、tuple...</code>)</span></span>

<h3><span>在非使用多种数据类型写法状态下：</span></h3>
                        <ol>
                            <li>
                                <span><code>字面量、list、set、dict</code>对应的变量值、元素、键和值必须是指定的数据类型</span>

<span><code>tuple</code>同样是使用【<code>|或Union</code>】指定单个元素的多种数据类型，逗号分隔是指定对应下标的数据类型，<span
                                    class="span">这是元组独有的</span></span>

<span>注释不能作用于解包场景：比如：(<code>name:str , age:int = "YLH",20</code>)直接报错/(<code>name, age:int = "YLH", 20</code>)同样继续报错</span>

<span>整个过程是注释的过程，重在提醒操作或调用者需要赋值或传参的数据类型，并不是规定数据类型，不按指定的数据类型赋值或传参，<b>并不会报错</b></span>

<span>同一个字面量的注释,后面的会覆盖前面的</span>

类型推断是指：<span><code>python</code>解释器自动推断出变量，表达式或函数返回值的数据类型的能力，而无需开发者显示声明</span>

<span>通过值的数据类型，推断出字面量的数据类型</span>

<span>在对变量进行直接赋值，或涉及到变量的运算，容器的推导式等场景时，解释器会自动推导出变量的类型</span>

<span>所以正常写代码可以不必写注释，主要是：<a
                    href="../函数的类型注释/函数的类型注释.html/#函数的类型注解" onclick="loadContent('../函数的类型注释/函数的类型注释.html','container','#函数的类型注解'); return false">函数参数</a>的注释</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\类型注释\类型注释——介绍\类型注释——介绍.py

from typing import Union

# 字面量注释

# 单个注释
name: str = "YLH"
# 多个数据类型
age: int | str = float(input("请问你的年龄是：age="))  # 只会提示，而不是报错
print(name)
print(age)
# 列表注释

# 指定所有元素，单个数据类型
my_list: list[str] = ["hello", 50, "必须是字符串"]  # 非使用 | 或 Union 指定的数据类型，所有元素必须遵守，同样只是提示，而非报错
print(my_list)
# 指定所有元素，可以是多个数据类型

my_list2: list[str | int] = ["hello", 50, "必须是字符串"]  # 使用 或运算符 | 指定元素可以是多个数据类型
print(my_list)
my_list3: list[Union[str, int, float]] = ["hello", 50, "必须是字符串", (50, 100)]  # 使用 模块与包 Union 指定元素可以是多个数据了类型
print(my_list3)
# 集合注释

# 指定所有元素，单个数据类型
my_set: set[str] = set()
my_set.add("hello")
my_set.add(50)  # 提示，但不会报错
my_set2: set[str | int | float] = set()  # 使用 或运算符 | 指定元素可以是多个数据类型
my_set2.add(50)
my_set2.add("hello")
print(my_set)
# 同一个字面量，后面的注释会覆盖前面的注释
my_set2: set[Union[str, int, float, tuple]] = set()  # 使用 模块与包 Union 指定元素可以是多个数据了类型
my_set2.add(50)
my_set2.add("hello")
my_set2.add((50, 100))

# 字典注释

# 指定所有键和值，单个数据类型
my_dict: dict[str, int] = {"姓名": "YLH", "年龄": 20}
print(my_dict)

# 同一个字面量，后面的注释会覆盖前面的注释

my_dict: dict[str | int | tuple, str | float | int | list] = {"name": "YLH", "age": 20, (50, 30): "元组"}
print(my_dict)
my_dict: dict[Union[str, int, tuple], Union[str,int,bool]] = {"name": "YLH", "age": 20, (50, 30): "元组"}

# 元组注释
# 注意：... 不能作为类型使用

# 单个注释
my_tuple: tuple[str, int, float] = ("name", 15, 18.5)

print(my_tuple)

# 多个数据类型注释
my_tuple: tuple[str|int|float,int|bool] = ("name", 15)
print(my_tuple)


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——创建类-实例对象-实例方法概念\代码\__init__.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——创建类-实例对象-实例方法概念\代码\面向对象——创建类-实例对象-实例方法概念.py

# 要求定义一个学生类，初始化属性（班级、姓名、年龄、性别,城市），建立一个实例方法，输出学生信息。

class Student:  # 首字母大写——约定
    # 将所有属性和方法封装到类中,通过类实例化对象,通过实例对象调用类内部的方法,达到对应结果,结果的过程不可见,就是面向对象
    # 通过 __init__ 方法是初始化方法，会在对象创建时自动调用
    def __init__(self, name, cls, age: int, gender, city):
        """
        创建实例对象
        :param name: 学生姓名
        :param cls: 学生所在班级
        :param age: 学生年龄
        :param gender: 学生性别
        :param city: 学生所在城市
        """
        # 通过 实例对象(self).属性 = 实参(传入的实参) 整个过程：添加实例属性
        self.cls = cls
        self.name = name
        self.age = age
        self.gender = gender
        self.city = city
        # 创建所有是实例属性，每实例化一个对象，实例方法便会执行一次。
        # 所以每个实例对象都会有默认的属性，统一管理：统一修改、统一删除、统一添加。
        # 这才是将类是'蓝图'、'模板'贯彻极致

        # 方法代码从上往下执行,每一步清晰可见,就是面向过程

    # 创建实例方法，用于输出实例对象
    def print_student(self):
        """
        以字典的形式打印学生信息

        :return: 无返回值
        """
        for value in self.__dict__.values():
            print(f"{value}", end=" ")
        print(end="\n")
        # 方法代码从上往下执行,每一步清晰可见,就是面向过程

    # def __str__(self):
        # return "我在用魔法(钩子)：__str__"

    # def __repr__(self):
        # return "我在用魔法(钩子)：__repr__"


# 实例化对象

# 第一位学生
student1 = Student('小明', '软件三班', 20, '男', '江西省吉安市')

# 调用实例方法
student1.print_student()

# 第二位学生
student2 = Student('小红', '数控一班', 20, '女', '江西省吉安市')
student2.print_student()



student2.age = 60
print(student2.__dict__)
print(Student.__dict__)
print(student1)


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——创建类-实例对象-实例方法概念\笔记\面向对象——创建类-实例对象-实例方法概念.html

**Title:** 类与对象

类与对象

怎么定义类

在上面，我们理解了，怎么创建类、怎么创建实例对象，怎么对实例对象进行操作

问题2(解决)

关键字解释(<span>用于后续复习</span>)

扩展

扩展2——类与实例对象的关系

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="类与对象">
<main>
    <header>
        <h1>类与对象</h1>
    </header>
    <section id="section_1">
        <h2>怎么定义类</h2>
        <ul>
            <li>语法：<code>class 类名: 代码块</code>

类名建议：<span>正常来说，类名与字面量规则一致，但是为了方便识别，尽量首字母大写</span>

<a href="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/数据存储与运算/标识符/笔记/标识符.html/#命名开发者约定"
                   onclick="loadContent(this,'container-类与对象','#命名开发者约定');return false">命名开发者社区约定</a>
                <div id="container-类与对象" class="div_table"></div>

<h3>实例对象操作</h3>
                <ol>
                    <li>
                        <h4>创建实例对象(<span>重点</span>)</h4>
                        <ul>
                            <li><code>对象名 = 类名()</code>

<span>这个对象名，就是实例对象，后续操作通过它来完成</span>

<span>前提是类必须存在</span>

<span>一个类中，实例对象可以是无数个，重名则覆盖</span>

<h4>创建(添加)实例属性(<span>了解即可</span>)</h4>
                        <ul>
                            <li><code>对象名.属性名 = 属性值</code>

<span>支持动态添加属性(<span class="span">前提是属性名本身未定义</span>)</span>

执行该操作需要先创建实例对象

<h4>输出(查询)实例对象属性/属性值(<span>独特场景会用到</span>)</h4>
                        <ul>
                            <li><code>对象名.属性</code>：<span>只适用单个属性查询，<span
                                    class="span">返回值是属性值</span></span>

<span>注意直接打印实例对象，<span
                                    class="span">结果是内存地址而不是</span>打印所有属性值</span>

<span>可以使用：<a href="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/面向对象/基础/面向对象——创建类-实例对象-实例方法概念/笔记/面向对象——创建类-实例对象-实例方法概念.html/#__dict__"
                                                  onclick="loadContent(this,'container-类与对象2','#__dict__');return false">_dict__</a>以字典形式打印出来 <span
                                    class="span">属性名为键，属性值为值</span></span>
                                <div id="container-类与对象2"></div>

执行该操作需要先创建实例对象

<h4>修改实例对象属性值(<span>独特场景会用到</span>)</h4>
                        <ul>
                            <li><code>对象名.属性名 = 新属性值</code>

<span>前提是属性名，已经定义</span>

执行该操作需要先创建实例对象

<h4>删除实例对象（<span>本身/属性</span>）</h4>
                        <ul>
                            <li>删除属性：<code>del 对象名.属性名</code>

<span>前提是实例对象已经创建，且属性名，已经定义</span>

删除实例对象：<code>del 对象名</code>

前提是实例对象已创建，永久删除

<h4>注释事项</h4>
                        <ul>
                            <li>类可以有无数个实例对象

实例对象执行的任何操作与类没有任何影响，只会对实例对象本身产生影响

但是类中：通过创建的实例对象，以及内部方法的更改，将对全部实例对象产生影响

<span>实例对象属性与实例属性是同一个意思</span>

<h3>示例</h3>
                <code>
                    <br>class Student:
                    <br> &nbsp;&nbsp;pass
                    <br>
                    <br>students = Student()
                    <br>students.name = 'YLH'
                    <br>students.age = 20
                    <br>students.gender = '男'
                    <br>print(students.__dict__)
                </code>

<h3>那么我们来解决两个问题：</h3>
                <ol>
                    <li><span>方法写哪里，怎么用方法，能不能使用操作实例对象那样，进行方法的操作</span>

<span>类的定义是实现复用，类可以有无数个实例对象，通过上面所学习的操作，怎么的发挥类的最大用处吗？</span>

<h3>问题1(解决)</h3>
                <ol>
                    <li><span>很遗憾，类外面的方法，无法用于实例对象使用</span>

<span>那么很明确了，类的方法（函数）必须在类中定义</span>

<span>好处也及其明显，统一修改，统一增加，统一删除、实例对象统一调用</span>

实例方法的使用：<code>对象名.方法名()</code>

实例方法：<span>第一个形参必须是：<code>self</code></span>

<h4>注意</h4>
                        <ul>
                            <li>如果通过实例属性修改的操作，将原本定义好的实例方法赋值会怎么样

比如(<span>假设<code>calc</code>是一个实例方法</span>)：<code>对象名.calc = 值</code>

结果是：<span>原本实例方法(<code>calc</code>)变为了实例属性，后续改对象再次使用它，便是属性，失去原有功能</span>

<span>所以避免，给实例方法赋值</span>

<span>实例方法跟普通方法一样，只有在被调用才会执行</span>

也就是实例对象可以根据自己需要调用对应的实例方法，而不是创建实例对象就执行

<span>定义在类的外面的称之为<span class="span">函数</span> ，定义在<span class="span">类中的函数称之为方法</span></span>

<h2>问题2(解决)</h2>
                <ol>
                    <li><span>实例方法必须在类中定义，所以可以：统一修改、统一增加、统一删除，达到方法统一管理的目的</span>

类的最大优点就是：<span>统一管理</span>，当每个实例对象的属性，均为不同，极其分散，违背了类的定义

类的定义：<span>它是所有实例对象的'<span class="span">蓝图/模板</span>'</span>

<h3>__init__</h3>
                        <ul>
                            <li>
                                <code>__init__</code>：<span>初始化方法，对象创建后自动调用，主要用于设置对象的初始状态(<span
                                    class="span">设置对象属性</span>)</span>

可以在类的开头使用构造函数：<code>def __init__(self,参数列表):</code>，为每个实例对象设置默认的属性

这么一来：<span>属性与方法一致：统一增加、统一删除、统一修改</span>

<h4>注意事项</h4>
                                <ol>
                                    <li>既然是函数，就不要将<code>def</code>忘记了

既然是函数，就能被传参，但是<code>self</code>始终排在第一位

且后续使用对应属性也必须是：<code>self.属性</code>的形式，外部就是：<code>对象名.属性</code>的形式

<h5>例如</h5>
                                        <code>
                                            <br>class Student:
                                            <br> &nbsp;&nbsp;def __init__(self,name,age,gender):
                                            <br> &nbsp;&nbsp; &nbsp;&nbsp;self.姓名 = name # 定义属性
                                            <br> &nbsp;&nbsp; &nbsp;&nbsp;self.年龄 = age # 定义属性
                                            <br> &nbsp;&nbsp; &nbsp;&nbsp;self.性别 = gender # 定义属性
                                            <br>students = Student('小明',20,'男') # 创建实例对象
                                            <br>students2 = Student('小红',20,'女') #创建实例对象
                                            <br><span>注意：实例对象重名，后定义的覆盖前定义的</span>
                                        </code>

<span>总结：<code>def __init__(self)</code>，
                                就是跳过先定义实例对象再增加属性这个弊端，规定每个实例对象初始属性，方便类内统一管理</span>

<span><code>self</code>就是实例对象本身</span>

<h2>关键字解释(<span>用于后续复习</span>)</h2>
                <ul>
                    <li>面向过程：<span>以过程为主，每一步都有迹可循。(比如函数、条件分支、循环体)从上到下每一步都清晰</span>

面向对象：<span>对外暴露清晰的接口，使用者通过调用方法获取结果，内部具体如何实现被封装隐藏，对调用者不可见。</span>

类：<span>就是<span class="span">蓝图/模板</span> ，定义了属性和方法的"<span
                            class="span">规范</span>"</span>

实例对象：<span>以类为蓝图，通过 <code>实例对象名 = 类名</code>,实例化的对象，对象内包含(<span
                            class="span">属性和方法</span>)，一个类可以有无数个实例对象</span>

实例属性：<span>每个实例对象都拥有自己独立的一份属性，互不干扰，就像同一个列表中不同位置的元素，各自保存各自的值。</span>

实例方法：<span>必须再类中定义，注意不要给方法重新赋值，且第一个参数永远是：<code>self</code></span>

<code>__init__</code>：<span>就是这个蓝图上指定的"<span>初始设置</span>"，确保每个实例生来就拥有完整的属性</span>

<code>self</code>：<span>就是将来要创建的实例对象本身，它暂时还没有名字，所以用<code>self</code>指代，创建完成后，self就是实例对象名</span>

<span>在类中，<span>实例方法的第一个参数必须是 <span>self</span>，<span
                                class="span">但调用时不需要传入</span>，Python 会自动把调用对象传进去</span></span>

<span>最后，最好将属性和方法均放入到类中，方便统一管理，除非项目必要操作，尽量不要在类外，增加属性、删除属性、有必要可以适当修改属性值</span>
                        <br><span
                            class="span">实例对象的修改，不会对类产生影响，但是类中的变化，将导致所有实例对象，产生影响。</span>
                        <br><span>但要注意： 如果是通过类名修改类属性，则会影响所有实例；如果是通过实例修改类属性，
                        则只会影响该实例自己的副本（如果该实例没有同名属性，则会新建一个实例属性覆盖）。</span>

<span>实例对象属性，尽量遵守：字面量的硬性规则：<span
                            class="span">A-Z,a-z,非数字开头数字，中文同样不建议使用。</span></span>

<span>还需要注意的是：<span class="span">注意公有与私有的关系，</span>私有为下划线开头的字面量(属性)，公有则反之</span>

<h3><code>__dict__</code></h3>
                <ol>
                    <li>说明：<span><code>__dict__</code>是<code>python</code>中自定义类实例的一个特殊属性，<span
                            class="span">用于以字典形式存储对象的所有属性</span></span>

本身是字典：<span>所以：<code>__dict__.keys()、__dict__.values、__dict__.items()</code>功能一致。返回视图</span>

删除写法略有不同：<code>__dict__.popitem()</code>,<span>无法传参，默认删除最后一个，返回值是对应的元组(属性,属性值)</span>

<a href="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/数据容器/数据容器——字典dict/数据容器——字典dict-常规操作/笔记/数据容器——字典dict-常规操作.html#字典操作"
                           onclick="loadContent(this,'container-类与对象3','#字典操作');return false">字典操作回顾</a>
                        <div id="container-类与对象3" class="div_table"></div>

<h3>类与实例的关系</h3>
                <ul>
                    <li>实例对象通过 <code>__class__</code> 指向类对象（存储的是类对象的内存地址）。

当访问实例属性/方法时，查找顺序：
                        <ol>
                            <li>先在实例自己的 <code>__dict__</code> 里找。

没找到则通过 <code>__class__</code> 去类对象的 <code>__dict__</code> 里找。

还没找到则继续通过 <code>__bases__</code> 往父类找。

<h3>实例对象的结构</h3>
                <ul>
                    <li>实例对象由属性组成，属性以 <strong>键值对</strong> 形式存储。

属性存放在 <code>__dict__</code> 中：
                        <ul>
                            <li>属性名 → 键

属性值 → 值

<strong>所以：实例对象本质上就是一个字典。</strong>

<h3>类对象的结构</h3>
                <ul>
                    <li>类对象也有 <code>__dict__</code>，存储类的属性和方法。

类对象还有 <code>__bases__</code>，指向父类。

类对象属性查找顺序：先 <code>__dict__</code>，再 <code>__bases__</code>。

<h3>__class__ 的可变性</h3>
                <ul>
                    <li><code>__class__</code> <strong>不是只读的</strong>，你可以修改它，让实例切换到另一个类：<br>
                        <code>实例.__class__ = 其他类</code>

切换后，该实例的行为（方法调用）会立刻变成新类的行为，但自身已有的属性（<code>__dict__</code>）保持不变。

<strong>正常开发中不建议这样做</strong>，会降低代码可读性和可维护性，属于高阶技巧（如框架中的动态代理）。

知道它存在即可，作用是帮助你理解“实例通过引用指向类”这个机制的灵活性。

<h3>关键结论</h3>
                <ul>
                    <li><strong>实例属性来源一（自身）</strong>：<code>__dict__</code> —— 修改只影响当前实例。

<strong>实例属性来源二（共享）</strong>：<code>__class__</code> —— 类修改影响所有实例。

<strong>修改实例自身</strong> → 只改 <code>__dict__</code>，不影响类和其他实例。

<strong>修改类</strong> → 改 <code>__class__</code> 指向的内容，影响所有实例。

<strong>更换类</strong> → 改 <code>__class__</code> 指向另一个类，实例行为随之改变，自身属性保留。

<h3>__init__ 的实际操作（本质）</h3>
                <ul>
                    <li><code>__init__</code> 在实例对象创建后自动执行。

它做的操作是：在实例的 <code>__dict__</code> 里添加键值对（属性名 → 属性值）。

它的核心逻辑就是：
                        <ul>
                            <li><code>self.属性名 = 值</code> → 等价于 <code>self.__dict__['属性名'] = 值</code>

所以，<code>self</code> 就是将来要创建的那个实例对象本身。

调用时不需要手动传入 <code>self</code>，Python 会自动把当前实例传进去。

<strong>所以：__init__ 不是“构造函数”，而是“初始化方法”。</strong>
                        <ul>
                            <li>实例对象由 Python 底层（<code>__new__</code>）创建。

<code>__init__</code> 只负责给创建好的实例添加初始属性，不负责创建实例本身。

这也是为什么 <code>__init__</code> 里必须通过 <code>self.属性 = 值</code>
                        来定义属性——因为它是在给实例这个字典添加键值对。

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——实例属性与类属性\代码\__init__.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——实例属性与类属性\代码\面向对象——实例属性与类属性.py

# 创建类

class Student:
    def __init__(self, name, age, cls=None):
        try:
            age = abs(int(age))  # 这里面的：age 就是 局部变量。方法内，不是self定义
        except ValueError:
            print("年龄应该数正数")

        # 一下这些，通过self定义。其实就是：对象.属性 = 值。 是实例属性。
        self.name = name
        self.age = age
        self.cls = cls if cls is not None else Student.cls
        """
            条件表达式：值1 if 条件 else 值2
                当条件成立，使用值1，否则使用值2
            等价于:
                if cls is not None:
                    self.cls = cls
                else:
                    self.cls = Student.cls
        """

    # 类中——方法外——非self定义的字面量。是类属性，所有对象均可访问。通过：__class__接口
    cls = "软件一班"

    def __str__(self):
        return f"{self.cls},{self.name},{self.age}"


stu1 = Student('小明', 15)
print(stu1)

stu2 = Student('小红', 20, '数控一班')
print(stu2)

# 外部创建 实例属性：对象.属性 = 值。存放在对象的__dict__中
stu1.score = 50
print(stu1.__dict__)

stu2.score = 100
print(stu2.__dict__)

# 从输出可见，每个实例都有自己独立的 __dict__，互不影响——这为封装提供了技术基础。
# 而每个类也都有自己独立的 __dict__，同名方法在不同类中可以独立定义——这是多态能够成立的前提。。

# 外部创建类属性：类名.属性 = 值。存放在类的__dict__中
Student.score = 90
print(Student.score)

"""
    总结：
        1.通过[对象.属性] 的方式定义的属性叫 【实例属性】
        2.在类中，方法外且非self定义的属性、在类外：[类名.属性] 的方式定义的属性叫 【类属性】
        3.在方法中，非[self]定义的字面量或函数中定义的字面量，叫 [局部变量]
        4.通过链式运算或链式比较，中间过程的结果叫：【临时对象，用完第一个销毁】
        
        查找顺序：
            1.先了解：对象与类的接口：__class__。类与父类(基类)的接口：__bases__。
            2.属性查询：对象本身：__dict__————>类中：__dict__————>父类中：__dict__————>基类中：__dict__
            3.方法查询：类中：__dict__————>父类中：__dict__————>基类中：__dict__
"""


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——实例属性与类属性\笔记\面向对象——实例属性与类属性.html

**Title:** 类属性与实例属性

类属性与实例属性

具体区分

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="类属性与实例属性">
<main>
    <header>
        <h1>类属性与实例属性</h1>
    </header>
    <section id="section_1">
        <ul>
            <li><span>实例属性：<span
                    class="span">实例属性属于每个具体对象的属性，每个对象都是独立的。(各个对象特有的数据)</span></span>

<span>类属性：<span
                    class="span">类属性是属于类本身的属性，所有实例共享的。(所有对象共享的数据或配置)</span></span>

<h2>具体区分</h2>
                <ol>
                    <li>
                        实例属性：<span>类中通过魔法方法：<code>__init__</code>创建的实例属性</span>和<span>单独在实例对象添加的属性</span>

类属性：<span>类属性只有一个，在类中 <span>方法外定义的变量(属性)</span></span>

<h3>注意分辨：</h3>
                        <ul>
                            <li>
                                <h4>局部变量</h4>
                                <ol>
                                    <li><span>局部变量：<span class="span">方法内部，非<code>self</code>定义的变量</span></span>

<h4>实例属性</h4>
                                <ol>
                                    <li><span>实例属性：<span class="span">通过<code>self</code>定义的属性(变量)</span>，不管是类中还是实例对象</span>

还有在类中，实例属性统一在：初始化方法<code>__init__</code>中定义

<span>不要到实例方法内单独定义<span class="span">实例属性</span></span>

<code>__init__</code><span>同样可以定义局部变量</span>

<h4>类属性</h4>
                                <ol>
                                    <li><span>类属性本质就是存储在，类的<code>__dict__</code>属性</span>

<h5>定义同样有两种方法：</h5>
                                        <ul>
                                            <li><span>在类中，方法外，非<code>self</code>定义的属性(变量)</span>

<span>在类外，通过：<code>类名.属性 = 值</code>的方式定义。</span>

注意如果是：<span><code>实例对象.类属性 = 值</code>，会在实例对象的<code>__dict__</code>添加对应的属性,
                                                不会影响类的<code>__dict__</code></span>

<span>类属性适合存储“所有实例共享的数据”</span>，比如默认配置、常量、学校名称等。实例属性适合存储“每个实例各自不同的数据”，比如姓名、成绩等。

<span>全部实例对象共享</span>

<h3>回顾属性和方法的查找顺序</h3>
                                <ol>
                                    <li>
                                        <h4>方法</h4>
                                        <ul>
                                            <li>
                                                <span>对象通过：<code>__class__</code>在类的<code>__dict__</code>查找————>
                                                <br>通过 <code>__bases__</code>在父类查找的<code>__dict__</code>查找——————>
                                                <br>最后通过<code>__bases__</code>在基类查找的<code>__dict__</code>查找——————>
                                                <br>均没找到报错</span>

<h4>属性</h4>
                                        <ul>
                                            <li>
                                                <span>对象本身<code>__dict__</code>查找——————>
                                                <br>通过 <code>__class__</code>在类的<code>__dict__</code>查找————>
                                                <br>通过 <code>__bases__</code>在父类的 <code>__dict__</code>查找——————>
                                                <br>最后通过 <code>__bases__</code>在基类的<code>__dict__</code>查找—————>
                                                <br>均没找到报错</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——魔法方法\代码\__init__.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——魔法方法\代码\面向对象——魔法方法.py

# 创建一个学生类
class Student:
    # 对象的生命周期：创建、初始化、销毁

    # def __new__(cls, *args, **kwargs):
    #     """
    #      __new__ 创建实例第一个执行。默认是： object.__new__
    #     :param args:
    #     :param kwargs:
    #     """
    #     return super().__new__(cls)  # super使用父类方法

    def __init__(self, cls, name, age, city, score, sum_score=None):
        """
        __init__：在：__new__执行后，立即执行。默认作用：初始化实例
        :param cls: 班级
        :param name: 姓名
        :param age: 年龄
        :param city: 城市
        :param score: 成绩
        :param sum_score:总成绩，默认None。只有执行 加法运算才有结果
        """
        self.cls = cls
        self.name = name if isinstance(name, list) else [name]  # isinstance 类型检查器，返回布尔值。同一实例对象写法。
        self.age = age
        self.city = city
        self.score = score if isinstance(score, list) else [score]
        self.sum_score = sum_score

    # __del__：当执行销毁操作执行。
    def __del__(self):
        """
         字符串提示。
         __str__:当print()、str()。执行该函数。返回值只能是字符串
        :return: 返回字符串
        """
        print(f"{self.name} 对象销毁完毕")

    def __str__(self):
        """
        覆盖原本基类的：__str__返回值
        :return: 返回字符串
        """
        return f"班级：{self.cls}，姓名：{self.name}，年龄：{self.age}，城市：{self.city}，成绩：{self.score},总成绩：{self.sum_score}"

    def __repr__(self):
        """
        __repr__：当repr()、交互姐界面输入对象名回车后，执行该函数
        :return: 返回字符串
        """
        return f"{self.name} {self.age} {self.city}"

    # 运算符重载

    # 运算符重载——运算方法

    def __add__(self, other):
        """
         __add__：当执行 + 运算，执行该函数

         当实例对象需要进行加法运算、因为正常存储的是内存地址，
         可以通过__add__，覆盖原本加法逻辑，使加法可以正常运行

         注意事项：__add__只支持两个对象(self,other)，同级运算：从左到右。结合运算：先乘除再加减，特殊：有括号先计算括号内的

         不管最后结果如何，计算的结果就是新对象——临时对象，下一个符号左边的是：self，右边的是：other
        :param self: 加号左边的对象
        :param other: 加号右边的对象
        :return: 返回计算成绩后的结果
        """

        if isinstance(other, Student):
            try:
                new_score = self.score + other.score  # 列表拼接
                total_score = sum(float(score) for score in new_score)
            except (ValueError, TypeError):
                print("成绩应该是数字或字符串,否则无法相加")
                return NotImplemented
            new_name = self.name + other.name
            # 只相加分数，其他属性保留
            return Student(
                cls=self.cls,
                name=new_name,
                age=self.age,
                city=self.city,
                score=new_score,
                sum_score=total_score
            )
        # 如果 other 不是 Student ， 返回 NotImplemented
        return NotImplemented  # 反向运算。b__radd__a 如果均不成立


student1 = Student('软件一班', '小明', '18', '吉安', 50)
student2 = Student('软件一班', '小红', '18', '吉安', '100')
student3 = Student('软件一班', '张三', '18', '吉安', '70')
student4 = Student('软件一班', '张三', '18', '吉安', {'score': 40})
result = student1 + student2 + student3  # 等价于 (student1 + student2) + student3
"""
    第一次加法：student1.__add__(student2)：
            返回第一个新的 Student实例，暂时称之为：temp，其中name 为 ['小明','小红']，score 为 [50, '100']
            此时 temp 是临时对象，没有被任何变量引用(除了在第二次加法的过程中会用到)
    第二次加法：temp + student3:
            调用：temp.__add__(student3)
            返回一个新的Student 实例，我们称它为 result ，其中name 为 ['小明', '小红', '张三'],score 为 [50, '100', '70']
            这个result 被赋值给变量 result，所以它存活到了程序结束
    销毁时机 (_-del__的调用顺序):
            1.第二次加法结束后，temp 这个临时对象没有被任何变量引用，python 的垃圾回收器立即回收它，除法 __del__ 打印：['小明', '小红'] 对象销毁完毕
            2.程序结束时，所有全局变量 student1、student2、student3、result 都会被销毁
                （1）销毁顺序通常与创建顺序相反(但python 不保证严格顺序)
                （2）所以总共调用__del__5次，1次临时对象 + 3次原始对象 + 1次最终结果
    __str__的触发：只有打印对象的时候才会被触发。自定义的__str__会覆盖基类的：__str__
"""
print(result)
print(result.score)
print(student1)


# 逻辑方法：__eq__、__lt__、__le__、__gt__、__ge__。
class Shop:
    def __init__(self, name, price, quantity):
        self.name = name
        self.price = price
        self.quantity = quantity

    def __eq__(self,other):
        if isinstance(other, Shop):
            if self.price == other.price:
                return True
            else:
                return False
        return NotImplemented

shop1 = Shop('苹果',50,30)
shop2 = Shop('香蕉',30,15)
shop3 = Shop('荔枝',50,40)
shop4 = Shop('西瓜',50,60)
result1 = shop1 == shop2
result2 = shop1 == shop3 == shop4

if result1:
    print("商品价格一致")
else:
    print("商品价格不一致")

if result2:
    print("商品价格一致")
else:
    print("商品价格不一致")



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象——魔法方法\笔记\面向对象——魔法方法.html

**Title:** 魔法方法

魔法方法

<span><code>python</code>的魔法方法速查表</span>

扩展——属性/方法查询与模块查询之间的关系

官方硬性规定(必须遵守)

社区最佳实践(强烈遵守)

但是计算过程可以是多个对象：比如：<code>object1 + object2 + object3</code>

所采用的形式均是链式比较：比如：<code>a == b == c == d</code>

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="魔法方法">
<main>
    <header>
        <h1>魔法方法</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>定义：<span>魔法方法是指<code>python</code>中提供的双下划线开头和结尾的特殊方法。</span>

作用：<span>用于定义类的特殊行为,比如：<code>__init__</code></span>

特殊：<span>魔法方法不需要手动调用，<code>python</code>会在合适的时机自动调用</span>

时机：<span>看下面的表格</span>

<div class="div_table">
                    <table>
                        <tr>
                            <th colspan="3"><h2><span><code>python</code>的魔法方法速查表</span></h2></th>
                        </tr>
                        <tr>
                            <td colspan="3"><h3><span>一、基类(base class)————所有已知对象的雏形</span></h3></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <h3><span>基类（<code>object</code>）</span></h3>
                                <ul>
                                    <li><code>object</code> 是 Python 中所有类的“老祖宗”，所有类（包括
                                        <code>int</code>、<code>str</code>、<code>list</code> 和你的自建类）都直接或间接继承自它。

它提供了所有对象最基本的行为，比如：
                                        <ul>
                                            <li><code>__new__</code>：分配内存，创建空白实例

<code>__init__</code>：初始化实例属性（默认不做任何事）

<code>__str__</code>、<code>__repr__</code>：返回对象的字符串表示

你写的每一个类，即使不写 <code>class Student(object)</code>，也默认继承自
                                        <code>object</code>。

所以，数字、字符串、列表、函数、自建类……它们都是这个“基准”的派生品，都能用
                                        <code>__new__</code> 创建，也都能用 <code>__str__</code> 转换成字符串，只是默认实现是返回内存地址而已。

<span>创建一个类的<span class="span">新实例</span></span>

<span>这个实例对象本身自带：<code>__dict__、__class__</code></span>

不管类中有没有指定：<code>__new__</code>，只要是实例化对象，就一定会执行：<code>__new__</code>

<span>实例被销毁前执行，用于清理资源</span>

比如：<code>del 字面量</code>删除对象本身，
                                        <br><code>function()</code>函数执行完后，生命周期结束，自动销毁

<span>因为是销毁先执行：<code>__del__</code>内的代码块，所以暂时理解为：提示销毁</span>

官方解释：<span>返回一个用户友好的字符串</span>

<span>返回一个字符串，将原本对象的内存地址，替换成返回的字符串。</span>

语法：<code>def __str__(self): return 需要返回的字符串</code>

注意：<span>只能是字符串，否则报错，且只有<code>self</code>一个参数，调用不需要传参</span>

使用方式：<code>str(对象名)，print(对象名)</code>

<span>注意：<span class="span">自定义对象在 print() 或 str() 时的显示内容（<code>返回值</code>）</span></span>

<span>暂时理解为，有助于提醒调用者，类的作用</span>

官方解释：<span>返回一个开发者友好、精确的字符串</span>

<span>返回一个字符串，将原本对象的内存地址，替换成返回的字符串</span>

语法：<code>def __repr__(self):return 需要返回的字符串</code>

注意：<span>只能是字符串，否则报错，且只有<code>self</code>一个参数，调用不需要传参</span>

使用方式：<code>repr(obj)、交互式环境输入对象名。</code>

交互式环境：<code>命令提示符、IDLE运行环境...</code>,说白了，就是按回车就是执行代码的环境

将多个对象，通过运算符行为，重新组合成一个对象

定义 <code>+</code>运算符的行为

将多个对象，通过运算符行为，重新组合成一个对象

定义 <code>-</code>运算符的行为

将多个对象，通过运算符行为，重新组合成一个对象

定义 <code>*</code>运算符的行为

将多个对象，通过运算符行为，重新组合成一个对象

定义 <code>/</code>运算符的行为

将多个对象，通过运算符行为，重新组合成一个对象

定义 <code>//</code>运算符的行为

将多个对象，通过运算符行为，重新组合成一个对象

定义 <code>%</code>运算符的行为

将多个对象，通过运算符行为，重新组合成一个对象

定义 <code>**</code>运算符的行为

将多个对象，通过运算符行为，重新组合成一个对象

定义 <code>@</code>运算符的行为

<code>@</code>：<span>矩阵乘法(较少用)</span>

<span>只能是两个参数，运算符左边的：<code>self</code>，运算符右边的：<code>other</code></span>

<span>以上运算法则同样：<span
                                                class="span">同级运算符：从左到右(<span>除了特殊情况：括号、加减与乘除混合</span>)</span>
                                        </span>

<span>当(加减与乘除混合)：<span
                                                class="span">优先计算乘除，再进行加减</span>,有括号除外</span>

<p>但是计算过程可以是多个对象：比如：<code>object1 + object2 + object3</code></p>
                                        <ol>
                                            <li>同级运算：<span>从左往右计算</span>

第一步：object1(<code>self</code>) + object2(<code>other</code>) =
                                                total(结果)——<span>这个<code>total</code>就是临时对象，第一个调用：<code>__del__</code></span>

第二步：total(结果——在左边[<code>slef</code>]) + object3 = total2

可以看到：<span>从始至终都只有两个参数：(<code>self/other</code>)</span>

<span>计算的结果取决于运算符的左边还是右边，左边则为：<code>slef</code>，右边则为：<code>other</code></span>

比如：<code>object1 * object2 + object3 / object4</code>

先计算(<span>乘除</span>)：(<code>object1 * object2= result2</code>) 和
                                                <code>object3 /
                                                    object4 = result1</code>

加号左边的是：<code>result1也就是self</code>，右边的是：<code>result2也就是other</code>

<span>所以最后结果也是：<code>self + other</code>,两个参数</span>

<span>减法/乘法/除法同样的道理，同级从左往右</span>

<h4>总结：</h4>
                                        <ol>
                                            <li><span>固定两个参数，但是可以多个参数参与计算，每次计算的结果按符号位置，左边为：<code>self</code>，右边为：<code>other</code></span>

<span>魔法方法本身，不受同级运算和混合运算影响，但是计算过程受：<span
                                                    class="span"><code>python</code>解释器影响(正常数学运算)</span>。</span>

<span>运算参数必须是数字，可以指定需要执行运算的部分</span>

<span>在链式运算中：<span>中间过程会产生临时变量，这个临时对象一旦后续没有操作会被立刻回收: <span
                                                    class="span">调用：<code>__del__</code></span></span></span>

所以执行(<code>__del__</code>)的顺序是：<span>临时对象——原始对象——输出结果后</span>

<span>返回的是结果</span>

最后严格遵守：<a
                                                    href="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/面向对象/基础/面向对象——魔法方法/笔记/面向对象——魔法方法.html/#官方硬性规定"
                                                    onclick="loadContent(this,'container-魔法方法','#官方硬性规定');return false">官方硬性规定(必须遵守)</a>,
                                                <a href="#社区最佳实践"
                                                   onclick="loadContent(this,'container-魔法方法','#社区最佳实践');return false">社区最佳实践(强烈遵守)</a>

<div id="container-魔法方法"></div>

将多个对象，通过运算符行为，返回一个布尔值

定义 <code>==</code>运算符的行为

记忆：<code>equal：相等的意思。<span>魔法取：前两个字母</span></code>

将多个对象，通过运算符行为，返回一个布尔值

<span>具体返回值，由编码者决定，<span
                                            class="span">但非常不建议，返回除布尔值以外所有类型</span></span>

定义 <code><</code>运算符的行为

记忆：<code>lt:less than。<span>less——小，than——比较，<span
                                            class="span">取首字母</span></span></code>

将多个对象，通过运算符行为，返回一个布尔值

<span>具体返回值，由编码者决定，<span
                                            class="span">但非常不建议，返回除布尔值以外所有类型</span></span>

定义 <code><=</code>运算符的行为

记忆：<code>lt:less than equal。<span>less——小，than——比较，equal——相等<span
                                            class="span">取首尾单词首字母</span></span></code>

将多个对象，通过运算符行为，返回一个布尔值

<span>具体返回值，由编码者决定，<span
                                            class="span">但非常不建议，返回除布尔值以外所有类型</span></span>

定义 <code>></code>运算符的行为

记忆：<code>lt:greater than。<span>greater——大，than——比较<span
                                            class="span">取首字母</span></span></code>

将多个对象，通过运算符行为，返回一个布尔值

<span>具体返回值，由编码者决定，<span
                                            class="span">但非常不建议，返回除布尔值以外所有类型</span></span>

定义 <code>>=</code>运算符的行为

记忆：<code>lt:greater than equal。<span>greater——大，than——比较，equal——相等<span
                                            class="span">取首尾单词首字母</span></span></code>

<span>与运算方法一致，只能有两个参数，运算符左边的是：<code>self</code>，右边的是：<code>other</code></span>

<p>所采用的形式均是链式比较：比如：<code>a == b == c == d</code></p>
                                        <ul>
                                            <li><span>所谓的链式比较：<span class="span">均是拆分操作，先拆分，然后默认使用: <code>and</code>相连</span></span>

比如案例：<code>a == b == c ===> a==b and b==c and c==d</code>

<span>多个对象进行比较，最后都会默认由：<code>and</code>连接</span>

<span>再比如：<code>a > b > c > d ===> a>b and b>c and c>d</code></span>

<h5>回顾：<code>and与or</code></h5>
                                                <ol>
                                                    <li><span>它们均有短路系统</span>

<span><code>and</code>：返回第一个<code>False</code>（<span
                                                            class="span">那么后续代码短路，不会进行判断</span>），若均没有返回最后一个：<code>True</code></span>

<span><code>or</code>：返回第一个<code>True</code>(<span
                                                            class="span">那么后续代码短路，不会进行判断</span>)，若均没有返回最后一个：<code>False</code></span>

<h4>总结</h4>
                                        <ol>
                                            <li>链式比较：<span>拆分、然后由<code>and</code>连接</span>，然后得出最后结果

<span>拆分过程就是，运行比较方法的过程，从来都是两两比较，左边：<code>self</code>，右边：<code>other</code></span>

<span>最后返回的结果是布尔值</span>

<a href="../../../../../../../../内容文件夹/python_study/哔哩哔哩UP主——黑马程序员/第二部分——python核心语法/数据存储与运算/运算符/笔记/运算符.html/#运算符"
                   style="font-size: 1.5rem" onclick="loadContent(this,'container-魔法方法1','#运算符');return false">复习运算符</a>
                <div id="container-魔法方法1"></div>

<h3>属性/方法查询</h3>
                <ol>
                    <li>
                        <span>已知：<code>int、float、str、容器、函数、自建类</code>都是基于，基类(base class)衍生出的子类，<span
                                class="span">也就是它们都有共同的父类——<code>基类(object)</code></span></span>

已知：<code><code>__dict__</code>是每个对象、类中必会存在、用于存储当前对象的属性/方法</code>

<span>也是正是因为每个对象、类中都有自身独立的：__dict__，所以不会互相影响，<span
                            class="span">这就是封装</span></span>

实例对象通过：先通过：<code>__dict__</code>内查询属性/方法，再通过：<code>__class__</code>查询对应类的<code>__dict__</code>

子类通过：<code>__bases__</code>，查询父类的：<code>__dict__</code>

<span>
                            所以查询顺序：<span>实例对象本身(<code>__dict__</code>)</span>————>
                            <br>通过接口<code>__class__</code>查询对应类(<code>__dict__</code>——————>
                            <br>通过接口<code>__bases__</code>查询父类(<code>__dict__</code>)———————>
                            <br>直到查询到基类(<code>object</code>)未找到——————>报错
                        </span>

<span>从下往上查询：<code>__dict__</code>，对象与类接口是：<code>__class__</code>，子类与父类接口是：<code>__bases__</code></span>

<span>子类与父类的关系就是继承关系，子类继承父类的所有属性和方法。通过：<code>super()</code>方法，使用父类的属性和方法</span>

<span>因为每个对象/类都有自己独立的：<code>__dict__</code>，更改的操作只会修改自身的：<code>__dict__</code>，<span
                                class="span">所以同名方法可以有多种不同的效果，这就是多态</span></span>

魔法方法就是继承基类的属性和方法的结果，可以自行修改，自建类定义的同名方法(魔法方法)覆盖原本基类的效果(<span
                            class="span">修改自身：<code>__dict__</code></span>)，所以基类原本方法不受影响，本质也是多态的延申

<h3>模块查询</h3>
                <ol>
                    <li>
                        <span>当前文件夹(<code>sys.path[0]</code>)——————>
                        源根(<code>sys.path[1,-1]</code>)——————>
                        python自带模块(<code>sys.path[-1]</code>)——————>报错</span>

从下往上查询，以<code>sys.path</code>python运行列表为主

<h3>相同点与不同点</h3>
                <ol>
                    <li>
                        <h4>相同点：</h4>
                        <ul>
                            <li><span>查找顺序都是从下往上查找</span>

<span>均找不到，则报错</span>

<h4>不同点：</h4>
                        <ul>
                            <li><span>属性/方法是以：<code>__class__、__bases__</code>引用对应的地址(<span
                                    class="span">接口</span>)找到对应的<code>__dict__</code>内查询</span>

<span>模块是以：<code>sys.path</code>的顺序查找</span>

<span>属性/方法查询的尽头是：基类(object)，模块查询的尽头是：语言自带的模块</span>

<span>必须返回 <code>NotImplemented</code>，而非抛出异常：当你的魔法方法不支持某个操作（例如，学生
                    <br>+ 字典）时，必须返回 <code>NotImplemented</code> 这个特殊值。这让 Python
                    <br>有机会去尝试调用右侧对象的反向方法（如 <code>__radd__</code>）。如果直接抛出
                    <br><code>NotImplementedError</code>，程序会直接崩溃，而不会给右侧对象任何机会。</span>

<span>方法应返回新对象：对于 <code>__add__、__sub__</code> 这类运算，通常应该返回一个运算结果的新对象，而不是修改 self 或 other。这能避免产生难以预料的副作用</span>

<h3>不能改变的规则：运算符重载有一些不可逾越的限制</h3>
                    <ol>
                        <li><span>不能改变运算符的优先级（<span class="span">例如，让 <code>+</code> 比 <code>*</code> 先算</span>）</span>

<span>不能改变运算符的结合性（<span class="span">例如，让 <code>-</code> 从右向左结合</span>）</span>

<span>不能改变运算符的元数（<span
                                class="span">例如，让 <code>+</code> 变成三目运算符</span>）</span>

<span>不能创建新的运算符（<span class="span">例如，不能发明一个 <code>~~</code> 运算符</span>）</span>

<h3>
                        保持语义清晰（避免滥用）：这是最重要的一条原则。重载一个运算符，必须让它做的事情符合人们对这个运算符的普遍认知。</h3>
                    <ol>
                        <li>✅ 好的例子：让 + 实现向量的加法，让 *
                            实现金额的乘法。语义明确，一看就懂。

❌ 坏的例子：让 * 实现“复制用户”的功能。这不符合乘法的直觉，会让人困惑，应该用
                            <code> user.duplicate()</code> 这样的普通方法。

<h3>保持一致性：实现比较运算符时，要保持逻辑上的一致。</h3>
                    <ol>
                        <li>
                            <span>如果你实现了 <code>__eq__</code>，通常也应该实现 <code>__hash__</code>，这样才能保证对象能正常放入集合或作为字典的键。</span>

<span>如果你实现了 <code>__lt__</code>，最好把 <code>__gt__、__le__、__ge__</code> 等也一并实现，或者使用 <code>functools.total_ordering</code> 装饰器来补全。</span>

<span>避免副作用：魔法方法不应该修改操作数的状态（除非是 <code>__iadd__</code> 这样的原地运算）。同时，魔法方法内部也不应该包含复杂的 I/O 操作或日志记录，它应该只专注于实现运算逻辑。</span>

<span>善用类型检查：在方法内部，可以使用 <code>isinstance()</code> 来检查 <code>other</code> 的类型。如果不是期望的类型，应返回 <code>NotImplemented</code>，让 Python 去尝试反向运算。</span>

<span>实现完整协议：不要只实现单个魔法方法，而应考虑实现一整套相关的协议。例如，让一个类支持迭代，就应该实现 <code>__iter__</code> 和 <code>__next__</code>，而不是只实现一个 <code>__getitem__</code>。</span>

<h3> 反向方法（__radd__）与就地方法（__iadd__）</h3>
                    <ol>
                        <li>当你实现 <code>__add__</code> 时，通常也应该考虑实现其“反向”版本
                            <code>__radd__</code>， 以支持操作数顺序交换的情况（如 3 +
                            学生）。
                            <br>同时，<code>+=</code> 这样的增强赋值运算符，是由
                            <code>__iadd__</code> 方法实现的。如果没有定义 <code>__iadd__</code>，Python
                            会回退到使用 <code>__add__</code>。

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象基础案例\面向对象基础案例.html

**Title:** 面向对象基础案例

面向对象基础案例

创建类与添加功能

修改功能

删除和查询

控制台

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象基础案例\面向对象基础案例.py

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


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向对象基础案例\面向对象案例——课后作业\面向对象案例——课后作业.py

# 采用面向对象编程思想完成如下需求
"""
    采用面向对象的编程思想，开发一个购物车管理系统，实现商品信息的添加、修改、删除、查询功能
        要求系统使用自定义对象存储商品数据，通过控制台菜单与用户交互。具体功能如下：
            1.添加购物车：用户根据提示录入商品名称，以及该商品的价格、数量、保存该商品信息到购物车
            2.修改购物车：要求用户输入要修改的购物车商品名称，然后再提示输入该商品的价格、数量、输入完成后修改该商品信息
            3.删除购物车：要求用户输入要删除的购物车名称，根据名称删除购物车中的商品
            4.查询购物车：将购物车中的商品信息展示出来，格式为：”商品名称：XXX，商品价格：XXX，商品数量：XXX“
            5.退出购物车
"""


# 思路：创建一个购物车类：收集商品信息。再创建一个系统类：执行功能。最后写一个控制台菜单函数。
# 尽量做到边界清晰，功能完善。
# 相比课堂案例采用：字典存储学生信息，类中：学生信息创建+功能在一起。这一次尝试分开来。

# 创建购物车类
class Shopping:
    # 初始化方法、实例对象
    def __init__(self, name, price, quantity):
        """
            创建购物车实例属性
        :param name: 商品名称
        :param price: 商品价格
        :param quantity: 商品数量
        """
        self.name = name
        self.price = price
        self.quantity = quantity

    # 输出格式定义：
    def __str__(self):
        return f'商品名称：{self.name},商品价格：{self.price},商品数量：{self.quantity}'


# 创建管理系统类
class ShopGoverns:
    # 创建实例属性，用于存放购物车实例对象
    def __init__(self):
        self.shopping = []

    # 添加一个判断用户输入是否合法的方法
    def judgment_data(self, price, quantity) -> tuple | None:
        """
            该函数主要判断用户输入是否准确
        :param price: 价格
        :param quantity: 数量
        :return: 合法：返回元组（价格，数量），否则返回None
        """
        try:
            price, quantity = abs(float(price)), abs(int(quantity))
            return price, quantity
        except ValueError:
            print("商品必须为数字，数量必须为整数")
            return None

    # 查询商品是否存在：
    def judgment_indata(self, name):
        """
            该函数主要用于查找，商品是存在
        :param name: 商品名称
        :return: 存在返回：True，否则返回：None
        """
        shop_name = []
        for shop in self.shopping:
            shop_name.append(shop.name)
        if name in shop_name:
            return True
        return None

    # 功能一：增加商品。用户根据提示录入商品名称，以及该商品的价格、数量、保存该商品信息到购物车
    def add_shop(self, name, price, quantity):
        """
            该函数主要用于添加商品信息，包含判断价格与数量的合法。
        :param name: 商品名称
        :param price: 商品价格
        :param quantity: 商品数量
        :return: 添加成功返回：True，否则返回：None
        """
        # 查询商品是否存在：
        result1 = self.judgment_indata(name)
        result = self.judgment_data(price, quantity)
        if result1 is None:  # 不存在才添加
            if result is not None:
                shop = Shopping(name, *result)
                self.shopping.append(shop)
                print(f'商品：[{name}] 添加成功')
                return True
        print(f"商品：[{name}] 已在购物车中，请执行修改操作")
        return None

    # 功能二：修改：要求用户输入要修改的购物车商品名称，然后再提示输入该商品的价格、数量、输入完成后修改该商品信息
    def revise_shop(self, name, price, quantity):  # 暂时不考虑默认值

        result1 = self.judgment_indata(name)  # 商品不存在，无法修改
        if result1 is None:
            print(f"商品：[{name}] 未添加，请执行添加操作")
            return None
        # 检查输入是否合法
        result = self.judgment_data(price, quantity)
        # # 检查商品是否存在以及修改商品信息
        if result is not None:
            for shop in self.shopping:
                if name == shop.name:
                    shop.price = result[0]
                    shop.quantity = result[1]
                    print(f'商品：[{name}] 信息修改完成')
                    return True  # 本来想：str(shop)返回修改后的信息，但是为了整个框架稳定，一律成功True,失败：None
        return None

    # 功能三：删除功能
    def remove_shop(self, name):
        result = self.judgment_indata(name)
        if result is not None:
            for shop in self.shopping:
                if name == shop.name:
                    self.shopping.remove(shop)
                    print(f'商品：[{name}] 已移除购物车')
                    return True
        print(f"商品：[{name}] 未添加购物车")
        return None

    # 查询购物车：将购物车中的商品信息展示出来，格式为：”商品名称：XXX，商品价格：XXX，商品数量：XXX“
    def refer_shop(self):
        if self.shopping:
            for shop in self.shopping:
                print(shop)
            return True
        print('未添加任何商品')
        return None


# 测试
if __name__ == '__main__':
    # 测试购物车实例对象是否成功创建，商品信息是否正常添加，价格/数量是否合法
    shops = ShopGoverns()
    shops.add_shop('苹果', 50, 30)
    print(shops.shopping[0])
    shops.add_shop('香蕉', 'hello', 50)
    shops.add_shop('香蕉', 100, 50)

    # 测试修改功能
    shops.revise_shop('苹果', 50, 40)
    print(shops.shopping[0])
    shops.revise_shop('西瓜', 50, 'hello')
    shops.revise_shop('西瓜', 50, 101)
    shops.revise_shop('苹果', 50, 'hello')

    # 删除
    shops.remove_shop('香蕉')
    shops.remove_shop('草莓')

    # 查询
    shops.add_shop('香蕉', 100, 50)
    shops.refer_shop()


## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向过程-面向对象-对象-类之间的关系\代码\__init__.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向过程-面向对象-对象-类之间的关系\代码\面向过程-面向对象-对象-类之间的关系.py



## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\基础\面向过程-面向对象-对象-类之间的关系\笔记\面向过程-面向对象-对象-类之间的关系.html

**Title:** 面向对象——概述

面向对象——概述

面向过程

面向对象

类

通过AI，建立知识体系

以上知识均是学习笔记来源于哔哩哔哩UP主——黑马程序员

<span>因为我并不是第一次接触编程(<code>javaScript</code>)，会采用python语法与 <code>javaScript</code>语法类比的方式，记笔记</span>

</head>
<body id="面向对象——概述">
<main>
    <header>
        <h1>面向对象——概述</h1>
    </header>
    <section id="section_1">
        <h2>面向过程</h2>
        <ul>
            <li>核心思想：<span>把一个需求分解成一系列要执行的步骤，然后按照步骤依次执行这些任务(<span
                    class="span">关注的是流程、步骤</span>)</span>

<span>在学习面向对象之前，通常是面向过程编程<</span>

比如：<span>建一栋房子需要的过程是：<br><span
                    class="span">平整地基——>地基打桩——>地基浇筑——>主体施工——>砌墙施工——>外墙施工——>室内硬装——>室内软装</span></span>

<span>可以得出：面向过程：每一步都是亲自操刀，关注的是‘怎么做’，流程清晰但不易复用。</span>

一个人的精力是有限的，所以使用场景：<span>面向过程编程非常直接，适合简单、线性的任务</span>

提前解释：<span>面向对象的过程是：<span
                    class="span">我需要建一个房子————>施工(过程封装在对象内)——————>房子交互</span></span>

对象定义：<span>对象可以理解为现实中具体的人/物在程序中的数字化身(<span
                    class="span">万物皆对象</span>)</span>

<span>把一个人/物的特征和功能打包到一起，<span class="span">是面向对象编程的基本单元</span></span>

所以对象<span>包括特征和功能</span>

其中特征为属性、功能为方法

比如一个对象空调：<span>特征(<span class="span">属性</span>)：颜色、功率...、以及功能(<span
                    class="span">方法</span>):制冷...</span>

总结：<span>属性是对象的状态（<span class="span"></span>），方法是对象的行为（<span
                    class="span">如：制冷、制热</span>）</span>

类的定义：<span>类是一个模板，定义了属性和方法</span>

核心思想：<span>把一个需求分解成一系列步骤，按照顺序执行(<span class="span">关注流程</span>)</span>

特点：<span>每一步都是亲自操刀，适合简单、线性的任务</span>

<span>比如建房子：平整地基 → 打桩 → 浇筑 → 主体 → 砌墙 → ...</span>

在面向过程中，类中的方法，也是面向过程

核心思想：<span>把数据和操作数据的逻辑打包成一个"<span class="span">对象</span>"，调用者只需要告诉对象"<span
                        class="span">做什么</span>"，对象自己决定"<span class="span">怎么做</span>"</span>

特点：<span>把过程封装在对象内部，对外只暴露结果</span>

<span>比如建房子：你找了一个施工队（对象），告诉它“我要一栋3层现代风格的房子”，施工队内部自己安排流程，最后你拿到房子。</span>

定义：<span>现实中具体的人/物在程序中的数字化身(<span class="span">万物皆对象</span>)</span>

组成：<span>属性（<span class="span">状态/特征</span>）+ 方法（<span
                        class="span">行为/功能</span>）</span>

<span>例子：空调 → 属性（颜色、功率），方法（制冷、制热）。</span>

类（<code>Class</code>）：<span>是对象的"<span class="span">蓝图</span>"或"<span
                        class="span">模板</span>"，定义了对象有那些属性和方法</span>

对象（<code>object</code>）：是类的"实例"，根据类这个模板创建出来的具体个体

<span>类比：空调是一个类，你家客厅那台格力空调就是一个实例对象。</span>

<span>实例对象与类是包含关系，实例对象的特征/功能——类都有(因为类是模板/是蓝图)，<span
                            class="span">实例对象一般由调用类自动生成</span></span>

<span>对象是由类创建出来的，创建对象的过程，也称为对象的实例化，一个类可以创建无数个对象</span>

<span>首先：他们并不是对立关系，而是包含关系</span>

<span><span class="span">面向对象</span>负责的是<span
                        class="span">代码的组织结构(<span>谁拥有哪些数据、谁负责那些操作</span>)</span></span>

<span><span class="span">面向过程</span>负责的是<span
                        class="span">具体操作的实现(<span>这个方法内部具体怎么做</span>)</span></span>

<span>二者在同一个项目里是并存的，不是二选一</span>

## D:\GitHub\my_web\内容文件夹\python_study\哔哩哔哩UP主——黑马程序员\第二部分——python核心语法\面向对象\高阶\面向对象高阶——类方法、静态方法、继承、多态、封装.html

**Title:** 函数高阶——类方法、静态方法、继承、多态、封装

函数高阶——类方法、静态方法、继承、多态、封装

一、封装（Encapsulation）

二、继承（Inheritance）

三、多态（Polymorphism）

四、类的三种方法

五、关联总结

<code>class Person:
    __slots__ = ('name', '__age')  # 限制属性
    def __init__(self, name, age):
        self.name = name
        self.__age = age          # 私有属性

    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):
        if value > 0:
            self.__age = value
        else:
            raise ValueError("年龄必须为正")</code></pre>
                    </li>
                </ul>
            </li>
            <li>
                <h2>二、继承（Inheritance）</h2>
                <ul>
                    <li><span>定义</span>：子类（派生类）可以复用父类（基类）的属性和方法，并可以扩展或重写。</li>
                    <li><span>语法</span>：<code>class 子类(父类1, 父类2, ...):</code>（支持多重继承）</li>
                    <li><span>关键点</span>：
                        <ul>
                            <li><strong>查找顺序</strong>：实例 → 子类 → 父类 → ... → <code>object</code>（遵循 <code>__mro__</code>
                                顺序，C3线性化）
                            </li>
                            <li><code>super()</code>：调用父类的方法，常用于 <code>__init__</code> 中初始化父类属性，避免重复代码。
                            </li>
                            <li><strong>方法重写（Override）</strong>：子类重新定义父类的方法，实现多态。</li>
                            <li><strong>`__bases__`</strong>：类属性，记录直接父类。</li>
                            <li><strong>抽象基类（ABC）</strong>：通过 <code>abc</code> 模块，定义抽象方法，强制子类实现。
                            </li>
                        </ul>
                    </li>
                    <li><span>目的</span>：代码复用、层次化组织、扩展功能。</li>
                    <li><span>示例</span>：
                        <pre><code>class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "汪汪"

class Cat(Animal):
    def speak(self):
        return "喵喵"

# super() 用法
class Student(Person):
    def __init__(self, name, age, grade):
        super().__init__(name, age)  # 调用父类初始化
        self.grade = grade</code></pre>
                    </li>
                </ul>
            </li>
            <li>
                <h2>三、多态（Polymorphism）</h2>
                <ul>
                    <li><span>定义</span>：同一个方法名在不同类中可以有不同的实现，调用时根据对象实际类型决定执行哪个方法。
                    </li>
                    <li><span>实现条件</span>：
                        <ul>
                            <li>继承（子类重写父类方法）</li>
                            <li>不同的类具有同名方法（不一定要继承，只要具有相同接口，即“鸭子类型”）</li>
                        </ul>
                    </li>
                    <li><span>表现形式</span>：
                        <ul>
                            <li>方法重写（子类覆盖父类方法）</li>
                            <li>运算符重载（魔法方法，如 <code>__add__</code>、<code>__eq__</code>）</li>
                            <li>鸭子类型：只要对象支持某个方法，就可以直接调用，不关心其类型。</li>
                        </ul>
                    </li>
                    <li><span>底层原理</span>：通过 <code>__dict__</code> 和查找链实现，同名方法在不同的类字典中独立存在。
                    </li>
                    <li><span>示例</span>：
                        <pre><code>def make_sound(animal):
    print(animal.speak())

dog = Dog()
cat = Cat()
make_sound(dog)  # 汪汪
make_sound(cat)  # 喵喵</code></pre>
                    </li>
                </ul>
            </li>
            <li>
                <h2>四、类的三种方法</h2>
                <ul>
                    <li>
                        <h3>1. 实例方法（Instance Method）</h3>
                        <ul>
                            <li><span>定义</span>：最常用的方法，第一个参数为 <code>self</code>（实例对象）。</li>
                            <li><span>调用</span>：<code>实例.方法()</code> 或 <code>类.方法(实例)</code>。</li>
                            <li><span>访问权限</span>：可以访问实例属性、类属性以及其他方法。</li>
                            <li><span>用途</span>：操作具体对象的数据，是OOP的主力。</li>
                        </ul>
                    </li>
                    <li>
                        <h3>2. 类方法（Class Method）</h3>
                        <ul>
                            <li><span>定义</span>：使用 <code>@classmethod</code> 装饰，第一个参数为 <code>cls</code>（类本身）。
                            </li>
                            <li><span>调用</span>：<code>类.方法()</code> 或 <code>实例.方法()</code>（自动传入类）。</li>
                            <li><span>访问权限</span>：只能访问类属性和其他类方法，不能访问实例属性。</li>
                            <li><span>用途</span>：工厂方法、修改类属性、替代构造函数等。</li>
                        </ul>
                    </li>
                    <li>
                        <h3>3. 静态方法（Static Method）</h3>
                        <ul>
                            <li><span>定义</span>：使用 <code>@staticmethod</code> 装饰，无 <code>self</code> 或
                                <code>cls</code> 参数。
                            </li>
                            <li><span>调用</span>：<code>类.方法()</code> 或 <code>实例.方法()</code>（无需自动传参）。</li>
                            <li><span>访问权限</span>：不能访问类或实例的任何属性，只是一个放在类中的普通函数。</li>
                            <li><span>用途</span>：工具函数，与类相关但不需要类数据，方便组织代码。</li>
                        </ul>
                    </li>
                    <li>
                        <span>对比总结</span>
                        <div class="div_table">
                            <table>
                                <tr>
                                    <th>类型</th>
                                    <th>装饰器</th>
                                    <th>第一参数</th>
                                    <th>可访问</th>
                                    <th>调用示例</th>
                                </tr>
                                <tr>
                                    <td>实例方法</td>
                                    <td>无</td>
                                    <td><code>self</code></td>
                                    <td>实例属性、类属性</td>
                                    <td><code>obj.method()</code></td>
                                </tr>
                                <tr>
                                    <td>类方法</td>
                                    <td><code>@classmethod</code></td>
                                    <td><code>cls</code></td>
                                    <td>类属性、其他类方法</td>
                                    <td><code>Class.method()</code></td>
                                </tr>
                                <tr>
                                    <td>静态方法</td>
                                    <td><code>@staticmethod</code></td>
                                    <td>无</td>
                                    <td>不能访问类或实例属性</td>
                                    <td><code>Class.method()</code></td>
                                </tr>
                            </table>
                        </div>
                    </li>
                </ul>
            </li>
            <li>
                <h2>五、关联总结</h2>
                <ul>
                    <li><span>封装、继承、多态是 OOP 的三大基石，它们共同支撑代码的可复用性、可扩展性和可维护性。</span></li>
                    <li><span>实例方法、类方法、静态方法提供了不同粒度的访问和控制，根据实际需求选择合适的方法类型。</span>
                    </li>
                    <li><span>底层实现均依赖于 <code>__dict__</code>、<code>__class__</code>、<code>__bases__</code> 的查找链，理解这些有助于深入理解动态行为。</span>
                    </li>
                    <li><span>魔法方法（如 <code>__init__</code>、<code>__str__</code>、<code>__add__</code>）是 Python 提供的内置钩子，允许类与语言特性无缝集成，本质上是多态的特例。</span>
                    </li>
                    <li><span>推荐实践：</span>
                        <ul>
                            <li>优先使用实例方法处理对象特定行为。</li>
                            <li>类方法用于工厂模式或修改类状态。</li>
                            <li>静态方法用于逻辑上与类相关但独立于实例/类的工具。</li>
                            <li>使用 <code>@property</code> 控制属性访问，替代直接暴露属性。</li>
                            <li>使用 <code>__slots__</code> 优化内存并防止误新增属性（在大量实例时有效）。</li>
                            <li>利用抽象基类定义接口，确保子类实现必要方法。</li>
                        </ul>
                    </li>
                    <li><span>你已经掌握了面向对象的核心机制，后续的框架、设计模式将建立在此基础之上。</span></li>
                </ul>
            </li>
        </ul>
    </section>
    <section id="section_2">
        <!-- 可保留为空或补充额外内容 -->
    </section>
    <footer>
        <p>以上知识基于 Python 面向对象编程体系整理

<span>结合个人学习笔记与补充理解</span>

</head>
<body id="面向对象高阶——类方法、静态方法、继承、多态、封装">
<main>
    <header>
        <h1>函数高阶——类方法、静态方法、继承、多态、封装</h1>
    </header>
    <section id="section_1">
        <ul>
            <li>
                <h2>一、封装（Encapsulation）</h2>
                <ul>
                    <li><span>定义</span>：将数据（属性）和操作数据的方法（行为）捆绑在一起，并隐藏内部实现细节，只对外暴露必要的接口。

<span>实现方式</span>：
                        <ul>
                            <li><strong>私有属性</strong>：以双下划线 <code>__</code> 开头的属性（如
                                <code>self.__score</code>），Python 会进行名称修饰（变为 <code>_类名__score</code>），防止外部直接访问。

<strong>公有属性</strong>：普通属性，外部可直接访问，但应通过方法控制读写。

<strong>`@property`</strong>：将方法变成属性调用，可自定义 getter、setter、deleter，实现受控访问。

<strong>`__slots__`</strong>：限制实例允许的属性名，节省内存并防止随意添加属性。

<span>目的</span>：
                        <ul>
                            <li>保护数据完整性，避免被随意修改。

降低耦合度，内部变化不影响外部调用。

提高代码可维护性和安全性。

<span>示例</span>：
                        <pre><code>class Person:
    __slots__ = ('name', '__age')  # 限制属性
    def __init__(self, name, age):
        self.name = name
        self.__age = age          # 私有属性

    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):
        if value > 0:
            self.__age = value
        else:
            raise ValueError("年龄必须为正")</code></pre>

<h2>二、继承（Inheritance）</h2>
                <ul>
                    <li><span>定义</span>：子类（派生类）可以复用父类（基类）的属性和方法，并可以扩展或重写。

<span>语法</span>：<code>class 子类(父类1, 父类2, ...):</code>（支持多重继承）

<span>关键点</span>：
                        <ul>
                            <li><strong>查找顺序</strong>：实例 → 子类 → 父类 → ... → <code>object</code>（遵循 <code>__mro__</code>
                                顺序，C3线性化）

<code>super()</code>：调用父类的方法，常用于 <code>__init__</code> 中初始化父类属性，避免重复代码。

<strong>方法重写（Override）</strong>：子类重新定义父类的方法，实现多态。

<strong>`__bases__`</strong>：类属性，记录直接父类。

<strong>抽象基类（ABC）</strong>：通过 <code>abc</code> 模块，定义抽象方法，强制子类实现。

<span>目的</span>：代码复用、层次化组织、扩展功能。

<span>示例</span>：
                        <pre><code>class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "汪汪"

class Cat(Animal):
    def speak(self):
        return "喵喵"

# super() 用法
class Student(Person):
    def __init__(self, name, age, grade):
        super().__init__(name, age)  # 调用父类初始化
        self.grade = grade</code></pre>

<h2>三、多态（Polymorphism）</h2>
                <ul>
                    <li><span>定义</span>：同一个方法名在不同类中可以有不同的实现，调用时根据对象实际类型决定执行哪个方法。

<span>实现条件</span>：
                        <ul>
                            <li>继承（子类重写父类方法）

不同的类具有同名方法（不一定要继承，只要具有相同接口，即“鸭子类型”）

<span>表现形式</span>：
                        <ul>
                            <li>方法重写（子类覆盖父类方法）

运算符重载（魔法方法，如 <code>__add__</code>、<code>__eq__</code>）

鸭子类型：只要对象支持某个方法，就可以直接调用，不关心其类型。

<span>底层原理</span>：通过 <code>__dict__</code> 和查找链实现，同名方法在不同的类字典中独立存在。

<span>示例</span>：
                        <pre><code>def make_sound(animal):
    print(animal.speak())

dog = Dog()
cat = Cat()
make_sound(dog)  # 汪汪
make_sound(cat)  # 喵喵</code></pre>

<h2>四、类的三种方法</h2>
                <ul>
                    <li>
                        <h3>1. 实例方法（Instance Method）</h3>
                        <ul>
                            <li><span>定义</span>：最常用的方法，第一个参数为 <code>self</code>（实例对象）。

<span>调用</span>：<code>实例.方法()</code> 或 <code>类.方法(实例)</code>。

<span>访问权限</span>：可以访问实例属性、类属性以及其他方法。

<span>用途</span>：操作具体对象的数据，是OOP的主力。

<h3>2. 类方法（Class Method）</h3>
                        <ul>
                            <li><span>定义</span>：使用 <code>@classmethod</code> 装饰，第一个参数为 <code>cls</code>（类本身）。

<span>调用</span>：<code>类.方法()</code> 或 <code>实例.方法()</code>（自动传入类）。

<span>访问权限</span>：只能访问类属性和其他类方法，不能访问实例属性。

<span>用途</span>：工厂方法、修改类属性、替代构造函数等。

<h3>3. 静态方法（Static Method）</h3>
                        <ul>
                            <li><span>定义</span>：使用 <code>@staticmethod</code> 装饰，无 <code>self</code> 或
                                <code>cls</code> 参数。

<span>调用</span>：<code>类.方法()</code> 或 <code>实例.方法()</code>（无需自动传参）。

<span>访问权限</span>：不能访问类或实例的任何属性，只是一个放在类中的普通函数。

<span>用途</span>：工具函数，与类相关但不需要类数据，方便组织代码。

<span>对比总结</span>
                        <div class="div_table">
                            <table>
                                <tr>
                                    <th>类型</th>
                                    <th>装饰器</th>
                                    <th>第一参数</th>
                                    <th>可访问</th>
                                    <th>调用示例</th>
                                </tr>
                                <tr>
                                    <td>实例方法</td>
                                    <td>无</td>
                                    <td><code>self</code></td>
                                    <td>实例属性、类属性</td>
                                    <td><code>obj.method()</code></td>
                                </tr>
                                <tr>
                                    <td>类方法</td>
                                    <td><code>@classmethod</code></td>
                                    <td><code>cls</code></td>
                                    <td>类属性、其他类方法</td>
                                    <td><code>Class.method()</code></td>
                                </tr>
                                <tr>
                                    <td>静态方法</td>
                                    <td><code>@staticmethod</code></td>
                                    <td>无</td>
                                    <td>不能访问类或实例属性</td>
                                    <td><code>Class.method()</code></td>
                                </tr>
                            </table>
                        </div>

<h2>五、关联总结</h2>
                <ul>
                    <li><span>封装、继承、多态是 OOP 的三大基石，它们共同支撑代码的可复用性、可扩展性和可维护性。</span>

<span>实例方法、类方法、静态方法提供了不同粒度的访问和控制，根据实际需求选择合适的方法类型。</span>

<span>底层实现均依赖于 <code>__dict__</code>、<code>__class__</code>、<code>__bases__</code> 的查找链，理解这些有助于深入理解动态行为。</span>

<span>魔法方法（如 <code>__init__</code>、<code>__str__</code>、<code>__add__</code>）是 Python 提供的内置钩子，允许类与语言特性无缝集成，本质上是多态的特例。</span>

<span>推荐实践：</span>
                        <ul>
                            <li>优先使用实例方法处理对象特定行为。

类方法用于工厂模式或修改类状态。

静态方法用于逻辑上与类相关但独立于实例/类的工具。

使用 <code>@property</code> 控制属性访问，替代直接暴露属性。

使用 <code>__slots__</code> 优化内存并防止误新增属性（在大量实例时有效）。

利用抽象基类定义接口，确保子类实现必要方法。

<span>你已经掌握了面向对象的核心机制，后续的框架、设计模式将建立在此基础之上。</span>

## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月12日——第一次网课\笔记.py

a = 10
print(a)

## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月12日——第一次网课\自学作业.py

Array = []


#  增加任务
def zj(myArray):
    print("增加任务！！！")
    text = str(input("请输入需要增加的任务："))
    if text == "":
        print("不能添加空任务")
    else:
        myArray.append(text)


# 查找任务

def showcase(myArray):
    print("查找任务！！！")
    for index, value in enumerate(myArray):
        print(f"编码：{index},任务：{value}")


#   删除任务(关键字删除)

def delete(myArray):
    if not myArray:
        print("当没有能删除的任务")
        return
    print("删除任务！！！！")
    showcase(myArray)
    text = str(input("请输入需要删除的关键字(注意：只要存在匹配的字符，都会被删除！！！！)："))
    remove = False
    for Text in myArray[:]:
        if text in Text:
            myArray.remove(Text)
            print(f"删除任务的任务是：{Text}")
            remove = True
    if not remove:
        print("没有匹配的任务！！！")


# 修改任务

def modify(myArray):
    if not myArray:
        print("当前无能修改的任务")
        return
    print("修改任务！！！！！")
    showcase(myArray)
    index = int(input("请输入需要更改的任务编号："))

    text = str(input("请输入需要修改的内容："))

    try:
        if 0 <= index <= len(myArray):
            myArray[index - 1] = text
            print(f"修改的任务编号是：{index}，修改的内容是：{text}")
        else:
            print("输入的编号超出任务数量！！！！")
    except IndexError:
        print("输入的编号为非数字!!!!")


while True:
    try:
        const = int(input("请输入你的选择(必须是整数)：1.添加任务 2.查看任务 3.删除任务 4.修改 5.退出:"))
    except ValueError:
        print("请输入1~5之间的整数")
        continue
    if const == 1:
        zj(Array)
    elif const == 2:
        showcase(Array)
    elif const == 3:
        delete(Array)
    elif const == 4:
        modify(Array)
    elif const == 5:
        break
print("退出任务管理器！！！！")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月12日——第一次网课\作业.py

# 任务管理器 1.做作业 2.打游戏  3.打卡

# 功能设置：  1.任务添加 2.删除任务 3.查看任务 4.退出

mylist = []


def tj(task):
    print("添加任务")
    text = input("请输入你的任务:")
    task.append(text)


def showcase(task):
    print("查看任务")
    for index, value in enumerate(task, start=1):
        print(f"{index}. {value}")


def delete(task):
    print("删除任务")
    if not task:
        print("没有任何任务能删除")
        return
    showcase(task)
    try:
        num = int(input("请输入你要删除的任务编号："))
        if -1 <= num <= len(task):
            task2 = task.pop(num - 1)
            print(f"删除的任务是：{task2}")
        else:
            print("编号超出任务数量!!!")
    except ValueError:
        print("请输入有效编号(正整数)!!!")

def modify(task) :
    print("修改任务")
    if not task:
        print("没有任何任务可以修改")
        return
    showcase(task)
    try:
        num = int(input("请输入要修改的任务编号："))
        if num <= len(task):
            text = str(input("请输入需要修改的任务内容："))
            task[num - 1] = text
            print(f"修改的任务编号是：{num - 1},修改的内容是：{text}")
        else:
            print("编号超出任务数量")
    except ValueError:
        print("请输入有效编号(正整数)")

while True:
    try:
        choose = int(input("请输入你的选择(必须是整数)：1.添加任务 2.查看任务 3.删除任务 4.修改 5.退出:"))
    except ValueError:
        print("输入无效，请输入1-4之间的整数！")
        continue
    if choose == 1:
        tj(mylist)
    elif choose == 2:
        showcase(mylist)
    elif choose == 3:
        delete(mylist)
    elif choose == 4:
        modify(mylist)
    elif choose == 5:
        break
    else:
        print("输入的不对，请重新输入！")
print("退出任务管理器")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月16日——第二次网课\笔记.py



## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月16日——第二次网课\作业1\作业.py

import my_calculator

number = []
while True:

    try:
        ID = int(input("请输入需要的操作\n1.添加操作数、2.加法、3.减法、4.乘法、5.除法、6.查看当前操作数、7.退出："))
    except ValueError:
        print("请输入1~6之间的数字")
        continue
    if ID == 1:
        text = float(input("请输入数字:"))
        number.append(text)

    elif ID == 2:
        print("加法操作")
        if len(number) < 2:
            print("需要两个及以上操作数才能进行除法操作！！！")
        else:
            add = my_calculator.add(number)
            add_str = [str(x) for x in number]  # join 输出的是字符串类型，所以需要转换
            print(f"{'、'.join(add_str)}的和是：{add}")
    elif ID == 3:
        print("减法操作：")
        if len(number) < 2:
            print("需要两个及以上操作数才能进行除法操作！！！")
        else:
            subtract = my_calculator.subtract(number)
            sub_str = [str(x) for x in number]  # join 输出的是字符串类型，所以需要转换
            print(f"{'、'.join(sub_str)}的差是：{subtract}")
    elif ID == 4:
        print("乘法操作：")
        if len(number) < 2:
            print("需要两个及以上操作数才能进行除法操作！！！")
        else:
            multiply = my_calculator.multiply(number)
            multi_str = [str(x) for x in number]  # join 输出的是字符串类型，所以需要转换
            print(f"{'、'.join(multi_str)}的积是：{multiply}")
    elif ID == 5:
        print("除法操作：")
        if len(number) < 2:
            print("需要两个及以上操作数才能进行除法操作！！！")
        elif any(num == 0 for num in number[1:]):
            try:
                operate = int(input("除数不能为0!!!\n请执行：1.退出计算器、2.删除所有为0的操作数："))
            except ValueError:
                print("请输出数字1~2")
                continue
            if operate == 1:
                break
            elif operate == 2:
                num2 = 0
                remove = False
                for num in number[1:]:
                    if num == num2:
                        number.remove(num)
                        remove = True
                        continue
                    else:
                        print("已经删除所有为0操作数")
                        divide = my_calculator.divide(number)
                        divide_str = [str(x) for x in number]  # join 输出的是字符串类型，所以需要转换
                        print(f"{'、'.join(divide_str):}的商是：{divide}")
    elif ID == 6:
        print(number)
    elif ID == 7:
        break
print("退出计算器")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月16日——第二次网课\作业1\my_calculator.py

from multiprocessing import Array


def add(Array):
    if not Array: return 0
    add2 = Array[0]
    for num in Array[1:]:
        add2 += num
    return add2


def subtract(Array):
    if not Array: return 0
    subtract2 = Array[0]
    for num in Array[1:]:
        subtract2 -= num
    return subtract2


def multiply(Array):
    if not Array: return 0
    multiply2 = Array[0]
    for num in Array[1:]:
        multiply2 *= num
    return multiply2


def divide(Array):
    if not Array:
        return 0
    divide2 = Array[0]
    for num in Array[1:]:
        divide2 /= num
    return divide2


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月16日——第二次网课\作业2\函数.py

def people(Array):
    city_count = {}
    for stu in Array:
        city = stu['城市']
        city_count[city] = city_count.get(city, 0) + 1

    result_parts = []
    for city, count in city_count.items():
        result_parts.append(f"{city}有{count}位学生")
    if not result_parts:
        return ""
    else:
        return ",".join(result_parts)


def eightScore(Array):
    name = []
    for stu in Array:
        if stu['成绩'] < 80:
            name.append(stu['姓名'])
    if not name:
        return ""
    else:
        return '、'.join(name)

def nineScore(Array):
    name = []
    for stu in Array:
        if stu['成绩'] > 90:
            name.append(stu['姓名'])
    if not name:
        return ""
    else:
        return ",".join(name)

def cityShangHai(Array):
    dict2 = []
    for stu in Array:
       if stu["城市"] == "上海" and stu['成绩'] < 85:
           dict2.append(stu['姓名'])
    if not dict2:
        return ""
    else:
        return ",".join(dict2)

def cityBJ(Array):
    dict2 = []
    for stu in Array:
        if stu['城市'] == "北京" and stu['成绩'] > 95:
            dict2.append(stu['姓名'])
    if not dict2:
        return ""
    else:
        return ",".join(dict2)





## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月16日——第二次网课\作业2\主程序.py

import 函数

students = [
    {'姓名': '张一', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 98, '城市': '北京'},
    {'姓名': '张二', '年龄': 15, '性别': '女', '爱好': '跳舞', '成绩': 92, '城市': '北京'},
    {'姓名': '张三', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 94, '城市': '北京'},
    {'姓名': '李四', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 50, '城市': '新余'},
    {'姓名': '李五', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 80, '城市': '新余'},
    {'姓名': '李六', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 80, '城市': '新余'},
    {'姓名': '王五', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 60, '城市': '上海'},
    {'姓名': '王六', '年龄': 21, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '上海'},
    {'姓名': '王七', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 70, '城市': '上海'},
    {'姓名': '老六', '年龄': 22, '性别': '女', '爱好': '跳舞', '成绩': 50, '城市': '北京'},
    {'姓名': '李华', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 60, '城市': '北京'}
]


def main(Arry):
    while True:
        try:
            oper = int(input("1.统计各个地区的学生人数\n"
                             "2.查找分数低于80分的学生\n"
                             "3.查找分数大于90的学生\n"
                             "4.查找来自上海且分数低于85分的学生\n"
                             "5.查找来自北京且分数高于95分的顶尖学生\n"
                             "6.退出查找\n:"))
        except ValueError:
            print("请输入数字1~5")

            continue
        if oper == 1:
            print(f"======================\n{函数.people(Arry)}\n=============================")

        elif oper == 2:
            print(f"======================\n小于80的同学有：{函数.eightScore(Arry)}\n=============================")
        elif oper == 3:
            print(f"======================\n大于90的同学有：{函数.nineScore(Arry)}\n===============================")
        elif oper == 4:
            print(f"======================\n上海小于85分的同学有:{函数.cityShangHai(Arry)}\n========================")
        elif oper == 5:
            print(f"======================\n北京大于95分的顶尖学生有：{函数.cityBJ(Arry)}\n===========================")
        elif oper == 6:
            break
main(students)
print("退出成绩查找程序！！！")

## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\5月20日\5月20日.py

students = [
    {'姓名': '张一', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '吉安'},
    {'姓名': '张二', '年龄': 15, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '吉安'},
    {'姓名': '张三', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '吉安'},
    {'姓名': '李四', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 80, '城市': '新余'},
    {'姓名': '李五', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 80, '城市': '新余'},
    {'姓名': '李六', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 80, '城市': '新余'},
    {'姓名': '王五', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 60, '城市': '宜春'},
    {'姓名': '王六', '年龄': 21, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '宜春'},
    {'姓名': '王七', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 70, '城市': '宜春'},
    {'姓名': '老六', '年龄': 22, '性别': '女', '爱好': '跳舞', '成绩': 50, '城市': '吉安'},
    {'姓名': '李华', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 60, '城市': '吉安'}
]


class Class:
    def __init__(self, ClassName, headcount, form_teacher, Students):
        self.班级名 = ClassName
        self.人数 = headcount
        self.班主任 = form_teacher
        self.班级学生表 = Students

    def JG(self):
        result = []
        for stu in self.班级学生表:
            if stu["成绩"] <= 60:
                score = "不合格"
            else:
                score = "合格"
            result.append(f"{stu['姓名']}：{score}")
        return "\n".join(result)

    def AVG(self):
        headcount = 0
        sum = 0
        for stu in self.班级学生表:
            headcount += 1
            sum += stu["年龄"]
        if headcount == 0:
            return 0
        return f"平均年龄是:{sum / headcount:.2f}"


Clss01 = Class("25303", "11", "W", students)
print(Clss01.班级名, Clss01.人数, Clss01.班主任, Clss01.班级学生表)
print(Clss01.JG())
print(Clss01.AVG())


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第一节课\第一节课.py

import math

''' 
    #  单行注释 

    语法错误:SyntaxError

    变量名未定义:IndentationError:缩进错误

    input——输入函数

    if ease——判断语句

    print——输出语句

    三单引号/或三双引号  多行注释

    import 调动数据库

    GitHub
'''


###
s = input("输入一个数:")
s = float(s)
if s >= 0:
    s = math.sqrt(s)
    print("平方根是：", s)
else:
    print("负数不能开平方")
print("The End")


name = input("你的名字是：")
age = input("你的年龄是:")
print("你好，" + name +  "\n今年:" + age + "岁")

'''
             / \
            /   \
           /     \
          /_______\
              ||
              || 
              ||  
              || 
             /||\ 
'''

# 当使用符号[\]，需要在后面加入空格，不然会将后面的字符同时认为转义字符
# f后面跟着引号范围的字符串，大括号包裹的字符串为变量
print("     /\\")
print("    /  \\")
print("   /    \\")
print("  /      \\")
print(" /________\\")
print("     || ")
print("     || ")
print("     || ")
print("     || ")
print("    /||\ ")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第一节课\第一节课作业.py

name = "叶力弘"
age = 20
性别 = "男"
爱好 = "敲代码"

print(f"你好！我叫{name} , 今年：{age}岁,性别：{性别},爱好：{爱好}")

## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第七节课\第七节课.py

for i in range(1, 11):
    for j in range(1, i + 1):
        print('*', end='')
    print()

X = int(input("x="))

for i in range(0, X):
    for j in range(0, i + 1):
        print('@', end=' ')
    print()


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第七节课\列表.py

# 列表
# 定义列表 [元素1，元素2，元素3](也可以叫列表项)
"""
    取列表内某一项  索引、下标来对列表进行定位: 
                            print(列表名[取值项位置])
                            取值位置从0开始计数
"""""

name = ['张三', "李四", "王五", "老六"]

print(name)
print(name[3])

"""
    添加元素 append(元素内容)

"""

name.append('三七')
print(name)

"""
    依次列出所有列表项,可以用循环来做 for
                    for 取名  in  列表名：
                        print(取名)
"""

for i in name:
    print(i)

# 介绍一下你的好朋友，先创建一个列表，然后依次添加你的好朋友，接下来把你的好朋友全部显示出来

friend = []
friend.append('袁**')
friend.append('徐**')
friend.append('手机')
friend.append('电脑')
friend.append('JavaScript')
friend.append('Python')
friend.append('CSS')
friend.append('HTML')
friend.append('MySQL')

for friends in friend:
    print(friends)

"""
    输出列表项个数 len(列表名)
"""
print("总人数是：", len(friend))

# 需求，输出列表项中每一项的编号 for 编号命名  变量名(随便取)  in enumerate(列表名 ， start=取得值是编号的第一位)
for number, name in enumerate(friend, start=1):
    print(number, '------------------', name)

# 需求：设计一个商品购物车，每次输入一件商品名称，当输入的内容为"结算"的时候，就将所有的商品输出

commodity = []

while True:
    commodity2 = input('请输入你要购买的商品：')
    if commodity2 == "结算":
        break
    else:
        commodity.append(commodity2)
print('你今天购买的商品有：', commodity, '\n共', len(commodity), '样商品')





## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第七节课\作业.py

commodity = []

while True:
    commodity2 = input("请输入购买的商品：")
    if commodity2 == '结算':
        break
    elif commodity2 in commodity:
        print("已经在篮子里，不用重复购买")
    else:
        commodity.append(commodity2)
for number, commodity3 in enumerate(commodity, start=1):
    print(f"第{number}商品，是{commodity3}")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第三节课\笔记.py

"""
    输出时，使用f关键字，在大括号内(变量名)后加英文冒号:
        1.单纯输入数字。【表示该变量名输出的占N位(具体以输入的数字为主)】
        2.点加数字:【如果输出的数值太长，会变成科学计数法】
        3.单加数字+后缀【F强制以浮点数输出，】

    在Python中，对于缩进，空格非常敏感
"""

height = input("请输入你的身高(米)：")

weight = input("请输入你的体重(千克)：")

height2 = float(height) ** 2

BMI = float(weight) / height2

print(f'您的BMI指数是：{BMI:.2f}')

if 18.5 < BMI < 23.9:
    print("正常范围")
elif BMI < 18.5:
    print("需要加强营养")
elif 23.9 < BMI < 28:
    print("需要控制体重")
else:
    print("需要警惕健康风险")

    """
        任务：输入BMI指数计算结果后，判断正常指标，并给出建议
    """

while True:
    age = input("请输入你的年龄(年龄大于0)：")
    try: # 用于捕获代码执行过程中可能出现的异常(错误)。比如int()转非数字字符串,以及浮点数
        # 尝试执行的代码(可能会输错)
        age1 = int(age)
        if age1 > 0:
            break
        else:
            print("输入的整数必须大于0，请重新输入")
    #  与try是固定搭配  （异常处理）
    except ValueError: # 具体流程：tyr识别，输入程序会不会有Error返回值（数据类型自动判断，不符合会报错，被try识别）， 识别到Error,执行except Error的内容。
        print("输入无效，请输入一个整数")
# 循环结束后判断
if age1 >= 18:
    print("你已经成年，可以进入网吧")
else:
    print("你未成年不能进入网吧")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第三节课\作业.py

for i in range(3):
    money = input("请输入商品总金额:")
    money1 = float(money)
    if 100 < money1 < 200:
        print(f'因为超过100，打九折折，最后的需要付：{money1 * 0.9}')
    elif money1 > 200:
        print(f'因为超过100，打八折，最后的需要付：{money1 * 0.8}')
    else:
        print(f'少于100元，原价，需付:{money1}')


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第九节课\第九节课.py

# 列表的常用方法: sort()排序 index()索引 reverse()翻转 count() extend()数组合并 insert()插入元素

score = [100, 102, 90, 100, 80, 160, 20]

# sort()排序 原地排序改变原列表的顺序
score.sort()  # 升序排列(默认)  使用reverse = True 降序

name = ['张三', '李四', '王五', '老刘']
name.sort()  # 字符排序，根据拼音或英文首字母升序排列
print(f"name升序操作：{name}")

# reverse() 翻转
score.reverse()
print(f"reverse翻转操作：{score}")

# 降序操作
name.sort(reverse=True)  # 字符排序，根据拼音或英文首字母升序排列
print(f"name降序操作：{name}")

# index()索引 ， 返回指定值得索引值
print(name.index("张三"))  # 字符串1个

try:
    print(score.index(5, 3))  # 数字可以是多个，逗号隔开
except ValueError:
    print("当前没有符合条件的结果")
# extend()数组合并

score.extend(name)  # 字符串也可以添加进数组。 数字报错
print(score[7])

# insert(下标,插入的内容)插入元素

num = [1, 212, 2, 3, 55, 66, 77, 88, 100]
num.insert(4, "插入元素")
print(num)

# remove()删除元素 —— 搜索并删除第一个元素

# 计算score列表的最高分，最低分和平均分

score = [100, 200, 250, 400, 350]

scoreMax = max(score)
print(f"最高分是{scoreMax}")

scoreMin = min(score)
print(f"最低分是：{scoreMin}")

scoreAverage = sum(score) / len(score)
print(f"平均分是：{scoreAverage}")

# 去最高值、最低值，求平均分
score = []

for i in range(1, 6):
    score.append(int(input(f"请输入第{i}位评委评分：")))
print(f"各个评委评分：{score}")
score.sort()
score.pop(0)
score.pop()
score = sum(score) / len(score)
print(f"选手最终评分{score}")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第九节课\作业.py

# 去最高值、最低值，求平均分
score = []

for i in range(1, 6):
    score.append(int(input(f"请输入第{i}位评委评分：")))
print(f"各个评委评分：{score}")
score.sort()
score.pop(0)
score.pop()
score.sort( reverse = True )
print(f"去除最高分，最低分后降序：{score}")
score = sum(score) / len(score)
print(f"选手最终评分{score}")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第二节课\第二节课.py

# 多个相同字符可以用*(个数)，多次添加

"""
    作业要求：
        1.输出的信息可以是用户输入的内容(输入input函数接收用户输入的内容)
        2.input函数接收的输入内容都是字符串类型
        要求2：
            1.在输出个人信息之前，完成个人信息的输入

        注意：
            缩进对Python影响很大，不要随意缩进
            打印时：f在最前面，后面大括号包裹内容就是变量。
                大括号内：变量后面加入英文冒号，后面输入的数值，就是变量值输出后，所占的空间，中文符号占两个空间，英文则一个
                在数值前面插入：< (右对齐)  > （左对齐）  ^  (居中对齐)
"""


name = input("请输入你的姓名：")
age = input("请输入你的年龄：")
String = "*"
print("*"*22)
length = len(name)
aligned_String = String.rjust(length)
print(f"*你好：{name:<15}*")
print(f"*今年：{age:<15}*")
print("*"*22)  # 同一字符，*代替






## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第二节课\作业\作业.py

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



## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第五节课\第五节课.py

"""
    for循环
    语法： for i in range(开始，结束)默认情况 ， i的变化每次加1
    左开有和

"""
# count = 0
# count2 = 0
#
# for i in range(1, 101):
#     if i % 2 == 0:
#         count = count + 1
#         print(i)
#     elif 1 % 2 != 0:
#         count2 = count2 + 1
#
# # 输出1~100之间的所有偶数个数
# print(f"偶数个数是：{count}")
# # 输出所有奇数的个数
# print(f"奇数个数是：{count2}")

# 倒数
# count3 = 0
# count4 = 0
# for b in range(10, 0, -1):
#     if b % 2 == 0:
#         count3 = count3 + 1
#         print(b)

# count3 = 0
# count4 = 0
#
# for b in range(50, 0, -1):
#     if b % 3 == 0 and b % 5 == 0:
#         count3 = count + 1
#         print(b)
# print(f"能同时")

# 密码验证：允许输入3次，如果密码=“12345”，欢迎访问，如果不是请重新输入。密码3次错误，设备锁定






## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第五节课\第五节课作业.py

count = 3

for key in range(1, 4):
    password = input("请输入密码：")
    count = count - 1
    if password == '12345':
        print("欢迎登录")
        break
    if password != '12345':
        if count > 0:
            print(f"密码输入错误，还剩{count}机会")
        elif count == 0:
            print("密码次数耗尽，请联系管理员")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第八节课\第八节课.py

# 任务管理器 1.做作业 2.打游戏  3.打卡

# 功能设置：  1.任务添加 2.删除任务 3.查看任务 4.退出

mylist = []


def tj(task):
    print("添加任务")
    text = input("请输入你的任务:")
    task.append(text)


def showcase(task):
    print("查看任务")
    for index, value in enumerate(task, start=1):
        print(f"{index}. {value}")


def delete(task):
    print("删除任务")
    if not task:
        print("没有任何任务能删除")
        return
    showcase(task)
    try:
        num = int(input("请输入你要删除的任务编号："))
        if -1 <= num <= len(task):
            task2 = task.pop(num - 1)
            print(f"删除的任务是：{task2}")
        else:
            print("编号超出任务数量!!!")
    except ValueError:
        print("请输入有效编号(正整数)!!!")

def modify(task) :
    print("修改任务")
    if not task:
        print("没有任何任务可以修改")
        return
    showcase(task)
    try:
        num = int(input("请输入要修改的任务编号："))
        if num <= len(task):
            text = str(input("请输入需要修改的任务内容："))
            task[num - 1] = text
            print(f"修改的任务编号是：{num - 1},修改的内容是：{text}")
        else:
            print("编号超出任务数量")
    except ValueError:
        print("请输入有效编号(正整数)")

while True:
    try:
        choose = int(input("请输入你的选择(必须是整数)：1.添加任务 2.查看任务 3.删除任务 4.修改 5.退出:"))
    except ValueError:
        print("输入无效，请输入1-4之间的整数！")
        continue
    if choose == 1:
        tj(mylist)
    elif choose == 2:
        showcase(mylist)
    elif choose == 3:
        delete(mylist)
    elif choose == 4:
        modify(mylist)
    elif choose == 5:
        break
    else:
        print("输入的不对，请重新输入！")
print("退出任务管理器")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第八节课\知识点.py

"""
    删除列表项：
            1.pop方法
                1)语法：列表.pop()
                2)默认删除最后一个元素
                3)以索引为准 0开头


"""

## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第六节课\第六节课作业.py

X = int(input("X="))
Y = int(input("Y="))

for i in range(X):
    for j in range(Y):
        if i == 0 and j == 0 or i == X - 1 and j == 0 or j == Y - 1  and i == 0 or i == X - 1  and j == Y - 1:
            print("#", end="")
        elif i == 0 or i == X - 1:
            print("%", end="")
        elif j == 0 or j == Y - 1 :
            print("@", end="")
        else:
            print(" ", end="")
    print("")


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\代码\第四节课\第四节课作业.py

count = 0

while count < 4:
    weight = input("你今天的体重(千克)是：")
    height = input("你今天的身高(米)是:")

    weightFloat = float(weight)
    heightFloat = float(height)
    BMI = weightFloat / heightFloat ** 2
    if BMI > 24:
        BMI_1 = " 今天需要适量运动一下!"
    elif BMI < 18.5:
        BMI_1 = " 最近你辛苦了,要好好犒劳一下自己,去吃点好吃的吧!"
    else:
        BMI_1 = " 您的BMI指数很正常,注意保持"

    print(f"    你今天的BMI值是:{BMI:.2f},建议：{BMI_1}")
    count = count + 1




## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\笔记\5月13日\笔记.py

# 字典数据存储的基本形式
"""
        关键字：get  在字典查询，若键不存在，则返回值是None

        增：
            1. 变量[“需要添加的键，必须原字典不存在，否则就是改操作”] = 值
        删：
            1. del 变量[“需要添加的键，必须原字典存在，否则返回值报错”]
            2.pop

        改：
            1. 变量[“需要添加的键，必须原字典存在，否则就是增操作”] = 值

        查：
            1. 变量[“需要添加的键，必须原字典存在，否则就是报错”]
            2. 变量.get("需要添加的键，必须原字典存在，否则返回值是None")
        单独查：
            1.键： 变量.keys()
            2.值： 变量.values()
            3.键值对： 变量.items()


"""
Arr = {'name': 'ls', 'score': 90, 'gender': '男'}

print("我的名字是:", Arr["name"])

Arr["age"] = 90

del Arr['score']
print(Arr)

Arr2 = {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'}

Arr["分数"] = 90

print(Arr2)
key = Arr.keys()
value = Arr.values()
items = Arr.items()
print(key)
print(value)
print(items)

Arr3 = [
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
]

num = 0
for i, j in enumerate(Arr3):
    num = j["age"]


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\笔记\5月13日\作业.py

students = [
    {"姓名": '猪猪侠', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 90},
    {"姓名": '张三', '年龄': 22, '性别': '女', '爱好': '跳舞', '成绩': 85},
    {"姓名": '李四', '年龄': 21, '性别': '女', '爱好': '跳舞', '成绩': 88}
]

def Average(courses):
    num = 0
    average = 0
    for index,value in enumerate(courses,1):
        num = num + value["成绩"]
        average = num / len(courses)
    print(f"平均分是：{average:.2f}")

Average(students)

## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\笔记\5月15日\作业.py

students = [
    {'姓名': '张一', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '吉安'},
    {'姓名': '张二', '年龄': 15, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '吉安'},
    {'姓名': '张三', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '吉安'},
    {'姓名': '李四', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 80, '城市': '新余'},
    {'姓名': '李五', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 80, '城市': '新余'},
    {'姓名': '李六', '年龄': 25, '性别': '女', '爱好': '跳舞', '成绩': 80, '城市': '新余'},
    {'姓名': '王五', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 60, '城市': '宜春'},
    {'姓名': '王六', '年龄': 21, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '宜春'},
    {'姓名': '王七', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 70, '城市': '宜春'},
    {'姓名': '老六', '年龄': 22, '性别': '女', '爱好': '跳舞', '成绩': 50, '城市': '吉安'},
    {'姓名': '李华', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 60, '城市': '吉安'}
]


def city2(arr):
    stort = {}
    for stu in arr:
        city = stu['城市']
        score = stu['成绩']
        # 当键为城市不存在的时候,新建字典(第一层字典)
        if city not in stort:
            stort[city] = {
                'city_num': 0,
                'city_sum': 0,
            } 
        data = stort[city]
        data['city_num'] += 1
        data['city_sum'] += score
    for city3, data in stort.items():
        avg = data['city_sum'] / data['city_num']
        print(f"{city3}市平均成绩：{avg:.2f}")
    max_score = -1
    for stu in arr:
        if stu['成绩'] > max_score:
            max_score = stu['成绩']
    max_name = []
    for stu in arr:
        if stu['成绩'] == max_score:
            max_name.append(stu['姓名'])
    print(f"班级最高分是：{max_score},学生是：{','.join(max_name)}")


city2(students)


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\笔记\5月22日\笔记.py

# 列表推导式

Mylist = [1, 5, 8, 12]
"""
    新列表，每个元素等于原列表的两倍
"""

newList = [i * 2 for i in Mylist]
print(Mylist)
print(newList)

newList2 = [i ** 2 for i in Mylist]
print(newList2)

# 条件筛选
newList3 = [i ** 2 for i in Mylist if i % 2 != 0]
print(newList3)

students = [
    {'姓名': '赵一', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '吉安'},
    {'姓名': '张三', '年龄': 22, '性别': '男', '爱好': '足球', '成绩': 85, '城市': '吉安'},
    {'姓名': '李四', '年龄': 21, '性别': '男', '爱好': '篮球', '成绩': 88, '城市': '新余'},
    {'姓名': '王五', '年龄': 21, '性别': '女', '爱好': '唱歌', '成绩': 90, '城市': '新余'},
]

# 字典列表的条件筛选

# 筛选出列表中成绩在85分以上的学生
neStudent = [{i['姓名']: i['成绩']} for i in students if i['成绩'] > 85]
print(neStudent)

# 筛选出成绩60及以上，显示及格，反之不及格

newStudent2 = [{i['姓名']: i['成绩'], "评级": '及格' if i['成绩'] >= 60 else '不及格'} for i in students]
print(newStudent2)


# newStudent3 = [{i['姓名']: i['成绩']} for i in students]
# print(newStudent3, '及格' if newStudent3['成绩'] >= 60 else '不及格')

# 字典列表转对象列表
class Stuents:
    def __init__(self, name, score):
        self.name = name
        self.score = score


myObject = [Stuents(i['姓名'], i['成绩']) for i in students]
print(myObject[0].name)


## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\笔记\5月22日\作业.py

products = [
    {'name': '手机', 'price': 1999, 'sales': 100},
    {'name': '电脑', 'price': 4999, 'sales': 50},
    {'name': '耳机', 'price': 199, 'sales': 200},
    {'name': '键盘', 'price': 99, 'sales': 300}, ]


class Product:
    def __init__(self, name, price, sales):  # price价格 sales销量
        self.name = name
        self.price = price
        self.sales = sales
    def __repr__(self):
        return f"Product(name='{self.name}', price='{self.price}', sales='{self.sales}')"
productObject = [Product(pro['name'], pro['price'], pro['sales']) for pro in products]
productOneHundred = [Product(pro['name'], pro['price'], pro['sales']) for pro in products if pro['sales'] >= 100]

print(productObject)
print(productOneHundred)

## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\以前线下学习\笔记\第一节课\index.html

**Title:** Title

#——代码注释

SyntaxError:语法错误

## D:\GitHub\my_web\内容文件夹\python_study\学校线上网课\第一学期测试\第一学期测试.py

# 1、在自己电脑上安装好python解释器，以及pycharm开发工具，并在pychram上
# 运行例1-2-2平方根程序，要求运行结果截图上传。

# import 导入  math 数学模块————运用数学方法
import math

# 平方根方法：math.sqrt()
a = input("请输入一个数：")
# 数值类型才能数学运算，python没有隐式转换
a = float(a)
# 平方根，a >=0
if a >= 0:
    s = math.sqrt(a)
    print(f"{a}的平方根是：{s:.4f}")
else:
    print(f"负数不能开平方根")

# 2.运用python,编写程序实现判断一个数是否为奇数，要求截图上传代码及运行结果。
# 判断一个是否为奇数，只要满足不被 2整除即可
if a % 2 == 0:
    print(f"{a}是偶数")
else:
    print(f"{a}是奇数")

# 3.编写代码，实现闰年判断，要求上传运行结果截图。
# 闰年：被400整除 或 被4整除，同时不能被 100 整除的数

year = input("请输入年份：")
year = float(year)
if year <= 0:
    print("年份是大于零的数")
elif year % 400 == 0 or year % 4 == 0 and year % 100 != 0:
    print(f"{str(year)}是闰年")
else:
    print(f"{year}是平年")

# 4.输入a,b,c三个整数,求方程的根。注意a可以为0.
# 一元二次方程：a²+bx+c=0
# 求根公式：-b±厂Δ / 2a    Δ = b² - 4ac
# 且当Δ = 0 ，两个实数解相同
# 且当Δ > 0 ，有两个不同的实数解
# 且当Δ < 0 ，无实数解

a = float(input("请输入二次项系数(a)："))
b = float(input("请输入一次项系数(b):"))
c = float(input("请输入常数项："))
if a == 0:
    if b == 0:
        if c == 0:
            print(f"方程有无数解")
        else:
            print("方程无解")
    else:
        print(f"实数解是：{(-c) / b}")
else:
    de_er_ta = b ** 2 - 4 * a * c
    if de_er_ta < 0:
        print("无实数解")
    elif de_er_ta == 0:
        x1 = (-b + math.sqrt(de_er_ta)) / (2 * a)
        print(f"x1，x2 = {x1}")
    else:
        x1 = (-b - math.sqrt(de_er_ta)) / (2 * a)
        x2 = (-b + math.sqrt(de_er_ta)) / (2 * a)
        print(f"x1 = {x1},x2 = {x2}")

# 5.输入整数n,计算1-n之间的所有偶数累加和，比如，n为10时，打印出30.,
# 要求上传代码和运行结果截图。
# 要求1-输入整数的偶数相加

number = input("请输出一个正整数:")  # 获取用户输入的数据
try:  # try——except ValueError : 判断当输入的是非整数时，运行except代码块
    number = int(number)  # 转成整型，已经提前排除浮点数，所以不会受float影响
    if number <= 0:  # 要求的是1-n，正帧数，负整数，0去除
        print(f"{number}不是正帧数")
    else:
        num = 0  # 创建累加器
        for i in range(number + 1):  # 遍历，i 从 0开始，所以循环次数需要 + 1
            if i % 2 == 0 and i != 0:  # 排除奇数 和 0
                num = num + i  # 偶数相加，替换外面的 num
        print(f"1-{number}的偶数和是：{num}")  # 输出结果
except ValueError:
    print(f"{number}不是一个整数")  # 当用户输出的不是整数时


# 6.输入一个四位正整数，逆序打印出它，比如1234，打印出4321.，要求上传代码和运行截图。
# 逆序，字符串需要用到，reversed()————返回的是一个迭代器对象，需要转成列表或字符串拼接(''.join())

def is_integer(is_num):
    try:
        int(is_num)
        return True
    except ValueError:
        return False


number = input("请输出一个四位整数：")
boolean = is_integer(number)
if boolean and len(number) == 4:
    number_reverse = ''.join(reversed(number))
    print(f"原数据:{number}")
    print(f"反转后：:{number_reverse}")
elif boolean and len(number) != 4:
    print("请输入四位整数")
else:
    print(f"{number}不是整数")


# 7.用for循环实现求两个数之间的最小公倍数，要求上传代码和运行截图
# 最小公倍数(lcm) = (a / 最大公约数[gcd]) * b
# 最大公约数(gcd) = gcd(a,b) = gcb(b,a mod b) —————— 意思是：a % b 做模运算，直到取余为零为止
# 任何数根0的公约数都是那个数本身

def gcd(one, two):
    try:
        one, two = int(one), int(two)
        # 只有正整数才有公约数或公倍数
        argument_a = abs(one)
        argument_b = abs(two)

        # 判断0的情况
        if argument_a == 0: return argument_b
        if argument_b == 0: return argument_a

        # 计算最大公约数
        # 先选出两个参数的最大公约数
        min_num = int(min(argument_a, argument_b))
        # 递减穷举法：公约数 <= 参数最小值
        for i in range(min_num, 0, -1):  # range(起始，终止，步长) -1指的是单次减1
            if argument_a % i == 0 and argument_b % i == 0:  # 当第一次有一个数同时被两个参数整除，那么它就是最大公约数
                return i
    except ValueError:
        print("两个数均为整数！！！")
        return None


def lcm(one, two):
    try:
        one = int(one)
        two = int(two)

        # 先判断零的情况
        if one == 0 or two == 0: return 0

        # 获取最大公约数
        big_gcd = gcd(one, two)

        # 判断并计算最小公倍数
        if big_gcd is None:
            return None
        else:
            lcm_result = one // big_gcd * two  # lcm = (a // gcd)*b
            return lcm_result
    except ValueError:
        print("两个参数均为整数!!!!")
        return None


argument_one = input(f"请输出第一个整数：")
argument_two = input(f"请输出第二个整数：")
print(f"{argument_one}与{argument_two}最大公约数是：{gcd(argument_one, argument_two)}")
print(f"{argument_one}与{argument_two}的最小公倍数是：{lcm(argument_one, argument_two)}")

# 8.输入一个正整数n，求2-n之间的所有素数和，
# 比如，输入10，则需要求出2-10之间的所有素数和，2+3+5+7=17，要求上传代码和运行截图。
# 素数另一个名字：质数

prime = input(f"请输入一个整数(大于1)：")


def is_prime(prime_num):
    try:
        number2 = int(prime_num)
        number2 = abs(number2)
        if number2 < 1:
            return f"输入的数字:{number2}小于1"
        else:
            prime_list = []
            for i in range(2, number2 + 1):
                is_prime = True
                for j in range(2, i):
                    if i % j == 0:
                        is_prime = False
                        break
                if is_prime: prime_list.append(i)
            sum = 0
            for i in prime_list:
                sum = i + sum
            return f"2到{prime_num}的素数是：{'+'.join(map(str, prime_list))} = {sum}"
    except ValueError:
        return "你输入不是整数："


print(is_prime(prime))

# 9.百仙花数（Narcissistic Number），也被称为水仙花数、自恋数或阿姆斯壮数，
# 是指一个n位数，其每个位上的数字的n次幂之和等于它本身。
num = 1000
li_st = []
for i in range(0, num + 1):
    s = str(i)
    n = len(s)
    tatal = sum(int(digit) ** n for digit in s)
    if tatal == i:
        li_st.append(i)
if not li_st:
    print(f"1000以内没有白仙花数！！！")
else:
    print(f"1000以内的百仙花数有：{','.join(map(str, li_st))}")


# 10.、定义函数，计算1+2+4+...+100的

def sum_sum(num):
    sum_ = 0
    for i in range(1, num + 1):
        sum_ = sum_ + i
    return sum_


print(f"1~100求和是：{sum_sum(100)}")


# 11、如果一个数正好等于它的所有因子（除它自身外的因子）之和，则称这个数为完数。
# 比如，6的因子有1，2，3，而6=1+2+3，因此6是一个完数。编写程序找出1000以内的所有完数。
# 因数：因子（约数）：如果 A % B == 0（余数为0），那么 B 就是 A 的因子。
# 最大因子：最大因子不超过原数一半
# 真因子：原数
def complete(num):
    li_list = []  # 创建列表：收集结果，统一输出
    for i in range(1, num + 1):  # 遍历，将1~1000所有数列举出来
        total = 0  # 累加器，收集每个数相加的结果，然后用于完整数判断
        for j in range(1, i // 2 + 1):  # 筛选出，自身元素(完整数，除自身外，其余所有数的和等于自身)
            if i % j == 0:  # 因子（约数）：如果 A % B == 0（余数为0），那么 B 就是 A 的因子。
                total += j  # 因子相加
        if total == i:  # 判断所有因子相加后，是否等于原数
            li_list.append(i)  # 是则加入列表
    return li_list  # 返回值是列表


print(f"1000以内的完整数有：{','.join(map(str, complete(1000)))}")


# 12、小明今年12岁，他妈妈比他大20岁，
# 编写程序计算多少年后，小明妈妈的年龄是小明年龄的2倍。
# 本题使用for循环，不会变得麻烦，因为不知道要循环几次。注意：range(1,True)==>range(1,1)一次都不会循环
# 本题使用while循环，会非常简单，while就是为循环未知次数而生，但是：while True 会一直循环，死循环。所以内部一定要有结束语句(break/return)
def age(num):
    xiaoMing_age = num
    monther = xiaoMing_age + 20
    year = 0
    while True:
        year += 1
        monther += 1
        xiaoMing_age += 1
        if 2 * xiaoMing_age == monther:
            return year


print(f"{age(12)}年后，小明妈妈的年龄是小明年龄的2倍")

# 13.输入一个字符串，输出它所包含的所有数字，
# 例如输入“123abc456def7”,输出“1234567”，上传代码和运行结果截图。
# 需要先将字符串转成列表，当字符串没有符号分割时用：list(),反之使用方法：split()分割
# 然后判断，将数字输出
# for i in 对象 ，只要是可迭代对象，都可以使用。i 就是 遍历的元素本身。
# for i in rang(),这里的 i 可以理解为索引，或下标
# isdigit() 方法：内容判断(字符串专属方法)：判断一个字符串是否全是数字，是则返回True，否则False
string = "123abc456def7"
newList = []
for i in string:  # ① 遍历：把每个字符依次拿出来
    if i.isdigit():  # ② 判断：拿出来的这个字符是不是数字？
        newList.append(i)  # ③ 筛选：是数字，就收下；不是，就扔掉

print(f"原字符串:{string}内数字有{''.join(map(str, newList))}")

# 14.输入一个字符串，找出其中的所有小写字符，并将其转换成大写字符后输出。
# 例如，输入字符串"a1b2c3d4", 输出“ABCD”,上传代码和运行结果截图。
# 同样先迭代字符串，然后做判断
# islower() 判断字符串中所有的字母（A-Z/a-z）是否都是小写。
# isupper()：判断字符串中所有的字母（A-Z/a-z）是否都是大写
# upper()：将字符串中的所有小写字符转换为大写
# lower()：将字符串中的所有大写字符咋混换位小写

string = "a1b2c3d4"
newList = []
for i in string:
    if i.islower():
        newList.append(i.upper())

print(f"原字符串{string}中的英文字符转大写是：{''.join(newList)}")

# 15.创建一个列表list，包含“a” “b” “c” “d” “e” “f” “g”七个字符串，然后在其
# 基础上添加元素“1” “2” “3” “a”四个字符串,统计“a”在列表中出现的次数后，
# 删除列表中所有的“a”，最后进行排序并反向输出列表，要求输出每一步的结果截图。
# 注意：合并列表的两种方法：
#               1. + 连接 (不更改原数组，生成新数组，与JavaScript的concat()类似)
#               2. 方法：extend() (更改原数组)
#               3. 切记不要使用append() (它会将整个列表嵌套)
# 可以使用 count() 方法直接统计需要的字符个数，不需要遍历
# sort() 升序 sore(reverse=True) 降序
# 列表专属方法：reverse()，反转列表
# 与 reversed的区别，reversed是一个迭代器，输出结果需要转成字符串，或列表
# 还有，使用for循环删除指定元素，列表长度会缩减，迭代可能会出问题，最好使用while循环完成，因为while会每次查看完整列表，确保没有遗漏
# while循环也可以进行迭代——就是以后在删除元素，在不想用推导式的时候，使用。
string_list = ["a", "b", "c", "d", "e", "f", "g"]
print(f"创建列表：{string_list}")
new_list = ["1", "2", "3", "a"]
new_list = string_list + new_list
print(f"添加元素1，2，3，a：{new_list}")
count = new_list.count("a")
print(f"字符a：出现{count}次")
while "a" in new_list:
    new_list.remove("a")
print(f"删除所有a后：{new_list}")
# 排序：sort()升序  降序： sort(reverse==True)
new_list.sort()
# 反转
new_list.reverse()
print(f"列表反向后：{new_list}")

# 16.使用字典描述一个时间，例如t={"hour":12,"minute":23,"second":34}表示时间“12：23：34”，
# 设计一个函数interval(t1,t2)，计算时间t1与t2的时间差，返回相同结构的一个字典时间。
# 思路：
#       1.先通过字典，设置两个不同的时间
#       2.定义函数：以 时 ： 分 ： 秒输出
#       2.定义函数：将字典的时间转为以秒为单位
#       3.定义函数：将秒转为时分秒
#       4.定义函数：计算时间差(秒为单位)，然后将时间差转换为：时分秒
timeTime = {"hour": 12, "minute": 23, "second": 50}
timeTime2 = {"hour": 6, "minute": 20, "second": 60}


def second(t):
    return t["hour"] * 3600 + t["minute"] * 60 + t["second"]


def time(t):
    return f"{t["hour"]}时: {t["minute"]}分: {t["second"]}秒"


def format_time(seconds):
    seconds = abs(seconds)
    h = seconds // 3600  # 1时 = 60分 = 3600秒  所以 // 3600  取整就是 时
    m = seconds % 3600 // 60  # 时 % 3600 先取 余数(不构成1小时) // 60 (再取整，拿到分数)
    s = seconds % 60  # 1分 = 60秒 所以 % 60 取整就是 秒
    return {"hour": h, "minute": m, "second": s}


def interval(t1, t2):
    diff = second(t1) - second(t2)
    return format_time(diff)


print(f"当前时间：{time(timeTime)}")
print(f"{time(timeTime)}与{time(timeTime2)}相差：{interval(timeTime, timeTime2)}")


# 17.创建一个汽车类，汽车拥有轮胎，方向盘，外壳，车门，大灯等属性，
# 汽车可以打喇叭，加速，刹车，开灯等操作。
# 要求至少实例化两个对象，体验修改类属性和对象属性的区别。
# 类名首字母大写，其余字母小写
class Car:
    def __init__(self, tire, steering_wheel, body, door, headlamp):
        self.轮胎 = tire
        self.方向盘 = steering_wheel
        self.车身 = body
        self.车门 = door
        self.大灯 = headlamp

    def honk(self):
        return "滴滴"

    def acceleration(self):
        return "加速"

    def brake(self):
        return "刹车"

    def lingths(self):
        return "开灯"


car1 = Car("轮胎", "真皮方向盘", "红色外观", "4个车门", "LED大灯")
car2 = Car("轮胎", "塑料方向盘", "绿色外观", "4个车门", "卤素大灯")
print(f"第一量车参数：{car1.轮胎}、{car1.方向盘}、{car1.车身}、{car1.车门}、{car1.大灯}")
print(f"第一量车参数：{car2.轮胎}、{car2.方向盘}、{car2.车身}、{car2.车门}、{car2.大灯}")
print(car1.honk())
print(car1.acceleration())
print(car1.brake())
print(car1.lingths())


# 18.完成书本第160页第4题，要求上传代码及运行截图。
# 建立一个普通人员类Person，包含姓名(m_name)、性别(m_gender)、年龄(m_age)成员变量
# (1)建立 Person类，包含Private 成员 m_name、m_sex、m_age 成员变量
# (2)建立Person的构造函数 __init__ 就是构造函数
# (3)建立一个显示过程Show()，显示该对象的数据
# (4)派生一个学生类Student，增加班级(m_class)、专业(m_major)，设计这些类的构造函数
# (5)建立 m_class、m_major对应的属性函数sClass()、sMajor()。
# (6)建立显示成员函数Show()，显示该学生对象所有成员数据

class Person:
    def __init__(self, m_name, m_gender, m_age):
        self.姓名 = m_name
        self.性别 = m_gender
        self.年龄 = m_age

    def Show(self):
        return f"姓名：{self.姓名},性别：{self.性别},年龄：{self.年龄}"


class Student(Person):
    def __init__(self, m_name, m_gender, m_age, m_class, m_major):
        Person.__init__(self, m_name, m_gender, m_age)
        self.班级 = m_class
        self.专业 = m_major

    @property
    def sClass(self):
        print(f"班级：{self.班级}")

    @property
    def sMajor(self):
        print(f"专业{self.专业}")

    def Show(self):
        students = super().Show()
        return f"{students},班级：{self.班级},专业：{self.专业}"


students1 = Student("小明", "男", "18", "软件三班", "软件技术专业")
students2 = Student("扎三", "女", "25", "软件四班", "软件技术专业")

print(students1.Show())
print(students2.Show())


# 19.完成书本上实践项目：学生信息管理，要求实现show,insert,update,delete，exit命令对应功能，上传运行截图。

class Students:
    def __init__(self, No, Name, Gender, Age):
        self.No = No
        self.Name = Name
        self.Gender = Gender
        self.Age = Age

    def show(self):
        print("%-16s %-16s %-8s %-4d" % (self.No, self.Name, self.Gender, self.Age))


class StudentList:
    def __init__(self):
        self.students = []

    def show(self):
        print("%-16s %-16s %-8s %-4s" % ("No", "Name", "Gender", "Age"))
        for s in self.students:
            s.show()

    def _insert(self, s):
        i = 0
        while i < len(self.students) and s.No > self.students[i].No:
            i = i + 1
        if i < len(self.students) and s.No == self.students[i].No:
            print(s.No + "已经存在")
            return False
        self.students.insert(i, s)
        print("增加成功")
        return True

    def _update(self, s):
        flag = False
        for i in range(len(self.students)):
            if s.No == self.students[i].No:
                self.students[i].Name = s.Name
                self.students[i].Gender = s.Gender
                self.students[i].Age = s.Age
                print("修改成功")
                flag = True
                break
        if not flag:
            print("没有这个学生")
        return flag

    def _delete(self, No):
        flag = False
        for i in range(len(self.students)):
            if self.students[i].No == No:
                del self.students[i]
                print("删除成功")
                flag = True
                break
        if not flag:
            print("没有这个学生")
        return flag

    def delete(self):
        No = input("No=")
        if No != "":
            self._delete(No)

    def insert(self):
        No = input("No=")
        Name = input('Name=')
        while True:
            Gender = input("Gender=")
            if Gender == "男" or Gender == "女":
                break
            else:
                print("性别为男或女")
        Age = input("Age=")
        if Age == "":
            Age = 0
        else:
            Age = int(Age)
        if No != "":
            self._insert(Students(No, Name, Gender, Age))
        else:
            print("学号，姓名不能为空")

    def update(self):
        No = input("No=")
        Name = input("Name=")
        while True:
            Gender = input("Gender=")
            if Gender == "男" or Gender == "女":
                break
            else:
                print("性别为男或女")
        Age = input("Age=")
        if Age == "":
            Age = 0
        else:
            Age = int(Age)
        if No != "":
            self._update(Students(No, Name, Gender, Age))
        else:
            print("学号，姓名不能为空")

    def process(self):
        while True:
            s = input(">")
            if s == "show":
                self.show()
            elif s == "insert":
                self.insert()
            elif s == "update":
                self.update()
            elif s == "delete":
                self.delete()
            elif s == "exit":
                break
            else:
                print("show:    show students")
                print("insert: insert a new students")
                print("update: update a new students")
                print("delete: delete a  students")
                print("exit:    exit")


st = StudentList()
st.process()


# 20.输入若干个学生的姓名，性别，年龄，学号等信息，
# 把它们存储到文件students.txt中，每个数据项占一行，上传代码及文件内容截图。
# 打开文件：with open("students.txt", "w", encoding="utf-8") as f:
#       ·"w" 表示写入模式，如果文件存在会覆盖，不存在则创建。
#       · encoding="utf-8" 保证中文不乱码。
#       ·写入内容：f.write(内容 + "\n")
#       ·每写一项都要手动加换行符 \n，因为 write() 不会自动换行。
#       ·关闭文件：with 语句会自动关闭，不需要手动 close()。
# 注意：退出循环条件最好，往正确方向思考，即：只关心正确的退出条件，把错误情况统一交给循环去处理。
def save_students_to_file():
    with open("students.txt", "a", encoding="utf-8") as f:
        while True:
            name = input("请输入姓名(直接回车结束)：")
            if name == "":
                break
            while True:
                gender = input("请输入性别：")
                if gender == "男" or gender == "女":
                    break
                else:
                    print("性别应为男或女，请重新输入")

            age = input("请输入年龄：")
            student_id = input("请输入学号：")

            # 每个数据单独占一行
            f.write("姓名：" + name + "\n")
            f.write("性别：" + gender + "\n")
            f.write("年龄：" + age + "\n")
            f.write("学号：" + student_id + "\n")

            print("该学生信息已经保存。\n")
    print("所有学生信息已保存到：students.txt 文件。")


save_students_to_file()


# 21.完成书本6.2.3案例，从文件中读出学生信息，要求截图上传结果。
# 创建文件，并打开文件，一次读一个字符
# 注意：尽量填写：encoding = "utf-8" 不然有可能：
#                               1.UnicodeDecodeError：明确表示解码失败。
#                               2.gbk' codec can't decode：说明当前使用的解码器是 gbk，但它无法解码某些字节。
#                               3.illegal multibyte sequence：表示字节序列不符合该编码规则，通常是编码不一致导致的。
def readFile():  # 定义一个名为 readFile 的函数，用于从文件中读取内容并返回。
    fobj = open("students.txt", "rt", encoding="utf-8")
    # "students.txt"：要打开的文件名。
    # "rt"：r 表示以只读方式打开，t 表示以文本模式打开（默认就是 rt，所以可以简写为 "r"）。
    # encoding="utf-8"：指定使用 UTF-8 编码来解码文件内容，保证中文不乱码。
    # fobj：返回一个文件对象，通过它可以对文件进行操作（如读取）。
    goon = 1
    st = ""
    # goon = 1：创建一个标志变量，用来控制循环是否继续。1 表示“继续”，0 表示“停止”。
    # st = ""：创建一个空字符串，用来拼接每次读取到的字符，最终组成完整的文件内容。
    while goon == 1:  # 只要 goon 还等于 1，循环就持续执行。
        s = fobj.read(1)  # 读取单个字符，有效拼接(注意，换行符也是有效字符)，文档末尾返回空字符串
        # fobj.read(1)：从文件中读取 1 个字符（如果文件指针已到末尾，则返回空字符串 ""）。
        # 每次读取后，文件指针会自动向后移动一位。
        if s != "":  # 如果 s 不是空字符串（即读到了有效字符）：把该字符拼接到 st 的末尾。
            st = st + s
        else:  # 如果 s 是空字符串（即已经读到文件末尾）：将 goon 设为 0，下一次循环条件判断时 goon == 1 为 False，循环停止。
            goon = 0
    fobj.close()  # 手动关闭文件对象，释放系统资源。虽然程序结束时也会自动关闭，但显式关闭是良好习惯。
    return st  # 把拼接好的完整文件内容（字符串）返回给调用者。


print(readFile())


# 22.完成课本第186页的实践项目，教材记录管理，要求上传文件结果截图。(大概率不考)

# 23.建立学生表students，并插入几条记录。要求截图上传MYSQL数据库中的结果。？？？

# 24.往学生表中插入几条数据，然后尝试用fetchone和fetchall函数读取学生表的记录，截图上传？？？


# 91.91、编写程序，计算出1+1/3+1/5+...+1/99的和，要求编写函数实现，写出函数定义和函数调用的关键代码。

def sum_fraction(n):
    total = 1
    for i in range(3, n + 1, 2):
        total = total + 1 / i
    return total


print(f"1+1/3+1/5+....+1/99的和是：{sum_fraction(99)}")

# 92、在自己电脑上安装好python解释器，以及pycharm开发工具，并在pychram上运行例1-2-1程序，
# 要求运行结果截图上传。
# 题目：新建文件，打印结果，print
print("hello word")
print("hello python")
print("hello word")


# 93.输入矩形的长和宽，计算矩形的周长和面积。要求截图上传运行结果。
# 周长 C = 2a + 2b  S = ab

def rectangle(a, b):
    C = (2 * a) + (2 * b)
    S = a * b
    return S, C


length = input("请输出矩形长度(cm)=")
width = input("请输出矩形宽度度(cm)=")
result = rectangle(float(length), float(width))
print(f"矩形长：{length}cm,宽：{width}cm，周长是：{result[1]}cm，面积是：{result[0]}cm²")


# 94.输入一个年份，判断它是否是平年，要求上传运行结果截图。
# 平年：不被 400整除以及 被4整除的同时，不能被100整除
# 在不采用括号的方式，and 优先级比 or 更高
def judge_common_year(year):
    try:
        isyear = abs(int(year))
        if isyear == 0:
            return f"年份不能为0"
        elif isyear % 400 == 0 or isyear % 4 == 0 and isyear % 100 != 0:
            return "闰年"
        else:
            return "平年"
    except ValueError:
        print("年份应该是整数！！！")


input_year = input(f"判断平年或闰年，年份=：")
print(f"{input_year}是{judge_common_year(input_year)}")


# 95.从键盘输入一个学生的数学、英语、语文、化学、物理成绩，计算其总分和平均分。
# 要求上传运行结果截图。

def is_score(prompt):
    while True:
        try:
            value = float(input(prompt))
            if 0 <= value <= 100:
                return value
            else:
                print("分数应该在0~100之间，请重新输入")
        except ValueError:
            print("请输出数字")


def avg_sum_score():
    math_score = is_score("请输入数学成绩=")
    english_score = is_score("请输出英语成绩=")
    chinese_score = is_score("请输入语文成绩=")
    chemistry_score = is_score("请输入物理成绩=")
    physics_score = is_score("请输入化学成绩=")
    sum_score = math_score + english_score + chinese_score + chemistry_score + physics_score
    avg_score = sum_score / 5
    return f"数学：{math_score}，英语：{english_score}，语文：{chinese_score}，物理：{chemistry_score}，化学：{physics_score}，总分：{sum_score}，平均分：{avg_score}"


print(avg_sum_score())


# 96.输入一个月份m,输出这个月最大的日期。比如m=3,则输出31；m=4，则输出30；当m=2时，
# 要判断当前年份是否为闰年，闰年输出29，否则输出28.要求上传程序代码截图和运行结果截图。


def is_month(month):
    while True:
        try:
            ismonth = abs(int(input(month)))
            if 1 <= ismonth <= 12:
                return ismonth
            else:
                print("月份应该在1~12，请重新输出")
        except ValueError:
            print("请输出数字")


def is_day():
    month = is_month("请输出月份=")
    if month == 2:
        input_year = input("请输出年份=")
        isyear = judge_common_year(input_year)
        if isyear == "闰年":
            return f"{input_year}是闰年，{month}月，有29天"
        else:
            return f"{input_year}是平年，{month}月，有28天"
    elif month in (1, 3, 5, 7, 8, 10, 12):
        # in(将括号内的值，回调给month)
        # any(实参均满足返回值：True 等价于 JavaScript的every)
        # all(实参均不满足，返回值值：True ，等价于 JavaScript的some)
        return f"{month}月，有31天"
    else:
        return f"{month}月，有30天"


print(is_day())


# 97.计算1000以内（包含1000本身）所有偶数的和，要求用循环实现，截图上传。

def even_number(num):
    sum_even = 0
    for i in range(2, num + 1, 2):
        sum_even += i
    return sum_even


print(f"1000以内的偶数和是：{even_number(1000)}")


# 98.输入5个同学的7门课成绩（语文、数学、英语、化学、物理、生物，政治），
# 计算每个人的总分和平均分。要求用循环实现，结果截图上传。

def headcount_avg_sum_score(headcount):
    total = 0
    student_list = []
    if headcount == 0:
        return f"取消成绩录入"
    else:
        while total < headcount:
            try:
                name = input("请输出姓名=")
                chinese = is_score("语文成绩=")
                math = is_score("数学成绩=")
                english = is_score("英语成绩=")
                physics = is_score("物理成绩=")
                chemistry = is_score("化学成绩=")
                biology = is_score("生物成绩=")
                politics = is_score("政治成绩=")
                sum_score = chinese + math + english + physics + chemistry + politics + biology
                avg_score = sum_score / 7
                students = {
                    "姓名": name,
                    "语文": chinese,
                    "数学": math,
                    "英语": english,
                    "化学": chemistry,
                    "物理": physics,
                    "生物": biology,
                    "政治": politics,
                    "总分": sum_score,
                    "平均分": avg_score
                }
                student_list.append(students)
                total += 1
            except ValueError:
                print("请输出数字")
        return student_list


try:
    enter = abs(int(input("请输入要录入成绩的学生数量(0为不录入)：")))
    student_sore = headcount_avg_sum_score(enter)
    for student in student_sore:
        print(student)
except ValueError:
    print("请输入整数")


# 99.用for循环实现，求出1000以内的所有素数，并且计算出素数和。上传运行结果截图。
# 素数(质数)只被 1 和 自身整除

def prime(number2):
    prime_list = []
    sum_prime = 0
    for i in range(2, number2 + 1):
        isprime = True
        for j in range(2, i):
            if i % j == 0:
                isprime = False
                break
        if isprime: prime_list.append(i)
    for primes in prime_list:
        sum_prime += primes
    return sum_prime


try:
    number = abs(int(input("请输入求素数的范围:")))
    print(f"{number}以内素数和={prime(number)}")
except ValueError:
    print("请输入整数")


# 100.计算数值和，s= a+aa+aaa+....+aaa...aaa(n个),
# 其中n和a由键盘输入，a为【1,9】之内的一个整数，要求上传运行结果截图。

def sum_repeat(num, count):
    try:
        num = abs(int(num))
        count = abs(int(count))
        if 1 <= num <= 9:
            sum_list = []
            sum = 0  # 初始化加数
            total = 0  # 初始化求和
            for i in range(0, count):
                sum = sum * 10 + num  # 获取加数
                total += sum  # 累加
                sum_list.append(sum)
            return f"等式：s={'+'.join(map(str, sum_list))}= {total}"
        else:
            print("个位数范围：1~9")
    except ValueError:
        print("请输入整数")


digit = input("个位数(1~9)取一个：")
count = input("n(整数)个数相加：n=")
print(sum_repeat(digit, count))


# 101.完成书本上的“百钱买百鸡”问题，要求上传结果截图  ？

# 102.请用python代码打印上述图案，上传运行结果截图。输出菱形 9 * 9 实心
def rhombus(num):
    for i in range(num):
        start = 2 * min(i, num - 1 - i) + 1  # i 是当前行数  n 是总的行数  ，该表达式主要作用：获取每个行数
        spaces = (num - start) // 2
        print(f"{' ' * spaces}{'*' * start}")


rhombus(9)


# 103、完成书本实践项目：验证哥德巴赫猜想，要求对于异常情况，引入异常处理机制。截图上传。
# 原理：任何一个6以上的偶数都可以分解为两个素数的和

# 输入偶数，如果不满足要求继续输入

def gdb():
    while True:
        n = input("输入6以上的偶数：")
        n = int(n)
        if n % 2 == 0 and n >= 6:
            break
        else:
            print("输入的不是偶数，请重新输入：")
    # p 最大值maxp
    maxp = n // 2
    p = 2
    gdb_list = []
    # 判断p是否为素数
    while p <= maxp:
        flag = True
        for i in range(2, p):
            if p % i == 0:
                # p 可以被比它小的整数除尽，不是素数
                flag = False
                break
        # 如果 p 是素数，再次判断 q 是否是素数
        if flag:
            q = n - p
            for i in range(2, q):
                if q % i == 0:
                    flag = False
                    break
            if flag:
                gdb_sum = f"{n} = {p} + {q}"
                gdb_list.append(gdb_sum)
        p = p + 1
    return '\n'.join(map(str, gdb_list))


print(gdb())


# 105.用一个函数输入省份和城市，另外一个函数显示。上传函数代码和运行结果截图。

def citys():
    provincial = input("请输入省份：")
    city = input("请输入城市：")
    return provincial, city


def print_city():
    provincial, city = citys()
    print(f"省份：{provincial}，城市：{city}")


print_city()


# 106、如果一个数正好等于它的所有因子之和，则称这个数为完数。例如，6的因子有1,2,3，而
# 6=1+2+3，因此6是一个完数。编写程序，定义函数，找出1000以内的所有完数，要求每输出5个数，
# 换一行输出。结果截图上传。
# 因子：能被整除的数
def completeness():
    li_list = []  # 收集结果
    for i in range(1, 1001):  # 获取具体值
        total = 0
        for j in range(1, i // 2 + 1):  # 被除数
            if i % j == 0:  # 判断因数 ， 能被自身整除的数
                total += j  # 所有因数相加
        if total == i:  # 完整数：所有因数相加 = 本身
            li_list.append(i)  # 将完整数添加进列表
    count = 0
    for i in li_list:
        print(i, end=' ')  # end默认'\n'
        count += 1
        if count == 5:
            print()  # 因为将默认改为空格，也就是不会自动换行，当在第五个print的时候，恢复 end='\n'，自动换行
            count = 0


completeness()
print("=========================================")


# 107、从键盘输入一个字符串，直到按enter键结束，统计字符串中的大小写英文字母各有多少个。要
# 求定义函数，输出结果截图上传。
# 判断大写：isupper  判断小写：islower

def is_lower_or_supper():
    count_upper = 0
    count_lower = 0
    while True:
        string = input("请输入字符串(enter终止输入)：")
        if string == "enter":
            break
        else:
            for i in string:
                if i.isupper():
                    count_upper += 1
                elif i.islower():
                    count_lower += 1
    print(f"大写字目有：{count_upper}个，\n小写字母有{count_lower}个")


is_lower_or_supper()

# 109、输入一个字符串，输出它包含的所有数字，如输入23abc123,输出23123。

string = "23abc123"
num_list = []
for i in string:
    if i.isdigit():
        num_list.append(i)

print(f"{string}内的数字提取：{''.join(map(str, num_list))}")


# 110、编写myStrip(s)实现去除字符串中所有空格的效果，
# 比如字符串“ abc d ef g ”调用myStrip(s)后，输出“abcdefg”截图上传结果
# replace() 三个参数：第一个[需要被替换的字符] 第二个[新字符]  第三个[替换次数]
# 去除空白常用方法：
#           1.strip()：去掉字符串首尾的空白字符(空格、换行(\n)、制表符(\t))
#           2.lstrip()：只去掉首空白字符(空格、换行(\n)、制表符(\t))
#           3.rstrip()：只去掉尾空白字符(空格、换行(\n)、制表符(\t))
def myStrings(string):
    print(string.replace(" ", ""))


s = " abc d ef g "
myStrings(s)

# 111、定义一个列表list,里面包含字符串类型和数字类型，然后将字符串和数字类型的元素分别进行
# 排序后，再合并成一个新列表输出。比如list=['xyz','abc',12,34,'efg',9,56,'hij',78],输出的
# 新列表应该是listnew=['abc','efg','hij','xyz',9,12,34,56,78]。截图上传结果。
# isdigit()：判断字符串整体是否为数字，均是返回值True,否则False
Array = ['YLH', '18', 'JXS', 'JAS', '敲代码', '9', '30', '15', '8', '100']
num_list = []
str_list = []
for i in Array:
    if i.isdigit():
        num_list.append(i)
    else:
        str_list.append(i)
num_list.sort()
str_list.sort()
list_new = num_list + str_list
print(f"原列表：{Array}，新列表：{list_new}")

# 112、完成书本上4.3.5案例，使用列表实现省份与城市的对应查找。结果截图上传。
provincess = ["广东", "四川", "贵州"]
cities = [["广州", "深圳", "惠州", "珠海"], ["成都", "内江", "乐山"], ["贵阳", "六盘水", "遵义"]]

# 输入省份查找城市
p = input("请输入需要查找的省份：")
found = False
for i in range(len(provincess)):
    if provincess[i] == p:
        print(i, end=":")
    for j in range(len(cities)):
        print(cities[i][j], end=" ")
    found = True
    break
if not found:
    print("没有这个省份")

# 输入城市查找省份
c = input("请输入城市：")
for i in range(len(cities)):
    for j in cities[i]:
        if c == j:
            print(f"{c}在，{provincess[i]}省")
            break
    print("没有查到")


# 113、设计一个通用的最小值函数，它可以计算出任意个数的最小值。结果截图上传。

def min_number():
    numbers = []
    while True:
        try:
            num = float(input("请输入数字(空字符串结束输入)："))
            numbers.append(num)
            if num == "":
                break
        except ValueError:
            print("请输入数字！！！")
    min_number = min(numbers)
    return f"{','.join(map(str, numbers))}最小值是：{min_number}"


# 114、用一个字典描述一个日期，包含年，月，日的键值。

date = {"年": 2026, "月": 6, "日": 21}
print(f"今年是：{date["年"]}年-{date["月"]}月-{date["日"]}日")

# 115、使用列表和字典存储一个班的学生信息，方便查找学生信息，信息包括姓名、性别、年龄、班级

students = [
    {"姓名": "YLH", "性别": "男", "年龄": 20, "班级": "软件技术三班"},
    {"姓名": "YJY", "性别": "男", "年龄": 19, "班级": "软件技术三班"},
    {"姓名": "YMH", "性别": "女", "年龄": 18, "班级": "数控技术三班"}
]


# 116、创建一个图书类，图书有名称、作者、价格、ISBN编号、出版社、出版日期等属性，
# 设计一个图书类Book,并设计一个show()函数输出图书信息。要求上传某本书的展示截图。

class Book:
    def __init__(self, title, autrhor, price, Number, publisher, publisher_date):
        self.书名 = title
        self.作者 = autrhor
        self.价格 = price
        self.ISBN编号 = Number
        self.出版社 = publisher
        self.出版日期 = publisher_date

    def show(self):
        return f"{self.书名}作者[{self.作者}]买[{self.价格}￥],ISBN编号：{self.ISBN编号},{self.出版社}，出版日期：{self.出版日期}"


book1 = Book("python程序设计", "FB", "49", "中国教育出版传媒集团", "1222121212", "2025-8-12")
print(book1.show())

# 117、编写我的时间类，实现时间的初始化和显示。需要新建时从外部输入有效的时分秒数据，要求定义自己的构造方法和析构方法。截图上传。 白天写


# 118、数学中有矩形，矩形有长和宽。也有周长和面积。矩形中又有长方形和正方形两大类。
# 请用面向对象的思维为它们之间的关系定义父类和子类，使用输入的长和宽值进行初始化，
# 并且为父类和子类中定义计算周长和面积的实例方法，要求上传截图。

class Rectangle:
    def __init__(self,width,height):
        self.宽 = width
        self.长 = height
    def show(self):
        C = 2 * (self.宽 * self.长)
        S = self.宽 * self.长
        return f"长方形：长：{self.长}，宽：{self.宽}，周长：{C}cm，面积：{S}cm²"
class Square(Rectangle):
    def __init__(self,width,height):
        super().__init__(width,height)
    def show(self):
        C = 2 * (self.宽 * self.长)
        S = self.宽 * self.长
        return f"正方形：长：{self.长}，宽：{self.宽}，周长：{C}cm，面积：{S}cm²"

rectangle = Rectangle(40,30)
square = Square(50,20)
print(rectangle.show())
print(square.show())

# 119、完成书本上5.5 实践项目：学生信息管理，截图上传运行结果 做过不做了

# 120、完成书本上6.1.5案例，将学生信息写入students.txt文件中，每个数据项占一行。上传运行截图。 做过，白天复习一次


# 158、编写代码，用循环实现打印平行四边形，如下图。

def parallelogram():
    try:
        height = int(input("请输入边长："))
        width = int(input("请输入宽度"))
        for i in range(height,0,-1):
            print(f"{' '* i}{'*' * width}")
    except ValueError:
        print("请输入整数！！！")

parallelogram()

