// 读取 fs 模块
let fs = require('fs')

// 批量创建txt文件
for (let i = 1 ; i < 5;i++) {
    fs.writeFile(`./测试/${i}.txt`,'hello', (err) => {
        if (err) {
            console.error(err)
        }
    })
    fs.writeFile(`./测试/${i}.excel`,'hello', (err) => {
        if (err) {
            console.error(err)
        }
    })
    fs.writeFile(`./测试/${i}.docx`,'hello', (err) => {
        if (err) {
            console.error(err)
        }
    })
}

