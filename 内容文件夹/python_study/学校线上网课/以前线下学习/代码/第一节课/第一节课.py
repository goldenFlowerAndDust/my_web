import math

''' 
    #  单行注释 

    语法错误:SyntaxError

    变量名未定义:IndentationError:缩进错误

    input——输入函数

    if ease——判断语句

    print——输出语句

    三单引号/或三双引号  多行注释

    import 调动数据库

    GitHub
'''


###
s = input("输入一个数:")
s = float(s)
if s >= 0:
    s = math.sqrt(s)
    print("平方根是：", s)
else:
    print("负数不能开平方")
print("The End")


name = input("你的名字是：")
age = input("你的年龄是:")
print("你好，" + name +  "\n今年:" + age + "岁")

'''
             / \
            /   \
           /     \
          /_______\
              ||
              || 
              ||  
              || 
             /||\ 
'''

# 当使用符号[\]，需要在后面加入空格，不然会将后面的字符同时认为转义字符
# f后面跟着引号范围的字符串，大括号包裹的字符串为变量
print("     /\\")
print("    /  \\")
print("   /    \\")
print("  /      \\")
print(" /________\\")
print("     || ")
print("     || ")
print("     || ")
print("     || ")
print("    /||\ ")
