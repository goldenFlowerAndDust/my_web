#请在.....处填写多行表达式或语句
#不得修改其他代码

img = [0.244, 0.832, 0.903, 0.145, 0.26, 0.452]
filter = [0.1,0.8,0.1]
res = []
for i in range(len(img)-2):
    k=0 #有多个和，所以每次赋初始值0
    for j in range(3): #求3次累计和
        k+=filter[j]*img[i+j] #求3次累计和
        print('k={:.3f},filter[{}]={:.3f},img[{}+{}]={:.3f}'.format(k,j,filter[j],i,j,img[i+j]))
    res.append(k)
for r in res:
    print('{:<10.3f}'.format(r),end = '')

