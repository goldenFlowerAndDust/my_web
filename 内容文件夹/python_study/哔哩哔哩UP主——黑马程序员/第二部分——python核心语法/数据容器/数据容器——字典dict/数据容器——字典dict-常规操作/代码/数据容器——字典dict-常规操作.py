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