"""
在控制台输入一段英文文本（包含大写、小写字母和数字），要求：

统计该文本中数字字符的总个数。

将文本中所有大写字母转换为小写，并去除所有数字。

输出转换后的文本，并同时输出数字的个数。
"""

# 使用函数
string = input("请输入一段英文文本(包含大写、小写字符和数字)，string=")


# 统计该文本中数字字符的总个数。
def isdigit(str2):
    count = 0
    for num in str2:
        if num.isdigit():
            count += 1
    return count


# 将文本中所有大写字母转换为小写，并去除所有数字。
def lower(char):
    string_lower = ""
    for char in char:
        if not char.isdigit():
            string_lower += char
    return string_lower.lower()


print(f"输入的文本是：{string} \n 其中数字有：{isdigit(string)}个 \n 将所有大写转成小写并去除数字：{lower(string)}")

# 不适用函数
count = 0
string_2 = ""
for char in string:
    if char.isdigit():
        count += 1
    else:
        string_2 += char
string_2 = lower(string_2)
print(f"有{count}个数字")
print(f"全部转小写并去除数字：{string_2}")

# 案例2：
"""
题目：文本分析与格式化处理
题目描述：

1.从控制台输入一段英文文本（包含大小写字母、数字、标点符号和空格），需要对这段文本进行分析和清洗，最终输出一个格式化后的统计报告。

2.具体要求如下：

2.统计行数：文本可能包含多行（以换行符分隔）。统计输入文本的行数。

4.统计单词总数：按空白字符（空格、换行）拆分文本，统计单词总数。

5.统计字符总数：统计整个文本的总字符数（包括空格和换行）。

6.提取所有数字：将文本中所有的数字字符提取出来，组合成一个新字符串。

7.统一大小写：将文本中的所有字母统一转换为大写。

8.替换标点符号：将文本中的英文句号 .、逗号 , 替换为空格 。

9.去除首尾空白：清洗后的文本去除首尾空白字符。

"""
text = input("请输入一个文本(包含大小写字母、数字、标点符号和空格)，text=")

# 统计行数：文本可能包含多行（以换行符分隔）。统计输入文本的行数。
# 模拟多行情况
count = 0
text_2 = ""
leng = 0
row = 0  # 行数
for char in text:
    if count < 10:
        text_2 += char
        count += 1
    else:
        count = 0
        print(text_2)
        text_2 = ""
        row += 1
leng += 1
print(f"一共{row}行")
# 4.统计单词总数：按空白字符（空格、换行）拆分文本，统计单词总数。

# 遍历函数

text.split(" ")
English = 0
for char in text:
    if char.isalpha():
        English += 1
print(f"单词有{English}个")

# 5.统计字符总数：统计整个文本的总字符数（包括空格和换行）。
print(f"文本总字符有：{len(text)}个")

# 6.提取所有数字：将文本中所有的数字字符提取出来，组合成一个新字符串。
num = ""
for char in text:
    if char.isdigit():
        num += char
print(f"提取数字：\n{num}")

# 7.统一大小写：将文本中的所有字母统一转换为大写。
print(f"统一转大写：\n{text.upper()}")

# 8.替换标点符号：将文本中的英文句号 .、逗号 , 替换为空格 。
word = text.replace(".", " ")
word = word.replace("、", " ")
print(f"替换标点符号后：\n{word}")
# 9.去除首尾空白：清洗后的文本去除首尾空白字符。
print(f"去除首尾空白：\n{text.strip()}")

