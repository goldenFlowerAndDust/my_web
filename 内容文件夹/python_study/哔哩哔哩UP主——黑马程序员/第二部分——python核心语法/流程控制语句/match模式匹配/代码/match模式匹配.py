# 案例一：实现一个计算器，可以实现+、-、*、/ 运算，用户输入运算的两个数以及运算符之后，就可以进行计算

def calculator(num1, num2, symbol):
    try:
        num1 = float(num1)
        num2 = float(num2)
    except ValueError:
        return None
    match symbol:
        case '+':
            return num1 + num2
        case '-':
            return num1 - num2
        case '*':
            return num1 * num2
        case '/':
            if num2 == 0:
                return False
            else:
                return num1 / num2
        case _:
            return None


print("===================只是简易计算器，只能输入两个参数=====================")
number_1 = input("请输入第一个数(必须是数值类型)：")
number_2 = input("请输入第二个数(必须是数值类型)：")
symbols = input("请输入要进行的运算(+、-、*、/)：")
result = calculator(number_1, number_2, symbols)
if result is None:  # None、False、True都是单例对象，可以使用 is 或 is not 进行身份匹配
    print("请输入数值类型或合法运算符")
elif result is False:
    print("除数不能为0")
else:  # 以后遇到多个假值尽量将输出结果放入else内。或直接在函数内部返回结果，就以：见名知意的字符串，或数字返回结果，直接使用 == 判断，更加清晰
    print(f"{number_1} {symbols} {number_2} = {result}")


# 写法二
def calculator(num1, num2, symbol):
    try:
        num1 = float(num1)
        num2 = float(num2)
    except ValueError:
        return None
    match symbol:
        case '+':
            return num1 + num2
        case '-':
            return num1 - num2
        case '*':
            return num1 * num2
        case '/' if num2 != 0: # 注意：match支持case + 守卫，但是返回边界模糊，最后用于只要结果的项目
            return num1 / num2
        case _:
            return None


# 案例二：编写一个游戏角色移动控制系统。根据玩家输入的不同指令，控制游戏角色执行相应的动作(输出控制台)
"""
    具体按键：
        玩家输入                                    对应动作
       上 / w / W                                角色向上移动
       下 / s / S                                角色向下移动
       左 / a / A                                角色向左移动
       右 / d / D                                角色向右移动
       '跳' | ' space' | 'SPACE'                 角色跳跃
       攻击 / j /J                               角色发动攻击
       退出 / esc / ESC                          角色退出游戏
"""
print("==================来玩个游戏吧==================")
print("""
    具体按键：
        玩家输入                                    对应动作
       上 / w / W                                角色向上移动
       下 / s / S                                角色向下移动
       左 / a / A                                角色向左移动
       右 / d / D                                角色向右移动
       '跳' | ' space' | 'SPACE'                 角色跳跃
       攻击 / j /J                               角色发动攻击
       退出 / esc / ESC                          角色退出游戏
""")
def game(key):
        match key:
            case '上' | 'w' | 'W':
                return 'on'
            case '下' | 's' | 'S':
                return 'downward'
            case '左' | 'a' | 'A':
                return 'forward'
            case '右' | 'd' | 'D':
                return 'backward'
            case '跳' | 'space' | 'SPACE':
                return 'jump'
            case '退出' | 'esc' | 'ESC':
                return 'exited'
            case _:
                return None
while True:
    keys = input("请输入键位, key=")
    result = game(keys)

    if result is None:
        print("请输入合法键位")
    elif result == 'on':
        print("角色向上移动")
    elif result == 'downward':
        print("角色向下移动")
    elif result == 'forward':
        print("角色向左移动")
    elif result == 'backward':
        print("角色向右移动")
    elif result == 'jump':
        print("角色跳跃")
    elif result == 'exited':
        print("角色退出游戏")
        break
