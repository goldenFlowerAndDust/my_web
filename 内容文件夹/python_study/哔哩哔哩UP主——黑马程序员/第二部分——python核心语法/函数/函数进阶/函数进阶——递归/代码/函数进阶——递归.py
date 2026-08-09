def subtract(num):
    try:
        num = float(num)
        print(f"当前 num: {num}")
        if num >= 1000:
            return subtract(num - 10)
        elif num >= 500:
            return subtract(num - 5)
        elif num >= 200:
            return subtract(num - 3)
        elif num > 0:
            return subtract(num - 1)
        else:
            return num
    except ValueError:
        return "请输入数字类型"


# print(subtract(1000))

# 案例：定义一个函数，根据传入的数字，计算该数字阶乘的结果
# 阶乘：n**n + n**(n-1)+.....+n**(n-n)

def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result


print(factorial(50))


def factorial_return(n):
    if n == 1:
        return 1
    return n * factorial_return(n - 1)

result = factorial_return(5)
print(result)
"""
    先入栈：列出所需所有函数
    def factorial_return(5): # n * factorial_return(4) # 出栈：5 * 24 = 120 达到栈顶，返回最终结果，销毁栈帧
        def factorial_return(4): # n * factorial_return(3) # 出栈：4 * 6 = 24
            def factorial_return(3): # n * factorial_return(2) # 出栈：3 * 2 = 6
                def factorial_return(2): # n * factorial_return(1) # 出栈：2 * 1 = 2
                   def factorial_return(1): # 出栈：1
                         # n = 1，达到退出递归条件，停止递推
                         # 返回值1

"""

# 案例：用递归计算“数字的位数和” 如：sums(123) = 1+2+3 sums(4050) = 4 + 0 + 5 + 0
"""
    要求：
    必须用递归实现。
    不能在函数内部使用 str、list 等容器，只能使用数学运算（// 和 %）。
    写出递归终止条件和递归调用。
"""


# 正常运行逻辑
def sums(n):
    length = len(str(n))
    sum2 = 0
    n = str(n)
    for i in range(length):
        sum2 += int(n[i])
    return sum2


print(sums(123))


# 递归
def sums(n):
    if n <= 10:  # 个位数，递归停止
        return n
    return n % 10 + sums(n // 10)  # n % 10 获取最后一个数字  n // 10 获取剩余数字


print(sums(123))

"""
    递归过程： 同样先递归出所有的栈帧，然后栈顶开始计算，返回值给下一层，自身物理销毁，直到最外层（栈底），计算结果后，输出结果，然后物理销毁，函数周期结束
    入栈：
        sums(123): 出栈：123 % 10 = 3 + 3 = 6 返回最终结果：6，并物理销毁，函数周期结束。
            sums(12): # sums(123//10 = 12) 出栈：12 % 10 + 1 = 2 + 1 = 3
                sums(1): # sums(12//10 = 1) 出栈：返回值1
                    n < 10 个位数停止递归
                    返回值 1
                

"""
