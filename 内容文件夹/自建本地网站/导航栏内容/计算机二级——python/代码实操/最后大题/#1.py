#
# 在____________上补充代码
# 在……上补充一行或多行代码
# 可修改其他代码

import jieba
from collections import Counter

fs = open("data301.txt", "r",encoding='utf-8')
lss = fs.readlines()
fs.close()
# print(lss)
# print(len(lss))
lens = 0
for lr in lss:
    if lr != "\n":
        lens += 1
print("共{}个非空行。".format(lens))

ts = {}
for lr in lss:
    ts_list = lr.strip('\n,').split(':')
    if ts_list[0] != "":
        ts[ts_list[0]] = []

names = ts.keys()
print("共{}个人发言：{}".format(len(ts), ",".join(names)))

for r in ts.keys():
    for lr in lss:
        ts_list = lr.strip('\n,').split(':')
        if ts_list[0] != "":
            if ts_list[0] == r:
                ts[r].append(ts_list[1])

for key, value in ts.items():
    ts[key] = ' '.join(map(str, value))
print(ts)
for name, text in ts.items():
    # 1. 对合并后的字符串分词
    words = jieba.lcut(text)

    # 2. 过滤掉长度 ≤ 1 的词（如单个汉字、标点）
    filtered = [w for w in words if len(w) > 1]

    # 3. 统计词语个数
    count = len(filtered)

    # 4. 找出现次数最多的词
    if filtered:
        counter = Counter(filtered)
        most_word = counter.most_common(1)[0][0]
    else:
        most_word = ""

    # 5. 按格式输出
    print("{}说了{}个词，最多的词是：{}".format(name, count, most_word))

# print("{}说了{}个词，最多的词是：{}".format(____________))
