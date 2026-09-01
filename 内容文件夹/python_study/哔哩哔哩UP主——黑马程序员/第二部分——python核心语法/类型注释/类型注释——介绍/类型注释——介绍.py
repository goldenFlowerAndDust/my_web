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
