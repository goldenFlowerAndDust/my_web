# 数学答疑工具

专升本数学 AI 答疑的本地服务。

## 启动

双击项目根目录：

```text
启动数学答疑服务.bat
```

或手动：

```powershell
python 数学工具/server.py
```

打开：

```text
http://127.0.0.1:8768/数学答疑/数学答疑.html
```

## API Key

按以下顺序读取：

1. 环境变量 `DEEPSEEK_API_KEY`
2. `专升本备考/共享配置/API.txt`（推荐，与英语共用）
3. `数学工具/API.txt`（数学专用，备用）
4. `备考专升本英语/词素工具/API.txt`（兼容旧位置）
5. 用户目录下的旧版 key 文件

所以数学可以直接复用共享 Key；没有单独的 Key 也能用。  
不要把 Key 上传 GitHub。

## 文件

| 文件 | 作用 |
|---|---|
| `数学工具/server.py` | 本地静态服务 + `/api/health`、`/api/tutor`、`/api/tutor-log` |
| `数学工具/math_tutor.py` | 数学家人设、DeepSeek 调用、分类日志 |
| `数学答疑/数学答疑.html` | 数学答疑页面 |
| `数学答疑/数学答疑.css` | 页面样式 |
| `数学答疑/数学答疑.js` | 本地/云端连接、答疑、历史、KaTeX |
| `数学工具/数学问答日志/` | 本地分类日志，已 gitignore |

## 云端

页面连接设置支持：

```text
本地 8768
Cloudflare
国内 SCF
```

云端请求发送：

```json
{
  "subject": "math",
  "mode": "题目讲解",
  "question": "..."
}
```

Cloudflare Worker 用 `subject: "math"` 选择数学家人设和数学分类，日志索引用：

```text
index:math:<分类>
```

英语仍用原来的 `index:<分类>`，互不影响。

## 注意

- 数学答疑**不会**自动收词、不写词库、不进入英语复习额外新增。
- 公式用 LaTeX；页面加载本地 KaTeX。
- 本地 AI 需要有效 DeepSeek Key；没有 Key 时只能看页面和云端线路。
- 腾讯云 SCF 只是国内入口，转发到 Cloudflare Worker，不需要改 SCF 代码。
