# 外部插件与依赖清单

> 统计时间：2026-11-17  
> 统计来源：工作区各个 `package.json` + `node_modules` 里实际安装的版本 + Windows 卸载程序列表  
> 这里的“外部插件”分三类：**npm 包**、**数据库工具**、**IDE 插件**。

---

## 一、总览

| 类别 | 名称 | 版本 | 状态 |
|---|---|---|---|
| npm 包 | express | 5.3.0 | ✅ 在用（第十一节课） |
| npm 包 | mysql2 | 3.24.6 | ✅ 在用（第十、十一节课） |
| npm 包 | mysql | 2.18.1 | ⚠️ 旧驱动，已被 mysql2 取代 |
| npm 包 | jquery | 4.0.0 | ✅ 在用（第九节课） |
| npm 包 | moment | 2.31.0 | ✅ 在用（第二节课） |
| npm 包 | fs | 0.0.1-security | ❌ 误装（空壳包，建议卸载） |
| npm 包 | ajax | 0.0.4 | ❌ 已卸载（曾误当 jQuery 用） |
| 运行时 | Node.js | 24.20.0 | ✅ 必需 |
| 数据库 | MySQL Server | 8.0.46 | ✅ 必需 |
| 数据库工具 | MySQL Workbench | 8.0.47 | ✅ 可选 |
| 数据库工具 | MySQL Shell / Router | 8.0.46 | ✅ 可选 |
| 数据库工具 | Navicat Premium | 17.3.8 | ✅ 在用 |
| IDE | WebStorm | 2026.1.3 | ✅ 在用 |
| IDE 插件 | Database（内置） | 随 IDE | ✅ 内置，无需安装 |

---

## 二、npm 包（Node 侧的依赖）

### 安装方法

```bash
# 在“项目所在目录”执行（会写进该目录的 package.json）
npm install 包名
npm install 包名@版本号

# 国内加速（可选，装一次即可）
npm config set registry https://registry.npmmirror.com

# 查看本目录装了哪些
npm ls --depth=0
```

> ⚠️ 一定要**先 cd 到那个有 package.json 的目录**再装，否则会装到别的项目里 —— 之前 `fs` 就是装错了位置。

### 2.1 express —— Web 框架

| 项 | 内容 |
|---|---|
| 版本 | 5.3.0 |
| 作用 | 路由、中间件、静态托管、`res.json()` |
| 安装 | `npm install express` |
| 官网 | https://expressjs.com/ |
| 用在哪 | `课堂\第十一节课——express` |
| 备注 | 5.x 与网上大量 4.x 教程有差异，遇错先看版本 |

### 2.2 mysql2 —— MySQL 驱动（推荐）

| 项 | 内容 |
|---|---|
| 版本 | 3.24.6 |
| 作用 | 连接 MySQL，支持 Promise、支持 MySQL 8 的 `caching_sha2_password` |
| 安装 | `npm install mysql2` |
| 仓库 | https://github.com/sidorares/node-mysql2 |
| 用在哪 | 第十节课（`第十节课——MySQL模块`）、第十一节课 |
| 用法 | `require('mysql2/promise')` |

### 2.3 mysql —— 旧驱动

| 项 | 内容 |
|---|---|
| 版本 | 2.18.1 |
| 作用 | 老的 MySQL 驱动，**只有回调，没有 Promise**，且不支持 MySQL 8 默认认证方式 |
| 安装 | `npm install mysql@2.18.1` |
| 用在哪 | 第十节课早期（后来换成了 mysql2） |
| 备注 | 新项目不要用；报 `ER_NOT_SUPPORTED_AUTH_MODE` 就是它 |

### 2.4 jquery —— 前端 DOM / AJAX 库

