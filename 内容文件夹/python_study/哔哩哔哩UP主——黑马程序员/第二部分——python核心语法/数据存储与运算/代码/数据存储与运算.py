# 整数类型 int
Int = 10

# 浮点数 float
Float = 3.14

# 布尔 bool  本质也是整数类型，它是int类型的子类，进行数学运算，自动以True为1，False为0
bool2 = True
bool3 = False

# 字符串 str
name = "繁华与尘埃"

# 空值 None

# print(None)

# 单行注释
"""
    多
    行
    注
    释
"""

# 变量
Myname = "繁花与尘埃"
age = 20
gender = "男"

# print(f"你好！我叫{Myname}，今年{age}岁，{gender}")

# 变量结尾，作业

"""
    ·课程基础播放量：20.7万
    ·每月新增播放量：50万
    ·求出未来两个月，每个月的总播放量
"""

# 基础播放量
basisViews = 20.7  # basis(基础) views(播放量)
# 新增播放量
addViews = 50


# 第一个月播放总量
oneMonthViews = basisViews + addViews

# 第二个月播放总量
twoMonthViews = oneMonthViews + addViews


print(f"基础播放量：{basisViews}万，第一个月播放量：{oneMonthViews}万，第二个月播放量：{twoMonthViews}万")

