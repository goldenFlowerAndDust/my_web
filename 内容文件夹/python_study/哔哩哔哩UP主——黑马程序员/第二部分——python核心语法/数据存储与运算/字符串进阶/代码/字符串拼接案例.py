# 根据自己的实际情况，输出个人详细信息，具体结构如下：
# "大家好，我叫XXX，今年X岁，学习的专业是：XXX，爱好：XXX"

name = "繁花与尘埃"
age = 20
specialty = "软件技术"
hobby = "python、JavaScript、MySQL、HTML、CSS"

print("大家好，我叫" + name + "，今年：" + str(age) + "岁" + "，学习的是：" + specialty + "专业" + "，爱好是：" + hobby)
print("大家好，我叫%s，今年：%s岁，学习的是：%s专业，爱好是：%s" % (name,age,specialty,hobby))