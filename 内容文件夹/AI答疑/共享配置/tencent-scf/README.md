# 腾讯云 SCF 国内反向代理

腾讯云 API 网关已停止售卖，不再使用 API 网关。  
改用 **云函数函数 URL（Function URL）**，它自带 HTTPS 默认域名，不需要买域名、服务器或备案。

作用：

```text
国内浏览器
→ 腾讯云 SCF 函数 URL
→ 现有 Cloudflare Worker
→ DeepSeek + Cloudflare KV
```

> 前提：腾讯云函数要能访问你的 `workers.dev`。如果函数侧也访问不了，
> 只能改成 SCF 直连 DeepSeek + 国内数据库。

官方文档：

- [函数 URL 概述](https://cloud.tencent.cn/document/product/583/96099)
- [创建函数 URL](https://cloud.tencent.cn/document/product/583/100227)
- [API 网关触发器下线通知](https://cloud.tencent.cn/document/product/583/107631)

## 1. 准备

- 腾讯云账号已实名
- 开通 **云函数 SCF**
- 一个 Cloudflare Worker 访问口令（`TUTOR_ACCESS_TOKEN`）
- 一个新的 `PROXY_TOKEN`（给国内页面用，和 Worker 口令分开）

## 2. 创建 SCF 函数

腾讯云控制台 → **云函数 SCF** → **新建**：

```text
函数名称：english-tutor-cn-proxy
运行环境：Node.js 18
地域：广州 / 上海（离你近的）
内存：128 MB 或 256 MB
超时时间：120 秒
```

创建后，把本目录 `index.js` 全部粘贴进去，部署。

### 环境变量

在函数配置 → 环境变量中添加：

```text
UPSTREAM_BASE  = https://english-tutor.goldenfloweranddust.workers.dev
UPSTREAM_TOKEN = 你的 Cloudflare TUTOR_ACCESS_TOKEN
PROXY_TOKEN    = 新生成的 32 位口令
ALLOWED_ORIGIN = https://goldenfloweranddust.github.io
```

说明：

- `UPSTREAM_BASE` 末尾不要加 `/api/...`
- `UPSTREAM_TOKEN` 是 Cloudflare Worker 的访问口令，不要给页面
- `PROXY_TOKEN` 是给页面用的，可以换
- 测试阶段 `ALLOWED_ORIGIN` 可先用 `*`

## 3. 创建函数 URL

进入函数详情 → 左侧 **函数 URL** → **新建函数 URL**：

| 配置项 | 填写 |
|---|---|
| 别名/版本 | `$LATEST` 或默认版本 |
| 公网访问 | **开启** |
| 内网访问 | 不需要 |
| 授权类型 | **开放** |
| CORS | **关闭**（函数里已经返回 CORS 头） |

点击确定后，会得到类似：

```text
https://<app-id>-<url-id>.gz.tencentscf.com
```

这个地址就是国内入口，不需要 API 网关，不需要备案。

> 函数 URL 本身不收费；实际产生的是 SCF 调用费用/免费额度。
> 函数 URL 的授权类型必须选“开放”，否则浏览器无法直接调用。

## 4. 测试

先在浏览器访问：

```text
https://你的函数URL/api/health
```

应返回：

```json
{
  "ok": true,
  "service": "english-tutor",
  "has_key": true,
  "kv_bound": true,
  "auth_required": true
}
```

如果返回 502：

```text
无法连接上游 Cloudflare Worker：fetch failed
```

说明 **广州 SCF 到 Cloudflare 的网络不通**。这不是函数 URL 配置问题。

可以先试：

1. 在香港/新加坡区域新建同一个函数（代码、环境变量完全一样）
2. 给新函数开函数 URL
3. 测试新区域的 `/api/health`

香港/新加坡的 SCF 通常能访问 Cloudflare，而国内客户端访问香港函数 URL 一般也可用。
如果香港也不通，就只能改 SCF 直连 DeepSeek + 国内数据库，不能再依赖 Cloudflare。

如果返回 403：

```text
来源不在允许列表中
```

把 `ALLOWED_ORIGIN` 改成 `*` 再测一次。

## 5. 页面接入

页面有三条线路：

```text
本地 8767
Cloudflare（保留）
国内 SCF
```

国内 SCF 线路填写：

```text
地址：https://你的函数URL
口令：PROXY_TOKEN
```

Cloudflare 的地址和口令仍然单独保存，不会被覆盖。

## 6. 限制与费用

- 函数 URL 使用 SCF 默认域名，不需要 ICP；自定义域名才需要。
- 不需要 API 网关、服务器或域名。
- AI token 费用不变：SCF 只是转发，不会多调用一次 DeepSeek。
- 国内客户端访问函数 URL 通常比直接访问 `workers.dev` 好；
  但 SCF → Cloudflare 这一跳仍然可能出现延迟或失败，必须实测。
- 函数 URL 授权是“开放”，健康检查接口公开；其他接口仍要 `PROXY_TOKEN`。
- 没有 API 网关的额外限流，个人使用足够；不要公开 `PROXY_TOKEN`。

## 7. 排错

| 现象 | 处理 |
|---|---|
| 403 来源不在允许列表 | 改 `ALLOWED_ORIGIN`，测试时用 `*` |
| 401 访问口令不正确 | 页面填的是 `PROXY_TOKEN`，不是 Cloudflare 口令 |
| 500 未配置 | 检查 SCF 环境变量 |
| 502 无法连接上游 | SCF 到 Cloudflare 不通，或 `UPSTREAM_BASE` 写错 |
| 504/超时 | SCF 函数超时调到 120 秒 |
| 多个 CORS 头 | 函数 URL 的 CORS 保持关闭，只让函数返回 |
| 函数 URL 404 | 确认函数 URL 已开启公网、授权开放，并重新部署函数 |
