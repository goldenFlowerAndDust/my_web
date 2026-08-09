# 电商订单计算器

"""
    定义一个而函数，用于根据传入的一批商品信息(商品名、价格、数量)
    优惠(优惠券、积分抵扣)
    运费信息计算订单的总金额
    具体规则如下：
        优惠券需要商品金额满5000才可以使用，且优惠券金额不能超过商品总价（打七折）
        积分抵扣需要商品总金额满5000才可以使用，100 积分 = 1元，
            抵扣金额不能超过商品总价，积分只能整百抵扣
"""


class SHopping:
    """
        创建实例对象：存储商品信息
    """

    # 创建实例对象
    def __init__(self):
        self.data = {}  # 必须放在最上面

    # 添加商品

    def add(self, name, price, quantity='1'):
        """
            该函数用于添加商品：

            :param name: 商品名称
            :param price:商品价格
            :param quantity: 商品购买数量
            :return: 添加成功返回True , 失败则返回None
        """
        # 创建商品信息：键为后续拉链做准备
        information = ["价格", "数量"]
        # 价格与数量应为数字，数量应为整数
        try:
            price = abs(float(price))
            quantity = abs(int(quantity))
        except ValueError:
            print("价格与数量应为数字类型，且数量为整数。")
            return None

        # 创建内层字典：价格、数量
        information_dict = dict(zip(information, [price, quantity]))

        # 添加商品信息
        self.data[name] = information_dict

        print(f"商品 [{name}] 添加成功")
        return True

    # 计算应付款
    def calc(self, freight='0', coupon='0'):
        """
            该函数用于计算各种优惠后，应付金额

            :param freight:运费价格
            :param coupon: 账户积分
            :return:成功计算则返回True，否则返回None

        """

        # 运费与积分应是数字类型
        try:
            freight = abs(float(freight))
            coupon = abs(float(coupon))

        except ValueError:
            print("运费与积分应是数字类型")
            return None

        # 整体运算步骤：计算总金额——优惠券——积分抵扣——运费

        # 计算总金额：sums = 价格 * 数量
        # total = 0
        # for name, information in self.data.items():
        #     total += information["价格"] * information["数量"]

        total = sum(s["价格"] * s["数量"] for s in self.data.values())

        # 计算优惠券后的金额 总金额大于5000才能，优惠券打七折
        if total > 5000:
            total_coupon = total * 0.7

            # 计算积分抵扣后的金额。100 积分 = 1元，且不大于总金额。

            # 计算总抵扣积分
            sums_coupon = (coupon // 100) * 1

            # 计算抵扣后的金额
            if sums_coupon >= int(total_coupon):
                sums_coupon = int(total_coupon)
                total_coupon = total_coupon - sums_coupon
                # 使用积分
                coupon_rest = sums_coupon * 100
                coupon = coupon - coupon_rest

                # 添加进运费
                total_coupon = total_coupon + freight

            else:
                total_coupon = total_coupon - sums_coupon
                coupon = coupon - sums_coupon * 100  # 计算剩余积分

                # 添加进运费

                total_coupon = total_coupon + freight



        else:
            total_coupon = total + freight
            coupon = f"{coupon} 未使用积分"

        # 打印结果

        # 打印所有物品
        for name, information in self.data.items():
            print(f"商品：{name},价格：{information['价格']}，数量：{information['数量']}")

        # 打印应付结果
        print(f"应付金额：{total},实收金额：{total_coupon}，包含运费：{freight}，剩余积分：{coupon}")
        print("具体优惠过程：总金额 > 5000 则：优惠七折 + 积分抵扣 + 运费，总金额 < 5000 则：总金额 + 运费")

        return True


# 制作用户交互菜单
def shop_ing():
    # 创建实例对象
    shop = SHopping()

    print("欢迎使用，购物车计算器")

    # 创建用户菜单
    while True:
        print("==========1.添加商品============2.查询实付金额===========3.退出计算器")
        count = input("请输入您要执行的操作：")

        match count:
            case '1':
                name = input("请输入您要添加的商品：name=")
                price = input(f"请输入 【{name}】的价格：price=")
                quantity = input(f"请输入 【{name}】的购买数量(默认1，回车即时默认),quantity=")
                if quantity == '':
                    result = shop.add(name, price)
                else:
                    result = shop.add(name, price, quantity)
                if result is None:
                    continue

            case '2':
                freight = input("请输入运费价格：freight=")
                coupon = input("请输入现有积分：coupon=")
                if freight == '' and coupon == '':
                    result = shop.calc()
                elif freight == '':
                    result = shop.calc(coupon = coupon)
                elif coupon == '':
                    result = shop.calc(freight=freight)
                else:
                    result = shop.calc(freight,coupon)
                if result is None:
                    continue

            case '3':
                print("计算器已退出，欢迎下次使用")
                break

            case _:
                print("请输入支持的功能")


shop_ing()

"""
    写代码遇到的问题：
        非常严重的知识误区：在for循环内解包 values()\\keys()   int(float()) 是完全可行的，截断小数  int(str()) 就需要判断 如果是非整数数字类型，其他均报错
"""
