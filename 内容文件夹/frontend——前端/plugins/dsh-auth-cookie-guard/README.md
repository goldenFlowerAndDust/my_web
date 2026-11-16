# dsh-auth-cookie-guard

桌面端启动时的认证 Cookie 守卫：在欢迎页发起认证请求之前，检查并清理超量的
`dsh-auth-*` Cookie，避免下面这个启动失败：

```
应用无法启动或已意外停止。
desktop welcome: Web authentication failed
```

诊断日志通常位于
`%APPDATA%\@deepseek-ai\dsh-desktop\logs\crash-*-host.log`；同一问题在 Host 侧也可能表现为
`HTTP 431 Request Header Fields Too Large`。

## 根因

这不是账号、网络或插件问题，而是认证 Cookie 无上限累积：

1. `@deepseek-ai/dsh-client-connection` 用 `"dsh-auth-" + sha256(host:port)` 命名每个浏览器会话 Cookie。
2. 桌面 Host 每次启动使用随机端口，所以每次都是一个**新名字**的 Cookie，旧 Cookie 不会被覆盖。
3. Cookie 默认有效期 30 天（`cookieMaxAgeDays`），没有任何清理逻辑。
4. 欢迎页的 `net.fetch` 会带上 `127.0.0.1` 下**全部**历史 `dsh-auth-*` Cookie。
5. Node 的请求头上限默认 16 KiB；每条约 170 B，约 90 条就会超限，Host 返回 431，桌面端报
   `Web authentication failed`。

社区报告：[#11010](https://github.com/deepseek-ai/deepseek-harness/discussions/11010)、
[#11102](https://github.com/deepseek-ai/deepseek-harness/discussions/11102)、
[#11326](https://github.com/deepseek-ai/deepseek-harness/discussions/11326)。

## 行为

每次 Host 启动时（欢迎页认证之前）：

1. 打开 Chromium 默认会话的 Cookie 数据库
   `%APPDATA%\@deepseek-ai\dsh-desktop\Network\Cookies`。
2. 统计 `127.0.0.1` / `localhost` 下仍然有效的 `dsh-auth-*` Cookie 数量和估算的 `Cookie` 头大小。
3. 超过任一阈值时，删除最旧的记录，只保留最新的 `keepNewest` 条。
4. 把结果写入状态文件，并在 Host 日志里留一行（不包含 Cookie 值）。

阈值（`cordis.patch.yml` 里可改）：

| 配置 | 默认 | 含义 |
| --- | --- | --- |
| `maxCookies` | 50 | 有效 `dsh-auth-*` 条数上限 |
| `maxHeaderBytes` | 10240 | 估算的 `Cookie` 头字节上限 |
| `keepNewest` | 1 | 清理时保留的最新条数 |
| `dryRun` | false | 只报告，不删除 |

兜底：同一个 patch 还把 `connection.cookieMaxAgeDays` 从 30 天缩短到 7 天。如果某次启动时
Cookie 数据库已被 Electron 占用、插件无法清理，新 Cookie 也不会再保留 30 天。

状态文件：

```
%APPDATA%\@deepseek-ai\dsh-desktop\auth-cookie-guard\status.json
```

`state` 为 `pruned` 表示这次启动清掉了超量 Cookie；`clean` 表示在范围内；`unavailable` /
`locked` 表示数据库正被占用（此时依赖 7 天有效期兜底）；`missing` 表示不是桌面端或还没有 Cookie 库。

## 为什么删除的是数据库里的行，而不是整个文件

- 应用运行时 Electron 独占锁定 `Network\Cookies`，直接删文件会失败，还可能留下 `-journal`
  一类附属文件。
- 整库删除会连带清掉同一会话里与认证无关的 Cookie；只删 `dsh-auth-*` 行足够解决 431，影响面最小。
- 这些 `dsh-auth-*` Cookie 按“主机 + 随机端口”签名，旧端口签发的本来就无法再用于新一次启动，
  删除不会影响当前登录。

如果你确实想让它在超限时删除整个 `Cookies` 文件，请告诉我，我可以加一个 `mode: "file"` 选项。

## 手动恢复

如果桌面端已经卡在启动失败、插件又没来得及清理，先**完全退出** DeepSeek Harness，再运行：

```powershell
node "<插件目录>\tools\prune-cookies.mjs"
```

脚本只删除 `dsh-auth-*` 行并保留最新一条。应用打开时运行会报 `unavailable`，属正常。

## 安装位置

本插件装在 desktop profile 里，安装方式是链接（junction）到本目录。请不要移动或删除这个目录；
如果以后要把它挪到别处（例如 `D:\大肥鱼\plugins`），需要重新安装一次。

## 限制

- 插件只能在 Host 启动阶段清理；Chromium 已经打开 Cookie 库时无法写入。
- 它不修改 Electron 安装目录，也不碰 profile 配置之外的文件（只写自己的状态文件和 Cookie 库）。
- 这是对已发布 bug 的本地缓解，不是官方修复；升级 DSH 后如已修复，可禁用本插件。
