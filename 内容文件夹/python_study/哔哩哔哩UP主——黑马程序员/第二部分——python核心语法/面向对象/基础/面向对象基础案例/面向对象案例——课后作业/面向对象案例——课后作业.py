# 采用面向对象编程思想完成如下需求
"""
    采用面向对象的编程思想，开发一个购物车管理系统，实现商品信息的添加、修改、删除、查询功能
        要求系统使用自定义对象存储商品数据，通过控制台菜单与用户交互。具体功能如下：
            1.添加购物车：用户根据提示录入商品名称，以及该商品的价格、数量、保存该商品信息到购物车
            2.修改购物车：要求用户输入要修改的购物车商品名称，然后再提示输入该商品的价格、数量、输入完成后修改该商品信息
            3.删除购物车：要求用户输入要删除的购物车名称，根据名称删除购物车中的商品
            4.查询购物车：将购物车中的商品信息展示出来，格式为：”商品名称：XXX，商品价格：XXX，商品数量：XXX“
            5.退出购物车
"""


# 思路：创建一个购物车类：收集商品信息。再创建一个系统类：执行功能。最后写一个控制台菜单函数。
# 尽量做到边界清晰，功能完善。
# 相比课堂案例采用：字典存储学生信息，类中：学生信息创建+功能在一起。这一次尝试分开来。

# 创建购物车类
class Shopping:
    # 初始化方法、实例对象
    def __init__(self, name, price, quantity):
        """
            创建购物车实例属性
        :param name: 商品名称
        :param price: 商品价格
        :param quantity: 商品数量
        """
        self.name = name
        self.price = price
        self.quantity = quantity

    # 输出格式定义：
    def __str__(self):
        return f'商品名称：{self.name},商品价格：{self.price},商品数量：{self.quantity}'


# 创建管理系统类
class ShopGoverns:
    # 创建实例属性，用于存放购物车实例对象
    def __init__(self):
        self.shopping = []

    # 添加一个判断用户输入是否合法的方法
    def judgment_data(self, price, quantity) -> tuple | None:
        """
            该函数主要判断用户输入是否准确
        :param price: 价格
        :param quantity: 数量
        :return: 合法：返回元组（价格，数量），否则返回None
        """
        try:
            price, quantity = abs(float(price)), abs(int(quantity))
            return price, quantity
        except ValueError:
            print("商品必须为数字，数量必须为整数")
            return None

    # 查询商品是否存在：
    def judgment_indata(self, name):
        """
            该函数主要用于查找，商品是存在
        :param name: 商品名称
        :return: 存在返回：True，否则返回：None
        """
        shop_name = []
        for shop in self.shopping:
            shop_name.append(shop.name)
        if name in shop_name:
            return True
        return None

    # 功能一：增加商品。用户根据提示录入商品名称，以及该商品的价格、数量、保存该商品信息到购物车
    def add_shop(self, name, price, quantity):
        """
            该函数主要用于添加商品信息，包含判断价格与数量的合法。
        :param name: 商品名称
        :param price: 商品价格
        :param quantity: 商品数量
        :return: 添加成功返回：True，否则返回：None
        """
        # 查询商品是否存在：
        result1 = self.judgment_indata(name)
        result = self.judgment_data(price, quantity)
        if result1 is None:  # 不存在才添加
            if result is not None:
                shop = Shopping(name, *result)
                self.shopping.append(shop)
                print(f'商品：[{name}] 添加成功')
                return True
        print(f"商品：[{name}] 已在购物车中，请执行修改操作")
        return None

    # 功能二：修改：要求用户输入要修改的购物车商品名称，然后再提示输入该商品的价格、数量、输入完成后修改该商品信息
    def revise_shop(self, name, price, quantity):  # 暂时不考虑默认值

        result1 = self.judgment_indata(name)  # 商品不存在，无法修改
        if result1 is None:
            print(f"商品：[{name}] 未添加，请执行添加操作")
            return None
        # 检查输入是否合法
        result = self.judgment_data(price, quantity)
        # # 检查商品是否存在以及修改商品信息
        if result is not None:
            for shop in self.shopping:
                if name == shop.name:
                    shop.price = result[0]
                    shop.quantity = result[1]
                    print(f'商品：[{name}] 信息修改完成')
                    return True  # 本来想：str(shop)返回修改后的信息，但是为了整个框架稳定，一律成功True,失败：None
        return None

    # 功能三：删除功能
    def remove_shop(self, name):
        result = self.judgment_indata(name)
        if result is not None:
            for shop in self.shopping:
                if name == shop.name:
                    self.shopping.remove(shop)
                    print(f'商品：[{name}] 已移除购物车')
                    return True
        print(f"商品：[{name}] 未添加购物车")
        return None

    # 查询购物车：将购物车中的商品信息展示出来，格式为：”商品名称：XXX，商品价格：XXX，商品数量：XXX“
    def refer_shop(self):
        if self.shopping:
            for shop in self.shopping:
                print(shop)
            return True
        print('未添加任何商品')
        return None


# 测试
if __name__ == '__main__':
    # 测试购物车实例对象是否成功创建，商品信息是否正常添加，价格/数量是否合法
    shops = ShopGoverns()
    shops.add_shop('苹果', 50, 30)
    print(shops.shopping[0])
    shops.add_shop('香蕉', 'hello', 50)
    shops.add_shop('香蕉', 100, 50)

    # 测试修改功能
    shops.revise_shop('苹果', 50, 40)
    print(shops.shopping[0])
    shops.revise_shop('西瓜', 50, 'hello')
    shops.revise_shop('西瓜', 50, 101)
    shops.revise_shop('苹果', 50, 'hello')

    # 删除
    shops.remove_shop('香蕉')
    shops.remove_shop('草莓')

    # 查询
    shops.add_shop('香蕉', 100, 50)
    shops.refer_shop()
