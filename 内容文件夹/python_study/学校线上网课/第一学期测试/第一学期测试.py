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