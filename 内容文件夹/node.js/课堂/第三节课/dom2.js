let use = require('./dom1')

let fs = require('fs') /*文件系统，读取文件、删除文件、创建文件*/
console.log('已获取道fs模块')
fs.readFile('./hello.txt','utf-8',(err,data)=>{
    if(err){
        console.log('文件打开失败——异步执行')
    } else {
        console.log(data)
        console.log('文件打开成功——异步执行')
    }
}) /*异步执行——————>  先将异步执行程序丢给多线程，执行完所有主线程后在执行  */


/*
*   readFile——>异步读取: 有回调函数，一般不会报错，可以内部判断，自定义出错的提示
*   readFileSync————>同步读取:没有回调函数，当文件读取失败，便会报错，终止程序进行，需要使用：try-catch【捕获异常】
* */

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

console.log('文件写入——同步执行')
try {
    fs.writeFileSync('./txt2.txt',`${words}`,'utf-8')
    console.log('文件覆盖写入成功')
} catch(err) {
    console.log(err)
}

/*
*   writeFile————>异步写入：有回调函数，一般不会报错
* */
console.log(use.dom1('hello','word'))
