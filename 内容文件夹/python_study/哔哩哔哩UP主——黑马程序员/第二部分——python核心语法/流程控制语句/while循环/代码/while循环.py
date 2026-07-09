num = 0
while num <= 20:
    print(num)
    num += 1
else:
    print("循环结束")

# 案例一：使用while循环，打印 10遍 "人生苦短，我用python~"

count = 1
while count <= 10:
    print("人生苦短，我用python~")
    count += 1
else:
    print("打印完毕！！！")

# 案例二：计算1-100之间所有偶数的累加之和,使用while循环
num = 0
count = 2

while count <= 100:
        num += count
        count += 2
else:
    print(f"1-100之家偶数和是：{num}")