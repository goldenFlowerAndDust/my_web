let use = require('./dom1')

let fs = require('fs')
console.log('已获取道fs模块')
fs.readFile('./hello.txt','utf-8',(err,data)=>{
    if(err){
        console.log('文件打开失败')
    } else {
        console.log(data)
    }
}) /*异步执行——————>  先将异步执行程序丢给多线程，执行完所有主线程后在执行  */


try{
    console.log('同步执行')
    let data = fs.readFileSync('./hello.txt','utf-8')
    console.log(`内容是：\n${data}`)
} catch(err) {
    console.log(err)
}

let words = '你好！世界！\n'
fs.writeFile('./txt2.txt', `${words}`,{encoding:'utf-8',flag : 'a'},(err)=>{
    if(err) {
        console.log('文件执行失败')
    }
    else {
        console.log('文件追加成功')
    }
})

try {
    fs.writeFileSync('./txt2.txt',`${words}`,'utf-8')
    console.log('文件覆盖写入成功')
} catch(err) {
    console.log(err)
}
console.log(use.dom1('hello','word'))
