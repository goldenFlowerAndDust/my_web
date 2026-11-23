# DSH 笔记站 · 交接说明（Markdown → 网页体系）

> **30 秒速览**：把 `.md` 丢进 `DSH-woker/<科目>/<分类>/`，跑一次 `node build.mjs`，脚本会把它编译成网页，自动出现在目录页里。没有数据库、没有服务器、没有框架，纯静态，双击就能看。

---

## 1. 这是什么

一套「Markdown 笔记 → 静态网页」的最小系统，服务于专升本备考资料。

核心思路：**内容只有一个数据源（md），页面全部由脚本生成**。

- 不手写 `<a>` 标签，加一篇笔记不用改任何 HTML
- 目录页只加载「索引」（元数据），点开某篇才加载「正文」，所以笔记再多也不拖慢首屏
- 公式用本地 KaTeX 渲染，离线可用

---

## 2. 放在哪（绝对路径）

```text
D:\GitHub\my_web\内容文件夹\专升本备考\DSH-woker\
```

工作区：`D:\GitHub\my_web\内容文件夹\专升本备考`
操作系统：Windows

---

## 3. 目录结构

```text
DSH-woker/
├─ README.md                     ← 本文件
├─ 共享配置/                      ← 所有科目共用，不要放笔记
│  ├─ css/notes.css              ← 目录页 + 阅读页样式（深色模式、响应式、打印）
│  ├─ js/index.js                ← 目录页：分组、搜索、分类筛选、统计
│  ├─ js/reader.js               ← 阅读页：路由、按需加载、目录、翻页、字号、主题
│  ├─ vendor/katex/              ← 本地 KaTeX（katex.min.js/css、auto-render、fonts/）
│  ├─ tools/build.mjs            ← 构建脚本（Node ESM，无第三方依赖）
│  ├─ tools/构建笔记.bat         ← 双击构建
│  └─ 说明.md                    ← 面向使用者的操作说明
├─ 英语/
│  ├─ index.html                 ← 自动生成：笔记目录
│  ├─ view.html                  ← 自动生成：阅读模板
│  ├─ data.js                    ← 自动生成：索引（只有元数据）
│  ├─ data.json                  ← 自动生成：同样的数据，给外部工具读
│  ├─ content/                   ← 自动生成：正文，每篇一个 js
│  ├─ 语法/  ├─ 后缀/  ├─ 词根/  └─ 构词/
├─ 数学/     公式速查/ · 不定积分/
├─ 信息技术/ （暂无笔记）
└─ 政治/     （暂无笔记）
```

**规则**：`index.html`、`view.html`、`data.js`、`data.json`、`content/*.js` 全部由构建生成，**不要手改**，改了下次构建会被覆盖。

---

## 4. 数据格式（两个文件）

### 4.1 索引 `data.js`（目录页与阅读页共用的入口）

```js
window.DSH_INDEX = {
  subject: "数学",
  subjectName: "数学",
  description: "……",
  generatedAt: "2026-11-19 14:36",
  docs: [
    {
      slug: "不定积分/不定积分第二类换元法",   // 相对路径去掉 .md
      title: "不定积分第二类换元法",
      category: "不定积分",                      // 一级子目录名
      summary: "一句话：……",                    // 正文第一段，截断 96 字
      chars: 7011,                               // 去空白字符数
      updated: "2026-11-18",                     // md 文件修改日期
      file: "content/a74063fc5b.js"              // 正文文件名 = sha1(slug) 前 10 位
    }
  ]
};
```

### 4.2 正文 `content/<hash>.js`（每篇一个）

```js
window.__DSH_DOC = {
  slug: "不定积分/不定积分第二类换元法",
  title: "不定积分第二类换元法",
  category: "不定积分",
  html: "<blockquote><p>……</p></blockquote>\n<h2 id=\"sec-1\">……",
  toc: [ { id: "sec-1", text: "一、先分清", level: 2 } ],
  chars: 7011,
  updated: "2026-11-18"
};
```

正文是**预渲染好的 HTML**，阅读页不再解析 Markdown，直接把 `html` 注入即可。

---

## 5. 构建做了什么（`共享配置/tools/build.mjs`）

对每个科目目录依次执行：

