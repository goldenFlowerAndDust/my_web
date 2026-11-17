// ============================================================
// sql.js —— 只负责“连上 MySQL”，并把连接对象交出去
// 特点：这里没有回调、没有 async 函数，只导出一个 Promise
// ============================================================

// 引入 mysql2 的 Promise 版（注意是 mysql2，不是 mysql；是 /promise 子路径）
const mysql = require('mysql2/promise')

// 调用 createConnection 建立连接
// 注意：它返回的是 Promise<Connection>，不是连接对象本身
const conn = mysql.createConnection({
    host: 'localhost',        // 数据库所在主机，本机就是 localhost
    port: 3306,               // 端口，MySQL 默认 3306
    user: 'root',             // 登录账号
    password: '1044620286qwert@QW',   // 登录密码（注意别提交到 GitHub）
    database: '回顾数据库',     // 连上后默认使用的库，省得每次都 USE
    dateStrings: true         // 日期字段按 '2026-11-17' 字符串返回，不转成 Date 对象
})

// 把这个 Promise 导出
// 谁 require('./sql.js')，谁就拿到 Promise；await 之后才是真正的连接对象
module.exports = conn
