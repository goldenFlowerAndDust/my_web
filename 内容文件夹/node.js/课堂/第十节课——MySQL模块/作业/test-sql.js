// 用法：
//   node test-sql.js "SELECT * FROM product LIMIT 2"
//   node test-sql.js -f 脚本.sql
const fs = require('fs')
const ab = require('./ab.js')

let args = process.argv.slice(2)
let sql = args[0] === '-f' ? fs.readFileSync(args[1], 'utf8') : args.join(' ')

if (!sql.trim()) {
    console.log('用法：node test-sql.js "SELECT * FROM product"')
    console.log('     node test-sql.js -f 某个文件.sql')
    process.exit(1)
}

ab.conn.query(sql, (err, result) => {
    if (err) {
        console.log('❌ ' + err.code)
        console.log('   ' + err.message)
        if (err.sqlMessage) console.log('   SQL: ' + err.sqlMessage)
    } else if (Array.isArray(result)) {
        console.log('✅ 返回 ' + result.length + ' 行')
        console.table(result)
    } else {
        console.log('✅ 执行成功 | 影响行数：' + result.affectedRows + ' | 新 id：' + result.insertId)
    }
    ab.conn.end()
})
