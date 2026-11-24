# MySQL 笔记归档

只读 `MySql` 下的 `.sql` 原文，生成可直接阅读的 HTML；不修改 SQL，也不把知识做成图片。

## 构建

```powershell
cd /d "D:\GitHub\my_web\内容文件夹\MySql"
node "共享配置\tools\build.mjs"
```

或双击：

```text
共享配置\构建MySQL笔记.bat
```

## 输出

```text
MySql/html/
├─ index.html       目录页
├─ view.html        统一阅读界面
├─ data.json        索引
├─ data.js
└─ doc-*.html       每篇 SQL 的独立 HTML
```

## 分类

```text
笔记
├─ 学习笔记
├─ 回顾数据库
└─ dudainfo

查询练习
```

`笔记` 和 `查询练习` 在目录页和阅读界面里分组展示，不混在一起。

## 数据来源

所有相对路径以 `MySql` 为根目录。

每篇 HTML 顶层：

```html
<!-- source: 笔记/学习笔记存放地/多表查询.sql -->
<!-- source-root: MySql -->
```

`data.json` 每篇也有：

```json
{
  "source": "笔记/学习笔记存放地/多表查询.sql",
  "section": "笔记",
  "group": "学习笔记"
}
```

## SQL 能力

- 关键字、注释、字符串、数字、函数、运算符高亮
- 行号
- 一键复制原文
- 搜索标题/来源/注释
- 目录跳转与上一篇/下一篇
- 深色/亮色主题
