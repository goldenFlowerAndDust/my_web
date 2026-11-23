# 编程语言 AI 答疑

本地端口：`8769`，与英语 `8767`、数学 `8768` 完全独立。

## 启动

双击：

```text
AI/编程语言AI/启动编程答疑服务.bat
```

浏览器打开：

```text
http://127.0.0.1:8769/AI答疑/编程语言AI/
```

## 语言

```text
Python
JavaScript
HTML + CSS
MySQL
Node.js
```

## 配置

API Key 读取顺序：

```text
1. 环境变量 DEEPSEEK_API_KEY
2. 本目录/API.txt
3. 内容文件夹/专升本备考/共享配置/API.txt
```

不需要前端填写 Key。

## 文件

```text
index.html       页面
style.css        样式
app.js           Markdown/代码渲染、语言切换、历史
server.py        本地 8769 服务
skills/          五种语言的系统提示词预设
history/         按语言/日期保存的本地答疑历史（不提交 Git）
```

历史结构：

```text
history/python/2026-11-03.jsonl
history/javascript/2026-11-03.jsonl
```

每个语言单独目录，每天一个 JSONL 文件；页面历史按日期分组。

## 历史

本地：

```text
history/<language>/<日期>.jsonl
```

GitHub Pages 读取：

```text
history/index.json
```

`同步全部科目.bat` 会把云端 24 小时内的编程问答拉回本地，并重新生成
`history/index.json`。提交这个文件后，GitHub Pages 就能像数学、英语一样
显示本地历史；每日 JSONL 不上传。

## 主题

页面默认柔和暗色，可在左侧切换亮色/暗色，偏好保存在浏览器本地。

## 云端

页面左侧“连接设置”和数学、英语一样：

```text
连接方式：本地 8769 / 云端 Worker / SCF
云端线路：Cloudflare / 国内 SCF
云端地址
访问口令
```

Cloudflare 填：

```text
Worker 地址
TUTOR_ACCESS_TOKEN
```

国内 SCF 填：

```text
SCF 地址
PROXY_TOKEN
```

可以随时切换。

地址和令牌默认**不保存**，只保留在当前标签页；关闭页面后失效。
如需下次自动填入，勾选“保存地址和令牌到浏览器本地”。

云端接口：

```text
POST /api/code
GET  /api/code-log?language=python
```

和英语、数学共用同一个 Worker、同一个 KV、同一个访问令牌。

云端需要 Worker 配置：

```text
DEEPSEEK_API_KEY
TUTOR_ACCESS_TOKEN
TUTOR_KV
ALLOWED_ORIGIN
```

本地 8769 仍然只走本地 server.py，不会自动切到云端。

## 博客入口

六个博客页面的顶部都有：

```text
编程 AI 答疑
```

点击进入本页面，并使用对应语言参数自动选中语言。
