students = [
    {"姓名": '猪猪侠', '年龄': 20, '性别': '女', '爱好': '跳舞', '成绩': 90},
    {"姓名": '张三', '年龄': 22, '性别': '女', '爱好': '跳舞', '成绩': 85},
    {"姓名": '李四', '年龄': 21, '性别': '女', '爱好': '跳舞', '成绩': 88}
]

def Average(courses):
    num = 0
    average = 0
    for index,value in enumerate(courses,1):
        num = num + value["成绩"]
        average = num / len(courses)
    print(f"平均分是：{average:.2f}")

Average(students)