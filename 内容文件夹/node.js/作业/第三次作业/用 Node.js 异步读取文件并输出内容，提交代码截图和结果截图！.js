
// 用 Node.js 异步读取文件并输出内容，提交代码截图和结果截图！

// 获取fs模块

let fs = require('fs')

fs.readFile('./order.json', 'utf8', (err, data) => {
    if (err) {
        return console.error(err)
    }
    let data_Array = JSON.parse(data)
    console.log(data_Array)
})