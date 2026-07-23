"""
    案例：开发一个购物车管理系统，实现商品信息的添加、修改、删除、查询功能。
        系统使用字典结构存储商品数据，通过控制台菜单与用户交互。具体功能如下。
"""


# 购物车信息：商品名称，数量，价格
class ShoppingCar:
    def __init__(self, wares, price, quantity):
        self.商品名称 = wares
        self.价格 = price
        self.数量 = quantity

    def add_shopping(self):
        shop_dict = {self.商品名称: {"价格": self.价格, "数量": self.数量}}  # 当前情况，最好使用二维字典。符合实际应用
        return shop_dict


def judge_number(num1, num2):
    try:
        num1, num2 = float(num1), float(num2)
        return num1, num2
    except ValueError:
        return None


shopping_list = []


def shopping():
    while True:
        print(
            f"\t本系统是一个购物车管理系统功能如下(按输入的编号使用对应功能，第一次添加商品，会默认执行一次添加商品操作)："
            f"\n\t\t1.添加商品\t2.修改商品\t3.删除商品\t4.查询购物车\t5.退出购物车")
        operation = input("请输出您要执行的操作：operation=")
        if operation == "1" or len(shopping_list) == 0:
            wares_add = input("请输入需要购买的商品：wares=")
            price_add = input("请输入商品价格， price=")
            quantity_add = input("请输入商品购买数量，quantity=")
            result = judge_number(price_add, quantity_add)
            if result:
                shopping_add = ShoppingCar(wares_add, *result)
                shopping_list.append(shopping_add.add_shopping())
            else:
                print("商品价格与金额，请输入数字！！！")
        elif operation == "2":
            revise_wares = input("请输入需要修改的商品名称：wares=")
            for shop in shopping_list:  # shop 是商品存储字典
                if revise_wares in shop:
                    revise_price = input("请输入修改后的价格, price=")
                    revise_quantity = input("请输入修改后的数量, quantity=")
                    rsult = judge_number(revise_price, revise_quantity)
                    if rsult:
                        new_dict = {revise_wares: {"价格": rsult[0], "数量": rsult[1]}}
                        shop.update(new_dict)
                        print(f"您的商品{revise_wares}修改完成！！！")
                        break
                    else:
                        print("价格、数量应该为数字")
                else:
                    print("您要更改的商品，未添加进购物车！！！")
        elif operation == "3":
            remove_wares = input("请输入需要删除的商品， wares=")
            found = False
            for shop in shopping_list:
                for key in shop.keys():
                    if remove_wares == key:
                        shopping_list.remove(shop)
                        print(f"商品{remove_wares}已移除购物车")
                        found = True
                        break
            if found is False:
                print("您要删除的商品，未添加进购物车")

        elif operation == "4":
            seeAbout_shop = input("请输入需要查询的商品，wares=")
            for shop in shopping_list:  # 字典 {商品：{价格,数量}}
                if seeAbout_shop in shop:
                    for key, value in shop.items():  # (商品，{价格，数量})
                        print(f"{key}: 价格：{value["价格"]}，数量：{value["数量"]}")
                        break
            else:
                print("您要查询的商品，未添加进购物车")
        elif operation == "5":
            print("购物清单")
            print("商品\t\t\t\t价格\t\t\t\t数量\t\t\t\t小计")
            for shop in shopping_list:
                for key, value in shop.items():
                    sum_shop_price = value["价格"] * value["数量"]
                    print(f"{key}\t\t\t{value['价格']:.2f}\t\t\t{value['数量']}\t\t\t\t{sum_shop_price:.2f}")
            return
        else:
            print("请输入，具体功能(1~5)")


shopping()


# 方式二：所有操作均在，；类 与 类方法内完成 AI 检查 ， 目前关于类的知识储备不足，后续有机会补齐
class ShoppingCart:
    def __init__(self):
        self.cart = {}  # {商品名: {"价格": 价格, "数量": 数量}}

    def add(self, name, price, qty):
        if name in self.cart:
            print("商品已存在，请使用修改功能")
            return False
        self.cart[name] = {"价格": price, "数量": qty}
        print(f"{name} 已添加")
        return True

    def update(self, name, price=None, qty=None):
        if name not in self.cart:
            print("商品不存在")
            return False
        if price is not None:
            self.cart[name]["价格"] = price
        if qty is not None:
            self.cart[name]["数量"] = qty
        print("修改完成")
        return True

    def remove(self, name):
        if name in self.cart:
            del self.cart[name]
            print("删除成功")
            return True
        print("商品不存在")
        return False

    def search(self, name):
        if name in self.cart:
            item = self.cart[name]
            print(f"商品：{name}，价格：{item['价格']}，数量：{item['数量']}")
        else:
            print("商品不存在")

    def show(self):
        if not self.cart:
            print("购物车为空")
            return
        print("商品\t\t价格\t\t数量\t\t小计")
        total = 0
        for name, info in self.cart.items():
            subtotal = info["价格"] * info["数量"]
            total += subtotal
            print(f"{name}\t\t{info['价格']:.2f}\t\t{info['数量']}\t\t{subtotal:.2f}")
        print(f"总计：{total:.2f}")


shopping_list2 = []
while True:
    print(
        f"\t本系统是一个购物车管理系统功能如下(按输入的编号使用对应功能，第一次添加商品，会默认执行一次添加商品操作)："
        f"\n\t\t1.添加商品\t2.修改商品\t3.删除商品\t4.查询购物车\t5.退出购物车")
    operation = input("请输出您要执行的操作：operation=")
    if operation == "1" or len(shopping_list2) == 0:
        wares_add = input("请输入需要购买的商品：wares=")
        price_add = input("请输入商品价格， price=")
        quantity_add = input("请输入商品购买数量，quantity=")
        result = judge_number(price_add, quantity_add)
        if result:
            shopping_add = ShoppingCart()
            shopping_add.add(wares_add, *result)
            shopping_list2.append(shopping_add)
            print(f"{wares_add} 已添加到购物车")
        else:
            print("商品价格与金额，请输入数字！！！")
