# Cloudflare Worker 部署

这是英语答疑的云端代理：GitHub Pages 只请求 Worker，DeepSeek Key 只存在 Worker Secret 里。

## 一、准备

- 已注册 Cloudflare 账号
- 已有一个 DeepSeek API Key
- 自己生成一个访问口令，例如 32 位随机字符串：

```text
请用密码管理器生成，不要用 123456，也不要发给我。
```

## 二、在中文控制台部署（不需要买服务器）

### 1. 创建 KV

Cloudflare 控制台 → **存储和数据库** → **KV** → **创建命名空间**：

```text
名称：TUTOR_KV
```

创建后先不用记 ID，下一步在 Worker 绑定里选它。

### 2. 创建 Worker

**Workers 和 Pages** → **创建** → **Worker** → 名称：

```text
english-tutor
```

创建后进入 **编辑代码**，把本目录 `worker.js` 的全部内容粘贴进去，点 **部署**。

### 3. 绑定 KV

Worker → **设置** → **变量和机密** → **KV 命名空间绑定** → 添加：

```text
变量名称：TUTOR_KV
KV 命名空间：选择刚才创建的 TUTOR_KV
```

### 4. 添加机密和变量

在同一个 **变量和机密** 页面：

**机密（加密，不会显示在代码里）：**

```text
DEEPSEEK_API_KEY    = 你的 DeepSeek Key
TUTOR_ACCESS_TOKEN  = 你自己生成的访问口令
```

**纯文本变量：**

```text
DEEPSEEK_MODEL          = deepseek-chat
RATE_LIMIT_PER_MINUTE   = 10
LOG_TTL_DAYS            = 180
ALLOWED_ORIGIN          = *
```

> 第一次先用 `*`，方便测试。确认能用后，把 `ALLOWED_ORIGIN` 改成你的
> GitHub Pages 来源，例如 `https://你的用户名.github.io`。

保存后重新 **保存并部署**。

### 5. 拿到 Worker 地址

形如：

```text
https://english-tutor.你的子域.workers.dev
```

先测健康检查：

```powershell
$base = "https://english-tutor.你的子域.workers.dev"
Invoke-RestMethod "$base/api/health"
```

应返回 `ok: true`、`has_key: true`、`kv_bound: true`。

### 6. 测试答疑

```powershell
$headers = @{ "X-Tutor-Token" = "你的访问口令" }
$body = @{
  mode = "句子分析"
  question = "分析句子：What matters is not how fast you read but how much you understand."
} | ConvertTo-Json -Compress

Invoke-RestMethod "$base/api/tutor" `
  -Method Post `
  -Headers $headers `
  -ContentType "application/json; charset=utf-8" `
  -Body ([Text.Encoding]::UTF8.GetBytes($body)) `
  -TimeoutSec 180
```

再查日志：

```powershell
Invoke-RestMethod "$base/api/tutor-log?category=句子分析&limit=10" -Headers $headers
```

## 三、Wrangler 部署（可选）

如果本机有 Node.js：

```powershell
cd cloudflare-worker
npm install -g wrangler
wrangler login
wrangler kv namespace create TUTOR_KV
```

把输出的 KV ID 填到 `wrangler.toml` 的 `id`，然后：

```powershell
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put TUTOR_ACCESS_TOKEN
wrangler deploy
```

`wrangler.toml` 里不要写 Key 或访问口令。

## 四、页面接入

1. 启动本地服务（本地仍可用 8767）；
2. 打开 [英语答疑.html](../英语答疑/英语答疑.html)；
3. 点顶部的 **连接设置**；
4. 选择 **云端 Worker**；
5. 填 Worker 地址和访问口令；
6. 保存后看到“云端已连接”。

GitHub Pages 上同样打开答疑页，点连接设置填一次即可；口令只存在当前浏览器
localStorage，不写进 HTML/JS 文件。

## 五、安全设置

- Key 只放 `DEEPSEEK_API_KEY` Secret，**不要**写进 `wrangler.toml`、GitHub、页面。
- 访问口令用 24 位以上随机字符串；泄露后立即在 Worker 的“变量和机密”里更换。
- Cloudflare 账号开二次验证。
- `RATE_LIMIT_PER_MINUTE` 已限制每分钟请求；可在 Cloudflare 再加 WAF 限流。
- 确认页面来源后把 `ALLOWED_ORIGIN` 从 `*` 改成 `https://你的用户名.github.io`。
- 在 DeepSeek 后台设置消费上限/提醒；定期轮换 Key。
- 云端日志在 KV 中，包含问题和回答；注意隐私，设置 `LOG_TTL_DAYS` 自动过期。
- 公开的 Worker 端点即使有口令，也不是绝对安全；不要把它当成高敏感数据服务。

