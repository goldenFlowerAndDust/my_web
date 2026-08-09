# 传参方式——————>位置参数

def number(num1, num2, num3):
    return num1, num2, num3


# 2.传参方式——————>关键字参数

def name(name1, name2, name3):
    return name1, name2, name3


# 3.传参方式——————>默认参数+位置参数+强制关键字参数
def student(names, age, cls="软件三班", *, subject):
    return names, age, subject, cls


# 5.传参方式————————>无定长参数
def test(*args, **kwargs):
    print("位置元组:", args)
    print("关键字字典:", kwargs)


if __name__ == "__main__":
    print("""
        ==========================程序指定运行系统===============================
        #                   1.传参方式——————>位置参数                           #
        #                   2.传参方式——————>关键字参数                         #
        #                   3.传参方式——————>默认参数+位置参数+强制关键字          #
        #                   4.传参方式————————>无定长参数                       #
        =====================================================================
    """)
    count = input("请输入要运行的代码，count=")
    match count:
        case '1':
            number_input = []
            for i in range(1, 4):
                number_input.append(input(f"请输入第{i}个实参："))
            result = number(*number_input)
            print(f"输入的实参依次是：{','.join(result)}")
        case '2':
            name_input = []
            for i in range(1, 4):
                name_input.append(input(f"请输入学生姓名(关键字传参，传参顺序会被打乱)："))
            n = ["name3", "name1", "name2"]
            result = name(**dict(zip(n, name_input)))
            print(f"传入的学生姓名有：{','.join(result)}")
        case '3':
            student_input = []
            while True:
                name_input = input("请输入学生姓名(回车则结束输入), ：name=")
                if name_input == "":
                    break
                age_input = input(f"请输入 【{name_input}】 的年龄，age=")
                subject_input = input(f"请输入 [{name_input}] 专业名=：")
                cla_input = input(f"请输入 [{name_input}] 所在的班级(默认：软件三班)：class=")
                if cla_input == "":
                    student_input.append(student(name_input, age_input, subject=subject_input))
                else:
                    student_input.append(student(name_input, age_input, cla_input, subject=subject_input))
            for i in student_input:
                print(f"{i[0]} {i[1]}岁 {i[3]} 学习：{i[2]}专业")
        case '4':
            test(1, 2, 3, name="张三", age=18)
        case _:
            print("请输入可测试的代码")
