// ============================================================
// server.js —— Express 后端：提供 REST 接口 + 托管前端页面
// 启动：node --env-file=.env server.js
// ============================================================
const express = require('express')
const path = require('path')
const pool = require('./db')

const app = express()
const PORT = Number(process.env.PORT) || 3100

// 解析 JSON 请求体 → req.body（POST/PUT 必需）
app.use(express.json())

// 托管 public 目录：访问 / 就是 public/index.html
app.use(express.static(path.join(__dirname, 'public')))

// ---------- 工具函数 ----------

// 把前端传来的字符串规整一下：去空格、空字符串转 null
const norm = (v) => {
    if (v === undefined || v === null) return null
    const s = String(v).trim()
    return s === '' ? null : s
}

// 校验一条学生数据，返回错误信息或 null（null 表示通过）
function validate(body) {
    if (!norm(body.sno)) return '学号不能为空'
    if (!norm(body.name)) return '姓名不能为空'
    if (norm(body.gender) && !['男', '女'].includes(norm(body.gender))) return '性别只能是 男/女'
    if (body.age !== undefined && body.age !== null && body.age !== '') {
        const age = Number(body.age)
        if (!Number.isInteger(age) || age < 1 || age > 150) return '年龄必须是 1~150 的整数'
    }
    return null
}

// ---------- 接口 1：列表（搜索 + 分页）----------
// GET /api/students?kw=张&page=1&size=5
app.get('/api/students', async (req, res, next) => {
    try {
        const kw = norm(req.query.kw) || ''
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const size = Math.min(50, Math.max(1, parseInt(req.query.size) || 5))  // 每页最多 50 条
        const offset = (page - 1) * size

        // LIKE 的参数用两个 % 包起来；% 和 _ 是通配符，这里不处理转义（学习够用）
        const like = `%${kw}%`
        const whereSql = kw ? 'WHERE sno LIKE ? OR name LIKE ? OR class_name LIKE ?' : ''
        const whereParams = kw ? [like, like, like] : []

        // 总条数（用于算总页数）
        const [countRows] = await pool.query(
            `SELECT COUNT(*) AS total FROM students ${whereSql}`,
            whereParams
        )
        const total = countRows[0].total

        // 当前页的数据
        const [rows] = await pool.query(
            `SELECT id, sno, name, gender, age, class_name, created_at
             FROM students ${whereSql}
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [...whereParams, size, offset]
        )

        res.json({ list: rows, total, page, size, pages: Math.ceil(total / size) || 1 })
    } catch (err) {
        next(err)   // 交给统一错误处理
    }
})

// ---------- 接口 2：新增 ----------
// POST /api/students  { sno, name, gender, age, class_name }
app.post('/api/students', async (req, res, next) => {
    try {
        const msg = validate(req.body)
        if (msg) return res.status(400).json({ error: msg })

        const { sno, name, gender, age, class_name } = req.body
        const [result] = await pool.query(
            'INSERT INTO students (sno, name, gender, age, class_name) VALUES (?, ?, ?, ?, ?)',
            [norm(sno), norm(name), norm(gender) || '男', age === '' || age === undefined || age === null ? null : Number(age), norm(class_name)]
        )

        res.status(201).json({ id: result.insertId, message: '添加成功' })
    } catch (err) {
        // 学号唯一索引冲突 → 给用户一个能看懂的提示
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: '学号已存在' })
        next(err)
    }
})

// ---------- 接口 3：修改 ----------
// PUT /api/students/:id
app.put('/api/students/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id 不合法' })

        const msg = validate(req.body)
        if (msg) return res.status(400).json({ error: msg })

        const { sno, name, gender, age, class_name } = req.body
        const [result] = await pool.query(
            'UPDATE students SET sno = ?, name = ?, gender = ?, age = ?, class_name = ? WHERE id = ?',
            [norm(sno), norm(name), norm(gender) || '男', age === '' || age === undefined || age === null ? null : Number(age), norm(class_name), id]
        )

        if (result.affectedRows === 0) return res.status(404).json({ error: '找不到这个学生' })
        res.json({ message: '修改成功' })
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: '学号已存在' })
        next(err)
    }
})

// ---------- 接口 4：删除 ----------
// DELETE /api/students/:id
app.delete('/api/students/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id 不合法' })

        const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id])
        if (result.affectedRows === 0) return res.status(404).json({ error: '找不到这个学生' })

        res.json({ message: '删除成功' })
    } catch (err) {
        next(err)
    }
})

// ---------- 404：上面的路由都没匹配到 ----------
app.use((req, res) => {
    res.status(404).json({ error: '接口不存在：' + req.method + ' ' + req.url })
})

// ---------- 统一错误处理（4 个参数，必须放最后）----------
app.use((err, req, res, next) => {
    console.error('[服务器错误]', err.code || '', err.message)
    res.status(500).json({ error: '服务器内部错误：' + (err.message || 'unknown') })
})

app.listen(PORT, () => console.log(`学生管理系统已启动：http://localhost:${PORT}`))