| 项 | 内容 |
|---|---|
| 版本 | 4.0.0 |
| 作用 | `$()` 选择器、`$.ajax` 发请求 |
| 安装 | `npm install jquery` |
| 官网 | https://jquery.com/ |
| 用在哪 | `课堂\第九节课——通过HTTP与URL模块，将静态资源改为动态资源` |
| 页面引用 | `<script src="node_modules/jquery/dist/jquery.min.js"></script>` **必须引 dist，不能引 src** |
| 备注 | 4.x 的 `dist/jquery.slim.min.js` **不含 ajax**，别引错 |

### 2.5 moment —— 日期处理

| 项 | 内容 |
|---|---|
| 版本 | 2.31.0 |
| 作用 | 日期解析、格式化、多语言 |
| 安装 | `npm install moment` |
| 官网 | https://momentjs.com/ |
| 用在哪 | `课堂\第二节课` |
| 备注 | Node 里要**额外** `require('moment/locale/zh-cn')` 中文才生效；官方已进入维护模式，新项目可用 dayjs |

### 2.6 fs —— ❌ 误装的空壳包

| 项 | 内容 |
|---|---|
| 版本 | 0.0.1-security |
| 装它会发生什么 | 什么也不会发生；它是 npm 官方的“占位包”，没有代码 |
| 为什么不该装 | `fs` 是 **Node 内置模块**，`require('fs')` 走内置，跟这个包无关 |
| 怎么删 | 在该目录执行 `npm uninstall fs` |
| 用在哪 | `课堂\第三节课\package.json` |

### 2.7 ajax —— ❌ 曾经装过，已卸载

| 项 | 内容 |
|---|---|
| 版本 | 0.0.4 |
| 当时的误会 | 以为 `npm i ajax` 就能用 `$.ajax`，其实 `$` 来自 jQuery |
| 实际情况 | 它是 CommonJS 的服务端小工具，浏览器里连 `require` 都没有 |
| 现状 | 已卸载，改用 jQuery |

---

## 三、运行时与数据库软件

### 3.1 Node.js

| 项 | 内容 |
|---|---|
| 已装版本 | 24.20.0 |
| 作用 | 跑 `.js` 文件、npm 包管理 |
| 下载 | https://nodejs.org/zh-cn/download （选 LTS） |
| 验证 | 终端执行 `node -v`、`npm -v` |
| 备注 | 安装时勾选 “Add to PATH”，否则命令行找不到 node |

### 3.2 MySQL Server

| 项 | 内容 |
|---|---|
| 已装版本 | 8.0.46 |
| 安装位置 | `E:\Program Files\MySQL\MySQL Server 8.0` |
| 数据目录 | `E:\ProgramData\MySQL\MySQL Server 8.0\Data` |
| 服务名 | `MySQL80` |
| 端口 | 3306 |
| 下载 | https://dev.mysql.com/downloads/installer/ |
| 启动 | 管理员终端 `net start MySQL80` |
| 备注 | 装 Server 就行，Workbench 可选 |

### 3.3 MySQL 附带工具（随 Installer 安装）

| 工具 | 版本 | 作用 |
|---|---|---|
| MySQL Workbench | 8.0.47 | 图形化客户端（可选，你主要用 Navicat） |
| MySQL Shell | 8.0.46 | 命令行工具 |
| MySQL Router | 8.0.46 | 路由/读写分离（学习阶段用不到） |
| MySQL Connector/J | 随 IDE 下载 | JDBC 驱动，给 WebStorm 的 Database 用 |

### 3.4 Navicat Premium

