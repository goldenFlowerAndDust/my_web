# 词素自动归档工具

输入一个英文单词，DeepSeek 分析构词方式，自动写入对应的词族或词素页面，并同步加入 `复习清单/data.json` 的每日复习日程。

## 文件

| 文件 | 作用 |
| --- | --- |
| `词素工具/word_archiver.py` | API 调用、构词校验、页面写入、data.json 追加 |
| `启动词素服务.bat` | 双击启动服务（使用 DSH 自带 Python） |
| `word_server.py` | 启动器的 ASCII 路径入口 |
| `词素工具/server.py` | 本地 HTTP 服务，给网页工具提供 API，并防止 Key 被静态访问 |
| `词素工具/auto_archive.py` | 命令行入口，也是 skill 的底层工具 |
| `词素工具/API.txt` | 本地 API Key（和 py 同目录；已 gitignore；不要提交、不要发给别人） |
| `单词模块/词汇代码生成器.html` | 网页界面：输入、分析、写入 |
| `英语答疑/英语答疑.html` | 资深英语教师答疑：单词解释、作文反例、句子分析、语法问答 |
| `导入待归档单词.bat` | 把云端待归档单词 JSON 拖入后分类写入 |
| `整理云端下载.bat` | 把浏览器下载的两类 JSON 分到“云端下载”子文件夹 |
| `词素工具/organize_cloud_downloads.py` | 下载文件整理脚本 |
| `词素工具/import_pending_words.py` | 待归档单词导入脚本 |
| `词素工具/english_tutor.py` | 答疑 API、教师人设、按分类日志 |
| `skills/english-tutor/SKILL.md` | 资深英语教师答疑 skill |
| `cloudflare-worker/worker.js` | 可选：GitHub Pages 用的云端答疑代理 |
| `cloudflare-worker/README.md` | Cloudflare Worker 部署步骤 |
| `tencent-scf/index.js` | 可选：腾讯云 SCF 函数 URL 国内反向代理 |
| `tencent-scf/README.md` | 腾讯云 SCF / 函数 URL 部署步骤 |
| `添加日志.html` | 查看最近自动添加的单词、分类、文件和时间 |
| `skills/word-auto-archive/SKILL.md` | 给 agent 使用的项目 skill 说明 |
| `词素工具/backups/` | 每次写入前的自动备份 |
| `词素工具/归档日志.jsonl` | 每次成功归档的记录 |

## 启动

**推荐：双击项目根目录的 `启动词素服务.bat`。** 它会自动使用 DeepSeek Harness
自带的 Python，不要求系统 PATH 里有 `python`。

如果想用命令行，使用自带 Python：

```powershell
& "$env:USERPROFILE\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe" "词素工具\server.py"
```

或者确认系统 Python 3.10+ 已加入 PATH 后：

```powershell
python 词素工具/server.py
```

> Windows 的 `python` 可能只是 Microsoft Store 的“应用执行别名”，会提示
> “Python was not found”。这不是项目错误，用上面的 `.bat` 或自带 Python 路径即可。

然后打开：

```text
http://127.0.0.1:8767/单词模块/词汇代码生成器.html
```

如果通过你原来的静态服务器打开工具页（不是 8767），页面会自动请求
`http://127.0.0.1:8767`，因此仍然需要启动这个服务。

## 网页用法

1. 输入英文单词；可选填中文提示。
2. `AI 分析（不写入）`：只看分类、构词、卡片预览。
3. `分析并写入`：真正修改页面和 `data.json`。
4. 写入完成后可以直接打开写入页面，或进入词汇复习清单。

## 英语答疑

```text
http://127.0.0.1:8767/英语答疑/英语答疑.html
```

- 人设：资深英语教师，中文讲解、英文例句。
- 四类：单词解释、作文（审题 + 反例 + 问题诊断 + 修改 + 范文）、
  句子分析、语法/其他。
- 前端只调用 `POST /api/tutor`；Key 只在服务端读取。
- 每次成功回答自动写入对应分类的 JSONL：
  `词素工具/英语问答日志/{单词解释,作文,句子分析,其他}.jsonl`，
  字段包含 `time / mode / question / answer / model / duration_ms`。
- 页面历史记录调用 `GET /api/tutor-log?category=作文&limit=20`；
  `category=all` 合并全部分类。
- 日志目录已加入 `my_web/.gitignore`，不会静态暴露，也不要上传 GitHub。
- **单词解释模式会自动收录目标单词**：本地直接归档；云端先进入“待归档单词”队列。
- 作文、句子分析、其他模式只答疑，不自动收词。

### 云端待归档单词

云端 Worker 不能直接改本地 HTML / `data.json`，所以：

