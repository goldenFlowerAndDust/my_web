# 模块总览（Node.js 侧）

> 这里只放 **Node.js 学习项目**用到的东西。  
> DSH 的插件清单在另一个地方：`D:\DeepSeekHarness-自创插件\外部插件\DSH外部插件清单.md`

---

## 本目录内容

| 文件 | 内容 |
|---|---|
| [Node项目外部依赖清单.md](Node项目外部依赖清单.md) | npm 包、数据库软件、IDE 插件，含版本与安装命令 |

---

## 一句话结论

整套学习项目真正需要安装的外部依赖**只有 4 个 npm 包**：

```bash
npm install express    # 第十一节课：Web 框架
npm install mysql2     # 第十、十一节课：MySQL 驱动
npm install jquery     # 第九节课：前端 DOM / ajax
npm install moment     # 第二节课：日期处理
```

其余都是 Node 自带：`fs`、`path`、`http`、`url`、`os` —— **不需要装包**。

## 两个踩过的坑

| 包 | 问题 |
|---|---|
| `fs@0.0.1-security` | npm 上的空壳占位包，装了也没用，`require('fs')` 走内置 |
| `ajax@0.0.4` | 不是 jQuery，浏览器里用不了；`$` 只能来自 jQuery |

## 包管理器的区别（四个都叫“装包”）

| 工具 | 命令 | 锁文件 |
|---|---|---|
| npm | `npm install` | `package-lock.json` |
| yarn | `yarn add` | `yarn.lock` |
| cnpm | `cnpm install` | `package-lock.json`（用的是国内镜像） |
| pnpm | `pnpm add` | `pnpm-lock.yaml` |

> **包（package）** 是能发布到 registry 的东西；**模块（module）** 是 Node 加载的单位（一个文件）。
> 内置模块、第三方包、本地 `./` 文件，`require` 进来都用同一个概念——模块。

更新：2026-11-17
