# 定义一个函数，根据传入的数据，计算这批数据种的最小值、最大值、平均值

def judge(*num):
    """
        用于输入用户输入的数据最大值，最小值，平均值
        
        :param num:用户输入的数字容器，通过不定长参数收集
        :return:是数字，输出结果，包含非数字类型，输出None
    """
    try:
        num = [float(n) for n in num]
        return max(num),min(num),round(sum(num)/len(num),2)
    except ValueError:
        return None

num_list = []
while True:
    num = input("请输入数字(直接按回车结束输入)：number=")
    if num == "":
        break
    num_list.append(num)
    
result = judge(*num_list)
if result is None:
    print("包含非数字类型")
else:
    print(f"所输出数据最大值：{result[0]}，最小值：{result[1]}，平均值：{result[2]}")
