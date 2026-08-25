name = '你好'
data = name.encode('gbk')
print(data)

result = data.decode('gbk')
print(result)

# t = open('info.text','r',)
# print(t.read())