# 专升本 AI 答疑部署全记录

> 从静态网页，到本地服务、Cloudflare Worker、腾讯云 SCF，再到数学答疑、公式渲染与按日归档。
>
> 记录时间：2026-10-29 ～ 2026-10-30  
> 读者：已经会简单 HTML/CSS，Python 基础较好、模块经验少，JavaScript 会一点 DOM、没系统学过 ES6 和框架。
>
> 这篇不是“操作流水账”，而是按老师的讲法，从底层概念到项目实现，再到你以后自己搭建时的路线。你可以顺序读，也可以把它当成项目手册。

---

## 目录

1. [先看全局：这套系统到底是什么](#1-先看全局这套系统到底是什么)
2. [这两天的成果与时间线](#2-这两天的成果与时间线)
3. [必须建立的 8 个基础概念](#3-必须建立的-8-个基础概念)
4. [项目地图：文件、端口、职责](#4-项目地图文件端口职责)
5. [数据模型：词库、日志、KV、归档](#5-数据模型词库日志kv归档)
6. [前端：问题是怎么从网页发出去的](#6-前端问题是怎么从网页发出去的)
7. [本地 Python 服务：8767 与 8768](#7-本地-python-服务8767-与-8768)
8. [Python 模块逐个讲](#8-python-模块逐个讲)
9. [Cloudflare Worker：worker.js 到底在干什么](#9-cloudflare-workerworkerjs-到底在干什么)
10. [Cloudflare Worker 代码逻辑拆解](#10-cloudflare-worker-代码逻辑拆解)
11. [腾讯云 SCF：国内入口与 Function URL](#11-腾讯云-scf国内入口与-function-url)
12. [BAT 文件：为什么双击就能运行、更新](#12-bat-文件为什么双击就能运行更新)
13. [一次问答的完整 API 生命周期](#13-一次问答的完整-api-生命周期)
14. [数学答疑：公式、知识分类、删除](#14-数学答疑公式知识分类删除)
15. [自动归档：按分类、按天、自动更新主页](#15-自动归档按分类按天自动更新主页)
16. [部署手册：GitHub / Cloudflare / SCF / 本地](#16-部署手册github--cloudflare--scf--本地)
17. [安全、费用与常见坑](#17-安全费用与常见坑)
18. [这次踩过的真实坑与排查方法](#18-这次踩过的真实坑与排查方法)
19. [如果从零重写：建议的代码结构](#19-如果从零重写建议的代码结构)
20. [给你自己的学习路线：8 周](#20-给你自己的学习路线8-周)
21. [项目重建里程碑与练习](#21-项目重建里程碑与练习)
22. [术语表与最终检查清单](#22-术语表与最终检查清单)

---

# 1. 先看全局：这套系统到底是什么

先记住一句话：

> **GitHub Pages 负责“页面”，Cloudflare Worker 负责“云端大脑”，腾讯云 SCF 负责“国内入口”，本地 Python 负责“写自己的文件”。**

这四件事不是一回事。

## 1.1 四条链路

```text
【本地英语】
浏览器
  → http://127.0.0.1:8767
  → 词素工具/server.py
  → english_tutor.py / word_archiver.py
  → 本地 JSONL 日志、HTML、data.json

【本地数学】
浏览器
  → http://127.0.0.1:8768
  → 数学工具/server.py
  → math_tutor.py
  → 本地 JSONL 日志、归档 HTML

【云端英语/数学（境外直连）】
浏览器
  → Cloudflare Worker
  → DeepSeek API
  → Cloudflare KV（日志/待归档）

【云端英语/数学（国内入口）】
浏览器
  → 腾讯云 SCF 函数 URL
  → 现有 Cloudflare Worker
  → DeepSeek API + KV
```

## 1.2 为什么不能只用 GitHub Pages

GitHub Pages 只能提供**静态文件**：

- HTML
- CSS
- JavaScript
- 图片
- JSON 文件

它**不能**：

- 保存你提交的问答
- 写回 `data.json`
- 运行 Python
- 保管 DeepSeek Key
- 写本地 HTML

所以必须有一个“后端”。这就是 Cloudflare Worker 和本地 Python 服务存在的原因。

## 1.3 为什么不能只用云端

云端能回答，但它**改不了你电脑上的文件**。

单词归档需要：

```text
分析单词
→ 判断后缀/前缀/词根/复合词/原子词
→ 修改对应 HTML
→ 修改 data.json
→ 备份
```

这些只能本地做。

## 1.4 最终分工

| 层 | 负责 | 不负责 |
|---|---|---|
| GitHub Pages | 展示页面、运行浏览器 JS | 保存数据、执行 Python |
| Cloudflare Worker | AI API 代理、鉴权、限流、KV 日志 | 写本地词库 |
| Cloudflare KV | 云端日志、待归档单词 | 当关系型数据库 |
| 腾讯云 SCF | 国内 HTTPS 入口、转发请求 | 分类、存词库 |
| 本地 8767 | 英语答疑、单词归档、data.json | 公网访问 |
| 本地 8768 | 数学答疑、数学日志、归档 | 公网访问 |
| 本地归档脚本 | 生成每日 HTML、更新主页 | 上传 GitHub |

---

# 2. 这两天的成果与时间线

## 2.1 最终能力

### 英语

- 四类答疑：单词解释、作文、句子分析、其他
- 本地 / Cloudflare / 国内 SCF 三条线路
- 单词解释自动收词
- 云端待归档单词队列
- 额外新增队列（不占每天 20 个新词）
- 删除插队
- 历史记录
- 记录导出
- AI 答疑历史自动归档

### 数学

- 四类讲法：题目讲解、错题诊断、概念公式、方法/其他
- 11 个知识分类：
  - 极限
  - 导数与微分
  - 积分
  - 三角函数
  - 矩阵
  - 向量与空间几何
  - 微分方程
  - 无穷级数
  - 多元函数
  - 概率统计
  - 其他
- 本地 8768 / Cloudflare / 国内 SCF
- LaTeX + 本地 KaTeX 渲染
- 历史原题公式渲染
- 历史按知识分类筛选
- 每条记录可删除
- 历史按分类、按天归档
- 数学主页自动生成“AI 答疑历史”板块

### 公共

- 通用 AI 答疑窗口（iframe）
- 数学/英语主页
- 响应式修复
- 共享 API Key 配置
- 本地自动归档
- 共享的博客 CSS / JS
- 学习文档

## 2.2 当前数据快照

截至 2026-10-30：

```text
核心词汇：307
复习词：312
全部词条：325
额外新增：deep、hello、heaven、nasty（10 月 31 日）
priority：0
```

注意：

- 核心 307 是“核心词汇通关”页的 307 个后缀/前缀词族词。
- `deep` 是词根族，`hello` 等是原子词，不进入核心页。
- 所以“核心 307 / 复习 312 / 全部 325”不是矛盾，是三个不同统计口径。

## 2.3 时间线（概括）

### 10 月 29 日左右

- 英语答疑页
- 本地 8767 服务
- 云端 Worker + KV
- Q&A 日志
- 待归档单词
- 额外新增规则
- 删除插队

### 10 月 30 日

- 数学答疑页
- 数学家人设
- 公式渲染
- 数学知识分类
- 删除记录
- 腾讯云 SCF 国内入口
- API 网关停售 → Function URL
- 广州 SCF 访问 Cloudflare 失败 → 香港 SCF
- 答疑历史自动归档
- 数学/英语主页 AI 历史板块
- 响应式修复
- 通用 AI 窗口提取

---

# 3. 必须建立的 8 个基础概念

这一节是地基。后面所有代码都建立在这里。

## 3.1 前端与后端

- **前端**：浏览器里运行的 HTML/CSS/JS。
- **后端**：接收请求、做判断、访问数据库/API、返回 JSON 的程序。

你打开一个页面，页面里的 JS 可以 `fetch()` 一个后端地址。  
浏览器只负责“发请求”和“显示结果”，不负责保管 Key。

## 3.2 HTTP 请求

一个请求包含：

```text
方法：GET / POST / OPTIONS
URL：/api/tutor
Headers：Content-Type、X-Tutor-Token、Origin
Body：JSON
```

一个响应包含：

```text
状态码：200 / 400 / 401 / 403 / 404 / 429 / 500 / 502
Headers：Content-Type、CORS
Body：JSON
```

你要会看浏览器 DevTools 的 **Network** 面板：

- 请求地址
- 请求方法
- 请求头
- 请求体
- 状态码
- 响应体

这是排查问题的第一现场。

## 3.3 JSON

JSON 是前后端交换数据的格式。

```json
{
  "subject": "math",
  "mode": "题目讲解",
  "topic": "极限",
  "question": "求极限"
}
```

Python 里：

```python
json.loads(text)   # 字符串 → dict
json.dumps(obj)    # dict → 字符串
```

JS 里：

```js
JSON.parse(text)   // 字符串 → 对象
JSON.stringify(obj) // 对象 → 字符串
```

## 3.4 API Key、访问口令、Token

三个东西不要混：

| 名称 | 作用 | 放哪 |
|---|---|---|
| DeepSeek API Key | 让程序调用 DeepSeek | 本地 `共享配置/API.txt`；云端 Worker Secret |
| Cloudflare `TUTOR_ACCESS_TOKEN` | 页面访问 Worker 的口令 | Cloudflare Secret；页面云端线路 |
| SCF `PROXY_TOKEN` | 页面访问 SCF 的口令 | SCF 环境变量；页面国内 SCF 线路 |

调用链：

```text
页面带 PROXY_TOKEN → SCF
SCF 校验后，带 UPSTREAM_TOKEN → Worker
Worker 校验 TUTOR_ACCESS_TOKEN
Worker 用 DEEPSEEK_API_KEY → DeepSeek
```

DeepSeek Key 永远不应该出现在浏览器 JS 中。

## 3.5 静态托管与 Serverless

- **静态托管**：只发文件，不执行服务器代码。GitHub Pages。
- **Serverless**：你写一个函数，平台按请求执行。Cloudflare Worker、腾讯云 SCF。

Serverless 不是“没有服务器”，而是“服务器由平台管理，你只写函数”。

## 3.6 CORS

浏览器有同源策略。

如果页面在：

```text
https://goldenfloweranddust.github.io
```

请求发到：

```text
https://xxx.workers.dev
```

这是跨域。后端必须返回：

```text
Access-Control-Allow-Origin: https://goldenfloweranddust.github.io
```

或测试阶段的 `*`。

CORS 不是登录鉴权，它只是浏览器的安全策略。

## 3.7 环境变量与 Secret

- 普通变量：模型名、TTL、限流数。
- Secret：API Key、访问口令。

Cloudflare 里通过控制台 Secret 设置。  
SCF 里通过函数环境变量设置。  
本地通过 `API.txt` 或系统环境变量设置。

## 3.8 最终一致性与 KV

Cloudflare KV 是键值存储：

```text
key → value
```

它不是 MySQL：

- 没有 SQL
- 没有联表
- 没有事务
- 全球最终一致
- 同一个 key 每秒最多写 1 次

所以它适合：

- 日志
- 待归档队列
- 简单配置

不适合：

- 词库主数据
- 需要强一致的业务
- 复杂查询

---

# 4. 项目地图：文件、端口、职责

## 4.1 两个主项目

```text
my_web/
└─ 内容文件夹/
   └─ 专升本备考/
      ├─ 备考专升本英语/
      ├─ 备考专升本数学/
      ├─ 共享配置/
      │  ├─ API.txt
      │  └─ README.md
      └─ 共享工具/
         ├─ 归档答疑历史.py
         └─ README.md
```

## 4.2 英语项目

```text
备考专升本英语/
├─ 英语答疑/
│  ├─ 英语答疑.html
│  ├─ 英语答疑.css
│  ├─ 英语答疑.js
│  └─ 归档/<分类>/<日期>.html
├─ 词素工具/
│  ├─ server.py
│  ├─ english_tutor.py
│  ├─ word_archiver.py
│  ├─ auto_archive.py
│  ├─ import_pending_words.py
│  ├─ import_tutor_logs.py
│  ├─ organize_cloud_downloads.py
│  ├─ 英语问答日志/
│  └─ 英语问答日志备份/
├─ 复习清单/data.json
├─ 单词模块/词汇代码生成器.html
├─ 启动词素服务.bat
├─ 导入待归档单词.bat
├─ 导入答疑记录.bat
├─ 整理云端下载.bat
└─ cloudflare-worker/worker.js
```

## 4.3 数学项目

```text
备考专升本数学/
├─ 数学答疑/
│  ├─ 数学答疑.html
│  ├─ 数学答疑.css
│  ├─ 数学答疑.js
│  └─ 归档/<知识分类>/<日期>.html
├─ 数学工具/
│  ├─ server.py
│  ├─ math_tutor.py
│  ├─ import_math_tutor_logs.py
│  ├─ 数学问答日志/
│  └─ 数学问答日志备份/
├─ 启动数学答疑服务.bat
├─ 导入数学答疑记录.bat
├─ start_math_server.py
├─ import_math_tutor_logs.py
├─ skills/math-tutor/SKILL.md
└─ 一些必备脚本/数学公式js/libs/（KaTeX）
```

## 4.4 端口

| 服务 | 端口 | 作用 |
|---|---|---|
| 英语 8767 | `http://127.0.0.1:8767` | 英语答疑、单词归档、data.json |
| 数学 8768 | `http://127.0.0.1:8768` | 数学答疑、数学日志/归档 |
| 静态预览 | 任意，例如 8769/8773 | 只提供文件，不执行 Python |
| Cloudflare Worker | 公网 HTTPS | 云端 API |
| 腾讯云 SCF | 公网 HTTPS | 国内入口 |

## 4.5 为什么数学不用 8767

英语 8767 的 `server.py` 只把英语项目目录作为静态根目录。

数学页面在另一个目录。为了让数学页面也能本地加载，数学单独起 8768：

- 不污染英语服务
- 两个服务可以独立重启
- 日志/归档目录天然分开
- 以后政治、信息技术也可以按这个模式扩展

---

# 5. 数据模型：词库、日志、KV、归档

## 5.1 `复习清单/data.json`

它是英语词库的总索引，按分类保存：

```json
{
  "核心词汇通关": [
    {
      "name": "account",
      "kind": "word",
      "level": 0,
      "nextDate": "2026-10-31",
      "lastReviewed": null,
      "created": "2026-10-30",
      "extra": true,
      "extraDate": "2026-10-31",
      "source": "generator"
    }
  ]
}
```

关键字段：

- `name`：单词/条目名
- `kind`：`word` 或旧页面条目
- `level`：复习等级
- `nextDate`：下一次复习日期
- `lastReviewed`：最后复习日期
- `created`：创建日期
- `extra`：是否额外新增
- `extraDate`：额外新增出现日期
- `source`：来源

## 5.2 额外新增规则

以前：

```text
新词 → 塞进每天 20 个新词
已录入 → 插队到今天
```

现在：

```text
生成器新词 → extra: true，extraDate: 明天
答疑新词 → 本地/云端入库后同样 extra
不占 20 个新词
没复习完继续保留
已录入 → 只提示，不插队
```

当天总量：

```text
20 新 + 20 复习 + 额外新增 = 40+
```

## 5.3 英语答疑日志

本地：

```text
词素工具/英语问答日志/
├─ 单词解释.jsonl
├─ 作文.jsonl
├─ 句子分析.jsonl
└─ 其他.jsonl
```

每行一个 JSON：

```json
{
  "time": "2026-10-30 21:10:36",
  "mode": "单词解释",
  "question": "解释 account",
  "answer": "……",
  "model": "deepseek-chat",
  "duration_ms": 4000,
  "status": "ok"
}
```

## 5.4 数学答疑日志

本地：

```text
数学工具/数学问答日志/
├─ 题目讲解.jsonl
├─ 错题诊断.jsonl
├─ 概念公式.jsonl
└─ 其他.jsonl
```

数学多了：

```json
{
  "topic": "极限",
  "subject": "math"
}
```

`mode` 是“讲法”，`topic` 是“知识分类”。

例如：

```text
mode = 错题诊断
topic = 导数与微分
```

表示“用错题诊断的方式，讲导数与微分”。

## 5.5 Cloudflare KV 的 key

```text
rate:<IP>:<分钟>                   限流
log:<subject>:<mode>:<ISO>:<uuid>  单条日志
index:<mode>                       英语分类索引（旧格式保留）
index:math:<mode>                  数学分类索引
pending:<ISO>:<uuid>               待归档单词
```

为什么需要 `index`？

如果每次历史都 `list` 所有 KV key，再逐个 `get`，会慢且贵。  
所以每个分类维护一个最近 50 条的数组索引，读取历史只要 `get` 几个 index。

## 5.6 归档目录

数学：

```text
数学答疑/归档/<知识分类>/<YYYY-MM-DD>.html
```

英语：

```text
英语答疑/归档/<分类>/<YYYY-MM-DD>.html
```

每个分类一个文件夹，每天一个 HTML。

---

# 6. 前端：问题是怎么从网页发出去的

## 6.1 页面结构

英语/数学答疑页大体分：

```text
header        标题、连接状态、连接设置
notice        本地/云端未连接提示
ask-panel     分类、知识分类、输入框、示例、发送
answer-panel  回答、复制、时间、状态
history       历史记录、分类筛选、导出、删除
dialog        连接设置
toast         小提示
```

## 6.2 连接设置

页面把配置存在 `localStorage`：

英语：

```text
english-tutor-connection-v1
```

数学：

```text
math-tutor-connection-v1
```

结构：

```json
{
  "mode": "cloud",
  "provider": "domestic",
  "profiles": {
    "cloudflare": { "url": "...", "token": "..." },
    "domestic": { "url": "...", "token": "..." }
  }
}
```

为什么两套 profiles？

- Cloudflare 线路不能因为切到 SCF 就被覆盖
- 两套地址/口令分开保存
- 英语和数学又各用各的 localStorage key

## 6.3 本地地址

数学：

```js
if (location.port === "8768") return "";       // 与页面同源
return "http://127.0.0.1:8768";
```

英语同理是 8767。

如果页面在 GitHub，访问 `http://127.0.0.1:8768` 属于跨域；本地服务必须返回 CORS。

## 6.4 发送问题

核心代码：

```js
const resp = await fetch(apiUrl("/api/tutor"), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Tutor-Token": token   // 只有云端需要
  },
  body: JSON.stringify({
    subject: "math",
    mode: currentMode,
    topic: currentTopic,
    question
  })
});

const data = await resp.json();
if (!resp.ok || !data.ok) throw new Error(data.error);
renderAnswer(data.answer);
```

这段代码做了：

1. 选地址（本地/云端）
2. 选 token
3. 组装 JSON
4. POST
5. 解析 JSON
6. 错误处理
7. 渲染

## 6.5 为什么不直接 `innerHTML = answer`

因为 AI 返回的是 Markdown 文本，而且可能包含用户输入。

如果直接插 HTML，会有 XSS 风险。  
所以页面先 `escapeHtml`，再做受限 Markdown 渲染。

当前渲染器支持：

- 标题
- 段落
- 列表
- 粗体
- 行内代码
- 代码块
- 引用
- 分隔线
- `$...$` / `$$...$$` / `\(...\)` / `\[...\]`

## 6.6 数学公式为什么需要单独处理

KaTeX 只认“定界符”：

```text
$...$
$$...$$
\(...\)
\[...\]
```

API 返回的数学答案大量使用：

```text
\[
...
\]
```

原来的 Markdown 渲染器只提取 `$$`，所以 `\[` 被当普通文本。

修复：

```js
source = source.replace(/\\\[([\s\S]*?)\\\]/g, function (_, body) {
    mathBlocks.push(body);
    return "\n@@MATH" + (mathBlocks.length - 1) + "@@\n";
});
```

先把 `\[...\]` 提成块，再输出：

```html
<div class="math-display">$$...$$</div>
```

最后：

```js
renderMathInElement(container, {
  delimiters: [
    {left: "$$", right: "$$", display: true},
    {left: "\\[", right: "\\]", display: true},
    {left: "$", right: "$", display: false},
    {left: "\\(", right: "\\)", display: false}
  ],
  throwOnError: false
});
```

## 6.7 历史原题公式

历史记录里的 `question` 可能是裸 LaTeX：

```text
\lim_{x\to0}\frac{\sin x}{x}
```

没有 `$`，KaTeX 不会识别。

页面用 `questionHtml` 做了保守包裹：

- 如果已有 `$`/`\(`/`\[`，不动
- 否则从 `\命令` 开始，到下一个中文之前，包进 `$...$`

然后对历史原题调用 `renderMath`。

## 6.8 历史记录删除

每条历史卡是：

```text
<div class="history-row">
  <button class="history-item">...</button>
  <button class="history-delete">删除</button>
</div>
```

不能把删除按钮放在 `history-item` 里面，因为 `button` 不能嵌套 `button`。

删除流程：

```text
confirm
→ POST /api/tutor-log-delete
→ 当前线路的删除接口
→ 刷新历史
```

本地删除会重写 JSONL；云端删除会重写 KV index。

## 6.9 AI 答疑窗口

数学主页的 AI 窗口不是复制一套页面，而是：

```html
<div data-ai-tutor
     data-ai-src="...数学答疑.html"
     data-ai-title="AI 数学答疑">
</div>
```

`专升本-博客.js` 检测到 `[data-ai-tutor]`，自动生成：

- 悬浮按钮
- 弹窗
- iframe
- 关闭/遮罩/Esc
- 首次打开才加载 iframe

这样以后政治、信息技术只要复用同一段 HTML + 公共 CSS/JS。

---

# 7. 本地 Python 服务：8767 与 8768

## 7.1 为什么用 Python 标准库

当前服务没有用 Flask/FastAPI，而是：

```python
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
```

原因：

- 零依赖
- 双击 bat 即可启动
- 静态文件 + JSON API 够用
- 你 Python 基础好，适合先理解 HTTP 本质

框架不是必须的。先用标准库把“请求 → 处理 → 响应”走通，再学框架会更扎实。

## 7.2 英语 8767 服务

文件：

```text
备考专升本英语/词素工具/server.py
```

职责：

- 把英语项目目录作为静态站点根
- 提供 `/api/health`
- 提供 `/api/log`
- 提供 `/api/analyze`、`/api/check`、`/api/archive`
- 提供 `/api/review`
- 提供 `/api/tutor`、`/api/tutor-log`
- 屏蔽 `/词素工具/`，防止 Key/日志/备份被静态下载

## 7.3 数学 8768 服务

文件：

```text
备考专升本数学/数学工具/server.py
```

职责：

- 把数学项目目录作为静态站点根
- `/api/health`
- `/api/tutor`
- `/api/tutor-log`
- `/api/tutor-log-delete`
- 屏蔽 `/数学工具/`

## 7.4 请求处理骨架

```python
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if path == "/api/health":
            self._send_json(200, health())
        elif path == "/api/tutor-log":
            ...
        else:
            super().do_GET()   # 返回静态文件

    def do_POST(self):
        payload = json.loads(body)
        result = ask_tutor(...)
        self._send_json(200, result)
```

## 7.5 CORS

响应头：

```text
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

浏览器页面从 GitHub 访问本地 8767/8768 时，需要这些头。

## 7.6 静态文件安全

只靠 `.gitignore` 不够。  
`server.py` 还要阻止：

```text
/词素工具/
/数学工具/
```

否则，如果用户直接访问：

```text
http://127.0.0.1:8767/词素工具/API.txt
```

Key 就会暴露。

## 7.7 自动归档钩子

两个服务都在启动时调用：

```python
refresh_archive()
```

英语每次 `/api/tutor` 成功后也调用；数学每次答疑/删除后也调用。

这样：

- 启动服务 → 归档
- 新答疑 → 归档更新
- 删除记录 → 旧归档清理

---

# 8. Python 模块逐个讲

这一节按“你以后自己搭建”的角度讲。

## 8.1 `word_archiver.py`：英语词库核心

职责：

1. 读 API Key
2. 调 DeepSeek 分析单词
3. 校验 AI 返回 JSON
4. 判断词缀/词根/复合词/原子词
5. 写 HTML
6. 写 `data.json`
7. 备份
8. 写归档日志
9. 处理复习更新

关键函数：

| 函数 | 作用 |
|---|---|
| `read_api_key()` | 环境变量 → 共享配置 → 旧位置 |
| `call_deepseek()` | 调 DeepSeek |
| `validate_analysis()` | 校验分析结果 |
| `insert_into_word_page()` | 后缀/前缀写入核心页 |
| `insert_into_ci()` | 词根/复合词/原子词写入词素页 |
| `next_schedule_date()` | 找最近未满 20 的日期（旧逻辑） |
| `build_data_item()` | 构造 data.json 条目 |
| `append_data_item()` | 写入额外新增/日程 |
| `archive_word()` | 总入口 |
| `check_word()` | 检查是否已录入 |
| `apply_review_updates()` | 写回复习进度 |
| `health()` | 健康检查 |

### 额外新增的核心

新词：

```python
created = today
extra = True
extraDate = tomorrow
nextDate = tomorrow
source = "generator" / "tutor"
```

不再调用 `prioritize_existing`。  
旧代码里可能还留有这个函数，但页面和归档流程不再使用。

### 为什么写 HTML 和 data.json 要一起做

只写 HTML：

- 页面有词
- 复习清单没词

只写 data.json：

- 复习清单有词
- 页面没有词

所以必须：

```text
HTML + data.json + 备份 + 日志
```

## 8.2 `english_tutor.py`

职责：

- 英语教师人设
- 四类 mode
- 调 DeepSeek
- 写入 `英语问答日志/<分类>.jsonl`
- 读取历史

## 8.3 `math_tutor.py`

职责：

- 数学家人设
- 四类 mode
- 11 类 topic
- 调 DeepSeek
- 写入 `数学问答日志/<mode>.jsonl`
- 读取历史（支持 topic 筛选）
- 删除记录

数学日志文件名仍然按 mode 分，topic 是记录字段。  
这样：

```text
题目讲解.jsonl 里可以同时有 极限/积分/矩阵 的题
```

历史页再按 topic 筛选。

## 8.4 `auto_archive.py`

命令行入口：

```text
python 词素工具/auto_archive.py account
```

适合脚本调用/调试。

## 8.5 `import_pending_words.py`

输入：

```text
英语答疑待归档单词-*.json
```

流程：

```text
读取 entries
→ 校验 word
→ 去重
→ 调 archive_word
→ 本地分类写入
```

不负责云端删除；导入后本地已存在，下次会跳过。

## 8.6 `import_tutor_logs.py`

输入：

```text
英语答疑记录-*.json
```

合并到：

```text
词素工具/英语问答日志/*.jsonl
```

去重、备份。

## 8.7 `import_math_tutor_logs.py`

输入：

```text
数学答疑记录-*.json
```

合并到：

```text
数学工具/数学问答日志/*.jsonl
```

保留 `topic`；没有 topic 的归为“其他”。

## 8.8 `organize_cloud_downloads.py`

只做文件移动：

```text
英语答疑记录 → 云端下载/答疑归档
英语答疑待归档单词 → 云端下载/待归档单词
```

不导入、不调 AI。

## 8.9 `归档答疑历史.py`：自动归档核心

职责：

1. 读数学/英语 JSONL
2. 按 category + date 分组
3. 生成每日 HTML
4. 更新主页 marker 区域
5. 删除过期归档

数学按 topic；英语按 mode。

## 8.10 `server.py` 模块建议

以后自己写：

- 把“纯业务”放在模块里，例如 `tutor.py`
- 把 HTTP 层单独放 `server.py`
- 业务函数返回 dict，不直接 `print`
- 用 `argparse` 处理命令行
- 用 `pathlib` 而不是字符串拼路径
- 用 `try/except` 把错误转成用户能懂的中文
- 用 `json.dumps(..., ensure_ascii=False)`
- 写文件用临时文件 + `replace`，避免写一半
- 重要文件先备份

## 8.11 你现在的 Python 基础已经够用

你缺的不是语法，而是“模块之间怎么组织”。

建议先掌握这些标准库：

```text
pathlib
json
os
sys
time
datetime
argparse
http.server
urllib.request
urllib.error
shutil
re
typing
```

不需要一上来学 Django/FastAPI。  
先能写一个 200 行的 HTTP 服务，再学框架。

---

# 9. Cloudflare Worker：worker.js 到底在干什么

## 9.1 一句话

`worker.js` 是一个部署在 Cloudflare 边缘网络上的 **JavaScript 后端函数**。

它：

- 接收页面请求
- 校验访问口令
- 选英语/数学人设
- 调 DeepSeek
- 写 KV 日志
- 返回 JSON

它不是传统服务器：

- 没有常驻进程
- 没有本地磁盘
- 每个请求执行一次
- 运行在 V8 isolate
- 用 Web API（fetch/Request/Response/TextEncoder）
- 不是完整 Node.js（部分 Node 兼容，但不能当 Express 用）

## 9.2 它为什么必须存在

因为 DeepSeek Key 不能放前端。

如果页面直接调 DeepSeek：

```js
fetch("https://api.deepseek.com/...", {
  headers: { Authorization: "Bearer sk-..." }
})
```

任何人打开 DevTools 都能偷走 Key。

所以：

```text
浏览器 → Worker（有 Secret） → DeepSeek
```

Worker 是“带钥匙的中间人”。

## 9.3 绑定与配置

Worker 需要：

| 名称 | 类型 | 作用 |
|---|---|---|
| `DEEPSEEK_API_KEY` | Secret | 调 DeepSeek |
| `TUTOR_ACCESS_TOKEN` | Secret | 页面访问口令 |
| `TUTOR_KV` | KV binding | 日志/队列 |
| `DEEPSEEK_MODEL` | 变量 | `deepseek-chat` |
| `ALLOWED_ORIGIN` | 变量 | CORS 来源 |
| `RATE_LIMIT_PER_MINUTE` | 变量 | 每分钟限流 |
| `LOG_TTL_DAYS` | 变量 | 日志保留天数 |

## 9.4 路由

```text
GET  /api/health
POST /api/tutor
GET  /api/tutor-log
POST /api/tutor-log-delete
POST /api/pending-word
GET  /api/pending-words
```

---

# 10. Cloudflare Worker 代码逻辑拆解

## 10.1 入口

```js
export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      return json({ ok: false, error: "云端服务内部错误。" }, 500, request, env);
    }
  }
};
```

`request` 是请求，`env` 是绑定/Secret/变量。

## 10.2 总调度

```js
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (!originAllowed(request, env)) {
    return json({ ok: false, error: "来源不在允许列表中。" }, 403, request, env);
  }

  if (path === "/api/health") return ...;
  if (path === "/api/tutor") return handleTutor(...);
  ...
}
```

## 10.3 健康检查

```js
if (path === "/api/health") {
  return json({
    ok: true,
    service: "english-tutor",
    model: env.DEEPSEEK_MODEL || "deepseek-chat",
    has_key: Boolean(env.DEEPSEEK_API_KEY),
    kv_bound: Boolean(env.TUTOR_KV),
    auth_required: true
  }, 200, request, env);
}
```

注意：`has_key:true` 只代表 Secret 存在，不代表 Key 一定有效。  
真正的 401 只有调用 DeepSeek 时才知道。

## 10.4 鉴权

```js
function authorized(request, env) {
  const expected = String(env.TUTOR_ACCESS_TOKEN || "");
  if (!expected) return false;
  const provided = request.headers.get("X-Tutor-Token") || "";
  return constantTimeEqual(provided, expected);
}
```

`constantTimeEqual` 是为了避免简单的时序攻击。

## 10.5 CORS

```js
function corsHeaders(request, env) {
  const configured = env.ALLOWED_ORIGIN || "*";
  const origin = request.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": configured === "*" ? "*" : (origin === configured ? origin : configured),
    "Access-Control-Allow-Headers": "Content-Type, X-Tutor-Token",
    ...
  };
}
```

CORS 不是鉴权。  
它只是告诉浏览器“这个来源能不能读响应”。

## 10.6 读 JSON 体

```js
async function readJsonBody(request) {
  const text = await request.text();
  if (text.length > 20000) throw new Error("请求体过大。");
  const data = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("请求体必须是 JSON 对象。");
  }
  return data;
}
```

先限制大小，再解析。

## 10.7 选科目

```js
const subject = String(payload.subject || "english").toLowerCase() === "math"
  ? "math"
  : "english";
const config = subjectConfig(subject);
```

英语页不传 `subject`，默认英语。  
数学页传 `"math"`。

不是让 AI 猜科目，是页面明确声明。

## 10.8 选人设与分类

```js
function subjectConfig(subject) {
  if (subject === "math") {
    return {
      subject: "math",
      categories: MATH_CATEGORIES,
      topics: MATH_TOPICS,
      prompt: MATH_SYSTEM_PROMPT,
      temperature: 0.2,
      maxTokens: 4000,
      maxQuestion: 4000
    };
  }
  return {
    subject: "english",
    categories: CATEGORIES,
    aliases: ALIASES,
    prompt: SYSTEM_PROMPT,
    temperature: 0.35,
    maxTokens: 3200,
    maxQuestion: 2000
  };
}
```

## 10.9 限流

```js
const ip = request.headers.get("CF-Connecting-IP") || "unknown";
const minute = Math.floor(Date.now() / 60000);
const rateKey = `rate:${ip}:${minute}`;
const used = Number(await env.TUTOR_KV.get(rateKey) || 0);
if (used >= limit) return 429;
await env.TUTOR_KV.put(rateKey, String(used + 1), { expirationTtl: 120 });
```

同一 IP 每分钟最多 N 次。  
英语和数学共享这个限流。

## 10.10 调 DeepSeek

```js
const apiResponse = await fetch("https://api.deepseek.com/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model,
    messages: [
      { role: "system", content: config.prompt },
      { role: "user", content: JSON.stringify({ subject, mode, topic, question }) }
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens
  }),
  signal: controller.signal
});
```

DeepSeek 返回：

```json
{
  "choices": [
    {
      "message": {
        "content": "Markdown 正文"
      }
    }
  ]
}
```

Worker 取：

```js
const answer = data.choices[0].message.content.trim();
```

## 10.11 写日志

```js
const record = {
  created_at: now.toISOString(),
  time,
  subject,
  mode,
  topic,
  question,
  answer,
  model,
  duration_ms,
  status: "ok"
};

const key = `log:${subject}:${mode}:${createdAt}:${uuid}`;
await env.TUTOR_KV.put(key, JSON.stringify(record), { expirationTtl: ttl });

const indexKey = subject === "math" ? `index:math:${mode}` : `index:${mode}`;
const index = await env.TUTOR_KV.get(indexKey, "json") || [];
index.unshift(record);
await env.TUTOR_KV.put(indexKey, JSON.stringify(index.slice(0, 50)), { expirationTtl: ttl });
```

为什么同时写 `log:` 和 `index:`？

- `log:` 是完整存档，单条
- `index:` 是最近 50 条，用于快速读历史
- 读取历史不 `list` 全部

## 10.12 读历史

```js
const entries = await Promise.all(
  categories.map(name => env.TUTOR_KV.get(
    subject === "math" ? `index:math:${name}` : `index:${name}`,
    "json"
  ))
);
entries = entries.flat().filter(...).sort(...).slice(0, limit);
```

数学再按 `topic` 过滤：

```js
.filter(item => topic === "all" || normalizeTopic(item.topic) === topic)
```

## 10.13 待归档单词

`POST /api/pending-word`：

```json
{ "word": "heaven", "question": "解释 heaven" }
```

流程：

```text
校验 token
→ 校验 word 是英文单词
→ list pending:*
→ 查重
→ put pending:<ISO>:<uuid>
```

它只存“待归档”，不分类、不写 HTML。  
分类必须回本地由 `word_archiver.py` 做。

## 10.14 删除记录

`POST /api/tutor-log-delete`：

```json
{
  "subject": "math",
  "mode": "题目讲解",
  "created_at": "...",
  "time": "..."
}
```

流程：

```text
读 index
→ 过滤掉匹配记录
→ put 回去
→ 返回 deleted 数量
```

注意：当前删除的是历史索引记录。  
单独的 `log:` 原始 KV 记录仍会按 TTL 自然过期，页面历史不再显示它。

## 10.15 错误码设计

| 状态 | 含义 |
|---|---|
| 200 | 成功 |
| 400 | 参数错/JSON 错 |
| 401 | 口令错 |
| 403 | Origin 不允许 |
| 404 | 路由不存在 |
| 429 | 限流 |
| 500 | 服务端配置/内部错误 |
| 502 | DeepSeek/上游错误 |

统一的错误 JSON：

```json
{ "ok": false, "error": "人话错误信息" }
```

## 10.16 以后自己写 Worker 的建议

1. **一个文件先跑通，再拆模块**。
2. 所有 Secret 用 `env`，不要写死。
3. 先写 `/api/health`，再写业务。
4. CORS、OPTIONS、鉴权先写，否则前端一直报错。
5. 请求体限制大小。
6. 调外部 API 必须加超时（`AbortController`）。
7. 错误统一 JSON，前端好处理。
8. 日志索引不要用 `list` 全量读取。
9. 同 key 写频率注意 1 秒限制。
10. 用最小请求测试，再接页面。

---

# 11. 腾讯云 SCF：国内入口与 Function URL

## 11.1 为什么需要它

Cloudflare Worker 在国内可能访问不稳定，`workers.dev` 甚至打不开。

目标：

```text
国内浏览器
→ 国内可访问的 HTTPS 入口
→ 现有 Cloudflare Worker
→ DeepSeek + KV
```

这样：

- Cloudflare 继续当主系统
- 数据仍在 KV
- 页面多一条国内线路
- 不需要把整个后端重写

## 11.2 API 网关停售

原来的计划是：

```text
SCF + API 网关
```

但腾讯云 API 网关已经停止售卖/下线。  
官方替代是 **函数 URL（Function URL）**：

```text
https://<app-id>-<url-id>.<region>.tencentscf.com
```

优点：

- 不需要 API 网关
- 不需要买域名
- 自带 HTTPS
- 默认域名不需要自己备案
- 函数 URL 本身不额外收费

## 11.3 架构

```text
浏览器
→ SCF 函数 URL
→ SCF 代理函数
→ Cloudflare Worker
→ DeepSeek / KV
```

SCF 只做转发，不做分类、不存词库。

## 11.4 环境变量

```text
UPSTREAM_BASE   https://english-tutor.goldenfloweranddust.workers.dev
UPSTREAM_TOKEN  Cloudflare 的 TUTOR_ACCESS_TOKEN
PROXY_TOKEN     给页面用的新口令
ALLOWED_ORIGIN  https://goldenfloweranddust.github.io
```

## 11.5 三层 Token

```text
页面
  X-Tutor-Token: PROXY_TOKEN
→ SCF 校验 PROXY_TOKEN
  X-Tutor-Token: UPSTREAM_TOKEN
→ Worker 校验 TUTOR_ACCESS_TOKEN
→ Worker 使用 DEEPSEEK_API_KEY
```

为什么分开？

- 页面拿不到 Worker 口令
- SCF 可以单独撤销
- 泄露时影响范围小

## 11.6 SCF 代码逻辑

入口：

```js
exports.main_handler = async (event) => {
  try {
    return await handleRequest(event || {});
  } catch (error) {
    return response(500, { ok: false, error: "SCF 内部错误：" + error.message }, corsHeaders(...));
  }
};
```

核心步骤：

1. 读 `httpMethod`
2. 读 `headers`（统一小写）
3. 处理 `OPTIONS`
4. 检查 Origin
5. 从 `event.path` 找 `/api/...`
6. 健康检查允许匿名
7. 其他接口校验 `PROXY_TOKEN`
8. 拼上游 URL
9. 带上 `UPSTREAM_TOKEN` 请求 Worker
10. 115 秒超时
11. 原样返回 Worker 的状态码、headers、body

## 11.7 Function URL 事件格式

Function URL 的事件和 API 网关不完全一样：

```json
{
  "httpMethod": "GET",
  "path": "/api/tutor-log",
  "headers": {},
  "queryString": { "category": "all" },
  "body": "..."
}
```

注意：

- `queryString` 是对象，不是字符串
- 没有 `queryStringParameters`
- 代码要兼容对象和字符串

这就是为什么代理函数里写了：

```js
if (raw && typeof raw === "object") {
  const search = new URLSearchParams();
  ...
}
```

## 11.8 广州失败，香港成功

真实情况：

```text
广州 SCF → workers.dev：fetch failed
香港 SCF → workers.dev：成功
```

原因：

- 广州函数走中国大陆出口
- 对 `workers.dev` 的 DNS/网络不通
- 香港出口可以访问 Cloudflare

所以最终用了香港函数 URL。

这不是代码问题，是网络路径问题。  
排查时用真实请求测 `/api/health`，看返回：

```json
{"ok":false,"error":"无法连接上游 Cloudflare Worker：fetch failed"}
```

就能确定是上游网络，不是页面。

## 11.9 Function URL 配置

```text
绑定版本：$LATEST
公网访问：开启
授权类型：开放（页面需要匿名调用；靠 PROXY_TOKEN 保护业务接口）
CORS：关闭（函数自己返回 CORS）
函数超时：120 秒
```

## 11.10 SCF 部署顺序

1. 创建 SCF 函数，Node.js 18
2. 粘贴 `tencent-scf/index.js`
3. 配置环境变量
4. 超时 120 秒
5. 创建函数 URL
6. 公网 + 开放 + CORS 关闭
7. 测 `/api/health`
8. 页面连接设置选“国内 SCF”
9. 地址填函数 URL，口令填 `PROXY_TOKEN`

## 11.11 SCF 建议

- 只做代理，不要在函数里分类
- 上游 URL/Token 只放环境变量
- 健康检查匿名，业务接口必须口令
- 统一 120 秒超时
- 测 `/api/health` 先判断网络
- 不要在函数里写死域名
- 注意 Content-Type 重复：函数 URL 自己会加 JSON 头，函数里不要再加
- 函数 URL 是公网入口，但业务仍有 token

---

# 12. BAT 文件：为什么双击就能运行、更新

## 12.1 BAT 是什么

`.bat` 是 Windows 批处理脚本，本质是一行行命令。

例如：

```bat
@echo off
cd /d "%~dp0"
python server.py
pause
```

- `@echo off`：不显示命令本身
- `cd /d "%~dp0"`：切到 bat 所在目录
- `python server.py`：运行 Python
- `pause`：停住窗口

## 12.2 为什么用 BAT

因为用户不想每次打开终端敲：

```text
cd ...
python 词素工具/server.py
```

双击即可。

## 12.3 bundled Python

当前 bat 优先使用：

```text
%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe
```

找不到再：

```text
py -3
python
```

这样不要求系统 PATH 一定有 Python。

## 12.4 启动英语

```text
启动词素服务.bat
→ word_server.py
→ 词素工具/server.py
→ 127.0.0.1:8767
```

`word_server.py` 是 ASCII 路径入口，避免中文路径/编码问题。

## 12.5 启动数学

```text
启动数学答疑服务.bat
→ start_math_server.py
→ 数学工具/server.py
→ 127.0.0.1:8768
```

## 12.6 导入类 BAT

### 导入待归档单词

```text
导入待归档单词.bat
→ import_pending_words.py "拖入的 JSON" --write
```

### 导入英语答疑记录

```text
导入答疑记录.bat
→ import_tutor_logs.py "拖入的 JSON"
```

### 导入数学答疑记录

```text
导入数学答疑记录.bat
→ import_math_tutor_logs.py "拖入的 JSON" --write
```

`%~1` 就是拖入的文件路径。

## 12.7 整理下载

```text
整理云端下载.bat
→ organize_cloud_downloads.py
```

它只移动文件：

```text
英语答疑记录 → 云端下载/答疑归档
英语答疑待归档单词 → 云端下载/待归档单词
```

不调 AI，不导入。

## 12.8 为什么运行 bat 能“更新”

严格说，bat 不是“更新代码”，而是：

1. 启动一个新的 Python 进程
2. 重新导入最新的 `.py` 文件
3. 读取最新的日志/JSON
4. 写入最新的 HTML/data

所以：

```text
改了 .py + 重启 bat = 新代码生效
```

如果 Python 服务已经在运行：

```text
只改 .py，不重启 → 旧进程还在用旧代码
```

HTML/CSS/JS 改了：

```text
浏览器 Ctrl + F5 即可
```

## 12.9 bat 不会做什么

- 不会自动上传 GitHub
- 不会自动部署 Cloudflare
- 不会自动买域名
- 不会自动把本地文件推到线上

它只是“启动/执行本地程序”。

## 12.10 自动归档如何触发

- 启动英语服务 → `refresh_archive("english")`
- 启动数学服务 → `refresh_archive("math")`
- 每次英语答疑成功 → 归档
- 每次数学答疑/删除 → 归档

所以“打开服务自动归档”是真的，但只归档**本地日志**。

---

# 13. 一次问答的完整 API 生命周期

## 13.1 本地英语

```text
1. 用户在英语答疑页输入问题
2. JS 读取连接设置：本地
3. POST http://127.0.0.1:8767/api/tutor
4. server.py 调用 english_tutor.ask_tutor
5. ask_tutor 读共享 API Key
6. POST https://api.deepseek.com/chat/completions
7. DeepSeek 返回 choices[0].message.content
8. 写入 英语问答日志/<分类>.jsonl
9. 返回 JSON 给浏览器
10. 浏览器解析 answer
11. Markdown + KaTeX 渲染
12. 刷新历史
```

## 13.2 本地数学

同上，只是：

```text
8768
数学工具/server.py
math_tutor.py
topic
数学问答日志
```

## 13.3 云端直连

```text
浏览器
→ https://english-tutor...workers.dev/api/tutor
→ Worker 校验 token
→ Worker 调 DeepSeek
→ Worker 写 KV
→ 返回 JSON
→ 浏览器渲染
```

## 13.4 国内 SCF

```text
浏览器
→ https://<香港函数URL>/api/tutor
→ SCF 校验 PROXY_TOKEN
→ SCF 带 UPSTREAM_TOKEN 调 Worker
→ Worker 调 DeepSeek/写 KV
→ SCF 原样返回
→ 浏览器渲染
```

## 13.5 请求示例

```http
POST /api/tutor HTTP/1.1
Content-Type: application/json
X-Tutor-Token: <token>

{
  "subject": "math",
  "mode": "题目讲解",
  "topic": "极限",
  "question": "求 lim..."
}
```

## 13.6 响应示例

```json
{
  "ok": true,
  "subject": "math",
  "mode": "题目讲解",
  "topic": "极限",
  "time": "2026-10-30 21:10:36",
  "answer": "## ...\n\n\\[ ... \\]",
  "model": "deepseek-chat",
  "logged": true
}
```

## 13.7 为什么返回 Markdown，不返回 HTML

如果后端返回 HTML：

- 样式和页面耦合
- 容易 XSS
- 历史页/归档页无法复用
- 前端不能按需渲染公式

所以后端返回 Markdown + LaTeX，前端统一渲染。

---

# 14. 数学答疑：公式、知识分类、删除

## 14.1 两个维度

```text
mode：题目讲解 / 错题诊断 / 概念公式 / 方法其他
topic：极限 / 导数与微分 / 积分 / 三角函数 / 矩阵 / ...
```

这样历史不会只按“题目讲解”混在一起。

## 14.2 公式渲染链路

```text
API 返回 Markdown + LaTeX
→ renderMarkdown 保留公式
→ 把 \[...\] / $$...$$ 提成块
→ innerHTML
→ renderMathInElement
→ KaTeX 生成 DOM
```

## 14.3 历史原题

历史原题可能是裸 LaTeX，没有 `$`。  
页面用 `questionHtml` 包一层，再 `renderMath`。

## 14.4 删除

本地：

```text
/api/tutor-log-delete
→ 重写 JSONL
```

云端：

```text
/api/tutor-log-delete
→ 重写 KV index
```

删除后：

```text
刷新历史
刷新归档（服务端钩子）
```

## 14.5 数学归档

```text
数学答疑/归档/<topic>/<date>.html
```

每日页：

- 题目
- 回答
- KaTeX
- 返回主页

---

# 15. 自动归档：按分类、按天、自动更新主页

## 15.1 为什么需要归档

历史记录页只显示最近 20 条。  
要长期保存、按天查看，就需要静态归档。

## 15.2 归档脚本

文件：

```text
共享工具/归档答疑历史.py
```

配置：

```text
数学：log_dir=数学工具/数学问答日志
      archive_dir=数学答疑/归档
      category=topic
      hub=数学主页

英语：log_dir=词素工具/英语问答日志
      archive_dir=英语答疑/归档
      category=mode
      hub=英语主页
```

## 15.3 分组

```text
category → date → records
```

数学：

```text
极限/2026-10-30.html
```

英语：

```text
作文/2026-10-30.html
```

## 15.4 每日 HTML

内容：

- 顶部返回主页
- 分类/日期标题
- 每条：时间、mode、题目、回答
- 数学加载本地 KaTeX

## 15.5 主页 marker

数学主页：

```html
<!-- AI_ARCHIVE_START -->
<h2>AI 答疑历史</h2>
...
<!-- AI_ARCHIVE_END -->
```

英语主页：

```html
<!-- AI_ARCHIVE_START -->
<section class="hub-section" data-section="ai-history">
...
</section>
<!-- AI_ARCHIVE_END -->
```

脚本只替换两个 marker 之间的内容，其他内容不动。

## 15.6 自动触发

- 服务启动
- 答疑成功
- 删除记录

## 15.7 旧归档清理

脚本会删除：

- 不再对应任何记录的旧 HTML

避免删除答疑后旧归档还在。

## 15.8 GitHub 注意

归档是**本地生成**。

本地服务更新后，GitHub Pages 不会自动收到新 HTML。  
要线上可见，需要把：

```text
数学答疑/归档/...
英语答疑/归档/...
两个主页 HTML
```

提交/上传到 GitHub。

---

# 16. 部署手册：GitHub / Cloudflare / SCF / 本地

## 16.1 GitHub Pages

上传静态文件：

```text
英语答疑/英语答疑.html
英语答疑/英语答疑.css
英语答疑/英语答疑.js
数学答疑/数学答疑.html
数学答疑/数学答疑.css
数学答疑/数学答疑.js
数学答疑/归档/...
英语答疑/归档/...
两个主页 HTML/CSS
共享工具/归档答疑历史.py（可选，代码备份）
```

不要上传：

```text
共享配置/API.txt
词素工具/API.txt
数学工具/API.txt
英语问答日志/
数学问答日志/
备份目录
```

## 16.2 Cloudflare Worker

1. 打开 Worker
2. 编辑代码
3. 全选旧代码
4. 粘贴最新 `worker.js`
5. Deploy
6. 测 `/api/health`
7. 不改变 Secret/KV/URL

## 16.3 腾讯云 SCF

1. Node.js 18 函数
2. 粘贴 `tencent-scf/index.js`
3. 环境变量
4. 超时 120
5. 函数 URL：公网、开放、CORS 关闭
6. 测 `/api/health`
7. 页面国内 SCF 线路填函数 URL + `PROXY_TOKEN`

## 16.4 本地

英语：

```text
双击 启动词素服务.bat
→ 8767
```

数学：

```text
双击 启动数学答疑服务.bat
→ 8768
```

两个服务可以同时开。

## 16.5 更新顺序

```text
改后端 Worker → 部署 Cloudflare
改前端 HTML/CSS/JS → 上传 GitHub
改本地 Python → 重启两个 bat
改归档脚本 → 重启服务/手动运行
```

---

# 17. 安全、费用与常见坑

## 17.1 安全清单

- DeepSeek Key 只在本地/Worker Secret
- 页面永远不存 DeepSeek Key
- Cloudflare Token 只存页面 localStorage
- SCF `UPSTREAM_TOKEN` 只在 SCF 环境变量
- SCF `PROXY_TOKEN` 只存页面/SCF
- `.gitignore` 包含 API.txt、日志、备份
- GitHub 网页上传不会自动遵守 `.gitignore`，必须手动排除
- CORS 不是鉴权
- 访问口令放 localStorage 也不是绝对安全，但比写死源码好

## 17.2 费用

- GitHub Pages：免费
- Cloudflare Worker/KV：免费额度内基本够个人
- 腾讯云 SCF：按量，个人很低；Function URL 本身不额外收费
- DeepSeek：按 token，答疑很便宜

设置腾讯云预算/余额告警；不要开启不必要的 CLS 日志。

## 17.3 KV 限制

- 免费每天写入 1,000 个不同 key
- 同一个 key 每秒最多 1 次
- 最终一致
- 不适合当主数据库

## 17.4 国内访问

- `workers.dev` 国内可能不通
- 香港 SCF 做入口
- 不是“永久稳定”，网络会变
- GitHub Pages 国内也可能慢
- 需要稳定生产环境时，考虑国内服务器/备案/国内云函数

---

# 18. 这次踩过的真实坑与排查方法

## 18.1 API 网关停售

现象：无法创建 API 网关。

处理：改用 SCF Function URL。

教训：云产品会下线，部署文档要留替代方案。

## 18.2 广州 SCF fetch failed

现象：

```json
{"ok":false,"error":"无法连接上游 Cloudflare Worker：fetch failed"}
```

排查：

- 测 `/api/health`
- 看是函数错误还是上游网络
- 换香港区域
- 成功

教训：**函数 URL 正常 ≠ 函数能访问外网目标**。要测真实上游。

## 18.3 `ERR_INVALID_RESPONSE`

现象：浏览器打不开函数 URL，但 curl 能拿到 JSON。

原因：

- 函数 URL 自动加 `Content-Type`
- 函数又加了一个
- 重复头导致浏览器报错

处理：

- 函数响应不再重复设置 Content-Type
- 让 Function URL 自己加

教训：curl 能看到响应，不代表浏览器能接受；看响应头。

## 18.4 公式不渲染

现象：API 返回 `\[...\]`，页面显示原始 LaTeX。

原因：Markdown 渲染器只提取 `$$`。

处理：

- 增加 `\[...\]` 提取
- 历史原题裸 LaTeX 自动包裹
- 本地 KaTeX 渲染

教训：公式渲染失败先看 **API 原始返回** 用的是什么定界符。

## 18.5 历史记录溢出

原因：

- 手机端历史头部仍是横排
- 三个按钮 + 标题挤压
- 卡片没有 `min-width:0`

处理：

- 940px 以下单列
- 700px 以下头部纵向
- 卡片 `min-width:0; overflow:hidden`
- 按钮 flex-wrap

教训：响应式不是“加个 media query”，要测长文本和按钮。

## 18.6 本地 Key 401

现象：`Authentication Fails`。

原因：

- Key 失效/临时 Key 过期
- `api_key:true` 只代表文件非空

处理：

- 换有效 Key 到 `共享配置/API.txt`
- 重启服务
- 或使用云端 Worker 的 Key

## 18.7 页面旧版/缓存

现象：上传了 GitHub，但页面没变。

处理：

- `Ctrl + F5`
- 检查上传的是不是正确目录
- 检查 HTML/JS 大小
- 确认 Cloudflare 已 Deploy，不是只上传 GitHub

## 18.8 本地/云端不同步

这是设计，不是 bug：

- 本地日志只在本地
- KV 只在云端
- 删除只影响当前线路
- 英语待归档需要导出/导入
- 数学答疑记录需要导出/导入

---

# 19. 如果从零重写：建议的代码结构

## 19.1 最小版本

```text
project/
├─ index.html
├─ app.js
├─ server.py
├─ tutor.py
└─ API.txt
```

先做：

1. 页面输入问题
2. `fetch("/api/tutor")`
3. Python 接收
4. Python 调 DeepSeek
5. 返回 JSON
6. 页面显示

## 19.2 加历史

```text
logs/
  单词解释.jsonl
```

每次回答追加一行。

历史接口读取最近 N 条。

## 19.3 加鉴权

```text
X-Tutor-Token
```

本地服务可以简单校验；云端必须用 Secret。

## 19.4 加云端

```text
Worker
  /api/tutor
  /api/tutor-log
KV
  log:
  index:
```

## 19.5 加国内入口

```text
SCF proxy
  → Worker
```

## 19.6 加归档

```text
archive/
  category/
    date.html
```

不要过早抽象。  
先让一条链路跑通，再复制第二条。

---

# 20. 给你自己的学习路线：8 周

> 目标：不是“背完所有知识”，而是能独立重做这套系统，并能排查常见错误。
>
> 你的现状：HTML/CSS 会，Python 基础牢但模块少，JS 会一点 DOM，没系统学 ES6/框架。
>
> 所以路线要“少而准”，不要一上来学 React/Vue。

## 第 1 周：HTTP、JSON、浏览器 Network

### 学

- 请求/响应
- GET/POST/OPTIONS
- 状态码
- Headers
- JSON
- 同源/CORS

### 做

1. 打开任意网页 DevTools → Network
2. 找一个 XHR/fetch 请求
3. 看 Request URL、Method、Headers、Payload、Response
4. 用 `curl` 请求一次 `/api/health`
5. 用 Python `urllib.request` 请求一次

### 检查点

你能解释：

```text
为什么页面能打开，但 API 报 401？
为什么 API 返回 200，但浏览器报 CORS？
```

## 第 2 周：Python 模块、文件、日志

### 学

- `pathlib`
- `json`
- `argparse`
- `datetime`
- `try/except`
- `if __name__ == "__main__"`
- 模块导入与 `sys.path`

### 做

1. 写一个 `save_log.py`，把 JSON 追加到 `.jsonl`
2. 写一个 `read_log.py`，读取最近 10 条
3. 写一个 `backup.py`，复制文件
4. 把三个脚本拆成模块，用另一个脚本导入

### 检查点

你能解释：

```text
为什么 python server.py 能跑，但 import server 会执行服务？
```

（答：顶层代码/`main()` 的区别。）

## 第 3 周：Python HTTP 服务

### 学

- `http.server`
- `BaseHTTPRequestHandler`
- `do_GET` / `do_POST`
- `Content-Length`
- `Content-Type`
- CORS

### 做

1. 用标准库写一个 `/api/health`
2. 写一个 `/api/echo`，返回请求 JSON
3. 加一个静态 HTML
4. 用浏览器 fetch 调它
5. 加 404/400 错误 JSON

### 检查点

你能独立解释：

```text
为什么浏览器 fetch 本地服务会 CORS？
为什么 POST 的 body 要按 Content-Length 读？
```

## 第 4 周：JS ES6 + DOM + fetch

### 只学这些 ES6

- `let` / `const`
- 模板字符串
- 箭头函数
- 解构
- 默认参数
- `Promise`
- `async/await`
- `fetch`
- 可选链 `?.`
- 模块 `import/export`（先了解）

### 做

1. 一个输入框 + 按钮
2. `fetch` 调 `/api/echo`
3. 显示 JSON
4. 加 loading/error
5. 用 `localStorage` 保存一个设置
6. 用 `AbortController` 做超时

### 检查点

你能解释：

```text
await 到底在等什么？
try/catch 为什么能接住 fetch 失败？
```

## 第 5 周：AI API 与 Prompt

### 学

- Chat Completions 请求结构
- system/user 消息
- temperature
- max_tokens
- 超时
- 错误码 401/402/429/500
- Prompt 的角色、格式、边界

### 做

1. 用 Python 调一次 DeepSeek
2. 打印 `choices[0].message.content`
3. 加 system prompt
4. 加 JSON 输出约束
5. 加超时和错误处理

### 检查点

你能解释：

```text
为什么 AI 返回的是字符串，不是 Python dict？
为什么不能让前端直接带 Key？
```

## 第 6 周：Cloudflare Worker + KV

### 学

- Worker `fetch` 入口
- `env`
- Secret/变量
- CORS
- KV `get/put/list`
- 最终一致性
- 限流

### 做

1. 部署 `/api/health`
2. 部署 `/api/echo`
3. 加 token 校验
4. 加 KV 写日志
5. 加历史读取
6. 用 curl 测

### 检查点

你能解释：

```text
为什么 Worker 不能写本地文件？
为什么 index 比 list 更合适？
```

## 第 7 周：SCF / Function URL / 网络

### 学

- Serverless 函数
- Function URL
- 事件对象
- 环境变量
- 反向代理
- 超时
- CORS
- 国内/香港网络差异

### 做

1. 创建 Node.js 18 函数
2. 写一个返回 JSON 的 handler
3. 开函数 URL
4. 代理到你的 Worker `/api/health`
5. 测广州/香港
6. 页面加国内线路

### 检查点

你能解释：

```text
为什么函数 URL 正常，但调 Worker 会 502？
为什么页面 token 和上游 token 要分开？
```

## 第 8 周：整合、归档、部署

### 做

1. 英语/数学两套页面
2. 本地/云端连接
3. 历史/删除
4. 每日归档
5. 主页板块
6. GitHub 上传
7. Cloudflare 部署
8. 安全清单

### 检查点

你能从零复述：

```text
浏览器 → 本地/SCF → Worker → DeepSeek
数据 → JSONL/KV → 归档/主页
```

## 学习原则

1. **一次只改一个变量**：先本地，再云端，再 SCF。
2. **先跑通最小链路**：`/api/health` → `/api/echo` → `/api/tutor`。
3. **错误先看 Network/服务端日志**，不要猜。
4. **不要复制一大段代码不理解**：每次只加一个函数。
5. **不要过早学框架**：这套项目用原生 JS + 标准库完全够。
6. **写小测试**：一个 `curl`、一个最小 HTML，比反复刷新大页面快。
7. **Secret 不进代码**。

---

# 21. 项目重建里程碑与练习

## 里程碑 1：静态聊天页

- 输入框、按钮、回答区
- 不调 API，先用假数据
- 练习 DOM、事件、模板字符串

## 里程碑 2：本地 echo API

- Python 标准库
- `/api/echo`
- 页面 fetch
- 练习 HTTP/JSON/CORS

## 里程碑 3：本地 AI

- `/api/tutor`
- DeepSeek Key
- 历史 JSONL
- 练习错误处理/超时

## 里程碑 4：本地词库

- `word_archiver`
- 分类
- HTML/data.json
- 额外新增
- 练习文件写入/备份

## 里程碑 5：Cloudflare Worker

- `/api/tutor`
- token
- KV 日志
- 练习 Secret/CORS/限流

## 里程碑 6：待归档

- `/api/pending-word`
- `/api/pending-words`
- 本地导入
- 练习队列/去重

## 里程碑 7：国内 SCF

- Function URL
- 代理
- 三层 token
- 练习网络排查

## 里程碑 8：数学

- 数学人设
- topic
- 公式
- 删除
- 练习 params/KaTeX

## 里程碑 9：归档

- 按分类/天
- 主页 marker
- 自动触发
- 练习静态生成

## 里程碑 10：部署与安全

- GitHub
- Cloudflare
- SCF
- .gitignore
- 预算告警

---

# 22. 术语表与最终检查清单

## 22.1 术语表

| 术语 | 解释 |
|---|---|
| API | 程序之间约定的接口 |
| JSON | 数据交换格式 |
| CORS | 浏览器跨域策略 |
| Token | 访问口令 |
| Secret | 平台保存的敏感变量 |
| KV | 键值存储 |
| Worker | Cloudflare 的 Serverless 函数 |
| SCF | 腾讯云云函数 |
| Function URL | SCF 的 HTTPS 函数入口 |
| 反向代理 | 国内入口转发到 Cloudflare |
| JSONL | 一行一个 JSON 的日志文件 |
| KV index | 最近记录索引 |
| KaTeX | 数学公式渲染库 |
| localStorage | 浏览器本地存储 |
| iframe | 页面中嵌入另一个页面 |
| marker | 自动生成区块的边界注释 |

## 22.2 最终检查清单

### 本地

- [ ] 8767 能启动
- [ ] 8768 能启动
- [ ] `共享配置/API.txt` 有效
- [ ] 英语答疑可回答
- [ ] 数学答疑可回答
- [ ] 公式可渲染
- [ ] 历史可筛选
- [ ] 删除可生效
- [ ] 归档 HTML 生成
- [ ] 主页 AI 历史出现

### 云端

- [ ] Worker 已部署最新代码
- [ ] `/api/health` 返回 ok
- [ ] 英语 Cloudflare 线路可用
- [ ] 数学 Cloudflare 线路可用
- [ ] 待归档单词可导出
- [ ] 数学记录可删除
- [ ] SCF `/api/health` 返回 ok
- [ ] 国内 SCF 线路可用

### GitHub

- [ ] 最新答疑页 HTML/CSS/JS
- [ ] 最新主页 HTML
- [ ] 归档 HTML
- [ ] 没有上传 API.txt/日志
- [ ] Ctrl + F5 后页面正常
- [ ] 响应式无横向滚动

### 安全

- [ ] Key 不在 JS/HTML
- [ ] Token 不在 GitHub
- [ ] `.gitignore` 覆盖 Key/日志/备份
- [ ] 腾讯云预算告警
- [ ] 不在聊天/截图暴露 Token

---

## 最后一段话

这套系统真正的价值，不是“调用了 DeepSeek”，而是：

```text
你知道问题从哪来
知道它经过哪
知道它存在哪
知道哪一层坏了该怎么查
```

你现在的水平已经足够继续扩展：

- 政治答疑：复制数学结构，换 prompt/topic/页面
- 信息技术答疑：同样
- 更多科目：共用 Worker、KV、SCF、公共 AI 窗口
- 本地归档：共用 `共享工具/归档答疑历史.py`

但不要一次加太多。  
每次只做一条链路：

```text
页面 → API → 数据 → 显示
```

一条链路稳定后，再加下一条。

这就是“喝水式”的搭建方式。
