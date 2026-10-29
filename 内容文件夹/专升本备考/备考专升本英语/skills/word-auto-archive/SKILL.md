---
name: word-auto-archive
description: 把一个或多个英文单词通过 DeepSeek 构词分析，自动写入专升本核心词汇词族或词素（词根/复合词/原子词）页面，并追加到 data.json 的每日复习日程。用于用户说“添加单词/收词/自动分类/扩充词库”时。
---

# 单词自动归档

## 何时使用

用户要求：

- 把某个英文单词加入专升本词汇库；
- 自动判断单词是后缀、前缀、词根、复合词还是原子词；
- 扩充 `专升本英语核心词汇通关.html` 或 `词素/` 下的分类；
- 把新词加入第二天的“额外新增”，不占每天 20 个新词配额。

## 前置条件

- 工作目录是 `备考专升本英语`（或能解析到它的绝对路径）。
- Python 可用；API Key 位于 `词素工具/API.txt`（和 py 同目录），或环境变量 `DEEPSEEK_API_KEY`。
- 如果要用网页界面，启动 `python 词素工具/server.py`，打开
  `http://127.0.0.1:8767/单词模块/词汇代码生成器.html`。

## 标准流程

1. **先检查是否已录入，不要重复调用 API**
   - 搜索 `专升本英语核心词汇通关.html` 的 `data-word`；
   - 搜索 `词素/**/*.html` 的 `data-word` 和 `<code class="en">word`；
   - 检查 `复习清单/data.json` 所有分类的 `name`。
   - 工具提供只读检查：
     ```powershell
     python 词素工具/auto_archive.py "<word>" --check --json
     ```
   - 如果已录入：**不要新建词卡**，也不要插队；只返回“已录入”。

2. **执行写入**

   ```powershell
   python 词素工具/auto_archive.py "<word>" --write --json
   ```

   - 只预览时用 `--analyze`（不写文件）。
   - 已录入时 `--write` 不创建内容，也不修改 `nextDate` / `priority`。
   - 新词会打上 `extra: true`，排在第二天的“额外新增”，不占每天 20 个新词。
   - 不要使用浏览器直接调用 DeepSeek；Key 只在 Python 服务端。
   - API 失败时工具不会写入；可以重试一次，仍失败则报告错误。

3. **检查结果**

   新词返回的关键字段：

   - `analysis.morphology.type`：`suffix` / `prefix` / `root_family` / `compound` / `atom`
   - `analysis.target.label`：目标分类
   - `location.file`：写入的文件
   - `location.group_created`：是否新建了词族
   - `data.schedule`：额外新增日期（通常是第二天）
   - `backup`：备份目录

   已录入返回：

   - `exists: true`
   - `data.item`：已有 data.json 条目
   - `message`：已录入，不新建、不插队
   - `page_file`：已有页面（如有）

   新词写入后验证：

   - 目标页面含 `id="word-<word>"` 和正确的中文/例句；
   - 核心词页的总词数、词族数、导航计数能通过页面脚本自动更新；
   - `data.json` 有且只有一条该词，`kind` 为 `word`，`extra: true`；
   - 复习清单的“额外新增”出现该词，且不占 20 个新词配额；
   - 不修改旧页面条目和其他分类的已有数据。

   已录入验证：

   - `data.json` 中没有新增第二条同名记录；
   - 没有新增 `priority`，也没有被改到今天。

4. **报告给用户**

   简洁报告：

   - 单词、释义、词性、级别；
   - 新词：分类（如“核心词汇 · -ship 后缀”或“词素 / 复合词”）、写入文件、是否新建词族；
   - 已录入：提示“已录入，未新建”，说明不插队；需要时去“全部词条”查看；
   - 新词：目标分类、写入文件、额外新增日期；
   - 备份路径；
   - API 错误（如有）。

## 分类规则

- `suffix` / `prefix`：写入核心词汇页对应词族；没有该词族就新建，页面脚本会自动补导航和计数。
- `root_family` 且 `root_is_free=true`：写入 `词素/词根-本体-变体【派生词】/`。
- `root_family` 且 `root_is_free=false`：写入 `词素/词根族/`。
- `compound`：写入 `词素/复合词/`。
- `atom`：写入 `词素/原子词/`。

不要为了“有后缀”而硬拆 `corner`、`flower` 等假后缀；以 API 的形态分析和词义为准。

## 日程规则

- 新词写入 `data.json` 的 `kind: "word"`。
- 从今天起找第一个新词数不足 20 的日期；当天已满就顺延。
- 复习间隔由复习清单统一使用 `1 / 3 / 7 / 15 / 30 / 60 / 90` 天。
- 不要手工改已有词的 `created`/`nextDate`；只追加新条目。

## 安全边界

- 绝不在网页、日志、回答或提交中输出 API Key。
- 不绕过 `词素工具/server.py` 的静态目录屏蔽去暴露 `词素工具/`。
- 不删除 `词素工具/backups/`、`词素工具/review_backups/` 或 `复习清单/data.json.bak`；
  需要回滚时从备份恢复。
- 不在 API 返回异常、JSON 不完整或词缀与单词不匹配时写入。
- 不批量循环调用 API；一次一个词，避免超时和重复扣费。

## 复习写回

- 复习清单在 8767 服务开启时，会通过 `/api/review` 把完成/撤销/保存写回 `data.json`。
- 打开页面本身不改数据；只有打卡动作才写入。
- 服务不可用时先写入浏览器 `reviewPendingChanges`，下次打开页面或点“保存”自动同步。
- `data.json` 是根数据；`导出 data.json` 只用于备份/手动迁移，不是日常必需步骤。

## 相关文件

- `词素工具/word_archiver.py`
- `词素工具/server.py`
- `词素工具/auto_archive.py`
- `词素工具/README.md`
- `单词模块/词汇代码生成器.html`
- `复习清单/核心词汇复习清单.html`
- `复习清单/data.json`
