list_1 = [10,"hello",30,50,{"姓名":"老刘"}]
for index in range(0,len(list_1)):
    print(list_1[index])

for item in list_1:
    if isinstance(item,dict):
        item["姓名"] = "王五"
        print(item)
    else:
        print(item)