1. 云端答疑识别到单词后，写入 KV 的 `pending:` 队列；
2. 答疑页历史记录右上角点 **导出待归档单词**，下载 `英语答疑待归档单词-*.json`；
3. 把 JSON 拖到项目根目录的 `导入待归档单词.bat`；
4. 本地 `word_archiver.py` 统一分类、写入 HTML 和 `data.json`，
   标记为“明天额外新增”（不占 20 词）；
5. 已存在的词会跳过，不会重复。

也可以手动运行：

```powershell
python 词素工具/import_pending_words.py "英语答疑待归档单词-2026-10-30-0420.json" --write
```

> 需要重新部署包含 `/api/pending-word`、`/api/pending-words` 的 Worker；
> 旧 Worker 没有这两个接口。

### 浏览器下载整理

浏览器不允许网页自动把文件写进指定子文件夹。下载后双击：

```text
整理云端下载.bat
```

它会扫描“下载”、项目根目录和 `云端下载/`，按文件名移动：

```text
英语答疑记录-*.json       → 云端下载/答疑归档/
英语答疑待归档单词-*.json → 云端下载/待归档单词/
```

两个导出文件的区别：

- **导出答疑记录**：完整问题 + 回答日志，没有结构化的 `word` 字段；
  拖到 `导入答疑记录.bat`。
- **导出待归档单词**：才有 `word` 字段，拖到 `导入待归档单词.bat`。
  不要拿答疑记录去当待归档单词导入。

### 云端记录导回本地

1. 在答疑页“历史记录”右上角点 **导出记录**，下载 `英语答疑记录-*.json`；
2. 把 JSON 拖到项目根目录的 `导入答疑记录.bat` 上；
3. 脚本按分类合并到 `词素工具/英语问答日志/*.jsonl`，重复记录跳过，
   原日志备份到 `词素工具/英语问答日志备份/`。

也可以手动运行（先预览，再加 `--write`）：

```powershell
python 词素工具/import_tutor_logs.py "英语答疑记录-2026-10-30-0315.json"
python 词素工具/import_tutor_logs.py "英语答疑记录-2026-10-30-0315.json" --write
```

> 云端 Worker 的历史索引每个分类保留最近 50 条；导出按钮会导出这 50 条/分类。
> 更早的云端记录仍在 KV 的 `log:` 键里，但页面历史默认不展示。

### 云端模式（可选）

如果要把网页放到 GitHub Pages，可部署 `cloudflare-worker/` 的 Worker：
页面“连接设置”选“云端”，线路选 `Cloudflare`，填 Worker 地址和访问口令。
Key 存 Cloudflare Secret，日志存 KV；访问口令只存在浏览器 localStorage。
具体步骤见 `cloudflare-worker/README.md`。

如果国内访问 `workers.dev` 不稳定，可以再加腾讯云 SCF 反向代理：

```text
国内浏览器 → 腾讯云 SCF 函数 URL → 现有 Cloudflare Worker → KV
```

不买服务器、不买域名；函数 URL 自带 HTTPS 默认域名，不需要备案。  
页面“连接设置”里线路选 `国内 SCF`，填 SCF 地址和 `PROXY_TOKEN`。
Cloudflare 线路的地址和口令会单独保存，不会被覆盖。  
部署步骤见 `tencent-scf/README.md`。

## 复习打卡自动写回 data.json

复习清单在 8767 服务开启时，会把每次“学完/复习完成/撤销/保存”直接写回
`复习清单/data.json`，不再需要每次导出后手动覆盖：

```text
浏览器完成一条
  → POST http://127.0.0.1:8767/api/review
  → 校验后原子写入 复习清单/data.json
  → 刷新日历/原复习页即可看到
```

- 打开页面本身不会改数据，只有打卡/撤销/保存动作才写；
- 服务没开或网络失败时，记录先放在浏览器 `reviewPendingChanges`；
- 下次打开页面会自动尝试同步，也可以点“保存”重试；
- 每次写回前会覆盖 `复习清单/data.json.bak`，并按天保留
  `词素工具/review_backups/data-日期.json`；
- “导出 data.json”仍保留，但只用于备份或手动迁移，日常不需要。

> **GitHub Pages 限制：** GitHub Pages 是静态托管，线上页面不能修改仓库里的
> `data.json`。自动写回只发生在本地 `127.0.0.1:8767` + 本地文件；线上复习只会
> 写当前浏览器的 localStorage。要让 GitHub 版本更新，需要在本地复习后
> `git add / commit / push`（或 GitHub Desktop 上传）。不要把 GitHub Token
> 放进网页。

## 已录入检查（不插队）

网页上的“检查是否已录入”只读，不调用 DeepSeek；CLI 也可以：

```powershell
python 词素工具/auto_archive.py "friendship" --check
```

如果单词已经在核心词页、词素页或 `data.json` 中：

- 不新建词卡；
- 返回“已录入”；
- 不修改 `nextDate`，不写 `priority`，也不再提供“插队”。

