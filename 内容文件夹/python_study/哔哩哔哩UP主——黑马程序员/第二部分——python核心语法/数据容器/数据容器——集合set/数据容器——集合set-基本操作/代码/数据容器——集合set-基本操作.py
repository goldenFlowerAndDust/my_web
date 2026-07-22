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

