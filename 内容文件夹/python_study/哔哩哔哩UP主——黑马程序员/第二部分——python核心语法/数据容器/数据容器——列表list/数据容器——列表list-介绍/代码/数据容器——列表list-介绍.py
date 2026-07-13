score = [90, False, "hello", ["list2"], ("元组", "tuple"), {"集合", "set"}, {"字典": "dict"}, 80, True]
print(score[-9])
print(score[0])
print(score[-1])
print(score[8])

print("=" * 60)
# 可以遍历
for item in score:
    print(item)
    print(type(item))
    print("=" * 60)

del score[8]
print(score)


