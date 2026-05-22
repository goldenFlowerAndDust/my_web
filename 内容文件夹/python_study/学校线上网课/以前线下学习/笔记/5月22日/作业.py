products = [
    {'name': '手机', 'price': 1999, 'sales': 100},
    {'name': '电脑', 'price': 4999, 'sales': 50},
    {'name': '耳机', 'price': 199, 'sales': 200},
    {'name': '键盘', 'price': 99, 'sales': 300}, ]


class Product:
    def __init__(self, name, price, sales):  # price价格 sales销量
        self.name = name
        self.price = price
        self.sales = sales
    def __repr__(self):
        return f"Product(name='{self.name}', price='{self.price}', sales='{self.sales}')"
productObject = [Product(pro['name'], pro['price'], pro['sales']) for pro in products]
productOneHundred = [Product(pro['name'], pro['price'], pro['sales']) for pro in products if pro['sales'] >= 100]

print(productObject)
print(productOneHundred)