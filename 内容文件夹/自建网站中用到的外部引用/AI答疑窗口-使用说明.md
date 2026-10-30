# 通用 AI 答疑窗口

英语之外，数学、政治、信息技术等学习主页共用的一套 AI 答疑窗口。

## 使用方式

页面引入：

```html
<link rel="stylesheet" href="../../../../自建网站中用到的外部引用/自建网站用的样式表/专升本-博客样式表.css">
<script src="../../../../自建网站中用到的外部引用/JS文件/专升本-博客.js"></script>
```

在页面里放一个占位元素（位置随意，建议放在主要内容之后）：

```html
<div data-ai-tutor
     data-ai-src="../../../../专升本备考/备考专升本数学/数学答疑/数学答疑.html"
     data-ai-title="AI 数学答疑"
     data-ai-kicker="MATH TUTOR"
     data-ai-icon="∑"
     data-ai-newtab="新窗口打开">
    <a class="ai-tutor-fallback" href="../../../../专升本备考/备考专升本数学/数学答疑/数学答疑.html">AI 数学答疑</a>
</div>
```

JS 会自动：

- 隐藏占位元素
- 生成右下角悬浮按钮
- 生成弹窗
- 首次打开才加载 iframe
- 支持关闭、遮罩关闭、Esc、新窗口打开
- 锁定页面滚动

没有 JS 时，占位里的普通链接仍然可用。

## 属性

| 属性 | 必填 | 说明 |
|---|---|---|
| `data-ai-src` | 是 | 答疑页地址 |
| `data-ai-title` | 否 | 按钮/弹窗标题，默认“AI 答疑” |
| `data-ai-kicker` | 否 | 弹窗小标题，默认“AI TUTOR” |
| `data-ai-icon` | 否 | 按钮图标，默认 `∑` |
| `data-ai-newtab` | 否 | 新窗口打开文字，默认“新窗口打开” |

## 后续科目

政治、信息技术直接复用：

```html
<div data-ai-tutor
     data-ai-src="../../../../专升本备考/备考专升本政治/政治答疑/政治答疑.html"
     data-ai-title="AI 政治答疑"
     data-ai-kicker="POLITICS TUTOR"
     data-ai-icon="§">
</div>
```

只需要各自准备答疑页，不需要再写一套窗口 CSS/JS。

## 英语

英语主页继续使用自己的 `专升本英语.css/js`，不接入这套公共窗口；英语答疑页保持独立。
