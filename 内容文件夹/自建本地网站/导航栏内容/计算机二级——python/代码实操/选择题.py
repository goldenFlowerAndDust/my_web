import os

# 第一套卷子：21题
for i in 'python hello':
    if i == 'n':
        break
    print(i, end='')

print('', end='\n')

# 第一套卷子：22题
x = 10
while x:
    x -= 1
    if x % 2:  # 坑点：0是假值:falsy，也就是false，所以本意是判断奇数。
        print(x, end='')
    else:
        pass

# 第一套卷子：22题
print('', end='\n')

for i in range(3):
    for s in 'abcd':
        if s == 'c':
            break

        print(s, end='')

# AI出题
print()
a = [1, 2, 3, 4, 5]
for i in a:
    if i % 2 == 1:  # 如果是奇数
        a.remove(i)  # 删除该元素
        print(a)
print(a)

# 第一套卷子：30题
d = {"zhang": "China", "Jone": "America", "Natan": "Japan"}

for k in d:
    print(k, end="")

# 创建空字典
print()
dict_1 = dict()
print(type(dict_1))

dict_1 = {}
print(type(dict_1))

ser_1 = set()
print(type(ser_1))

# 文件处理-创建文件夹，以及对应操作
file_path = '文件处理/文件存放/text.txt'
os.makedirs(os.path.dirname(file_path), exist_ok=True)
fo = open("../代码实操/文件处理/文件存放/text.txt", 'w')

x = [90, 87, 93]

print(str(x))
print(','.join(str(x)))
x1 = ','.join(map(str, sorted(x)))
x2 = ','.join(str(i) for i in x)
fo.write(x1)
fo.close()

# 第一套卷子：40题
L = 'abcd'


def f(x, result=['a', 'b', 'c', 'd']):
    if x:
        result.remove(x[-1])

        f(x[:-1])

    return result


print(f(L))

# 队列AI出题1
"""
    一个队列初始为空，依次执行以下操作：
    入队 A、入队 B、出队、入队 C、入队 D、出队、出队
    请问最终队列中还剩哪些元素？
        A. A, B
        B. C, D
        C. A, C
        D. 队列为空
    queue = [] 
    选择：D。牢记：先进先出
"""

# 队列AI出题2
"""
    一个循环队列的存储空间为 Q(1:20)——不是切片(没有包前不包后)，意思是：下标 1 到 20。共 20个存储位。 
    经过多次入队和出队操作后，front = 15，rear = 8。请问当前队列中有多少个元素？
        A. 7
        B. 13
        C. 12
        D. 8
    公式：队列长度 = (rear - front + Q) % Q 
         items = (8 - 15 + 20) % 20 = 13 % 20 = 13
     所以选择：B
"""
