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


# 方式二：所有操作均在，；类 与 类方法内完成 AI 检查 ， 目前关于类的知识储备不足，后续回来理解
class ShoppingCart:
    """
    购物车类：管理一个购物车的所有操作
    一个实例就代表一个购物车
    """

    def __init__(self):
        # 实例属性：购物车数据，用字典存储 {商品名: {"价格": 价格, "数量": 数量}}
        self.cart = {}

    # ========== 增 ==========
    def add(self, name, price, qty):
        """
        添加商品到购物车
        参数：name(商品名), price(价格), qty(数量)
        返回：bool 添加成功返回True，否则返回False
        """
        # 1. 校验参数类型
        try:
            price = float(price)
            qty = float(qty)
        except ValueError:
            print("价格和数量必须是数字")
            return False

        # 2. 检查商品是否已存在
        if name in self.cart:
            print(f"商品'{name}'已存在，请使用修改功能")
            return False

        # 3. 添加到购物车
        self.cart[name] = {"价格": price, "数量": qty}
        print(f"✅ {name} 已添加")
        return True

    # ========== 改 ==========
    def update(self, name, price=None, qty=None):
        """
        修改购物车中的商品信息
        参数：name(商品名), price(新价格，可选), qty(新数量，可选)
        返回：bool 修改成功返回True，否则返回False
        """
        # 1. 检查商品是否存在
        if name not in self.cart:
            print(f"商品'{name}'不存在")
            return False

        # 2. 校验并更新价格
        if price is not None:
            try:
                price = float(price)
                self.cart[name]["价格"] = price
            except ValueError:
                print("价格必须是数字")
                return False

        # 3. 校验并更新数量
        if qty is not None:
            try:
                qty = float(qty)
                self.cart[name]["数量"] = qty
            except ValueError:
                print("数量必须是数字")
                return False

        print(f"✅ {name} 已修改")
        return True

    # ========== 删 ==========
    def remove(self, name):
        """
        从购物车中删除商品
        参数：name(商品名)
        返回：bool 删除成功返回True，否则返回False
        """
        if name not in self.cart:
            print(f"商品'{name}'不存在")
            return False

        del self.cart[name]
        print(f"✅ {name} 已删除")
        return True

    # ========== 查 ==========
    def search(self, name):
        """
        查询单个商品信息
        参数：name(商品名)
        返回：dict 商品信息，不存在返回None
        """
        if name not in self.cart:
            print(f"商品'{name}'不存在")
            return None

        item = self.cart[name]
        print(f"商品：{name}，价格：{item['价格']:.2f}，数量：{item['数量']}")
        return item

    # ========== 显示全部 ==========
    def show(self):
        """
        显示购物车所有商品及总计
        """
        if not self.cart:
            print("🛒 购物车为空")
            return

        print("\n" + "=" * 50)
        print("商品名称\t价格\t\t数量\t\t小计")
        print("-" * 50)

        total = 0
        for name, info in self.cart.items():
            subtotal = info["价格"] * info["数量"]
            total += subtotal
            print(f"{name}\t\t{info['价格']:.2f}\t\t{info['数量']}\t\t{subtotal:.2f}")

        print("-" * 50)
        print(f"总计：{total:.2f}")
        print("=" * 50 + "\n")

    # ========== 清空 ==========
    def clear(self):
        """清空购物车"""
        self.cart.clear()
        print("🛒 购物车已清空")


# ========== 主程序（交互界面） ==========
def main():
    # 核心：只创建一个购物车实例，所有操作都围绕这个实例进行
    cart = ShoppingCart()

    while True:
        print("\n1.添加商品  2.修改商品  3.删除商品")
        print("4.查询商品  5.查看购物车  6.清空购物车  7.退出")

        choice = input("请选择操作：")

        if choice == "1":
            name = input("商品名称：")
            price = input("价格：")
            qty = input("数量：")
            cart.add(name, price, qty)

        elif choice == "2":
            name = input("要修改的商品名称：")
            price = input("新价格（直接回车跳过）：")
            qty = input("新数量（直接回车跳过）：")
            cart.update(name, price if price else None, qty if qty else None)

        elif choice == "3":
            name = input("要删除的商品名称：")
            cart.remove(name)

        elif choice == "4":
            name = input("要查询的商品名称：")
            cart.search(name)

        elif choice == "5":
            cart.show()

        elif choice == "6":
            cart.clear()

        elif choice == "7":
            print("👋 退出购物车")
            break

        else:
            print("请输入1~7")


if __name__ == "__main__":
    main()

# 课堂知识：
# 1.使用字典嵌套方式：{商品:{价格:"", 数量:""}}
# 2.快捷键：Alt+Shift/按住鼠标滚轮也可以 可连续选中多行
# 3.非必要强制添加一件商品使用：match-case 模式匹配更好
# 4.三引号可以换行打印，且不会改变形式

open_btn = """
############购物车管理系统############
#           1.添加商品              #
#           2.修改商品              #
#           3.删除商品              #
#           4.查询购物车            #
#           5.退出购物车            #
###################################    
"""

# 1. 制作菜单
print("欢饮使用购物车管理系统 ~")




# 制作列表存储商品
shopping_list = []

while True:
    # 执行具体操作
    print(open_btn)
    choice = input("请选择要执行的操作(1~5), choice=")
    match choice:
        case "1":
            wares = input("请输入需要添加的商品，wares=")
            try:
                price = float(input(f"请输出({wares})的单价，price="))
                quantity = float(input(f"请输入({wares})购买数量="))
                shopping_list.append({wares: {"price": price, "quantity": quantity}})
                print(f"商品({wares})已添加到购物车")
            except ValueError:
                print("单价，数量应为数字")

        case "2":
            wares = input("请输入需要修改的商品, wares=")
            judge = True
            for item in shopping_list:
                if wares in item:
                    inner = item[wares]
                    while True:
                        try:
                            price, quantity = float(input("请输入修改后的单价，price=")), float(
                                input("请输入修改后的数量，quantity="))
                            inner["price"] = price
                            inner["quantity"] = quantity
                            print(f"商品({wares})修改完毕")
                            judge = False
                            break
                        except ValueError:
                            print("数量，单价应为数字")
            if judge:
                print(f"商品({wares})未添加进购物车")
        case "3":
            wares = input("请输入需要移除的商品, wares=")
            judge = True
            for item in shopping_list:
                if wares in item:
                    del item[wares]
                    print(f"商品(({wares}))已移除购物车")
                    judge = False
            if judge:
                print(f"商品({wares})未添加进购物车")

        case "4":
            print("""商品     单价      数量      小计""")
            for item in shopping_list:
                for key, value in item.items():
                    price = value['price']
                    quantity = value['quantity']
                    total = price * quantity
                    print(f"{key}\t\t{price} \t{quantity} \t\t{total:.2f}")
        case "5":
            print("已退出购物车，期待您的下一次购物")
            break
        case _:
            print("请输入具体操作：(1-5)")
