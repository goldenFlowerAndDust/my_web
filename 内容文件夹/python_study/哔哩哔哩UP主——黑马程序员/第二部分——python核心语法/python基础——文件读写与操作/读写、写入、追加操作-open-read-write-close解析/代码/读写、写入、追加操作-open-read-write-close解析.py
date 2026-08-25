def read1():
    with open('测试.txt', 'rt', encoding='utf-8') as f:
        print(f.read())


def student_note():
    while True:
        name = input("请输入学生姓名(回车结束录入)，name=")
        if name == '':
            break
        cls = input("请输入学生班级,class=")
        age = input("请输入学生年龄,age=")

        students = f"姓名：{name},班级：{cls},年龄：{age}\n"
        with open('学生系统文件.txt', 'at', encoding='utf-8') as f:
            f.write(students)

        print(f'学生 {name} 录入成功')

    print('学生信息录入结束')


def read2():
    with open('学生系统文件.txt', 'rt', encoding='utf-8') as f:
        print(f.read())


# 案例三：将文件姓名为：颤三 学生删除
def removes(del_name):
    # 先读取文件
    with open('学生系统文件.txt', 'rt', encoding='utf-8') as f:
        lines = f.readlines()  # 返回列表每一行元素

    # 备份文件进其他文件
    with open('学生系统文件备份.txt', 'at', encoding='utf-8') as f:
        f.writelines(lines)
    # 过滤掉要删除的行
    new_list = []
    for line in lines:
        if f'姓名：{del_name},' in line:
            continue
        new_list.append(line)

    # 重新打开文件，这一次mode=w  # 将过滤掉的行数，列表转字符串，并覆盖原文件
    with open('学生系统文件.txt', 'wt', encoding='utf-8') as f:
        f.writelines(new_list)

    print(f'已经删除姓名为 {del_name} 的学生')


if __name__ == '__main__':
    # 案例1 ———— 读取文件内容并打印出来
    # read1()

    # 案例2 —————— 制作简易录入学生信息
    student_note()

    # 读取案例2 —————— 文件内容并打印
    read2()

    # 案例三：将文件姓名为：颤三 学生删除
    name = input("请需输入需要删除学生的姓名，name=")
    removes(name)
