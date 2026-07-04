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

