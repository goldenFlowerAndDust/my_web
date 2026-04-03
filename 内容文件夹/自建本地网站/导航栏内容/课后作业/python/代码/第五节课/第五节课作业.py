count = 3

for key in range(1, 4):
    password = input("请输入密码：")
    count = count - 1
    if password == '12345':
        print("欢迎登录")
        break
    if password != '12345':
        if count > 0:
            print(f"密码输入错误，还剩{count}机会")
        elif count == 0:
            print("密码次数耗尽，请联系管理员")
