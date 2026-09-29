// 批量读取json内容

// 获取fs模块

let fs = require('fs')

let append_json = {
    name:"香蕉",
    price:"60",
    quantity:50,
    date:"2006-09-09"
}

// 先读取json文件

fs.readFile('./order.json', 'utf8', (err, data) => {
    if (err) {
        console.error('文件读取失败，请查看文件是否存在')
        return
    }
    let json =  JSON.parse(data)
    json.push(append_json)
    console.log(json)
    fs.writeFile('./new_order.json', JSON.stringify(json,null,2), {encoding:'utf8',flag:'w'}, (err) => {
        if (err) {
            console.log('文件添加失败')
        }
    })
})