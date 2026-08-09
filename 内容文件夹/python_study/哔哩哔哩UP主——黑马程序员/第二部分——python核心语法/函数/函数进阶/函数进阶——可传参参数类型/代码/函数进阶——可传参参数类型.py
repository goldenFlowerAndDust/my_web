def add(*args):
    try:
        args = [float(s) for s in args]
        return sum(args)
    except ValueError:
        print("包含非数字！！！")


def subtracts(*args):
    try:
        args = [float(s) for s in args]
    except ValueError:
        print("包含非数字！！！")
    subtract = 0
    for i in range(len(args)):
        if i == 0:
            subtract = args[0]
        else:
            subtract -= args[i]
    return subtract


def calc(oper, *args):  # 计算器：具体执行什么运算由，传参决定
    if len(args) == 1 and isinstance(args[0], (list, tuple, set)):
        data = args[0]
    elif any(isinstance(arg, (list, tuple, set)) for arg in args):
        return None
    else:
        data = args
    return oper(*data)  # 注意需要展开元组


number = [100, 80, 50, 60, 70]
result = calc(add, number)
result2 = calc(subtracts, 10, 50, 60, 100, 5)
if result is None:
    print("参数只能是多个元素或只能是一个容器")
else:
    print(result)

if result2 is None:
    print("参数只能是多个元素或只能是一个容器")
else:
    print(result2)


def calc_iter(n):
    n = int(n)
    while n > 0:
        if n >= 1000:

            n -= 5
        elif n >= 500:
            n -= 4
        elif n >= 100:
            n -= 1
        else:
            n -= 1
        print(n)
    return True


print(calc_iter(3000))

def calc_rec(n):
    n = int(n)
    if n <= 0:
        return True   # 终止条件
    # 确定递减步长
    if n >= 1000:
        n -= 5
    elif n >= 500:
        n -= 4
    elif n >= 100:
        n -= 1
    else:
        n -= 1
    print(n)
    return calc_rec(n)   # 递归调用 说白了，就是return 函数自身

print(calc_rec(400))