## 新词：额外新增

从词汇代码生成器或答疑自动归档的新词：

- 写入对应 HTML 和 `data.json`；
- 打上 `extra: true`、`extraDate: 第二天`；
- **不占每天 20 个新词配额**；
- 第二天出现在复习清单的“额外新增”；
- 没复习完会继续保留；
- 完成后按正常 1/3/7/15/30/60/90 天间隔复习。

当天总量因此可以是：

```text
20 新词 + 20 复习 + 额外新增 = 40+
```

已有词不会重复创建，也不会插队。

## 命令行用法

```powershell
# 只分析，不写文件
python 词素工具/auto_archive.py "friendship" --analyze

# 分析并写入
python 词素工具/auto_archive.py "friendship" --write

# 机器可读输出
python 词素工具/auto_archive.py "sunflower" --write --json
```

## 分类去向

| 类型 | 去向 |
| --- | --- |
| 后缀 `suffix` | `专升本英语核心词汇通关.html` 对应 `-xxx` 词族；没有该词族时自动新建 |
| 前缀 `prefix` | `专升本英语核心词汇通关.html` 对应 `un-` / `re-` 等前缀族 |
| 自由词根 `root_family` | `词素/词根-本体-变体【派生词】/` |
| 黏着词根 `root_family` | `词素/词根族/` |
| 复合词 `compound` | `词素/复合词/` |
| 原子词 `atom` | `词素/原子词/` |

写入 `data.json` 时统一使用 `kind: "word"`，因此：

- 词汇复习清单只把 `kind: word` 的词条放入每日 20 个新词 / 20 个旧词；
- 旧的页面条目仍出现在“全部词条”总览里，但不占每日 20 词配额；
- 新词会排到最近一个不足 20 词的日期；排满后自动顺延到下一天。

## 安全与验证

- API Key 只在 Python 服务端读取；浏览器只请求 `/api/analyze`、`/api/check`、`/api/archive`、`/api/review`、`/api/log`、`/api/tutor`、`/api/tutor-log`、`/api/pending-word` 和 `/api/pending-words`。
- 静态服务禁止访问 `/词素工具/`，避免工具目录、日志、备份被浏览器读到。
- 写入前会在 `词素工具/backups/时间戳/` 备份被修改的文件。
- 已录入的词（核心词页、词素页、data.json）不会重复创建；工具返回“已录入”，
  不修改日程，也不插队。
- 新词写入后进入第二天的“额外新增”，不占每日 20 词。 
- API 失败、JSON 不合法、词缀与单词不匹配时不会写入。
- 每次写入后应检查：
  - `data.json` 中该词的 `category`、`kind`、`created`、`nextDate`；
  - 目标页面包含该词和 `#word-xxx` 锚点；
  - 词汇复习清单能加载该分类。

> 旧的 `复习清单/生成json索引.js` 和 `重排计划.js` 只理解页面级索引，
> 不要直接运行它们覆盖当前 `data.json`；需要重建时先备份，并保留
> `核心词汇通关`、`词素/...` 与所有 `kind: "word"` 条目。

## 删除 API Key

使用完本阶段后，直接删除：

```text
词素工具/API.txt
```

如果曾使用旧位置，也检查一下 `词素工具/api_key.txt` 和用户目录
`.word_archiver_api_key` 并删除。

> `API.txt` 位于网站目录内，所以请使用本项目自带的 8767 服务（它屏蔽了
> `/词素工具/`），或确认你自己的静态服务器不会把整个项目目录暴露出去。

## 上传 GitHub 前检查

- **`词素工具/API.txt` 是本地 Key，绝不能上传。** `.gitignore` 已包含它，但 GitHub
  网页“Upload files”不会自动忽略文件，必须手动排除。
- 如果用 GitHub 网页上传，直接**不要上传 `词素工具/` 整个目录**；静态网站不需要它。
- 要排除 `词素工具/`、`backups/`、`review_backups/`、`归档日志.jsonl`、
  `data.json.bak`、`英语问答日志/`、`英语问答日志备份/`。
- 静态网站只需要 HTML/CSS/JS、`复习清单/data.json`、`词素/`、`每月打卡/` 等。
- 页面里引用了 `../../../../frontend——前端/...`。如果只上传 `备考专升本英语`
  一个文件夹，复习/日历/词素页会丢样式；建议上传整个 `my_web` 仓库，
  或至少保留 `内容文件夹/frontend——前端` 的相对位置。
- `data.json` 是学习进度；公开仓库会公开它。介意的话用私有仓库。
- GitHub Pages 不能写回 `data.json`，线上复习只存在浏览器；
  要更新仓库，需要本地服务写好后 commit/push，或在线上“导出 data.json”后手动上传。

> 如果曾经把 `API.txt` 上传到公开仓库，立即删除文件并作废/更换 Key。
