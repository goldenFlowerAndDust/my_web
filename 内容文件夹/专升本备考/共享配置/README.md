# 专升本共享配置

这里放英语和数学共用的本地配置。

## DeepSeek API Key

文件：

```text
共享配置/API.txt
```

内容只放一行：

```text
sk-你的DeepSeekKey
```

不要加变量名、引号或说明文字。

读取顺序：

1. 环境变量 `DEEPSEEK_API_KEY`
2. `共享配置/API.txt`（推荐）
3. 数学工具自己的 `数学工具/API.txt`（仅数学，备用）
4. 英语旧的 `词素工具/API.txt`（兼容）
5. 用户目录旧 Key

英语 8767 和数学 8768 都会读这里，所以只需要维护一份。

## 安全

- `共享配置/API.txt` 已被 `.gitignore` 忽略
- 不要上传 GitHub
- 不要写进 HTML / JS / README
- 不要把 Key 发给别人

## 其他共享内容

目前只共享 API Key。  
英语和数学的页面、日志、技能、词库仍然各自独立，避免路径和 Cloudflare 配置互相影响。
