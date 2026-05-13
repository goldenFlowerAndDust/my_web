# 任务管理器 1.做作业 2.打游戏  3.打卡

# 功能设置：  1.任务添加 2.删除任务 3.查看任务 4.退出

mylist = []


def tj(task):
    print("添加任务")
    text = input("请输入你的任务:")
    task.append(text)


def showcase(task):
    print("查看任务")
    for index, value in enumerate(task, start=1):
        print(f"{index}. {value}")


def delete(task):
    print("删除任务")
    if not task:
        print("没有任何任务能删除")
        return
    showcase(task)
    try:
        num = int(input("请输入你要删除的任务编号："))
        if -1 <= num <= len(task):
            task2 = task.pop(num - 1)
            print(f"删除的任务是：{task2}")
        else:
            print("编号超出任务数量!!!")
    except ValueError:
        print("请输入有效编号(正整数)!!!")

def modify(task) :
    print("修改任务")
    if not task:
        print("没有任何任务可以修改")
        return
    showcase(task)
    try:
        num = int(input("请输入要修改的任务编号："))
        if num <= len(task):
            text = str(input("请输入需要修改的任务内容："))
            task[num - 1] = text
            print(f"修改的任务编号是：{num - 1},修改的内容是：{text}")
        else:
            print("编号超出任务数量")
    except ValueError:
        print("请输入有效编号(正整数)")

while True:
    try:
        choose = int(input("请输入你的选择(必须是整数)：1.添加任务 2.查看任务 3.删除任务 4.修改 5.退出:"))
    except ValueError:
        print("输入无效，请输入1-4之间的整数！")
        continue
    if choose == 1:
        tj(mylist)
    elif choose == 2:
        showcase(mylist)
    elif choose == 3:
        delete(mylist)
    elif choose == 4:
        modify(mylist)
    elif choose == 5:
        break
    else:
        print("输入的不对，请重新输入！")
print("退出任务管理器")
