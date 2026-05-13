Array = []


#  增加任务
def zj(myArray):
    print("增加任务！！！")
    text = str(input("请输入需要增加的任务："))
    if text == "":
        print("不能添加空任务")
    else:
        myArray.append(text)


# 查找任务

def showcase(myArray):
    print("查找任务！！！")
    for index, value in enumerate(myArray):
        print(f"编码：{index},任务：{value}")


#   删除任务(关键字删除)

def delete(myArray):
    if not myArray:
        print("当没有能删除的任务")
        return
    print("删除任务！！！！")
    showcase(myArray)
    text = str(input("请输入需要删除的关键字(注意：只要存在匹配的字符，都会被删除！！！！)："))
    remove = False
    for Text in myArray[:]:
        if text in Text:
            myArray.remove(Text)
            print(f"删除任务的任务是：{Text}")
            remove = True
    if not remove:
        print("没有匹配的任务！！！")


# 修改任务

def modify(myArray):
    if not myArray:
        print("当前无能修改的任务")
        return
    print("修改任务！！！！！")
    showcase(myArray)
    index = int(input("请输入需要更改的任务编号："))

    text = str(input("请输入需要修改的内容："))

    try:
        if 0 <= index <= len(myArray):
            myArray[index - 1] = text
            print(f"修改的任务编号是：{index}，修改的内容是：{text}")
        else:
            print("输入的编号超出任务数量！！！！")
    except IndexError:
        print("输入的编号为非数字!!!!")


while True:
    try:
        const = int(input("请输入你的选择(必须是整数)：1.添加任务 2.查看任务 3.删除任务 4.修改 5.退出:"))
    except ValueError:
        print("请输入1~5之间的整数")
        continue
    if const == 1:
        zj(Array)
    elif const == 2:
        showcase(Array)
    elif const == 3:
        delete(Array)
    elif const == 4:
        modify(Array)
    elif const == 5:
        break
print("退出任务管理器！！！！")
