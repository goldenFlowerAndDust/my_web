def judgment_number(a, b, c):
    try:
        int(a)
        float(b)
        int(float(c))
    except:
        print("只能是数字或数字字符串、a只能是整数字符串")
        return None

    return a, b, c


result = judgment_number('50', 30, '15.6')  # 调用1
if result: print(result)
result2 = judgment_number('50.6', 30, '15.6')  # 调用2
if result2 is not None: print(result2)
