commodity = []

while True:
    commodity2 = input("请输入购买的商品：")
    if commodity2 == '结算':
        break
    elif commodity2 in commodity:
        print("已经在篮子里，不用重复购买")
    else:
        commodity.append(commodity2)
for number, commodity3 in enumerate(commodity, start=1):
    print(f"第{number}商品，是{commodity3}")
