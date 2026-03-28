# 列表
# 定义列表 [元素1，元素2，元素3](也可以叫列表项)
"""
    取列表内某一项  索引、下标来对列表进行定位: 
                            print(列表名[取值项位置])
                            取值位置从0开始计数
"""""

name = ['张三', "李四", "王五", "老六"]

print(name)
print(name[3])

"""
    添加元素 append(元素内容)

"""

name.append('三七')
print(name)

"""
    依次列出所有列表项,可以用循环来做 for
                    for 取名  in  列表名：
                        print(取名)
"""

for i in name:
    print(i)

# 介绍一下你的好朋友，先创建一个列表，然后依次添加你的好朋友，接下来把你的好朋友全部显示出来

friend = []
friend.append('袁**')
friend.append('徐**')
friend.append('手机')
friend.append('电脑')
friend.append('JavaScript')
friend.append('Python')
friend.append('CSS')
friend.append('HTML')
friend.append('MySQL')

for friends in friend:
    print(friends)

"""
    输出列表项个数 len(列表名)
"""
print("总人数是：", len(friend))

# 需求，输出列表项中每一项的编号 for 编号命名  变量名(随便取)  in enumerate(列表名 ， start=取得值是编号的第一位)
for number, name in enumerate(friend, start=1):
    print(number, '------------------', name)

# 需求：设计一个商品购物车，每次输入一件商品名称，当输入的内容为"结算"的时候，就将所有的商品输出

commodity = []

while True:
    commodity2 = input('请输入你要购买的商品：')
    if commodity2 == "结算":
        break
    else:
        commodity.append(commodity2)
print('你今天购买的商品有：', commodity, '\n共', len(commodity), '样商品')



