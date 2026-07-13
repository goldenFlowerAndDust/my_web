a = '白日依山尽'
b = '黄河入海流'
c = '欲穷千里目'
d = '更上一层楼'

Array = [a, b, c, d]

width = 10
height = 6
for i in range(height):  # i = 0 开始
    if i == 0 or i == height - 1:  # 因为 i 从零开始，所以需要 -1 // 定义外层
        print(f"{'*  ' * width}")  # 外层 符号与空格各占1字符，总结就是外层长度：10*2 = 20个字符
    elif i == 1:  # 定义内层
        print(
            f"* {' ' * (2 * 2 - 1)} {'  '.join(a)}  {' ' * (2 * 2 - 1)}*")  # 一个中文占2个字符，去掉首尾2个*号，左右个3个空格，剩下汉字+两个空格共4个字符，所以：
    elif i == 2:  # 定义内层
        print(f"* {' ' * (2 * 2 - 1)} {'  '.join(b)}  {' ' * (2 * 2 - 1)}*")  # 最后内部长度为：2 + 3*2 + 4*4 = 20个字符
    elif i == 3:  # 定义内层
        print(f"* {' ' * (2 * 2 - 1)} {'  '.join(c)}  {' ' * (2 * 2 - 1)}*")  # 与外层相同，所以能对齐。
    elif i == 4:  # 定义内层
        print(f"* {' ' * (2 * 2 - 1)} {'  '.join(d)}  {' ' * (2 * 2 - 1)}*")


def draw_diamond(n):
    # n 必须是奇数
    if n % 2 == 0:
        print("n必须为奇数")
        return
        # 自动调整为奇数，或者直接报错
    for i in range(n):  # n为行数  i从0开始
        stars = 2 * min(i, n - 1 - i) + 1  # i 是当前行数  n 是总的行数  ，该表达式主要作用：获取每个行数
        """ starts
            i = 0 min = 1
            i = 1 min = 3
            i = 2 min = 5
            i = 3 min = 7
            i = 4 min = 9
            i = 5 min = 11
            i = 6 min = 9
            i = 7 min = 7
            
        """
        remove2 = stars - 2
        spaces = (n - stars) // 2
        if stars == 1 :
            print(" " * spaces + "*")
        else :
            print(" "*spaces + "*" + " " * remove2 + '*')
# 调用示例
draw_diamond(15)

# height = 9
# for i in range(height):
#     if i == 0 or i == height - 1:
#         print(f"{' ' * height}*")
#     elif i == 1 or i == height -2 :


"""
         spaces:
         (11 - 1) = 5
         (11 - 3) = 4
         (11 - 5) = 3
         (11 - 7) = 2
         (11 - 9) = 1
         (11 - 11) = 0
         (11 - 9) = 1
         (11 - 7) = 2
         (11 - 5) = 3
         (11 - 3) = 4
         (11 - 1) = 5
     """

def  square_diamond(g) :
    for i in range(g):
        stars = g
        if i == 0 or i == g - 1:
            print("*  " * stars)
        else:
            print("*" + " " * (3*g -4)+ "*")
square_diamond(10)