# 案例：
#   1.生成1-20的平方列表
#   2.从如下数字列表中提取所有偶数，并计算其平方，组成一个新的列表

num_list1 = []
for num in range(1,21):
    num_list1.append(num ** 2)
print(num_list1)
print([num ** 2 for num in num_list1 if num % 2 == 0])