| 项 | 内容 |
|---|---|
| 已装版本 | 17.3.8 |
| 作用 | 图形化连库、写 SQL、保存查询 |
| 下载 | https://www.navicat.com.cn/download |
| 你的查询笔记位置 | `E:\Documents\Navicat\MySQL\Servers\localhost_3306\` |
| 备注 | 商业软件；学习可用 Navicat Premium Lite（免费）或 DBeaver（开源） |

---

## 四、IDE 与插件

### 4.1 WebStorm

| 项 | 内容 |
|---|---|
| 已装版本 | 2026.1.3（卸载面板记录） |
| 作用 | 写 JS/HTML/CSS、连数据库、执行 SQL |
| 下载 | https://www.jetbrains.com/webstorm/download/ ，或 JetBrains Toolbox |
| 社区版 | WebStorm 没有免费版；学生可申请免费教育授权 |

### 4.2 内置插件（不用装，随 IDE 自带）

| 插件 | 作用 |
|---|---|
| **Database**（`com.intellij.database`） | 连 MySQL、看表结构、执行 SQL、补全字段 |
| Node.js | 识别 `require`、提供 Node 补全 |

### 4.3 你自己装过的插件（`AppData\Roaming\JetBrains\WebStorm2026.3\plugins`）

| 插件 | 作用 | 需要吗 |
|---|---|---|
| TranslationPlugin（翻译） | 选中单词查词典 | 可选，好用 |
| vuejs-plugin | Vue 语法支持 | 现在用不到 |
| toml | TOML 文件高亮 | 用不到 |
| swagger | 接口文档预览 | 用不到 |
| python-ce / python-portable | 在 WebStorm 里写 Python | 用不到（你有 PyCharm） |
| clouds-docker-impl | Docker 支持 | 用不到 |
| mcpserver-plugin | MCP 协议支持 | 用不到 |
| vcs-hg / vcs-perforce / vcs-svn | 版本控制 | 用不到（用 Git 就够） |

**装插件的方法**：`Settings (Ctrl+Alt+S) → Plugins → Marketplace → 搜名字 → Install`，装完重启。

---

## 五、其他（不属于项目依赖，但用过）

| 工具 | 说明 |
|---|---|
| Python 3.x（DSH 内置） | 用来解析过 `.docx` 讲义（`python-docx`）；不是 Node 项目依赖 |
| PowerShell | 系统自带，用来查服务状态、跑脚本 |
| Git | 版本控制；`.gitignore` 已配置为不提交密码类文件 |

---

## 六、怎么快速核对版本

```bash
node -v                      # Node 版本
npm -v                       # npm 版本
npm ls --depth=0             # 当前目录装了哪些包
npm view express version     # 最新版本是多少
```

```powershell
# 查所有已安装软件（PowerShell）
Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*' |
  Where-Object { $_.DisplayName } |
  Select-Object DisplayName, DisplayVersion | Sort-Object DisplayName
```

```sql
-- 查 MySQL 版本
SELECT VERSION();
```

---

## 七、清理与升级建议

| 动作 | 命令 | 原因 |
|---|---|---|
| 删掉空壳 fs 包 | `npm uninstall fs` | 它不是真依赖 |
| 删掉旧 mysql 驱动 | `npm uninstall mysql`（确认代码不用它） | 有 mysql2 就够 |
| 升级依赖 | `npm update` | 修 bug |
| 国内加速 | `npm config set registry https://registry.npmmirror.com` | 装包更快 |
| 检查漏洞 | `npm audit` | 安全提示 |

---

## 八、每节课用到的外部依赖一览

| 课程 | 目录 | 外部依赖 |
|---|---|---|
| 第二节课 | `课堂\第二节课` | moment |
| 第三节课 | `课堂\第三节课` | （误装 fs） |
| 第九节课 | `课堂\第九节课——通过HTTP与URL模块…` | jquery |
| 第十节课 | `课堂\第十节课——MySQL模块` | mysql、mysql2 |
| 第十一节课 | `课堂\第十一节课——express` | express、mysql2 |

> 其余课程（第四、五、六、七、八节）只用了 Node 内置模块（`fs`、`path`、`http`、`url`），**不需要装任何包**。

---

## 九、一句话总结

> **整套项目真正的外部依赖只有 4 个 npm 包**：`express`、`mysql2`、`jquery`、`moment`。
> 其余（`fs`、`path`、`http`、`url`）都是 Node 自带，装包反而是错的。

更新：2026-11-17
