# 编程语言 AI 答疑

本地端口：`8769`，与英语 `8767`、数学 `8768` 完全独立。

## 启动

双击：

```text
启动编程答疑服务.bat
```

浏览器打开：

```text
http://127.0.0.1:8769/AI/编程语言AI/
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
history/         本地答疑历史（不提交 Git）
```

## 博客入口

六个博客页面的顶部都有：

```text
编程 AI 答疑
```

点击进入本页面，并使用对应语言参数自动选中语言。
