import my_calculator

number = []
while True:

    try:
        ID = int(input("请输入需要的操作\n1.添加操作数、2.加法、3.减法、4.乘法、5.除法、6.查看当前操作数、7.退出："))
    except ValueError:
        print("请输入1~6之间的数字")
        continue
    if ID == 1:
        text = float(input("请输入数字:"))
        number.append(text)

    elif ID == 2:
        print("加法操作")
        if len(number) < 2:
            print("需要两个及以上操作数才能进行除法操作！！！")
        else:
            add = my_calculator.add(number)
            add_str = [str(x) for x in number]  # join 输出的是字符串类型，所以需要转换
            print(f"{'、'.join(add_str)}的和是：{add}")
    elif ID == 3:
        print("减法操作：")
        if len(number) < 2:
            print("需要两个及以上操作数才能进行除法操作！！！")
        else:
            subtract = my_calculator.subtract(number)
            sub_str = [str(x) for x in number]  # join 输出的是字符串类型，所以需要转换
            print(f"{'、'.join(sub_str)}的差是：{subtract}")
    elif ID == 4:
        print("乘法操作：")
        if len(number) < 2:
            print("需要两个及以上操作数才能进行除法操作！！！")
        else:
            multiply = my_calculator.multiply(number)
            multi_str = [str(x) for x in number]  # join 输出的是字符串类型，所以需要转换
            print(f"{'、'.join(multi_str)}的积是：{multiply}")
    elif ID == 5:
        print("除法操作：")
        if len(number) < 2:
            print("需要两个及以上操作数才能进行除法操作！！！")
        elif any(num == 0 for num in number[1:]):
            try:
                operate = int(input("除数不能为0!!!\n请执行：1.退出计算器、2.删除所有为0的操作数："))
            except ValueError:
                print("请输出数字1~2")
                continue
            if operate == 1:
                break
            elif operate == 2:
                num2 = 0
                remove = False
                for num in number[1:]:
                    if num == num2:
                        number.remove(num)
                        remove = True
                        continue
                    else:
                        print("已经删除所有为0操作数")
                        divide = my_calculator.divide(number)
                        divide_str = [str(x) for x in number]  # join 输出的是字符串类型，所以需要转换
                        print(f"{'、'.join(divide_str):}的商是：{divide}")
    elif ID == 6:
        print(number)
    elif ID == 7:
        break
print("退出计算器")
