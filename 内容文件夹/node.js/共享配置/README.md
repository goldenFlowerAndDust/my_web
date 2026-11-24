# Node.js 笔记归档

这个目录只放归档配置和构建器，不改 `node.js` 下的 Markdown 原文。

## 一键构建

双击：

```text
构建笔记.bat
```

或运行：

```powershell
cd /d "D:\GitHub\my_web\内容文件夹\node.js"
node "共享配置\tools\build.mjs"
```

## 输出

```text
node.js/html/
├─ index.html           目录页
├─ view.html            统一阅读界面
├─ data.json            数据索引
├─ data.js              阅读器数据
├─ content/             每篇正文数据
└─ doc-*.html           每篇 Markdown 的独立 HTML
```

## 数据来源路径

所有相对路径都以 **node.js** 为根目录。

每个逐篇 HTML 的顶层都有：

```html
<!-- source: 课堂/第三节课/第三节课-总结.md -->
<!-- source-root: node.js -->
```

`content/*.js` 顶层也有：

```js
// source: 课堂/第三节课/第三节课-总结.md
// source-root: node.js
```

`data.json` 顶层包含：

```json
{
  "sourceRoot": ".",
  "generatedFrom": "共享配置/配置.json",
  "docs": [
    { "source": "课堂/第三节课/第三节课-总结.md", "htmlFile": "doc-xxxx.html" }
  ]
}
```

## 配置

编辑 `配置.json` 可改：

- `output`：输出目录，默认 `html`
- `home`：归档页返回的博客地址
- `exclude`：扫描时跳过的目录/文件

新增或修改 Markdown 后重新构建即可，不要手改 `html/` 里的生成文件。
