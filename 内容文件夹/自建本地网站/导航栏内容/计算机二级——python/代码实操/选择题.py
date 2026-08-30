
# 第一套卷子：21题
for i in 'python hello':
    if i == 'n':
        break
    print(i, end='')

print('',end='\n')

# 第一套卷子：22题
x = 10
while x:
    x -= 1
    if x % 2: # 坑点：0是假值:falsy，也就是false，所以本意是判断奇数。
        print(x, end='')
    else:
        pass


# 第一套卷子：22题
print('',end='\n')

for i in range(3):
    for s in 'abcd':
        if s == 'c':
            break

        print(s, end='')