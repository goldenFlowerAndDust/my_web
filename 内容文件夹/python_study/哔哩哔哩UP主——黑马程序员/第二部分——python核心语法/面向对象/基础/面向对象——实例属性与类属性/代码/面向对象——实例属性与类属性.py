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
