count = 0

while count < 4:
    weight = input("你今天的体重(千克)是：")
    height = input("你今天的身高(米)是:")

    weightFloat = float(weight)
    heightFloat = float(height)
    BMI = weightFloat / heightFloat ** 2
    if BMI > 24:
        BMI_1 = " 今天需要适量运动一下!"
    elif BMI < 18.5:
        BMI_1 = " 最近你辛苦了,要好好犒劳一下自己,去吃点好吃的吧!"
    else:
        BMI_1 = " 您的BMI指数很正常,注意保持"

    print(f"    你今天的BMI值是:{BMI:.2f},建议：{BMI_1}")
    count = count + 1


