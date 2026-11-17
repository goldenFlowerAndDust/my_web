// ============================================================
// JS.js —— 浏览器端脚本：发请求、拿数据、把数据渲染成表格
// 注意：这个文件在浏览器里跑，不参与 Node
// ============================================================

// 拿到输入框元素（用户在这里输入姓名）
const input = document.getElementById('kw')

// 拿到“查询”按钮元素
const btn = document.getElementById('btn')

// 拿到表格的 <tbody>，以后生成的行都往这里塞
const tbody = document.getElementById('tbody')

// 拿到提示文字元素，用来显示“共 3 条”“请求失败”等
const msg = document.getElementById('msg')

// ---------- 渲染函数：把后端返回的数组变成表格行 ----------
function renderRows(rows) {
    // 先清空上一次的结果，避免重复叠加
    tbody.innerHTML = ''

    // 如果数组为空，显示一行“没有匹配的学生”，占满 3 列
    if (rows.length === 0) {
        const tr = document.createElement('tr')          // 创建一行
        const td = document.createElement('td')          // 创建一格
        td.colSpan = 3                                   // 这一格横跨 3 列
        td.className = 'empty'                           // 加样式
        td.textContent = '没有匹配的学生'                  // 写入文字
        tr.appendChild(td)                               // 把格子放进行
        tbody.appendChild(tr)                            // 把行放进表格
        return                                           // 结束，不再往下走
    }

    // 遍历每一条学生记录
    for (const s of rows) {
        const tr = document.createElement('tr')          // 一条记录 = 一行

        // 按固定顺序取三个字段
        for (const key of ['学号', '姓名', '性别']) {
            const td = document.createElement('td')      // 每个字段 = 一格
            td.textContent = s[key] ?? ''                // 用 textContent 防 XSS，空值兜底
            tr.appendChild(td)                           // 格子放进行
        }

        tbody.appendChild(tr)                            // 整行放进表格
    }
}

// 显示提示文字；isError 为 true 时变红色
function showMessage(text, isError = false) {
    msg.textContent = text                               // 写入文字
    msg.className = isError ? 'msg error' : 'msg'        // 切换样式类
}

// 请求期间显示“查询中…”
function showLoading() {
    tbody.innerHTML = '<tr><td colspan="3" class="loading">查询中…</td></tr>'
}

// ---------- 核心函数：请求后端并渲染 ----------
async function load() {
    const kw = input.value.trim()          // 取输入框内容，去掉首尾空格
    btn.disabled = true                    // 请求期间禁用按钮，防止重复点击
    showLoading()                          // 显示加载状态
    showMessage('')                        // 清空旧提示

    try {
        // 拼接接口地址，encodeURIComponent 把中文等字符编码，防止 URL 出错
        const url = '/api/students?kw=' + encodeURIComponent(kw)

        // 发 GET 请求（同源，所以用相对路径就行）
        // 第一次 await：等响应头回来
        const res = await fetch(url)

        // 状态码不是 2xx 时抛错，进入 catch
        if (!res.ok) throw new Error('服务返回 ' + res.status)

        // 第二次 await：读取响应体并解析成 JS 数组
        const rows = await res.json()

        renderRows(rows)                              // 渲染表格
        showMessage('共 ' + rows.length + ' 条')        // 显示条数
    } catch (err) {
        showMessage('请求失败：' + err.message, true)    // 出错提示（红色）
        tbody.innerHTML = ''                          // 清空表格
    } finally {
        btn.disabled = false                          // 无论成功失败，都恢复按钮
    }
}

// 点击“查询”按钮时触发
btn.addEventListener('click', load)

// 输入框里按回车也触发查询
input.addEventListener('keydown', e => {
    if (e.key === 'Enter') load()
})

// 页面打开时先查一次（显示全部学生）
load()
