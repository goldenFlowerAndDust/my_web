x = 20


def num():
    return x


def num2():
    global x
    x = 50


def num3():
    y = 40

    def num4():
        nonlocal y
        y = 100

    num4()
    print(y)


if __name__ == '__main__':
    # 测试代码
    print("================测试代码程序====================")
    print("""
        ===========================目前测试功能=========================
        #       1.访问无需关键字     2.使用关键字global修改全局变量值      #
        #       3.使用关键nonlocal修改外层函数定义变量值                 #
        ============================================================
    """)
    count = input("请输入你要测试的代码：count=")
    match count:
        case '1':
            # 1.访问无须关键字
            print(num())
        case '2':
            # 2.使用关键字global 修改全局变量值，一般并不建议用
            num2()
            print(x)
        case '3':
            # 3.使用关键字nonlocal 修改外层函数定义变量值
            num3()
        case _:
            print("请输入合法功能")
