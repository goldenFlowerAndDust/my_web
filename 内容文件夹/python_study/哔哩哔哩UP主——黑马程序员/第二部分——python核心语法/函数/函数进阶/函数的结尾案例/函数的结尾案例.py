# 案例电商订单计算器

"""
    定义一个函数，用于根据传入的一批商品信息(商品名、价格、数量)、
    优惠(优惠卷、积分抵扣)、运费信息计算订单的总金额

    具体规则如下：
        1.优惠券需要商品金额满5000才可以使用，且优惠券金额打八折。
        2.积分抵扣：100积分抵扣1元(且抵扣金额不能超过商品总价，积分只能整百抵扣)

"""


class Shooping:
    def __init__(self):
        self.data = {}

    def add(self, name, price, count):
        """
            该函数主要用于添加商品信息

            :param name:商品姓名
            :param price:商品单价
            :param count: 商品数量
            :return：商品信息添加成功则，返回True，否则返回None
        """
        information = ["价格", "数量"]
        try:
            information_infact = [price, count]
            information_infact = [abs(float(p)) for p in information_infact]
            information_dict = dict(zip(information, information_infact))
            self.data[name] = information_dict
            return True
        except ValueError:
            print("实参应为数字类型")
            return None

    def calc(self, freight, loyalty_card=0):
        """
            该函数计算总价，包括优惠后的价格
            
            :param freight:运费
            :param loyalty_card:账户积分
            :return:返回付款金额,实参非数字，返回None
        """
        try:
            freight, loyalty_card = abs(float(freight)), abs(float(loyalty_card))
            loyalty_card = loyalty_card // 100
            total = 0
            for name, sums in self.data.items():
                total += sums["价格"] * sums["数量"]
            if total >= 5000:
                if loyalty_card > total:  # 当积分多余总金额时v
                    total2 = (total * 0.8) - total + freight  # 我勒个零元购
                    print(f"商品总金额：{total}元，有八折优惠券，减去积分抵扣，应付：{total2}元")
                else:
                    total2 = (total * 0.8) - loyalty_card + freight
                    print(f"商品总金额：{total}元，有八折优惠券，减去积分抵扣，应付：{total2}元")

            return True
        except ValueError:
            print("实参应为数字")
            return None


def shop():
    shop = Shooping()

    print("===============欢迎使用购物车计算器=================")
    while True:
        print("1.添加商品============2.计算应付金额==========3.退出")
        count = input("请输入需要的操作")
        match count:
            case '1':
                name = input("请输入添加商品姓名：name=")
                price = input(f"请输入 【{name}】 单价，price=")
                counts = input(f"请输入 【{name}】 购买数量，counts=")
                result = shop.add(name, price, counts)
                if result is None:
                    continue
            case '2':
                freight = input("请输入运费，freight=")
                loyalty_card = input("请输入账户积分，loyalty_card=")
                if loyalty_card == "":
                    result = shop.calc(freight)
                    if result is None:
                        continue
                else:
                    result = shop.calc(freight, loyalty_card)
                    if result is None:
                        continue
            case '3':
                print("退出计算器，欢迎下次使用")
                break
            case _:
                print("请输入现有功能")


shop()

# 案例电商订单计算器
class Shopping:
    def __init__(self):
        self.data = {}  # {商品名: {"价格": price, "数量": count}}

    def add(self, name, price, count):
        """添加商品"""
        try:
            price = abs(float(price))
            count = abs(float(count))
            if price == 0 or count == 0:
                print("价格和数量不能为0")
                return None
            self.data[name] = {"价格": price, "数量": count}
            print(f"✅ 商品 [{name}] 添加成功")
            return True
        except ValueError:
            print("价格和数量必须是数字")
            return None

    def calc(self, freight, points=0):
        """
        计算订单总金额
        :param freight: 运费
        :param points: 账户积分（可选）
        :return: 应付金额，失败返回 None
        """
        try:
            freight = abs(float(freight))
            points = abs(float(points))

            # 1. 计算商品总价
            total = 0
            for name, info in self.data.items():
                total += info["价格"] * info["数量"]
            print(f"商品总价：{total:.2f} 元")

            if not self.data:
                print("购物车为空，请先添加商品")
                return None

            # 2. 判断是否满 5000
            if total >= 5000:
                # 优惠券：打八折（优惠20%）
                coupon_discount = total * 0.2
                print(f"✅ 满5000，可使用优惠券，优惠：{coupon_discount:.2f} 元")

                # 积分抵扣：100积分 = 1元
                point_discount = (points // 100) * 1
                # 积分抵扣不能超过“优惠后金额”
                max_point_discount = total - coupon_discount
                if point_discount > max_point_discount:
                    point_discount = max_point_discount
                print(f"积分抵扣：{point_discount:.2f} 元（{points // 100 * 100} 积分）")

                # 优惠后金额
                after_discount = total - coupon_discount - point_discount
            else:
                print("未满5000，无优惠")
                coupon_discount = 0
                point_discount = 0
                after_discount = total

            # 3. 加运费
            final_amount = after_discount + freight
            print(f"运费：{freight:.2f} 元")
            print(f"应付金额：{final_amount:.2f} 元")
            return final_amount

        except ValueError:
            print("运费和积分请输入数字")
            return None


def shop():
    cart = Shopping()

    while True:
        print("\n=============== 购物车计算器 ===============")
        print("1. 添加商品")
        print("2. 计算应付金额")
        print("3. 退出")
        count = input("请输入操作编号：")

        match count:
            case '1':
                name = input("商品名：")
                price = input("单价：")
                count_num = input("数量：")
                cart.add(name, price, count_num)

            case '2':
                if not cart.data:
                    print("购物车为空，请先添加商品")
                    continue
                freight = input("请输入运费：")
                points = input("请输入积分（可不填）：")
                if points == "":
                    cart.calc(freight)
                else:
                    cart.calc(freight, points)

            case '3':
                print("退出成功，欢迎下次使用！")
                break

            case _:
                print("请输入 1、2 或 3")


shop()
