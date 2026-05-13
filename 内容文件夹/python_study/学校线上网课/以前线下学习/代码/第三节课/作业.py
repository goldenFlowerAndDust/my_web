for i in range(3):
    money = input("请输入商品总金额:")
    money1 = float(money)
    if 100 < money1 < 200:
        print(f'因为超过100，打九折折，最后的需要付：{money1 * 0.9}')
    elif money1 > 200:
        print(f'因为超过100，打八折，最后的需要付：{money1 * 0.8}')
    else:
        print(f'少于100元，原价，需付:{money1}')
