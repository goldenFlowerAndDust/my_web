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
