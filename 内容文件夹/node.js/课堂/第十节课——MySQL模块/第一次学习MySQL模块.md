# 第一次学习 MySQL 模块

> 日期：2026-11-10  
> 环境：Windows / MySQL 8.0.46 / Node.js v24 / mysql2 3.24.6  
> 目标：让 Node 连上 MySQL，跑通「查 → 增 → 改」，为作业交差。

---

## 0. 一句话总结

这节课真正难的不是 SQL 语法，而是 **三件环境上的事**：MySQL 服务没启动、数据目录被强杀留下残骸、Node 驱动与 MySQL 8 的认证方式不兼容。SQL 本身的坑（拼写、引号）反而不难，难在报错信息看不出层次。

---

## 1. 环境现状（下次直接查这一节，别再翻）

| 项目 | 值 |
|---|---|
| MySQL 版本 | 8.0.46 |
| 安装目录 | `E:\Program Files\MySQL\MySQL Server 8.0` |
| 数据目录 | `E:\ProgramData\MySQL\MySQL Server 8.0\Data` |
| 配置文件 | `E:\ProgramData\MySQL\MySQL Server 8.0\my.ini` |
| 错误日志 | `...\Data\WIN-A17UA1DV8BB.err` |
| 端口 | 3306 |
| Windows 服务名 | **MySQL80** |
| 默认认证插件 | `caching_sha2_password` |
| 可用账号 | **node / node123456**（专用账号） |
| 数据库 | `DuDaInfo` |
| 表 | `product`（引擎 **MyISAM**，无事务） |
| Node 驱动 | `mysql2@3.24.6`（同时装了旧的 `mysql@2.18.1`） |

> 注意：MySQL 装在 **E 盘**，不是 C 盘。C 盘那次安装失败过，`C:\Program Files\MySQL` 下只有 Workbench / Shell / Router，没有 Server。

---

## 2. 报错考古：今天踩过的 12 个坑

| # | 报错 | 真正原因 | 解决 |
|---|---|---|---|
| 1 | `2002 - Can't connect ... (10061)` | MySQL80 服务没启动，3306 无人监听 | `net start MySQL80` |
| 2 | `read ECONNRESET` | 服务在握手时被强杀（日志无 Normal shutdown） | 重启服务 |
| 3 | `3681 - Schema 'dudainfo' does not exist, but schema directory ... was found` | 强杀 mysqld 后，磁盘目录留下、数据字典回滚 | 停服务 → 把 `Data\dudainfo` 改名 → 起服务 |
| 4 | `getaddrinfo ENOTFOUND localhost_3306` | 把 Navicat 的**连接名**当成了主机地址 | `host: '127.0.0.1'`，端口单独写 `port: 3306` |
| 5 | `ER_NOT_SUPPORTED_AUTH_MODE` | 老驱动 `mysql@2.18.1` 不支持 `caching_sha2_password` | 换 `mysql2` |
| 6 | `Access denied for user 'root'@'localhost' (using password: YES)` | root 密码已遗忘 | 新建 `node` 账号 |
| 7 | `1064 ... near 'FORM product order by ...'` | `FROM` 拼成 `FORM` | 改正 |
| 8 | `INSET IGNORE` + 引号错位 + 值个数不对 | 一处拼错、一处引号把逗号包进字符串、10 字段只给 9 值 | 重写语句 |
| 9 | `1292 Incorrect date value: '2007'` | 日期没加引号，`2026-10-9` 被算成减法 | `'2026-10-09'` |
| 10 | `Can't add new command when connection is in closed state` | 三个回调各自 `conn.end()`，连接被提前关闭 | 只保留最后一次 `end()` |
| 11 | `Callback function is not available with promise clients` | `await conn.query(sql, callback)` 两种风格混写 | 二选一 |
| 12 | 脚本什么都没干就结束 | async 函数 `main()` 定义了却**没有调用** | 末尾加 `main()` |

### 几条值得记住的判断

