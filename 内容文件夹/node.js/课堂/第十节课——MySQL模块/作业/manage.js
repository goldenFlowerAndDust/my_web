let ab = require('./ab.js')

// 引入 promise 异步
const conn = ab.conn.promise()

async function main() {
    try {
        // 编写SQL语句——查询最新发布的两条信息

        // SELECT 字段 FROM 表名 ORDER BY 排序字段 DESC LIMIT 偏移量, 条数
        // 执行 SQL 语句
        const [rows] = await conn.query("SELECT id, name, cat_id, size, price, add_time FROM product ORDER BY add_time DESC LIMIT 0,2")
        console.log('最新两条：')
        console.table(rows)

        // 添加一条商品信息（放在查询回调里，保证顺序，且连接只关一次）

        // 语法：INSERT IGNORE INTO 表名(字段列表) VALUES(值列表)  —— 字段与值必须一一对应
        const [add] = await conn.query("INSERT IGNORE INTO product (id, name, cat_id, size, price, image, content, keywords, add_time, sort) VALUES (5, '苹果', 2, '50mm', 50.00, 'images/pro-5.jpg', '苹果', '苹果', '2026-11-10', 30)")
        console.log('添加成功 | 影响行数：' + add.affectedRows + ' | 新 id：' + add.insertId)

        // 修改一条信息

        // 语法：UPDATE 表名 set 字段 = 表达式 ... where
        const [revise] = await conn.query("UPDATE product SET add_time = '2026-10-10' where id = 3")
        console.log('修改完成 | 匹配：' + revise.affectedRows + ' | 实际改动：' + revise.changedRows)

        // 删除一条信息

        // 语法：DELETE FROM 表名 where 条件——>行条件删除，如果没有条件，则删除所有行
        const [deletes] = await conn.query('DELETE FROM product where id = 4')
        console.log('删除完成 | 匹配：'+deletes.affectedRows)

        const [read] = await conn.query("select * From product")
        console.log(typeof read)
        console.log(typeof JSON.stringify(read))

    } catch (err) {
        console.error('出错了：' + err.code + ' | ' + err.message)
    } finally {
        await conn.end()
    }
}

main()

