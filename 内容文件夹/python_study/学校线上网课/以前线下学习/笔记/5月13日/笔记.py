# 字典数据存储的基本形式
"""
        关键字：get  在字典查询，若键不存在，则返回值是None

        增：
            1. 变量[“需要添加的键，必须原字典不存在，否则就是改操作”] = 值
        删：
            1. del 变量[“需要添加的键，必须原字典存在，否则返回值报错”]
            2.pop

        改：
            1. 变量[“需要添加的键，必须原字典存在，否则就是增操作”] = 值

        查：
            1. 变量[“需要添加的键，必须原字典存在，否则就是报错”]
            2. 变量.get("需要添加的键，必须原字典存在，否则返回值是None")
        单独查：
            1.键： 变量.keys()
            2.值： 变量.values()
            3.键值对： 变量.items()


"""
Arr = {'name': 'ls', 'score': 90, 'gender': '男'}

print("我的名字是:", Arr["name"])

Arr["age"] = 90

del Arr['score']
print(Arr)

Arr2 = {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'}

Arr["分数"] = 90

print(Arr2)
key = Arr.keys()
value = Arr.values()
items = Arr.items()
print(key)
print(value)
print(items)

Arr3 = [
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
    {"name": 'YLH', 'age': 20, 'gender': '男', '爱好': '敲代码'},
]

num = 0
for i, j in enumerate(Arr3):
    num = j["age"]
