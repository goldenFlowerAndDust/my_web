# 去最高值、最低值，求平均分
score = []

for i in range(1, 6):
    score.append(int(input(f"请输入第{i}位评委评分：")))
print(f"各个评委评分：{score}")
score.sort()
score.pop(0)
score.pop()
score.sort( reverse = True )
print(f"去除最高分，最低分后降序：{score}")
score = sum(score) / len(score)
print(f"选手最终评分{score}")