1. **扫盘**：递归找出所有 `.md`（`fs.readdirSync` + `path`），一级子目录名作为分类，根目录下的记为「未分类」
2. **转 HTML**：自写转换器把 md 转成 HTML，同时收集 h2/h3 生成 `toc`，第一个 `# 标题` 作为 `title` 并从正文移除
3. **写正文**：`content/<sha1(slug) 前10位>.js`，内容为 `window.__DSH_DOC = {...}`
4. **写索引**：`data.js`（`window.DSH_INDEX`）与 `data.json`
5. **写页面**：`index.html`、`view.html` 由模板生成（每个科目一份，内容相同、科目名不同）
6. **清理**：删掉旧版整包文件 `docs.js` / `docs.json`，并清空上一轮生成的 `content/*.js`（避免删笔记后留孤儿文件）

排序：先按分类（`CATEGORY_ORDER` 里定义的顺序：语法/词法/后缀/前缀/词根/构词/阅读/写作/真题/其他/未分类），再按标题中文排序。

---

## 6. 运行时怎么加载

### 目录页 `index.html`

```text
index.html
  ├─ <script src="./data.js">       ← 索引（实测约 0.4 KB/篇）
  └─ <script src="../共享配置/js/index.js">
                                    → 渲染分组卡片、搜索、分类 chips、统计
```

### 阅读页 `view.html`

```text
view.html
  ├─ <script src="./data.js">              ← 只拿索引
  ├─ KaTeX（katex.min.js + auto-render）
  └─ <script src="../共享配置/js/reader.js">
        → 解析 #doc=<slug>
        → 动态创建 <script src="content/xxx.js"> 取正文
        → 注入 html、生成左侧目录、渲染公式、建上下篇
```

**路由约定**：`#doc=<encodeURIComponent(slug)>`。

- 只有 `#doc=` 开头才会触发换文章
- 左侧目录点击**不改地址栏 hash**，用 `scrollIntoView` 直接滚，避免和路由打架

**正文用 `<script>` 加载而不是 `fetch`**，因为 `file://` 下 fetch 会被 CORS 拦截；用 script 标签，双击本地文件也能正常读。

---

## 7. 新增一篇笔记（三步）

```text
1. 把 xxx.md 放进  DSH-woker/<科目>/<分类>/
2. 双击  DSH-woker/共享配置/tools/构建笔记.bat
   （或在该目录执行  node build.mjs）
3. 刷新  DSH-woker/<科目>/index.html
```

命令行方式：

```powershell
cd "D:\GitHub\my_web\内容文件夹\专升本备考\DSH-woker\共享配置\tools"
node build.mjs
```

构建输出示例：

```text
✓ 英语：9 篇，索引 3.7 KB
✓ 数学：2 篇，索引 1.0 KB
✓ 信息技术：0 篇，索引 0.2 KB
✓ 政治：0 篇，索引 0.2 KB
```

构建是可重复执行的，不会破坏已有内容。

---

## 8. md 写作约定

- **首行 `# 标题`** 会作为笔记标题，正文里不再重复显示
- `##`、`###` 自动进入左侧目录
- 如果写了「## 目录」这一节，构建时**自动跳过**（避免和左侧导航重复）
- 公式：行内 `$...$`，独立 `$$...$$`，交给 KaTeX
- 支持：标题、段落、有序/无序列表（2 空格缩进表示嵌套）、引用块、代码块、行内代码、粗体/斜体/删除线、链接、图片、表格、分隔线
- 摘要取正文第一段（引用块也算），超过 96 字截断
- 文件名可以中文；`slug` 就是相对路径去掉 `.md`，所以**不同分类下同名文件不会冲突**

---

## 9. 四个主页怎么接的

主页在：

```text
D:\GitHub\my_web\内容文件夹\自建本地网站\导航栏内容\专升本\<科目>\专升本<科目>.html
```

各自的接入方式不同，**别再改错地方**：

- **英语**：hero 快捷链接里加了 `DSH 笔记` 按钮，正文新增 `07 · DSH NOTES` 板块（`.hub-section` + `.resource-card`）
- **数学**：在 `<ol><li>` 的**最前面**加了 `<h2>DSH 笔记</h2>` + `<ul>` 链接，由 `专升本-博客.js` 渲染成第一张卡片
- **信息技术 / 政治**：`<body>` 上加了 `data-eyebrow` / `data-description` / `data-footer`，`<ol><li>` 里放 DSH 笔记内容，同一套脚本渲染

