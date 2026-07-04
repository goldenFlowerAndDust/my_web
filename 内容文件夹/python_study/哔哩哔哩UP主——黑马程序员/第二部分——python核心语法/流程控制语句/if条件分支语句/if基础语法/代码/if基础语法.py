# 案例一：结合前面学习的输入输出及if条件判断的知识，完成B站登录功能的实现(正确账号和密码同时符合)
user_db = {}
# 阶段一：存内存。

def register():
    username = input("请输入账号：")
    if username in user_db:
        print("账号已存在，请登录")
        return False

    password = input("请输入密码：")
    if not password:
        print("密码不能为空")
        return False
    if not password.isdigit():
        print("密码只能包含字母和数字")
        return False

    confirm = input("请再次输入密码：")
    if password != confirm:
        print("两次密码不一致")
        return False
    user_db[username] = password
    print("注册成功！")
    return True


def login():
    username = input("请输入账号：")
    password = input("请输入密码：")
    if user_db.get(username) == password:
        print(f"欢迎回来，{username}")
        return True
    else:
        print("账号或密码错误")
        return False


# 主流程：先注册，再登录
print("===请先注册===")
if register():
    print("\n===注册完成，请登录 ===")
    login()
else:
    print("注册失败，请重试")
