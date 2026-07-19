string = "hello Python"
print(string[3])
print(string[0:5]) # 左闭右开
print(string[-1:-7:-1]) # # 左闭右开
print(string[::-1]) # 反转
print(string[::]) # 拷贝

string = "hH,eE,LLll,Oo" # 可遍历
string_2 = ""
for char in string:
    if char.isupper():
        string_2 += char
print(string_2)

# 注意：因为字符串不可变，所以没有推导式 "sr for sr string if 条件"写法不存在