- `10061` / `ECONNREFUSED` = 服务没起；`ECONNRESET` = 连上了但对面死了；`1045` = 密码错；`1064` = SQL 语法。
- 报错里 `near 'xxx'` 的 **xxx 第一个词**就是出错位置。
- 服务被强行结束时，MySQL 错误日志**不会**写 `Normal shutdown`，也不会写崩溃信息 —— 这就是判断依据。
---

## 3. 连接一个 MySQL 的正确姿势

```js
// ab.js —— 只负责“连上”，导出连接对象给别的文件用
const mysql = require('mysql2')

const conn = mysql.createConnection({
    host: 'localhost',      // 主机名或 IP，绝不能写 Navicat 的连接名
    port: 3306,             // 端口单独一个属性
    user: 'node',
    password: 'node123456',
    database: 'DuDaInfo',
    dateStrings: true,      // DATE 直接返回 '2026-10-09'，不转成 Date
})

conn.connect((err) => {
    if (err) {
        console.log('连接失败！' + err.message)
        return
    }
    console.log('连接成功')
})

module.exports.conn = conn
```

| 配置项 | 说明 | 常见错误 |
|---|---|---|
| `host` | 主机名 / IP | 写成 `localhost_3306` → ENOTFOUND |
| `port` | 端口，数字 | 拼进 host → ENOTFOUND |
| `user` / `password` | 账号密码 | 密码错 → 1045 |
| `database` | 库名 | 库不存在 → 1049 |
| `dateStrings` | DATE/DATETIME 返回字符串 | 不设会拿到 Date，打印成 UTC 少一天 |
| `decimalNumbers` | DECIMAL 转 number | 默认返回字符串，防精度丢失 |

---

## 4. `query()` 的返回值（最容易搞错的地方）

```js
const [rows, fields] = await conn.query(sql)
```

| 元素 | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| `[0]` | **对象数组**，每行一个对象，键 = 列名 | 一个 `ResultSetHeader` 对象 |
| `[1]` | 字段元数据数组（一般不用） | `undefined` |

```js
// 查
const [rows] = await conn.query('SELECT id, name FROM product')
rows.length          // 行数（空表是 0）
rows[0].name         // 按列名取值

// 写
const [result] = await conn.query('UPDATE product SET price = ? WHERE id = ?', [99, 3])
result.affectedRows  // 匹配到几行
result.changedRows   // 实际改了几行
result.insertId      // INSERT 时的新 id
```

**三个坑**：

1. 忘记解构 → 拿到的是 `[rows, fields]`，`result.name` 是 `undefined`；
2. 查不到数据返回 `[]`（空数组，真值），判断要用 `rows.length === 0`；
3. 增删改时 `result` 不是数组，是对象 —— `result[0]` 会取不到。

---

## 5. 增删改查的四种写法

```js
// 查：按时间倒序取前两条
const [rows] = await conn.query(
    'SELECT id, name, price, add_time FROM product ORDER BY add_time DESC LIMIT 0, 2'
)

// 增：IGNORE 表示主键冲突时跳过（不报错）
const [add] = await conn.query(
    'INSERT IGNORE INTO product (id, name, cat_id, size, price, add_time, sort) VALUES (?,?,?,?,?,?,?)',
    [6, '香蕉', 2, '60mm', 30.00, '2026-11-11', 10]
)

// 改：WHERE 是命门
const [upd] = await conn.query(
    'UPDATE product SET price = ? WHERE id = ?',
    [88.8, 3]
)

// 删：先 SELECT 确认，再删，加 LIMIT 兜底
const [del] = await conn.query('DELETE FROM product WHERE id = ? LIMIT 1', [6])
```

| 语句 | 少了 WHERE 会怎样 |
|---|---|
| `UPDATE` | **全表所有行都被改** |
| `DELETE` | **全表清空**（表结构还在） |

> `DELETE FROM product` 不写 WHERE = 删除全部行。`affectedRows` 会等于总行数，这就是最后一道保险。

