for i in range(1, 11):
    for j in range(1, i + 1):
        print('*', end='')
    print()

X = int(input("x="))

for i in range(0, X):
    for j in range(0, i + 1):
        print('@', end=' ')
    print()
