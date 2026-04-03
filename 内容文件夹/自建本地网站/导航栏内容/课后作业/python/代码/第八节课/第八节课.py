# 任务管理器 1.做作业 2.打游戏  3.打卡

# 功能设置：  1.任务添加 2.删除任务 3.查看任务 4.退出

mylist = []

while True:
    try:
        choose = int(input("请输入你的选择(必须是整数)：1.添加任务2.查看任务3.删除任务4.退出:"))
    except ValueError:
        print("输入无效，请输入1-4之间的整数！")
        continue
    if choose == 1:
        task = input("请输入你的任务:")
        mylist.append(task)  # 添加任务
    elif choose == 2:
        for number, task3 in enumerate(mylist, start=1):
            print(f"第{number}任务编号是：{task3}")  # 查看任务
    elif choose == 3:
        print("删除任务")
        for number, task3 in enumerate(mylist, start=1):
            print(f"第{number}任务编号是：{task3}")  # 查看任务
        # mylist.remove(task2)  # 删除任务 remove方法。搜索并删除第一个匹配项
        mylist.pop(int(input("请输入你要删除的任务(是任务编号减一)：")))
    elif choose == 4:
        break
    else:
        print("输入的不对，请重新输入！")
print("退出任务管理器")
