// 批量读取json内容

// 获取fs模块

let fs = require('fs')

let append_json = {
    name: "草莓",
    price: "60",
    quantity: 50,
    date: "2006-09-09"
}

// 先读取json文件

fs.readFile('./order.json', 'utf8', (err, data) => {
    if (err) {
        console.error('文件读取失败，请查看文件是否存在')
        return
    }
    let json = JSON.parse(data) // 需要将json文件转成数组对象，才能进行操作
    json.push(append_json)  // 数组方法，push末尾追加。
    console.log(json)
    fs.writeFile('./new_order.json', JSON.stringify(json, null, 2), {encoding: 'utf8', flag: 'w'}, (err) => {
        if (err) {
            console.log('文件添加失败')    //JSON.stringify()————>将对象重新转成JSON形式。
        }

        // 删除指定键

        // 获取文件内容————>new_order.json是上面writeFile自动创建，所以后面读取必须晚于 writeFile，因为异步并不是严格按照队列逐一运行，所有readFile可能会抢跑，
        // 最好的办法是内嵌或其他。或者全部改成同步执行
        fs.readFile('./new_order.json', 'utf8', (err, data) => {
            if (err) {
                console.log('文件读取失败，请查看文件是否存在')
            }
            let txt_json = JSON.parse(data)
            // for (let i = 0; i < txt_json.length; i++) {
            //     delete txt_json[i].price
            // }
            fs.writeFile('./new_order2.json', JSON.stringify(txt_json, (key, value) => {
                if (key === '2') return undefined;
                return value
            }, 2), {encoding: 'utf8', flag: 'w'}, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        })
    })
})
