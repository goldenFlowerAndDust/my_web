import random
random_number = random.randint(1,100)
while True:
    try:
        num = int(input("请输入整数(1~100)，number="))
        if num <= 0 or num > 100:
            raise ValueError
    except ValueError:
        print("请输入1~100之间的整数")
        continue
    if num > random_number:
        print("猜大了")
        continue
    elif num < random_number:
        print("猜小了")
        continue
    else:
        print(f"恭喜猜成功了，你的幸运数字是：{random_number}")
        brea