## 六、常见问题

| 现象 | 处理 |
|---|---|
| `访问口令不正确` | 检查连接设置里的口令，和 Worker Secret 一致 |
| `云端未配置 DEEPSEEK_API_KEY` | Worker Secret 未保存或未重新部署 |
| `云端未绑定 TUTOR_KV` | KV 绑定变量名必须是 `TUTOR_KV` |
| 浏览器 CORS 报错 | 测试阶段 `ALLOWED_ORIGIN=*`；确认后改成 GitHub Pages 来源 |
| 手机能打开页面但不能问 | 检查 Worker 地址、口令、KV 绑定 |
| 日志为空 | KV 绑定/写入失败，或分类筛选不对 |

## 七、路由

```text
GET  /api/health
POST /api/tutor             Header: X-Tutor-Token
GET  /api/tutor-log         Header: X-Tutor-Token
POST /api/tutor-log-delete  Header: X-Tutor-Token
POST /api/delete-tutor-logs Body: cleanup_token + records
POST /api/queue-word        Header: X-Tutor-Token
POST /api/pending-word      Header: X-Tutor-Token
GET  /api/pending-words     Header: X-Tutor-Token
POST /api/delete-pending-words     Body: cleanup_token + words
```

> 如果之前部署的是旧版 Worker，需要重新粘贴新版 `worker.js` 并部署，
> 否则生成器的云端排队和自动清理会提示 404。云端只存待归档单词，分类和写入 HTML
> 仍由本地 `word_archiver.py` 完成。

## 生成器云端排队

`POST /api/queue-word` 只做两件事：

```text
英文单词 → 直接入队
中文意思 → AI 解析成单个英文单词后入队
```

不接受句子、问句或其他内容；不做构词分类，也不写本地文件。

生成器导出 `pending-words` JSON 后，用本地
`导入待归档单词.bat` 完成分类写入。

导出文件会带一个 **6 小时有效的 cleanup_token**。本地导入成功后，
`import_pending_words.py` 会自动调用 `POST /api/delete-pending-words`，
只删除本次成功处理的云端待归档记录；失败的词保留以便重试。
旧导出文件没有这个令牌，不会自动删除；重新从生成器导出即可。

## 答疑记录清理

- 云端答疑记录默认保留 180 天，由 Worker 变量 `LOG_TTL_DAYS` 控制；可改成 30 或 60 天。
- 在答疑页点“导出答疑记录”时，每条记录会附带 6 小时有效的清理令牌。
- 本地双击 `导入答疑记录.bat` 写入成功后，会自动调用 `POST /api/delete-tutor-logs`，只删除本次成功写入/已存在的记录。
- 导入失败或没有导入的云端记录继续保留；旧导出文件没有令牌，不会自动删除，重新导出即可。

## 八、数学答疑（subject: math）

同一个 Worker 同时支持英语和数学，不需要第二个 Worker。

数学请求：

```json
{
  "subject": "math",
  "mode": "题目讲解",
  "topic": "极限",
  "question": "..."
}
```

数学分类：

```text
题目讲解 / 错题诊断 / 概念公式 / 其他
```

知识分类：

```text
极限 / 导数与微分 / 积分 / 三角函数 / 矩阵 /
向量与空间几何 / 微分方程 / 无穷级数 / 多元函数 / 概率统计 / 其他
```

`mode` 和 `topic` 是两个维度；历史接口可以按 `topic` 筛选。

数学日志索引独立保存：

```text
index:math:<分类>
```

英语仍然使用：

```text
index:<分类>
```

互不影响。

数学历史：

```text
GET /api/tutor-log?subject=math&category=all&topic=极限&limit=20
POST /api/tutor-log-delete
```

删除请求：

```json
{
  "subject": "math",
  "mode": "题目讲解",
  "created_at": "2026-10-30T13:10:36.522Z",
  "time": "2026-10-30 21:10:36"
}
```

> 数学答疑页也要用新版 `worker.js`；旧 Worker 没有 `subject` 分支，
> 会把数学题按英语分类处理。更新 Worker 后不需要改 SCF 函数。
