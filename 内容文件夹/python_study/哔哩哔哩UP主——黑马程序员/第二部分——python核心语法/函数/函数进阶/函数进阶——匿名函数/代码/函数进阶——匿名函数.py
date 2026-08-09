sqrt = lambda x: 30 ** 0.5
print(sqrt(10))

# 任务(必须使用lambda)：
# 1.按成绩从高到低排序，并打印出所有学生的姓名和成绩。
# 2.筛选出成绩大于等于 80 分的学生，并打印他们的姓名。
students = [
    {"name": "小明", "score": 85},
    {"name": "小红", "score": 92},
    {"name": "小兰", "score": 78},
    {"name": "小刚", "score": 88},
    {"name": "小丽", "score": 95},
]

# 按成绩从高到低排序
students.sort(key=lambda x: x["score"], reverse=True)
print("按成绩大小排序，从高到低：")
for s in students:
    print(f"{s["name"]} : {s["score"]}")

# 筛选出成绩大于等于 80 分的学生
name = []
for s in filter(lambda x: x["score"] >= 80, students):
    name.append(s["name"])
print(f"成绩 >= 80的学生有：{','.join(name)}")

# 给每个学生实际成绩提升 5 分 # subscriptable 数字不能使用方括号访问
# for s in map(lambda x: x["score"] + 5, students):
#     print(f"{s['name']} : {s['score']}")
# s是数字，不能使用中括号法，访问键

for s in map(lambda x: {"name": x["name"], "score": x["score"] + 5}, students):
    print(f"{s['name']} : {s['score']}")


# 使用def + sort ，将成绩从低到高排序，且不更改原容器
def sort_score(x):
    return x["score"]


students = sorted(students, key=sort_score)
print("从低到高排序")
for s in students:
    print(f"{s['name']} : {s['score']}")

# 课堂练习
# 1.打印一个分割线
divide = lambda: "|" * 50
print(divide())

# 2.求n个数的合
result = lambda *args: sum([float(n) for n in args])  # 局限性：不能包含语句：异常处理、if-elif-else
print(result(100, 500, 60, 80, 70))

# 案例三：完成如下列表的排序操作，按字符串字符个数排序，从小到达
data_list = ["C++", "C", "python", "jack", "PHP", "java", "go", "JavaScript", "Rust"]
result = sorted(data_list, key=lambda x: len(x))
print(data_list)
print(list(result))
