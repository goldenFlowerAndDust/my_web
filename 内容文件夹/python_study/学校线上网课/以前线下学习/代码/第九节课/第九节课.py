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
