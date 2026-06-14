# 计算自身的BMI值
# BMI  = 体重(公斤) / 身高(米)的平方

# weight = input("请输入体重(公斤)：")
# height = input("请输出身高(米)：")
#
# BMI = float(weight) / float(height) ** 2
#
# print(f"您的身高是：{height}米，体重是：{weight}公斤，BMI值是：{BMI:.2f}")

# 案例2： 需求:小智的银行卡中有10000元，现在到ATM进行取钱操作，请根据输入的金额进行取钱操作
# 要求：取钱完毕后，展示其银行卡余额


money = 10000
password = None
while True:
    if password is None:
        password = input("请输入初始取款密码：")
    else:
        psd = input("请输入取款密码：")
        if password == psd:
            withdraw = input("请输入取款金额：")
            if money < float(withdraw):
                print(f"当前存款：{money}￥，取款：{withdraw}￥，超额，请重新取款")
            else:
                balance = money - float(withdraw)
                print(f"原存款：{money}￥,取款：{withdraw}￥，余额：{balance:.4f}￥")
                break
        else:
            print("取款密码不对，请重新输入密码！！！！")
