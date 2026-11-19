// ============================================================
// db.js —— 数据库连接池（整个项目只有这一处连数据库）
// ============================================================
const mysql = require('mysql2/promise')

// 用连接池而不是单个连接：
// 池子会复用连接，多个请求并发时不用反复握手，也不会互相阻塞
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',   // 从 .env 读，别写死在代码里
    database: process.env.DB_NAME || 'student_app',
    waitForConnections: true,   // 连接用完就等着，而不是直接报错
    connectionLimit: 10,        // 最多同时 10 个连接
    queueLimit: 0,              // 排队不限长度
    dateStrings: true,          // 日期按字符串返回，避免时区问题
})

module.exports = pool
