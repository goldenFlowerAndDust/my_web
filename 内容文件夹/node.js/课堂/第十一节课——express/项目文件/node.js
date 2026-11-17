// ============================================================
// node.js —— Express 服务器：托管前端文件 + 提供学生查询接口
// 运行：node node.js
// ============================================================

// 引入 express 框架，用于创建 Web 服务、定义路由
const express = require('express')

// 引入 Node 内置的 path 模块，用来安全地拼接路径
const path = require('path')

// 调用 express() 创建一个应用实例，后面所有路由都挂在它身上
const app = express()

// 把“当前文件所在目录”作为静态资源根目录
// 这样浏览器请求 /index.html、/style.css、/JS.js 时，express 会自动返回对应文件
app.use(express.static(path.join(__dirname)))

// 定义一个 GET 接口：浏览器请求 /api/students 时执行这个函数
// async 表示里面可以用 await（Express 支持 async 处理函数）
app.get('/api/students', async (req, res) => {
    // 引入数据库连接：require 拿到的是 Promise，await 之后是连接对象
    // require 有缓存，这里不会每次都新建连接
    const conn = await require('./sql.js')

    // 从 URL 的查询串里取 kw 参数，例如 /api/students?kw=张
    // 没传就是 undefined，用 || '' 兜底成空字符串
    const kw = req.query.kw || ''

    try {
        // 执行 SQL 查询，返回 [rows, fields] 两个元素
        // 用 ? 占位符，值放在第二个参数的数组里，驱动会负责转义，防止 SQL 注入
        const [rows] = await conn.query(
            // 语法：select 字段 from 表格 where【条件】 字段 like ?
            'SELECT `学号`, `姓名`, `性别` FROM students WHERE `性别` LIKE ?',
            [`%${kw}%`]                 // 前后加 % 表示“包含”匹配
        )

        // 把查询结果（对象数组）转成 JSON 发回浏览器
        // 内部会自动设置 Content-Type: application/json 并 JSON.stringify
        res.json(rows) // 类似 http原生 res.end()不过：自动writeHead、
    } catch (e) {
        // 查询出错时，返回 500 状态码和错误信息，方便前端显示
        res.status(500).json({ error: e.message })
    }
})

// 启动服务器，监听 3000 端口
// 启动成功后打印地址，方便直接点开
app.listen(3000, () => console.log('http://localhost:3000'))
