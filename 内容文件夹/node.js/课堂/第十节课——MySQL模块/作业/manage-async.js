// 用 async/await 重写的一版（不动 ab.js，也不动 manage.js）
let ab = require('./ab.js')

// ★ 关键：把回调式连接包装成 Promise 版
//   ab.conn 本身是回调 API（query(sql, cb)），没有 then，所以 await 不了
//   调用 .promise() 之后，query 返回 Promise，可以 await
const conn = ab.conn.promise()

async function main() {
    try {
        // 1. 查询：await 之后直接拿到结果数组（不是 OkPacket）
        const [rows] = await conn.query(
            'SELECT id, name, cat_id, size, price, add_time FROM product ORDER BY add_time DESC LIMIT 0,2'
        )
        console.log('最新两条：')
        console.table(rows)

        // 2. 添加：占位符写法，不会有引号问题
        const [addResult] = await conn.query(
            'INSERT IGNORE INTO product (id, name, cat_id, size, price, image, content, keywords, add_time, sort) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [5, '苹果', 2, '50mm', 50.00, 'images/pro-5.jpg', '苹果', '苹果', '2026-11-10', 30]
        )
        console.log('添加完成 | 影响行数：' + addResult.affectedRows)

        // 3. 修改
        const [upd] = await conn.query(
            'UPDATE product SET add_time = ? WHERE id = ?',
            ['2026-10-09', 3]
        )
        console.log('修改完成 | 匹配：' + upd.affectedRows + ' | 实际改动：' + upd.changedRows)

        // 4. 复查
        const [check] = await conn.query('SELECT id, name, add_time FROM product WHERE id = ?', [3])
        console.log('复查：', check[0])
    } catch (err) {
        // async 里所有 await 的错误都在这里统一捕获（不用每层判断 err）
        console.error('出错了：' + err.code + ' | ' + err.message)
    } finally {
        await conn.end()   // 只在最后关一次
    }
}

main()
