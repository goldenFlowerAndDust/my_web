import os
import requests

# ==========================================
# ⚙️ 1. 手动配置区（每次复用只需改这里）
# ==========================================
# 你的 DeepSeek API Key
API_KEY = "sk-215500aab5c64465a887ac3cafe82c76"

# 要读取的文本文件路径
INPUT_FILE = r"D:\GitHub\my_web\AI-总结文件\python_study_all_text.md"

# 总结后保存的文件路径
OUTPUT_FILE = r"D:\GitHub\my_web\AI-总结文件/终极深度总结.md"

# 使用的模型：推荐换成 deepseek-flash 支持百万级上下文
MODEL_NAME = "deepseek-flash"

# ==========================================
# 🚀 2. 核心逻辑区（不需要改）
# ==========================================
URL = "https://api.deepseek.com/v1/chat/completions"


def read_extracted_text(file_path):
    """读取已经提取好的 md 纯文本文件"""
    if not os.path.exists(file_path):
        print(f"❌ 找不到文件: {file_path}，请检查路径！")
        return None

    print(f"📂 正在读取文件: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return content


def summarize_with_deepseek(text):
    """调用云端 API 进行深度总结"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = (
            "这是一份提取自个人项目的纯文本代码和学习笔记汇总（包含HTML/CSS/JS/PY）。\n"
            "请发挥你作为顶级编程导师的能力，帮我写一份极其深度的总结报告，必须包含以下三个部分：\n"
            "1. 核心知识点提炼（按语言分类，提炼精髓）。\n"
            "2. 踩坑记录分析（找出笔记中提到的错误、报错或易错点，按‘现象->根因->解法’整理）。\n"
            "3. 实战应用与能力自评（分析代码中的实战项目，评估我的技术水平）。\n"
            "请务必直接输出 Markdown 格式的纯文本。\n\n"
            "以下是代码内容：\n" + text
    )

    data = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "你是一个顶级的编程导师，擅长提炼知识精华，洞察代码逻辑。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }

    print(f"🚀 正在将内容发送到 DeepSeek 云端，请稍候...")
    response = requests.post(URL, headers=headers, json=data)

    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    else:
        return f"❌ API 报错 (状态码 {response.status_code}): {response.text}"


if __name__ == "__main__":
    # 1. 读取提取好的内容
    extracted_text = read_extracted_text(INPUT_FILE)

    if extracted_text:
        # 🔍 核心：先打印出真实的字符总数！
        total_chars = len(extracted_text)
        print(f"📊 读取成功！文本真实总字符数为: {total_chars} 个字符")

        # 🛡️ 保护分支：DeepSeek 的安全上下文限制（约 80 万字符，太长了会直接报错 400）
        MAX_CHAR_LIMIT = 800000

        if total_chars > MAX_CHAR_LIMIT:
            print(f"⚠️ 警告：文件超过了 {MAX_CHAR_LIMIT} 字符限制，为防止 API 报错，将截取前 {MAX_CHAR_LIMIT} 个字符发送。")
            extracted_text = extracted_text[:MAX_CHAR_LIMIT]
        else:
            print("✅ 字符数在安全范围内，将完整发送。")

        # 2. 发送给 AI 进行总结
        summary_result = summarize_with_deepseek(extracted_text)

        # 3. 保存结果到新文件
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            f.write(summary_result)

        print(f"\n✅ 总结完成！请去查看新文件：{OUTPUT_FILE}")