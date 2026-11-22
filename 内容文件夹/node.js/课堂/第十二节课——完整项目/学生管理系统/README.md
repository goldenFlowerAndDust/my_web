# 学生管理系统（全栈完整示例）

> 一条完整的双向链路：**页面 → fetch → Express → MySQL → JSON → 页面**。
> 覆盖 **查（搜索+分页）、增、改、删** 四个接口，前后端都带输入校验和错误提示。

> 📂 **目录约定**
>
> - **根目录**：只放文档（`README.md`、`工程文档.md`）和模板（`.env.example`）——这里是**你自己动手写的位置**
> - **`示例\`**：一份完整可运行的参考实现（server.js / db.js / public / init.sql / 启动.cmd / node_modules）
> - **怎么用**：先看文档自己写，卡住了再翻 `示例\` 对照；别直接抄根目录没有的东西

---

## 0. 这个项目能学到什么

| 能力 | 落在哪个文件 |
|---|---|
| Express 路由 + 中间件 | `server.js` |
| 连接池、参数化查询（防注入） | `db.js` + `server.js` |
| 分页 / 模糊搜索的 SQL 写法 | `server.js` 的 `GET /api/students` |
| REST 风格（GET/POST/PUT/DELETE） | `server.js` 四个接口 |
| `fetch` 两种方法（GET 带参 / POST 带 body） | `public/app.js` |
| 表单校验 + 错误提示 | 前后端各一份 |
| 动态渲染表格、事件委托 | `public/app.js` |
| 配置与代码分离（.env） | `.env.example` |

---

## 1. 前提

```bash
node -v        # 需要 18+（用 --env-file 需要 20+，你这台是 24）
npm -v
```

MySQL 服务要在运行：

```bash
net start MySQL80
```

---

## 2. 建库建表

**方式 A：Navicat（推荐）**

1. 用 root 连接打开 `示例/init.sql`；
2. 全选 → `Ctrl + Enter` 运行；
3. 最后应输出 `学生总数 = 8`。

**方式 B：命令行**（在项目根目录执行）

```bash
cd D:\GitHub\my_web\内容文件夹\node.js\课堂\第十二节课——完整项目\学生管理系统
"E:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < 示例\init.sql
```

> ⚠️ 脚本开头是 `DROP DATABASE IF EXISTS student_app`，**每次执行都会清空重建**。熟悉之后建议去掉这行。
> 你自己写的时候，把建表语句写进自己的 `init.sql`，别直接用示例的。

---

## 3. 安装依赖（只装一次）

依赖装在**根目录**，根目录和 `示例\` 共用同一份，不用装两次。

```bash
cd D:\GitHub\my_web\内容文件夹\node.js\课堂\第十二节课——完整项目\学生管理系统
npm install express mysql2
```

目前的根目录已经有 `node_modules`（express 5.3.0 + mysql2 3.24.6），**这一步已经做过了**。

> 为什么共用？Node 找包是**逐级向上**找 `node_modules` 的：
> `示例\server.js` 会先看 `示例\node_modules`（没有）→ 再看上级 `学生管理系统\node_modules`（找到）。
> 反过来不行：根目录的代码**找不到**子目录里的包。所以包要放在**上面**。

---

## 4. 配置数据库密码

根目录的 `.env.example` 是**给你自己项目用的模板**：

```bash
copy .env.example .env
```

然后打开 `.env` 填上你的密码：

```ini
PORT=3100
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=student_app
```

> `示例\.env` 我已经配好了，可以直接跑示例看效果。
> `.env` 已在 `.gitignore` 里，不会被提交。**代码里永远不要写密码。**

---

## 5. 启动

**跑示例（看效果）：**

```bash
cd D:\GitHub\my_web\内容文件夹\node.js\课堂\第十二节课——完整项目\学生管理系统\示例
node --env-file=.env server.js
```

或者直接**双击 `示例\启动.cmd`**。

看到这一行就成功：

```
学生管理系统已启动：http://localhost:3100
```

> 端口用 **3100**，避开你之前那个占着 3000 的旧服务。被占就改 `.env` 里的 `PORT`。
> 等你自己写完，就在**根目录**用同样的命令启动你自己的 `server.js`。

---

## 6. 验证（先验接口，再看页面）

**① 浏览器直接访问接口**

```
http://localhost:3100/api/students
```

应该看到 JSON：

```json
{"list":[{"id":8,"sno":"2026008","name":"郑十",...}],"total":8,"page":1,"size":5,"pages":2}
```

**② 带参数试试**

```
http://localhost:3100/api/students?kw=软件&page=1&size=5
```

**③ 用 PowerShell 测增删改（可选）**

```powershell
# 新增
Invoke-RestMethod -Method Post -Uri http://localhost:3100/api/students `
  -ContentType 'application/json; charset=utf-8' `
  -Body '{"sno":"2026009","name":"测试","gender":"男","age":19,"class_name":"测试班"}'

# 修改（把 9 换成实际 id）
Invoke-RestMethod -Method Put -Uri http://localhost:3100/api/students/9 `
  -ContentType 'application/json; charset=utf-8' `
  -Body '{"sno":"2026009","name":"改名了","gender":"女"}'

# 删除
Invoke-RestMethod -Method Delete -Uri http://localhost:3100/api/students/9
```

