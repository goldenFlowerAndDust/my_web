# 案例一：
#   1.生成1-20的平方列表
#   2.从如下数字列表中提取所有偶数，并计算其平方，组成一个新的列表

num_list1 = [num ** 2 for num in range(1, 21)]
print(num_list1)
print([num ** 2 for num in num_list1 if num % 2 == 0])

# 案例二：
# 将下列多个列表合并为一个列表，并去重复元素，排好序(升序)后输出到控制台
# list1 = ['M', 'A', 'C', 'E', 'F', 'G', 'H', 'L', 'N', 'I', 'J', 'K', 'O']
# list1 = ['X', 'Z', 'T', 'Y', 'D', 'E', 'F', 'G']
# list1 = ['w', 'A', 'S', 'D']
list1 = ['M', 'A', 'C', 'E', 'F', 'G', 'H', 'L', 'N', 'I', 'J', 'K', 'O']
list1_2 = ['X', 'Z', 'T', 'Y', 'D', 'E', 'F', 'G']
list1_3 = ['W', 'A', 'S', 'D']

new_list = [*list1, *list1_2, *list1_3]
# new_list = [num for num  in new_list if num not in ] # 列表推导式不适合去重环境
new_list = list(dict.fromkeys(new_list))
new_list.sort()
print(new_list)

# 案例三：将如下列表中能被3 或 5 整除的元素提取出来，并获取这些数字对应的平方，组成一个新的列表
# list = [1, 2, 3, ..., 30 ]
num_list = [num for num in range(1, 31)]
new_list = [num ** 2 for num in num_list if num % 3 == 0 or num % 5 == 0]
print(new_list)

# 案例四：将如下列表中的正数提取出来，封装为一个新的列表
# num_list = [11, 2, 31, 4, -5, 15, 17, 28, 49, 10, -11, 16, 54, -14, 36, -16, 87, -39]
num_list = [11, 2, 31, 4, -5, 15, 17, 28, 49, 10, -11, 16, 54, -14, 36, -16, 87, -39]
print(f"原列表(正负混合)：\n{num_list}")
new_list = [num for num in num_list if num > 0]
new_list.sort(reverse=True)
print(f"过去负数后：\n{new_list}")
