// 该文件用于连接数据库
// 整个项目通过这个文件，连接数据库
import mysql from "mysql2/promise"
import path from "node:path"

// ★ 自动加载同目录下的 .env（这样就不用每次都写 --env-file=.env 了）
// 用 import.meta.dirname 定位，所以不管在哪个目录启动都能找到
// loadEnvFile 是 Node 20.12+ 的内置方法；没有 .env 文件就跳过，用默认值
try {
    process.loadEnvFile(path.join(import.meta.dirname, ".env"))
    // process——>node全局对象。loadEnvFile()——>全局对象的方法：它不返回值，只往 process.env 里写。
    // 实参是.env文件，会把文件内的 key=value 逐条写进 process.env（它本身就是对象），之后直接 process.env.key 取值。
    // 前提：内容必须是 KEY=VALUE 格式（文件名随便，叫什么都可以）；格式不对就写不进去。
    // 弊端：改的是整个进程共享的 process.env，所有模块都能看到；而且已存在的变量不会被覆盖。
    // 与readFile()的区别，readFile是读取，纯文本，后续需要自己，提纯出最后的对象，然后对象.key，访问值
    // readFile()的好处，可以读取任何形式的文件。
} catch {
    console.warn("[提示] 没找到 .env，将使用默认配置")
}

// 用连接池而不是单个连接：
// 池子会复用连接，多个请求并发时不用反复握手，也不会互相阻塞
const connection = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'new_student_app',
    waitForConnections: true,   // 连接用完就等着，而不是直接报错
    connectionLimit: 10,        // 最多同时 10 个连接
    queueLimit: 0,              // 排队不限长度
    dateStrings: true,          // 日期按字符串返回，避免时区问题
})

// 暴露接口
export { connection as conn }