> `专升本-博客.js` 里，原来首屏文案是写死的「MATH · STUDY HUB」，现在改成读 `body.dataset.*`，**不传就保持原值**，所以数学页不受影响。
>
> 另外：该脚本原先只读 `<ol>` 的**第一个 `<li>`**，后来加了 AI 答疑再分段写 `<li>`，后面的内容会被整段忽略（DSH 笔记卡片就是这样丢的）。现已改成**按顺序合并所有 `<li>` 的子节点**，多段书写不会再丢内容。

---

## 10. 设计约束（踩过的坑）

- **`file://` 不能 fetch**：所以索引与正文都用 `<script>` 注入
- **一个 json 会撑爆**：索引只放元数据（约 0.4 KB/篇），正文按篇独立；单科索引建议控制在 500 KB 以内（约 1200 篇），超了就在 build 里按分类再拆索引
- **正文文件名用哈希**：新增笔记不会让旧文件改名，浏览器缓存不会失效
- **路由与锚点必须分开**：早期把 `#sec-3` 也当成「换文章」，导致第一次点目录就跳回顶部、还渲染成第一篇
- **KaTeX 本地化**：`vendor/katex/` 含字体，不依赖 CDN
- **`$$` 必须整块处理**：早期被拆成 `<p>$$</p>`，公式完全匹配不到

---

## 11. 验证与排错

### 快速自检

```powershell
node --check "共享配置\js\reader.js"
node --check "共享配置\js\index.js"
node --check "共享配置\tools\build.mjs"
```

### 无头截图（可选，用来眼见为实）

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless=new --disable-gpu --no-sandbox `
  --user-data-dir="<临时目录>" --hide-scrollbars `
  --virtual-time-budget=6000 `
  --screenshot="<输出.png>" --window-size=1440,1500 `
  "file:///D:/GitHub/my_web/内容文件夹/专升本备考/DSH-woker/数学/view.html#doc=<url编码后的slug>"
```

### 症状对照

- **目录页空白 / 提示「索引没加载」** → `data.js` 不存在，跑一次构建
- **点开笔记一直「正在加载正文」** → `content/` 下缺文件，或索引与正文不是同一次构建的产物，重新构建
- **公式显示成 `$...$` 原文** → 检查 delimiters、`vendor/katex/` 是否齐全
- **改了样式没生效** → 浏览器缓存，Ctrl+F5
- **目录点了不动** → 旧版 `reader.js` 被缓存，Ctrl+F5
- **GitHub Pages 上没变化** → 本地改完要 `git add / commit / push`，静态托管不会自动同步

---

## 12. 不要做的事

- 不要手改 `index.html`、`view.html`、`data.js`、`data.json`、`content/*.js`
- 不要在 `共享配置/` 里放笔记
- 不要删 `content/` 里的文件（会失配），要删就删源 md 再构建
- 不要把 KaTeX 换成 CDN 链接（会失去离线能力）

---

## 13. 当前内容清单（截至 2026-11-19）

- **英语 9 篇**
  - 语法：`v+ing 形式知识点总结`、`-ly 结尾词族知识点总结`
  - 后缀：`-less 后缀详解`、`-ful 后缀详解`
  - 词根：`quire 单词详解`、`tank 词根辨析`、`port 词根详解`
  - 构词：`re+n 前缀构词法`、`grand 详解`
- **数学 2 篇**
  - 公式速查：`高数常用公式速查`
  - 不定积分：`不定积分第二类换元法`
- **信息技术 / 政治**：暂无，页面已建好，放 md 即可

`_preview/` 目录是验证用的截图，可随时整个删除，不影响功能。

---

## 14. 给接手者的最短路径

1. 读本文件第 3、4、5、7 节，就能加内容、能改数据
2. 想改样式 → 只动 `共享配置/css/notes.css`
3. 想改目录页行为 → `共享配置/js/index.js`
4. 想改阅读页行为 → `共享配置/js/reader.js`
5. 想改编译规则（分类、排序、模板）→ `共享配置/tools/build.mjs`，改完必须重新构建