### 行与列的概念

```
        字段/列（竖）：id | name | price
记录/行（横） 1  | PC008-1 | 2000.00    ← 一条商品 = 一行
记录/行（横） 2  | PC008-3A | 599.00
```

`DELETE` 删的是**行**（横向的一条记录）；删列用 `ALTER TABLE ... DROP COLUMN`，删表用 `DROP TABLE`。
---

## 6. 回调版 vs Promise 版（本课最大的分水岭）

> 同一个查询，mysql2 有**两套 API**。一开始写的是回调版（非异步），后来改成 async 版。
> 两者能力完全一样，区别在**错误处理和顺序控制**。

---

### 6.1 回调版（最初的写法，不用 async）

```js
const ab = require('./ab.js')
const conn = ab.conn          // 注意：不是 conn.promise()

// 查
conn.query(sql1, (err, rows) => {
    if (err) { console.error('查询失败：' + err.message); return conn.end() }
    console.table(rows)

    // 增 —— 必须嵌在“查”的回调里，才能保证在查之后执行
    conn.query(sql2, (err, add) => {
        if (err) { console.error('添加失败：' + err.message); return conn.end() }
        console.log('影响行数：' + add.affectedRows)

        // 改 —— 再嵌一层
        conn.query(sql3, (err, upd) => {
            if (err) { console.error('修改失败：' + err.message); return conn.end() }
            console.log('匹配：' + upd.affectedRows)

            conn.end()        // 只在最内层关一次
        })
    })
})
```

**特征**：

- 结果在**回调参数**里（`(err, rows)`），不是返回值；
- **每层都要写 `if (err)`**，漏一层就静默失败；
- 顺序靠**物理嵌套**保证，嵌得越深越往右缩进（回调地狱）；
- `end()` 的位置极敏感 —— 写早了连接提前关，写漏了进程不退出。

---

### 6.2 async 版（后来改的）

```js
const ab = require('./ab.js')
const conn = ab.conn.promise()   // ★ 差别就在这一行

async function main() {
    try {
        const [rows] = await conn.query(sql1)
        const [add] = await conn.query(sql2)
        const [upd] = await conn.query(sql3)
    } catch (err) {
        console.error(err.code + ' | ' + err.message)
    } finally {
        await conn.end()
    }
}
main()
```

**特征**：

- 结果在**返回值**里（`const [rows] =`），不是回调参数；
- **一个 `catch` 兜住三个 `await`**，不会漏；
- 顺序靠**代码顺序**保证，从上到下，不需要嵌套；
- `end()` 放 `finally`，成功失败都只执行一次。

---

### 6.3 逐项对照（重点看这张表）

| 维度 | 回调版（非异步） | async 版 |
|---|---|---|
| 入口 | `require('mysql2')` / `ab.conn` | `require('mysql2/promise')` / `ab.conn.promise()` |
| 拿结果的方式 | 回调第二个参数 `(err, rows)` | 返回值 `const [rows] = await ...` |
| 错误处理 | **每层**一个 `if (err)` | **一个** `try/catch` 全接 |
| 漏处理错误的后果 | 静默失败，拿到 `undefined` 继续跑 | 直接抛错（unhandled rejection） |
| 执行顺序 | 靠**嵌套**，不嵌套就乱序 | 靠**代码顺序**，天然串行 |
| 代码形状 | 每多一步多缩进一层（↘ 阶梯） | 平铺，缩进不变 |
| 关闭连接 | 容易写多个 `end()` 或忘记写 | `finally` 里一次 |
| 可读性 | 3 步以上明显变差 | 10 步也清楚 |
| 适合场景 | 一次性小脚本、单条语句 | 有分支/循环/多语句的业务逻辑 |

**一句话**：回调版把「下一步」写在**回调里面**，async 版把「下一步」写在**下一行**。

---

### 6.4 最初的写法是怎么崩的（三个真实故障）

