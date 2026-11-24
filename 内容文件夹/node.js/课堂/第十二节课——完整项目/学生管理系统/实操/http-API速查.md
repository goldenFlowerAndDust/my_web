# http 模块 API 速查（照着写版）

> 目标：**不装 Express**，用 Node 自带的 `http` 写出「静态页面 + JSON 接口」。
> 所有示例都是 ESM（`.mjs`），可以直接放进你的 `server.mjs`。

---

## 一、最小可跑骨架（先跑通再改）

```js
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 3100
const PUBLIC_DIR = path.join(import.meta.dirname, 'public')

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
}

const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://localhost')
    const pathname = decodeURIComponent(u.pathname)

    // 接口
    if (req.method === 'GET' && pathname === '/api/ping') {
        res.writeHead(200, { 'Content-Type': MIME['.json'] })
        return res.end(JSON.stringify({ ok: true, time: Date.now() }))
    }

    // 静态文件
    const filePath = pathname === '/'
        ? path.join(PUBLIC_DIR, 'web.html')
        : path.join(PUBLIC_DIR, pathname)

    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
        return res.end('403 Forbidden')
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
            return res.end('404 Not Found: ' + pathname)
        }
        const ext = path.extname(filePath).toLowerCase()
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
        res.end(data)
    })
})

server.listen(PORT, () => console.log(`http://localhost:${PORT}`))
```

> 跑起来后：访问 `/api/ping` 看 JSON，访问 `/` 看 web.html。
> **先让这两个都通，再往里加业务。**

---

## 二、http 模块本身的 API

| API | 作用 | 备注 |
|---|---|---|
| `http.createServer(cb)` | 创建服务器，`cb(req, res)` 每个请求执行一次 | 等价于 `.on('request', cb)` |
| `server.listen(port, cb)` | 监听端口 | 端口被占报 `EADDRINUSE` |
| `server.close(cb)` | 关闭服务器 | |
| `server.on('error', cb)` | 监听端口占用等错误 | 不监听会直接崩 |

```js
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') console.log('端口被占用，换一个')
})
```

---

## 三、`req`（请求对象）

| 属性 / 方法 | 得到什么 | 例子 |
|---|---|---|
| `req.method` | 请求方法（大写） | `'GET'` / `'POST'` |
| `req.url` | **路径 + 查询串**（不含域名） | `'/api/students?kw=张'` |
| `req.headers` | 请求头对象，**键名全小写** | `req.headers['content-type']` |
| `req.on('data', cb)` | 请求体的一小块（流） | POST 收 body |
| `req.on('end', cb)` | 请求体收完 | 在这里 parse |

> ⚠️ `req.url` 里**没有协议和域名**，所以 `new URL()` 必须补一个 base。

---

## 四、`res`（响应对象）

| 属性 / 方法 | 作用 | 调用次数 |
|---|---|---|
| `res.statusCode = 200` | 设状态码（属性） | 多次（发送前） |
| `res.setHeader(k, v)` | 设单个响应头 | 多次（发送前） |
| `res.writeHead(status, headers)` | 一次性发状态码 + 头 | **1 次** |
| `res.write(chunk)` | 写正文（可多次） | 多次 |
| `res.end(data)` | 结束响应 | **1 次** |

### 顺序规则（背下来）

```text
setHeader / statusCode      ← 只是准备，可以多次
        ↓
writeHead / 第一次 write     ← 头在这里发出去
        ↓
write ... write ...          ← 正文可以多次
        ↓
end()                        ← 只能一次
```

| 违规操作 | 报错 |
|---|---|
| `writeHead` 之后再 `setHeader` | `ERR_HTTP_HEADERS_SENT` |
| 第二次 `end()` | `ERR_STREAM_WRITE_AFTER_END`（异步 error，try/catch 抓不到） |

---

## 五、解析 URL 的三件套

```js
const u = new URL(req.url, 'http://localhost')   // ① 补 base 才能解析
const pathname = u.pathname                       // ② 路径：/api/students
const kw = u.searchParams.get('kw')               // ③ 参数：?kw=张 → '张'
```

| 想拿 | 写法 |
|---|---|
| 路径 | `u.pathname` |
| 单个参数 | `u.searchParams.get('kw')` |
| 参数默认值 | `u.searchParams.get('page') \|\| '1'` |
| 同名多值 | `u.searchParams.getAll('tag')` |
| 中文路径 | `decodeURIComponent(u.pathname)` |

> 注意：`u.pathname` 里的中文是 `%E5%BC%A0` 形式，**用之前要 decode**。

---

## 六、返回 JSON 的标准写法

```js
res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
res.end(JSON.stringify({ list, total }))
```

三件事缺一不可：

1. **状态码**：200 成功 / 400 参数错 / 404 找不到 / 500 服务器错；
2. **`Content-Type`**：不写的话浏览器当纯文本，前端 `res.json()` 会失败；
3. **`JSON.stringify`**：`res.end()` 只接受字符串或 Buffer，给对象会报错。

统一封装（后面到处用）：

```js
function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(data))
}

