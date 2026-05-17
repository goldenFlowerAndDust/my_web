def people(Array):
    city_count = {}
    for stu in Array:
        city = stu['城市']
        city_count[city] = city_count.get(city, 0) + 1

    result_parts = []
    for city, count in city_count.items():
        result_parts.append(f"{city}有{count}位学生")
    if not result_parts:
        return ""
    else:
        return ",".join(result_parts)


def eightScore(Array):
    name = []
    for stu in Array:
        if stu['成绩'] < 80:
            name.append(stu['姓名'])
    if not name:
        return ""
    else:
        return '、'.join(name)

def nineScore(Array):
    name = []
    for stu in Array:
        if stu['成绩'] > 90:
            name.append(stu['姓名'])
    if not name:
        return ""
    else:
        return ",".join(name)

def cityShangHai(Array):
    dict2 = []
    for stu in Array:
       if stu["城市"] == "上海" and stu['成绩'] < 85:
           dict2.append(stu['姓名'])
    if not dict2:
        return ""
    else:
        return ",".join(dict2)

def cityBJ(Array):
    dict2 = []
    for stu in Array:
        if stu['城市'] == "北京" and stu['成绩'] > 95:
            dict2.append(stu['姓名'])
    if not dict2:
        return ""
    else:
        return ",".join(dict2)



