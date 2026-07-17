# 将用户输入的10个数字，存储到一个列表中，
# 并将列表中的数字进行排序，输出其中的最小值、最大值和平均值

list_1 = []
for count in range(10): # 确定循环次数使用for-range()循环，不确定循环次数使用while循环
    try: # 异常处理：try-expect ValueError
        num = float(input(f"请输入第({count + 1})个数字，num="))
        list_1.append(num) # 将用户输入的数字，添加进列表，在try内确保输出的是数字
    except ValueError:
        print("请输入数字！！!") # 显示错误的原因
        continue # 输入错误，不终止循环。

if list_1:
    list_1.sort() # 升序排序
    sums = sum(list_1) # sum() : 求和方法
    print(f"输入的最小值是：{list_1[0]}，最大值是：{list_1[-1]}，平均值是：{sums/len(list_1):.2f}")