sendJson(res, 200, { list: rows })
sendJson(res, 500, { error: err.message })
```

---

## 七、静态文件分发的 5 个步骤

```text
① 从 req.url 取 pathname（去掉 ? 后面的查询串）
② '/' 映射成 '/web.html'
③ path.join(静态根目录, pathname) 得到磁盘路径
④ 校验路径仍在静态根内（防 ../ 穿越）
⑤ fs.readFile → 按扩展名设 Content-Type → res.end(data)
```

| 细节 | 为什么 |
|---|---|
| 用 `path.join` 而不是字符串相加 | 自动处理分隔符 |
| 校验 `filePath.startsWith(PUBLIC_DIR)` | 否则 `GET /../../.env` 能读到你密码 |
| 用 `path.extname` 查 MIME | 浏览器靠 `Content-Type` 决定渲染还是下载 |
| 读失败给 404，不要给 500 | 文件不存在是正常情况 |

---

## 八、路由：先用 if 链就够

```js
if (req.method === 'GET' && pathname === '/api/students') { ... }
if (req.method === 'POST' && pathname === '/api/students') { ... }

// 带 id 的路径（/api/students/3）
const m = pathname.match(/^\/api\/students\/(\d+)$/)
if (req.method === 'DELETE' && m) {
    const id = Number(m[1])
}
```

| 写法 | 适合 |
|---|---|
| `if (pathname === '/api/x')` | 固定路径 |
| 正则 `match` | 带 id 的路径 |
| 路由表对象 | 接口多了以后（进阶） |

---

## 九、读 POST 请求体（http 里要自己收）

```js
let body = ''
req.on('data', chunk => { body += chunk })          // 边收边拼
req.on('end', () => {
    let data = {}
    try { data = JSON.parse(body) } catch { }        // 格式错不能崩
    // 处理 data
})
```

| 注意 | 说明 |
|---|---|
| 必须收完再解析 | 在 `end` 里 parse，不能在 `data` 里 |
| 空 body | `JSON.parse('')` 会抛错，要 try/catch |
| 大文件 | 本例是全量拼接，上传要用流（后续再说） |

---

## 十、常见错误对照

| 现象 | 原因 | 处理 |
|---|---|---|
| `EADDRINUSE` | 端口被占 | 换端口，或关掉旧进程 |
| 页面 404 | 路径拼错 / 静态根不对 | 打印 `filePath` 看实际找哪 |
| CSS 不生效 | `Content-Type` 没设或设错 | 检查 MIME 表 |
| 中文路径 404 | 没 `decodeURIComponent` | 先 decode 再 join |
| 前端 `res.json()` 报错 | 响应头不是 json | 检查 `Content-Type` |
| `ERR_HTTP_HEADERS_SENT` | 头发出后又 setHeader | 头在 writeHead 一次设完 |
| 第二次 end 崩溃 | 分支没 return | 每个分支处理完 `return` |

---

## 十一、和 Express 的对照（以后迁移用）

| 想做的事 | 原生 http | Express |
|---|---|---|
| 路由 | `if (req.url === ...)` | `app.get('/x', fn)` |
| 取查询参数 | `new URL(req.url, base).searchParams` | `req.query.kw` |
| 解析 JSON 体 | 手动 `data` + `end` + `JSON.parse` | `express.json()` → `req.body` |
| 返回 JSON | `writeHead` + `end(JSON.stringify)` | `res.json(obj)` |
| 静态文件 | 手写 5 步 | `express.static('public')` |
| 404 | 自己兜底 | 最后 `app.use(...)` |

> 你现在用 http 写，把上面这些手工步骤走一遍，再学 Express 会发现它只是把这些步骤封装成了函数。**这是最好的学习顺序。**

---

## 十二、自测

1. `req.url` 里有域名吗？为什么 `new URL()` 要传第二个参数？
2. `writeHead`、`write`、`end` 分别能调用几次？
3. 为什么 `res.end()` 里不能直接放对象？
4. 静态分发时，为什么必须检查 `filePath.startsWith(PUBLIC_DIR)`？
5. `Content-Type` 不设会发生什么？
6. POST 的 body 为什么要在 `end` 事件里才能解析？

---

更新：2026-11-24
