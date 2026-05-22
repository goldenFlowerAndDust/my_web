# 列表推导式

Mylist = [1, 5, 8, 12]
"""
    新列表，每个元素等于原列表的两倍
"""

newList = [i * 2 for i in Mylist]
print(Mylist)
print(newList)

newList2 = [i ** 2 for i in Mylist]
print(newList2)

# 条件筛选
newList3 = [i ** 2 for i in Mylist if i % 2 != 0]
print(newList3)

students = [
    {'姓名': '赵一', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 90, '城市': '吉安'},
    {'姓名': '张三', '年龄': 22, '性别': '男', '爱好': '足球', '成绩': 85, '城市': '吉安'},
    {'姓名': '李四', '年龄': 21, '性别': '男', '爱好': '篮球', '成绩': 88, '城市': '新余'},
    {'姓名': '王五', '年龄': 21, '性别': '女', '爱好': '唱歌', '成绩': 90, '城市': '新余'},
]

# 字典列表的条件筛选

# 筛选出列表中成绩在85分以上的学生
neStudent = [{i['姓名']: i['成绩']} for i in students if i['成绩'] > 85]
print(neStudent)

# 筛选出成绩60及以上，显示及格，反之不及格

newStudent2 = [{i['姓名']: i['成绩'], "评级": '及格' if i['成绩'] >= 60 else '不及格'} for i in students]
print(newStudent2)


# newStudent3 = [{i['姓名']: i['成绩']} for i in students]
# print(newStudent3, '及格' if newStudent3['成绩'] >= 60 else '不及格')

# 字典列表转对象列表
class Stuents:
    def __init__(self, name, score):
        self.name = name
        self.score = score


myObject = [Stuents(i['姓名'], i['成绩']) for i in students]
print(myObject[0].name)
