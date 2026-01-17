# CSS简介
## CSS概念

- CSS(Cascading Style Sheets)层叠样式表，又叫级联样式表，简称样式表
- CSS文件后缀名为\[.css\]

### 为什么需要CSS

- 使用CSS的目的就是让网页具有美观一致的页面

## 语法

CSS规则由两个主要的部分构成

1.  选择器

    选择器通常是需要改变样式的HTML元素(也可以理解为标签)

2.  一条或多条声明
    [由一个属性和一个值组成]{.mark}
    - 属性

      1. 属性(property)是希望设置的样式属性(Style property)
      2. 如：color(设置文本颜色)，font-size(设置文本字体大小)

    - 属性值

      1. 每一个属性有一个值，属性和值被冒号分开
      2. 如：color:red、font-size:25px

3.  如：h1 {color:blue;font-size:12px;}
    - h1就是选择器(意思是将样式在h1标签起作用)
    - color、font-size就是声明中的【属性】
    - blue(这是给属性color赋的值，意思是将文本颜色改为蓝色)
    - 12px(这是给属性font-size赋的值，意思将文本字体大小改为12px(单位像素))

### 代码示例

注意：

- 所有样式都在style标签内
- 而style标签在head标签内
- 由选择器+大括号组成
- 大括号内部才是CSS语法写入的地方
- 可以添加多个声明，每一个声明占一行(只在对应选择器的大括号内有效)


    <style type="text/css">
        h1{
             color:blue;
             font-size:12px;
        }
    </style>

