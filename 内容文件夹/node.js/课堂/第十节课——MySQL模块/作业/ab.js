let mysql = require('mysql2')

let conn = mysql.createConnection({
    host: 'localhost',   // localhost_3306 是 Navicat 的连接【名字】，不是地址
    port: 3306,          // 端口单独写，别拼进 host
    user: 'node',          // 新建的专用账号
    password: 'node123456',
    database: 'DuDaInfo',
    dateStrings: true,   // DATE/DATETIME 直接给字符串 '2022-11-15'，不转成 Date
})
conn.connect(function (err, conn) {
    if (err) {
        console.log("连接失败！" + err.message);
        return;
    }

    console.log("连接成功")
})

module.exports.conn = conn;