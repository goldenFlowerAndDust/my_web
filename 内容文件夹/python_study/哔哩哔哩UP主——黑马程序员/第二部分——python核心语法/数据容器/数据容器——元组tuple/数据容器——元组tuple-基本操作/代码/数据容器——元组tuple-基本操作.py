# 定义空元组
tuple1 = ()
tuple2 = tuple()

# 定义空列表
list1 = []
# list2 = list[] 不行

# 定义空字符串
str1 = ""
str2 = str()

tuple3 = (5, 20, 5, 6, 565, 254, 5, 1, 5, 6, 5, 2, 4, ["hello", "tuple"], {"你好": "数组"})
# 获取元组内的元素：
print(tuple3[-1:-3:-1])

# 反转元组
print(tuple3[::-1])

# 使用方法：count():  count(tuple,value)
print(f"5在元组中出现：{tuple3.count(5)}次")

# 使用方法：index(): index(tuple,value)
print(f"5在元组中，索引为：[{tuple3.index(5)}]第一次出现")

tuple4 = (100,)
tuple5 = ("hello",)
print(type(tuple4))
print(type(tuple5))
# 错误示范：

# tuple3[0] = 100  元组不能修改，不能重新赋值