| 现象 | 原因 | 属于哪一版 |
|---|---|---|
| `Can't add new command when connection is in closed state` | 三条语句平铺、每个回调各写一个 `conn.end()`，第一次就关掉了连接 | 回调版 |
| 终端不退出、卡住 | 漏写 `end()`，连接一直开着 | 回调版 |
| 什么都没执行 | `main()` 定义了但没调用 | async 版 |
| `Callback function is not available with promise clients` | **混写**：Promise 版的 `query` 又塞了回调 | 两版混用 |

> 回调版的坑是「顺序 + 忘记关」；async 版的坑是「忘记调用 + 忘记 await」。两类都经历过一遍，就基本不会再犯。

---

### 6.5 千万不能混写

```js
// ❌ Promise 版的 query 不接受回调
await conn.query(sql, (err, rows) => { ... })
// -> Callback function is not available with promise clients.

// ✅ 二选一
conn.query(sql, (err, rows) => { ... })     // 纯回调
const [rows] = await conn.query(sql)        // 纯 Promise
```

**判断方法**：这个 `query` 的返回值有 `.then` 吗？有就是 Promise 版，只能用 `await`。

---

### 6.6 其他库的同类对应（同一个规律）

| 库 | 回调入口 | Promise 入口 |
|---|---|---|
| `fs` | `fs.readFile(p, cb)` | `fs.promises.readFile(p)` |
| `mysql2` | `require('mysql2')` | `require('mysql2/promise')` 或 `.promise()` |
| `child_process` | `exec(cmd, cb)` | `util.promisify(exec)` |
| 老 `mysql` | 只有回调 | ❌ 真的没有 |

规律：**错误优先回调 `(err, data)` 的库，几乎都有对应的 Promise 包装**，只是入口不同。

---
## 7. 错误处理：一次 catch 怎么定位到具体语句

`err` 带的信息（实测）：

| 字段 | 例子 | 用途 |
|---|---|---|
| `err.code` | `ER_BAD_FIELD_ERROR` | 判断错误类别（推荐用这个） |
| `err.errno` | `1054` | 和网上查到的编号对应 |
| `err.message` / `err.sqlMessage` | `Unknown column 'nmae' in 'field list'` | 人话描述，指出方向 |
| `err.sqlState` | `42S22` | 标准 SQL 状态码 |
| `err.sql` | 你执行的那条语句 | 直接看到原文 |
| `err.stack` | 调用栈 | 定位到第几行 |

> 注意：`err.message` 是**属性**，写成 `err.message()` 会报 TypeError。

单 catch 丢的不是错误信息，而是“哪一步”。用**阶段变量**补上：

```js
let step = '连接'
try {
    step = '查询最新两条';  const [rows] = await conn.query(sql1)
    step = '添加商品';      const [add]  = await conn.query(sql2)
    step = '修改商品';      const [upd]  = await conn.query(sql3)
} catch (err) {
    console.error(`❌ 步骤：${step}`)
    console.error(`   类型：${err.code} (${err.errno})`)
    console.error(`   描述：${err.message}`)
    if (err.sql) console.error(`   SQL：${err.sql}`)
}
```

### 错误码速查

| code | errno | 含义 | 常见原因 |
|---|---|---|---|
| `ER_PARSE_ERROR` | 1064 | 语法错误 | FROM 写成 FORM、少逗号、少引号 |
| `ER_BAD_FIELD_ERROR` | 1054 | 字段不存在 | 列名拼错 |
| `ER_NO_SUCH_TABLE` | 1146 | 表不存在 | 库没选对 / 表名错 |
| `ER_BAD_DB_ERROR` | 1049 | 库不存在 | `database` 配置错 |
| `ER_DUP_ENTRY` | 1062 | 主键重复 | INSERT 已存在的 id |
| `ER_TRUNCATED_WRONG_VALUE` | 1292 | 值类型不对 | 日期没加引号 |
| `ER_ACCESS_DENIED_ERROR` | 1045 | 认证失败 | 用户/密码/host |
| `ECONNREFUSED` | — | 连不上 | 服务没启动 |

