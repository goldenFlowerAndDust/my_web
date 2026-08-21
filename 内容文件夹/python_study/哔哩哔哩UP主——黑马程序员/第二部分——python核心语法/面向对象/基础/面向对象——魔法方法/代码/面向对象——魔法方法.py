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