# 案例三、
"""
    题目：文本关键词定位与替换工具
题目描述：

1.从控制台输入一段英文文本（可包含大小写字母、数字、标点符号和空格），然后输入一个关键词（一个单词）。程序需要完成以下操作：

2.统计关键词首次出现的位置：使用 find() 方法查找关键词首次出现的起始索引，如果不存在则输出 -1。

3.统计关键词最后一次出现的位置：使用 rfind() 方法查找关键词最后一次出现的起始索引，如果不存在则输出 -1。

4.统计关键词出现的总次数：使用 count() 方法统计关键词在文本中出现的次数。

5.将关键词替换为指定内容：将文本中所有关键词替换为 "[已屏蔽]"，并输出替换后的文本。

6.提取关键词首次出现位置前后的字符：提取关键词首次出现位置的前 5 个字符和后 5 个字符（如果存在），并输出。

7.统一大小写：将原始文本中的所有字母转换为小写，并输出。

8.去除首尾空白：清洗后的文本去除首尾空白字符（假设输入可能包含首尾空格）。

"""

# 1.从控制台输入一段英文文本（可包含大小写字母、数字、标点符号和空格），然后输入一个关键词（一个单词）。程序需要完成以下操作：

text = input("请输入文本(可包含大小写字母、数字、标点符号和空格), text=")
key = input(f"请输入关键字：key(一个单词)=")

# 2.统计关键词首次出现的位置：使用 find() 方法查找关键词首次出现的起始索引，如果不存在则输出 -1。

index = text.find(key)
print(f"字符{key}，首次出现在下标为：{index}")
# 3.统计关键词最后一次出现的位置：使用 rfind() 方法查找关键词最后一次出现的起始索引，如果不存在则输出 -1。

rindex = text.rfind(key)
print(f"字符{key}，首次出现在下标为：{rindex}")
# 4.统计关键词出现的总次数：使用 count() 方法统计关键词在文本中出现的次数。

count = text.count(key)
print(f"字符{key}，一共出现了：{count}次")
# 5.将关键词替换为指定内容：将文本中所有关键词替换为 "[已屏蔽]"，并输出替换后的文本。

replace_text = text.replace(f'{key}', "[已屏蔽]")
print(f"字符{key}替换为'[已屏蔽]'后：\n{replace_text}")
# 6.提取关键词首次出现位置前后的字符：提取关键词首次出现位置的前 5 个字符和后 5 个字符（如果存在），并输出。
into = input(f'请输入查找关键字前或后n个字符，n=')
key_index = text.find(key)
print(
    f"关键字：{key}  首次出现在：{key_index},    他所在的前{into}个字符是：{text[key_index - int(into):key_index]},     它所在后{into}个字符是：{text[key_index + len(key):key_index + len(key) + int(into)]}")

# 7.统一大小写：将原始文本中的所有字母转换为小写，并输出。

print(f"统一小写：{text.lower()}")

# 8.去除首尾空白：清洗后的文本去除首尾空白字符（假设输入可能包含首尾空格）。

print(f"去首尾空白：\n{text.strip()}")

# 课程案例：
#   邮箱格式验证：用户输入一个邮箱，验证邮箱格式是否正确(包含一个@和至少一个.)，
#   如果输入正确，输出"邮箱格式正确",否则输出"邮箱格式错误"
Email = input("请输入一个邮箱(包含一个@和至少一个.), email=")
if Email.count("@") == 1 and '.' in Email:
    print("邮箱格式正确")
else:
    print("邮箱格式错误")

# 课程案例二：
# 输入一个字符串，判断该字符串是否回文(两边对称)——
# 如：黄山落叶松叶落山黄
# 如：上海自来水来自海上
# 就是正反字符串一致 ,单个字符永远回文
text = input("请输入一个字符串，str=")
if text == text[::-1]:
    print(f"字符串：{text}，回文(两边对称)")
else:
    print(f"字符串：{text}，不回文(两边对称)")


# 课程案例三：
# 将用户输入的10个字符串，反转后全部换成大写，然后记录在列表中，最后将列表内容，遍历输出出来
text = input("请输入一个字符串（10个字符），str=")
print(len(text))
if len(text) <= 10:
    text = text[::-1].upper()
    text.split() # split()不能传参空字符串
    for char in text:
        print(char)
else:
    text = text[0:10]
    text = text[::-1].upper()
    text.split()
    for char in text:
        print(char)