---

## 8. 三条铁律

**① 引号决定“值”还是“表达式”**

```sql
UPDATE product SET add_time = 2026-10-9 WHERE id = 3    -- ❌ 2026-10-9 = 2007
UPDATE product SET add_time = '2026-10-09' WHERE id = 3 -- ✅
```

数字不加引号，字符串和日期必须加；日期统一写 `YYYY-MM-DD`。

**② 用 `?` 占位符，不拼字符串**

```js
'UPDATE product SET price = ? WHERE id = ?', [88.8, 3]
```

占位符由驱动负责转义，不会有引号错位，还能防 SQL 注入。

**③ 一个连接只 `end()` 一次，放 finally**

多个回调各写一个 `end()`，必然出现：

```
Cannot enqueue Query after invoking quit
Can't add new command when connection is in closed state
```

---

## 9. 这个目录里有什么

| 文件 | 作用 |
|---|---|
| `DuDaInfo-任务+实训数据库语句.sql` | 老师原版建库脚本（不可重复执行） |
| `DuDaInfo-修复版.sql` | 加了 `DROP DATABASE IF EXISTS`，可重复跑 |
| `作业/ab.js` | 连接配置，导出 conn |
| `作业/manage.js` | 查 / 增 / 改（回调 + Promise 版结构） |
| `作业/manage-async.js` | 纯 async/await 参考实现 |
| `作业/test-sql.js` | 命令行试跑 SQL：`node test-sql.js "SELECT ..."` |

---

## 10. 遗留问题（下次补）

1. **`product` 是 MyISAM**：不支持事务，`DELETE` / `UPDATE` 删错了无法 `ROLLBACK`。学事务要用 InnoDB；
2. **root 密码未知**：目前用 `node` 账号。要恢复 root，可走 `--skip-grant-tables` 流程；
3. **MySQL80 服务被强停过两次**：建议设为「自动」+ 恢复策略「失败后重启」，并检查安全软件的“开机加速”是否接管；
4. **SQL 没有预校验**：Navicat 只有高亮，WebStorm 需要「连库 + 语言注入」；当前靠 `test-sql.js` 试跑；
5. **还没写 Express 接口**：后面把这张表接成 HTTP 接口（`GET /api/products`），就是第 9 节课的“真动态”。

---

## 11. 自测

1. `10061`、`1045`、`1064`、`ER_DUP_ENTRY` 分别代表什么？
2. `const [rows] = await conn.query(...)` 里，`rows` 在 SELECT 和 INSERT 时分别是什么？
3. 为什么 `UPDATE ... SET add_time = 2026-10-9` 会失败？
4. 一个文件里出现三个 `conn.end()` 会发生什么？
5. `require('mysql2')` 和 `require('mysql2/promise')` 的区别？
6. 查不到数据时返回 `null` 还是 `[]`？怎么判断？
7. `affectedRows` 和 `changedRows` 有什么区别？
8. 为什么删除前要先 `SELECT` 一遍？
9. 同一个「查 → 增 → 改」流程，回调版和 async 版在**错误处理**和**执行顺序**上最大的区别是什么？
10. 写出回调版的骨架（三层嵌套），再写出等价的 async 版（不嵌套），对比一下行数。

---

## 12. 下一次的起点

```bash
# 1. 确认服务
net start MySQL80
netstat -ano | findstr :3306

# 2. 试跑一条 SQL
cd 课堂\第十节课——MySQL模块\作业
node test-sql.js "SELECT id, name, price FROM product LIMIT 3"

# 3. 跑完整流程
node manage-async.js
```

> 想继续深入：① 换 InnoDB 学事务；② 用 Express 把 product 做成 REST 接口；③ 前端 fetch 渲染 —— 正好接回第 7、8、9 节课。
