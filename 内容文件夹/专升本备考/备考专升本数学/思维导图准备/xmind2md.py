# -*- coding: utf-8 -*-
"""
XMind 自动转 Markdown
用法: python xmind2md.py

工作流：
  mindmmap_xmind/极限.xmind  →  mindmmap_md/极限/极限.md

公式约定：
  节点内容以 \begin{aligned} 开头、以 \end{aligned} 结尾
  → 自动包 $...$
  → 公式里的裸中文自动包 \text{}
  → 已手动写的 \text{...} 不重复包

其余内容 → 原样输出
"""

# ==================== 路径配置 ====================
SRC_DIR = '../思维导图准备/mindmmap_xmind'
OUT_DIR = '../思维导图准备/mindmmap_md'
# ================================================

import os
import re
import json
import zipfile
import xml.etree.ElementTree as ET


# ==================== 公式识别 ====================

def is_formula(s):
    """只有一种情况算公式：\begin{aligned} 开头，\end{aligned} 结尾"""
    if not s:
        return False
    s = s.strip()
    return s.startswith('\\begin{aligned}') and s.endswith('\\end{aligned}')


def auto_wrap_cjk(s):
    """
    把公式里的裸中文自动包成 \text{}
    - 已存在的 \text{...} 原样保留，不重复包
    - 只在公式里生效
    """
    if not s:
        return s

    # 1. 保护已有的 \text{...}
    placeholders = []
    def protect(m):
        placeholders.append(m.group(0))
        return '\x00P' + str(len(placeholders) - 1) + '\x00'

    s = re.sub(r'\\text\{[^{}]*\}', protect, s)

    # 2. 把剩下的连续中文包成 \text{...}
    s = re.sub(r'[\u4e00-\u9fff]+',
               lambda m: '\\text{' + m.group(0) + '}',
               s)

    # 3. 恢复被保护的 \text{...}
    for i, p in enumerate(placeholders):
        s = s.replace('\x00P' + str(i) + '\x00', p)

    return s


def smart_process(s):
    """转义标准化 + 是公式就包 $ + 中文自动 \text{}"""
    if not s:
        return s
    s = s.strip()

    # 已经手动包过 $...$ → 原样返回
    if s.startswith('$') and s.endswith('$'):
        return s

    # 是 aligned 公式 → 自动包 \text{} + 外层 $...$
    if is_formula(s):
        s = auto_wrap_cjk(s)
        return '$' + s + '$'

    # 其他 → 原样
    return s


# ==================== 节点名称提取 ====================

def extract_name(topic):
    """从 topic 提取节点名，自动判断公式并包 $"""

    # 1. XMind「公式节点」
    eq = topic.get('equation')
    if isinstance(eq, dict):
        for k in ('latex', 'content', 'text', 'value'):
            v = eq.get(k)
            if isinstance(v, str) and v.strip():
                s = v.strip()
                return s if s.startswith('$') else '$' + s + '$'
    if isinstance(eq, str) and eq.strip():
        s = eq.strip()
        return s if s.startswith('$') else '$' + s + '$'

    # 2. 普通 title
    title = (topic.get('title') or '').strip()
    if title:
        return smart_process(title)

    # 3. html 富文本字段
    html = topic.get('html')
    if isinstance(html, str) and html:
        text = re.sub(r'<[^>]+>', '', html)
        text = (text.replace('&lt;',   '<')
                .replace('&gt;',   '>')
                .replace('&amp;',  '&')
                .replace('&quot;', '"')
                .replace('&#39;',  "'")
                .strip())
        if text:
            return smart_process(text)

    return None


# ==================== XMind 解析 ====================

def parse_xmind(filepath):
    with zipfile.ZipFile(filepath, 'r') as z:
        names = z.namelist()
        if 'content.json' in names:
            with z.open('content.json') as f:
                data = json.load(f)
            return data[0].get('rootTopic', {})
        elif 'content.xml' in names:
            with z.open('content.xml') as f:
                tree = ET.parse(f)
            return _xml_root_topic(tree)
        else:
            raise Exception(f"无法识别 XMind 格式: {filepath}")


def _xml_root_topic(tree):
    """旧版 XMind 8（content.xml）"""
    root = tree.getroot()
    ns = {}
    for key in root.attrib:
        if key.startswith('{'):
            ns['xmap'] = key.split('}')[0].strip('{')
            break

    sheet = root.find('xmap:sheet', ns) if ns else root.find('sheet')
    topic = (sheet.find('xmap:topic', ns) if ns else sheet.find('topic')) if sheet else root[0]

    def convert(t):
        title_el = t.find('xmap:title', ns) if ns else t.find('title')
        raw = title_el.text if title_el is not None and title_el.text else ''
        node = {'title': smart_process(raw)}

        children_el = t.find('xmap:children', ns) if ns else t.find('children')
        if children_el is not None:
            topics_el = children_el.find('xmap:topics', ns) if ns else children_el.find('topics')
            if topics_el is not None:
                node['children'] = {
                    'attached': [
                        convert(c)
                        for c in (topics_el.findall('xmap:topic', ns) if ns else topics_el.findall('topic'))
                    ]
                }
        return node

    return convert(topic)


# ==================== 转 Markdown ====================

def topic_to_md(topic, depth=0):
    name = extract_name(topic)
    if not name:
        return None

    lines = ['  ' * depth + '- ' + name]

    children = topic.get('children', {}).get('attached', [])
    for c in children:
        sub = topic_to_md(c, depth + 1)
        if sub:
            lines.append(sub)

    return '\n'.join(lines)


def convert_xmind_to_md(xmind_path, out_path):
    root = parse_xmind(xmind_path)
    md = topic_to_md(root)
    if not md:
        raise Exception("根节点为空，无法生成 Markdown")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(md)


# ==================== 主流程 ====================

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    src_dir = os.path.abspath(os.path.join(base_dir, SRC_DIR))
    out_dir = os.path.abspath(os.path.join(base_dir, OUT_DIR))

    print(f"📂 源目录: {src_dir}")
    print(f"📂 输出目录: {out_dir}")

    os.makedirs(src_dir, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)

    xmind_files = [f for f in os.listdir(src_dir) if f.endswith('.xmind')]
    if not xmind_files:
        print("⚠️  源目录里没有 .xmind 文件")
        return

    print(f"\n找到 {len(xmind_files)} 个文件，开始转换...\n")

    for filename in xmind_files:
        base_name = os.path.splitext(filename)[0]
        xmind_path = os.path.join(src_dir, filename)
        out_path = os.path.join(out_dir, base_name, base_name + '.md')

        try:
            print(f"📖 解析: {filename}")
            convert_xmind_to_md(xmind_path, out_path)
            print(f"   ✅ 输出: {base_name}/{base_name}.md")
        except Exception as e:
            print(f"   ❌ 失败: {e}")

    print("\n🎉 全部完成！")


if __name__ == '__main__':
    main()