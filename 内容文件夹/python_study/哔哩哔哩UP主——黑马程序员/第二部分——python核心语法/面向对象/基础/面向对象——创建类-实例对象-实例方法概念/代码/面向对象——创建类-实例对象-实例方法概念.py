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