## 7. 打开页面

浏览器访问 **http://localhost:3100**（不要双击 html 文件，也不要走 WebStorm 内置服务器——那样接口会 404）。

能做的事：

- 列表默认每页 5 条，可以翻页；
- 搜索框输学号/姓名/班级，回车或点搜索；
- 上方表单填完点「添加」；
- 每行点「编辑」→ 表单变成编辑态 → 改完点「保存修改」；
- 点「删除」会二次确认。

---

## 8. 文件地图

```
学生管理系统/                 ← 你自己在这里写
├─ README.md                 操作步骤（本文档）
├─ 工程文档.md                架构 / 接口 / 知识清单 / 验收题
├─ .env.example              配置模板（copy 成 .env）
├─ .gitignore                忽略 node_modules / .env
├─ package.json              ★ 唯一的依赖清单（express + mysql2）
├─ node_modules/             ★ 唯一的依赖目录（根和示例共用）
└─ 示例/                      参考实现（可运行，别直接抄）
   ├─ server.js              4 个接口 + 404 + 错误处理
   ├─ db.js                  连接池
   ├─ public/                index.html / style.css / app.js
   ├─ init.sql               建库建表 + 8 条数据
   ├─ 启动.cmd               一键启动
   └─ .env / .env.example   示例自己的配置
```

### 请求怎么走

```
点「添加」
  → app.js 组装 body
  → fetch('/api/students', { method:'POST', body: JSON })
  → server.js 的 app.post('/api/students')
  → validate() 校验
  → pool.query('INSERT ...')
  → res.status(201).json({ id })
  → app.js 收到成功 → 重新 load() 列表
```

---

## 9. 常见错误对照

| 现象 | 原因 | 处理 |
|---|---|---|
| `ECONNREFUSED` | MySQL 没启动 | `net start MySQL80` |
| `ER_ACCESS_DENIED_ERROR`（`using password: YES`） | `.env` 里密码错 | 改 `.env` |
| `ER_ACCESS_DENIED_ERROR`（`using password: NO`） | **启动时没带 `--env-file=.env`**，或 `.env` 根本不存在 | 用 `示例\启动.cmd`，或 `node --env-file=.env server.js` |
| `ER_BAD_DB_ERROR` | 没建库 / 库名不对 | 跑 `示例/init.sql` |
| `EADDRINUSE` | 端口被占 | 改 `.env` 的 `PORT` |
| 启动服务时报 `System error 5` | 不是管理员 | 用“以管理员身份”打开终端再 `net start MySQL80` |
| 服务显示 Stopped 但启动类型是 Automatic | 进程崩溃了（不会自动拉起） | 手动 `net start MySQL80`；原因见文末 |
| 页面 404 | 用 file:// 或 WebStorm 内置服务器打开 | 用 `http://localhost:3100` |
| 接口 404 | 路径拼错 | 对照第 6 节的 URL |
| 添加提示「学号已存在」 | `sno` 有唯一索引 | 换个学号 |
| 页面没数据但接口有 | 前端字段名对不上 | 检查 `app.js` 里的 `s.no` / `s.name` 等 |

---

## 10. 进阶练习（做完这四步算“会了”）

1. **加排序**：点击表头按年龄/学号排序（后端接 `sort` 参数）；
2. **加批量删除**：表格每行加复选框，一次删多条（`DELETE ... WHERE id IN (?)`）；
3. **加登录**：没登录不能增删改（先用最简单的 session，再考虑 JWT）；
4. **换成连接池之外的写法**：把 `db.js` 改成单连接，感受一下并发时为什么会卡（体会连接池的价值）。

---

## 11. 清理

```sql
DROP DATABASE student_app;   -- 不玩了就删掉，干净
```

---

## 12. 一句话

> **前端只做三件事：发请求、渲染、改状态；后端只做三件事：收参数、校验、查库。**
> 中间靠 JSON 串起来 —— 这就是全栈。

更新：2026-11-18
