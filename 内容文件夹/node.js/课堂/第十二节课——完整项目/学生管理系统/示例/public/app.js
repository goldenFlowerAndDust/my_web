// ============================================================
// app.js —— 前端：调接口、渲染表格、处理表单
// ============================================================

// ---------- 页面元素 ----------
const form = document.getElementById('form')
const formTitle = document.getElementById('formTitle')
const submitBtn = document.getElementById('submitBtn')
const cancelBtn = document.getElementById('cancelBtn')
const formMsg = document.getElementById('formMsg')

const fSno = document.getElementById('sno')
const fName = document.getElementById('name')
const fGender = document.getElementById('gender')
const fAge = document.getElementById('age')
const fClass = document.getElementById('class_name')

const kwInput = document.getElementById('kw')
const tbody = document.getElementById('tbody')
const pageInfo = document.getElementById('pageInfo')
const totalInfo = document.getElementById('totalInfo')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')

// ---------- 状态 ----------
const state = {
    page: 1,          // 当前页
    size: 5,          // 每页几条
    kw: '',           // 搜索关键字
    pages: 1,         // 总页数
    editingId: null,  // null=新增；有值=正在编辑这个 id
    list: [],         // 当前页数据（编辑时回填表单用）
}

// ---------- 小工具 ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
))

function showFormMsg(text, isError = false) {
    formMsg.textContent = text
    formMsg.className = isError ? 'msg error' : 'msg'
}

// 统一请求方法：自动解析 JSON，并把后端的 error 抛出来
async function api(url, options = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || '请求失败 ' + res.status)
    return data
}

// ---------- 渲染表格 ----------
function renderRows(list) {
    state.list = list            // 缓存当前页，编辑时要用
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">没有数据</td></tr>'
        return
    }

    tbody.innerHTML = list.map(s => `
        <tr>
            <td>${esc(s.sno)}</td>
            <td>${esc(s.name)}</td>
            <td>${esc(s.gender)}</td>
            <td>${esc(s.age ?? '-')}</td>
            <td>${esc(s.class_name ?? '-')}</td>
            <td class="col-op">
                <button class="op edit" data-id="${s.id}">编辑</button>
                <button class="op del" data-id="${s.id}">删除</button>
            </td>
        </tr>`).join('')
}

// 给动态生成的按钮统一绑事件（事件委托，比给每个按钮绑更省事）
tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button')
    if (!btn) return
    const id = Number(btn.dataset.id)

    if (btn.classList.contains('edit')) {
        startEdit(id)
    } else if (btn.classList.contains('del')) {
        if (!confirm('确定删除这条记录吗？')) return
        try {
            await api('/api/students/' + id, { method: 'DELETE' })
            await load()
            showFormMsg('删除成功')
        } catch (err) {
            showFormMsg(err.message, true)
        }
    }
})

// ---------- 加载列表 ----------
async function load() {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">加载中…</td></tr>'
    try {
        const qs = new URLSearchParams({ kw: state.kw, page: state.page, size: state.size })
        const data = await api('/api/students?' + qs)

        state.pages = data.pages
        renderRows(data.list)

        pageInfo.textContent = data.page + ' / ' + data.pages
        totalInfo.textContent = '共 ' + data.total + ' 条'
        prevBtn.disabled = data.page <= 1
        nextBtn.disabled = data.page >= data.pages
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">加载失败：' + esc(err.message) + '</td></tr>'
    }
}

// ---------- 表单：提交（新增 / 修改共用） ----------
form.addEventListener('submit', async (e) => {
    e.preventDefault()
    submitBtn.disabled = true
    showFormMsg('')

    const body = {
        sno: fSno.value,
        name: fName.value,
        gender: fGender.value,
        age: fAge.value,
        class_name: fClass.value,
    }

    try {
        if (state.editingId === null) {
            await api('/api/students', { method: 'POST', body: JSON.stringify(body) })
            showFormMsg('添加成功')
            state.page = 1
            state.kw = ''
            kwInput.value = ''
        } else {
            await api('/api/students/' + state.editingId, { method: 'PUT', body: JSON.stringify(body) })
            showFormMsg('修改成功')
            exitEditMode()
        }
        form.reset()
        await load()
    } catch (err) {
        showFormMsg(err.message, true)
    } finally {
        submitBtn.disabled = false
    }
})

// ---------- 进入 / 退出编辑态 ----------
function startEdit(id) {
    const s = state.list.find(x => x.id === id)
    if (!s) return

    state.editingId = id
    formTitle.textContent = '编辑学生（ID: ' + id + '）'
    submitBtn.textContent = '保存修改'
    cancelBtn.hidden = false

    fSno.value = s.sno ?? ''
    fName.value = s.name ?? ''
    fGender.value = s.gender ?? '男'
    fAge.value = s.age ?? ''
    fClass.value = s.class_name ?? ''

    window.scrollTo({ top: 0, behavior: 'smooth' })
    fName.focus()
}

function exitEditMode() {
    state.editingId = null
    formTitle.textContent = '新增学生'
    submitBtn.textContent = '添加'
    cancelBtn.hidden = true
    form.reset()
}

cancelBtn.addEventListener('click', () => {
    exitEditMode()
    showFormMsg('')
})

// ---------- 搜索 / 翻页 ----------
document.getElementById('searchBtn').addEventListener('click', () => {
    state.kw = kwInput.value.trim()
    state.page = 1
    load()
})

document.getElementById('resetBtn').addEventListener('click', () => {
    kwInput.value = ''
    state.kw = ''
    state.page = 1
    load()
})

kwInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click()
})

prevBtn.addEventListener('click', () => {
    if (state.page > 1) { state.page--; load() }
})

nextBtn.addEventListener('click', () => {
    if (state.page < state.pages) { state.page++; load() }
})

// ---------- 启动 ----------
load()
