# ============================================================
#  导入必要的库
# ============================================================
import requests
import json
from datetime import datetime
import os
import re
from bs4 import BeautifulSoup

# ============================================================
#  配 置 区
# ============================================================

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "deepseek-r1:32b"

BASE_DIR = r"D:\GitHub\my_web\内容文件夹\AI\AI模型问题记录\存放记录"
KNOWLEDGE_INDEX = r"D:\GitHub\my_web\内容文件夹\AI\AI模型问题记录\AI知识库\knowledge_index.json"

# 全局变量
last_saved_index = 0
show_reasoning = False
auto_save = True
chat_mode = False


# ============================================================
#  工 具 函 数
# ============================================================

def sanitize_filename(text):
    return re.sub(r'[<>:"/\\|?*]', '_', text).strip()


def ensure_file_exists(file_path):
    save_dir = os.path.dirname(file_path)
    os.makedirs(save_dir, exist_ok=True)
    if not os.path.exists(file_path):
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"# {os.path.basename(file_path).replace('.md', '')} 对话记录\n\n")
            f.write(f"**模型**：{MODEL_NAME}\n")
            f.write(f"**创建时间**：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("---\n\n")
        print(f"📁 已创建新对话文件：{file_path}")
        return False
    else:
        print(f"📂 已找到现有对话文件：{file_path}")
        return True


def load_history_from_file(file_path):
    messages = []
    if not os.path.exists(file_path):
        return messages
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        parts = re.split(r'\n## \d+\. 🧑 用户\n', content)
        for part in parts[1:]:
            lines = part.strip().split('\n')
            if not lines:
                continue
            user_content = '\n'.join(lines).strip()
            if user_content:
                messages.append({"role": "user", "content": user_content})
            ai_blocks = re.split(r'\n### \d+\. 🤖 模型\n', part)
            if len(ai_blocks) > 1:
                ai_content = ai_blocks[1].strip()
                if ai_content:
                    messages.append({"role": "assistant", "content": ai_content})
        if messages:
            print(f"✅ 已从文件中加载 {len(messages) // 2} 轮对话历史")
        return messages
    except Exception as e:
        print(f"⚠️ 加载历史记录失败：{e}")
        return []


def save_to_markdown(file_path, messages, last_idx):
    if not messages or len(messages) <= last_idx:
        return last_idx
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "a", encoding="utf-8") as f:
        for idx in range(last_idx, len(messages)):
            msg = messages[idx]
            if msg.get("skip_save", False):
                continue
            if msg["role"] == "user":
                f.write(f"\n## {idx // 2 + 1}. 🧑 用户\n\n")
                f.write(f"{msg['content']}\n\n")
            else:
                f.write(f"### {idx // 2 + 1}. 🤖 模型\n\n")
                f.write(f"{msg['content']}\n\n")
        f.write("---\n*当前会话结束*\n")
    print(f"💾 已追加保存 {len(messages) - last_idx} 条新消息到：{file_path}")
    return len(messages)


def load_knowledge_index(index_path):
    if not os.path.exists(index_path):
        print(f"⚠️ 索引文件不存在：{index_path}")
        return {}
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("categories", {})
    except Exception as e:
        print(f"⚠️ 加载索引文件失败：{e}")
        return {}


def read_html_content(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        soup = BeautifulSoup(html_content, 'html.parser')
        text = soup.get_text(separator='\n', strip=True)
        return text
    except Exception as e:
        print(f"⚠️ 读取文件失败：{file_path}，错误：{e}")
        return ""


def load_knowledge_by_category(category_files):
    if not category_files:
        return ""
    context_parts = []
    for file_path in category_files:
        content = read_html_content(file_path)
        if content:
            filename = os.path.basename(file_path)
            context_parts.append(f"===== {filename} =====\n\n{content}\n\n")
    if not context_parts:
        return ""
    return "以下是我的学习笔记，请基于这些内容回答我的问题（不要复述笔记内容）：\n\n" + "\n\n".join(context_parts)


def parse_multi_choice(choice, max_num):
    if not choice or choice.strip() == "0":
        return []
    if choice.strip().lower() == "all":
        return list(range(max_num))
    selected = set()
    for part in choice.split(','):
        part = part.strip()
        if not part:
            continue
        if '-' in part:
            try:
                start, end = part.split('-')
                start = int(start.strip())
                end = int(end.strip())
                if start > end:
                    start, end = end, start
                for i in range(max(1, start), min(max_num, end) + 1):
                    selected.add(i - 1)
            except ValueError:
                print(f"⚠️ 范围格式无效：{part}，跳过")
        else:
            if part.isdigit():
                idx = int(part)
                if 1 <= idx <= max_num:
                    selected.add(idx - 1)
            else:
                print(f"⚠️ 无效输入：{part}，跳过")
    return list(selected)


def ask_ollama(prompt):
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": True,
        "options": {"num_predict": 2048}
    }
    try:
        resp = requests.post(OLLAMA_URL, json=payload, stream=True, timeout=180)
        resp.raise_for_status()
        print("\n🤖 ", end="", flush=True)
        full_response = ""
        line_len = 0
        max_line_len = 80
        for line in resp.iter_lines():
            if line:
                try:
                    chunk = json.loads(line.decode('utf-8'))
                    token = chunk.get("response", "")
                    if token:
                        if line_len + len(token) > max_line_len:
                            print("\n", end="", flush=True)
                            line_len = 0
                        print(token, end="", flush=True)
                        full_response += token
                        line_len += len(token)
                    if chunk.get("done", False):
                        break
                except json.JSONDecodeError:
                    continue
        print()
        return full_response.strip()
    except requests.exceptions.Timeout:
        return "⚠️ 请求超时"
    except requests.exceptions.ConnectionError:
        return "⚠️ 无法连接 Ollama"
    except Exception as e:
        return f"⚠️ 请求出错：{e}"


def build_context_from_messages(messages):
    if not messages:
        return ""
    history = "\n".join([
        f"{'用户' if m['role'] == 'user' else 'AI'}：{m['content']}"
        for m in messages
    ])
    if chat_mode:
        system_prompt = (
            "你现在是一个友好的聊天助手。请用自然、亲切的语言回应对方，"
            "不需要解析题目、不需要给出步骤，也不需要输出任何推理过程。"
            "就像朋友之间聊天一样。"
        )
    else:
        if show_reasoning:
            system_prompt = (
                "你是一个善于思考的AI助手。在回答每个问题之前，请先列出你的推理步骤（分点列出），"
                "然后再给出最终答案。请确保推理过程清晰、有条理。"
            )
        else:
            system_prompt = (
                "你是一个AI助手。请直接给出最终答案，不要输出任何推理过程、分析、思考步骤或额外的解释。"
                "只输出答案本身，不要重复用户问题，也不要复述提供的笔记内容。"
            )
    return system_prompt + "\n\n" + history


def get_multiline_input():
    temp_file = r"D:\GitHub\my_web\内容文件夹\AI\AI模型问题记录\源代码\临时对话框.txt"
    os.makedirs(os.path.dirname(temp_file), exist_ok=True)
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write("# 在此输入你的多行问题，保存后关闭此文件。\n")
        f.write("# 内容将自动提交给 AI。\n")
    os.system(f"notepad {temp_file}")
    try:
        with open(temp_file, "r", encoding="utf-8") as f:
            content = f.read()
        lines = [line for line in content.splitlines() if not line.strip().startswith('#')]
        content = '\n'.join(lines).strip()
        return content
    except Exception as e:
        print(f"⚠️ 读取临时文件失败：{e}")
        return ""
    finally:
        with open(temp_file, "w", encoding="utf-8") as f:
            f.write("# 此文件已读取，内容已提交。\n")
            f.write("# 下次使用 /note 时会重新生成内容。\n")


def prompt_save_decision(file_path, messages, last_idx):
    if not messages or len(messages) <= last_idx:
        return last_idx
    while True:
        choice = input("\n💾 是否保存当前对话到文件？(y/n，默认y)：").strip().lower()
        if choice == '' or choice == 'y':
            return save_to_markdown(file_path, messages, last_idx)
        elif choice == 'n':
            print("⏭️ 跳过保存")
            return last_idx
        else:
            print("⚠️ 请输入 y 或 n")


def scan_current_level(base_dir, rel_path=''):
    """
    扫描指定相对路径下的直接子目录和 .md 文件
    返回 (subdirs, md_files)
    """
    full_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(full_path):
        return [], []
    subdirs = []
    md_files = []
    for entry in os.listdir(full_path):
        entry_full = os.path.join(full_path, entry)
        if os.path.isdir(entry_full):
            subdirs.append(entry)
        elif entry.endswith('.md'):
            md_files.append(entry)
    return subdirs, md_files


def navigate_conversations(base_dir):
    """
    交互式导航对话记录，返回 (folder_rel_path, file_name) 或 (None, None)
    - 如果用户选择了一个已有文件，返回 (路径, 文件名)
    - 如果用户在当前目录新建文件，返回 (当前路径, 新文件名)
    - 如果用户选择手动输入（0），返回 (None, None)
    """
    current_path = ''  # 相对于 BASE_DIR 的路径
    while True:
        subdirs, md_files = scan_current_level(base_dir, current_path)
        display_path = current_path if current_path else '根目录'
        print(f"\n📂 当前目录：{display_path}")
        if subdirs:
            print("  子文件夹：")
            for idx, d in enumerate(subdirs, 1):
                print(f"    {idx}. {d}/")
        if md_files:
            print("  对话文件：")
            for idx, f in enumerate(md_files, 1):
                print(f"    {chr(ord('a') + idx - 1)}. {f}")  # a,b,c...
        print("  操作：")
        print("    输入文件夹编号进入子文件夹")
        print("    输入文件字母选择文件")
        print("    输入 n 在当前目录新建文件")
        print("    输入 .. 返回上级目录")
        print("    输入 0 放弃选择，进入手动输入")
        choice = input("\n请选择：").strip()
        if choice == '0':
            return None, None
        if choice == '..':
            if current_path:
                current_path = os.path.dirname(current_path)
                if current_path == '.':
                    current_path = ''
                continue
            else:
                print("⚠️ 已在根目录，无法返回上级。")
                continue
        # 判断是否是 'n'（新建文件）
        if choice.lower() == 'n':
            new_filename = input("请输入新文件名（不需要后缀，自动补 .md）：").strip()
            if not new_filename:
                print("⚠️ 文件名不能为空。")
                continue
            if not new_filename.endswith(".md"):
                new_filename += ".md"
            # 检查是否与现有文件重名（可选的提醒）
            if new_filename in md_files:
                print(f"⚠️ 文件 '{new_filename}' 已存在，将加载已有文件。")
            return current_path, new_filename
        # 判断是否是数字（进入子文件夹）
        if choice.isdigit():
            idx = int(choice)
            if 1 <= idx <= len(subdirs):
                if current_path:
                    current_path = os.path.join(current_path, subdirs[idx - 1])
                else:
                    current_path = subdirs[idx - 1]
                continue
            else:
                print("⚠️ 无效的文件夹编号。")
                continue
        # 判断是否是单个字母（选择文件）
        if len(choice) == 1 and choice.isalpha():
            idx = ord(choice.lower()) - ord('a')
            if 0 <= idx < len(md_files):
                return current_path, md_files[idx]
            else:
                print("⚠️ 无效的文件选择。")
                continue
        print("⚠️ 无效输入，请重新选择。")


# ============================================================
#  主 程 序
# ============================================================

def main():
    global last_saved_index, show_reasoning, auto_save, chat_mode

    print(f"\n🤖 本地模型聊天（模型：{MODEL_NAME}）")
    print("=" * 50)

    reasoning_choice = input("\n是否显示AI的推理过程？(y/n，默认n)：").strip().lower()
    show_reasoning = (reasoning_choice == 'y')
    print(f"✅ 推理显示：{'开启' if show_reasoning else '关闭'}")

    # ---- 选择已有对话记录（逐层导航） ----
    folder_name = None
    file_name = None
    if os.path.exists(BASE_DIR):
        print("\n📂 是否浏览已有对话记录？(y/n，默认n)：")
        browse = input().strip().lower()
        if browse == 'y':
            result = navigate_conversations(BASE_DIR)
            if result[0] is not None:
                folder_name = result[0]
                file_name = result[1]
                print(f"✅ 已选择：{folder_name} / {file_name}")

    # ---- 如果未选择已有记录，则手动输入 ----
    if folder_name is None or file_name is None:
        print("\n📂 请输入本次对话的保存位置：")
        folder_name = input("  文件夹名（可多层，如 二级备考/函数专题）：").strip()
        if not folder_name:
            folder_name = "默认对话"
        folder_name = folder_name.replace('\\', '/').strip('/')
        file_name = input("  文件名（.md）：").strip() or f"对话_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        if not file_name.endswith(".md"):
            file_name += ".md"

    save_dir = os.path.join(BASE_DIR, folder_name)
    save_path = os.path.join(save_dir, file_name)

    print(f"\n📂 当前对话房间：{folder_name} / {file_name}")
    print("📌 导航：编号进入分类 | b返回 | d完成 | 文件多选用逗号或范围如 1-5")
    print("📌 对话：/save 手动保存 | /nosave 关闭保存询问 | /autosave 开启保存询问")
    print("📌 /exit 退出（不保存） | /note 打开记事本编写多行问题")
    print("📌 你也可以在输入中说“聊天”或“解题”，AI会自动切换模式。")
    print("=" * 50)

    ensure_file_exists(save_path)
    messages = load_history_from_file(save_path)
    last_saved_index = len(messages)

    # ---- 加载知识库索引（原有功能不变） ----
    categories = load_knowledge_index(KNOWLEDGE_INDEX)
    if categories:
        print("\n📚 知识库导航（从顶层分类开始）")
        print("=" * 40)

        selected_files = []
        current_category = None
        current_files = []

        while True:
            if current_category is None:
                category_list = list(categories.keys())
                print("\n📁 顶层分类：")
                for idx, name in enumerate(category_list, 1):
                    file_count = len(categories[name])
                    print(f"  {idx}. {name}（{file_count} 个文件）")
                print("  d. 完成选择，开始对话")

                choice = input("\n请选择（输入编号进入分类，d=完成）：").strip().lower()
                if choice == "d":
                    break
                elif choice.isdigit() and 1 <= int(choice) <= len(category_list):
                    current_category = category_list[int(choice) - 1]
                    current_files = categories[current_category]
                    print(f"\n📂 进入分类：【{current_category}】（共 {len(current_files)} 个文件）")
                else:
                    print("⚠️ 无效输入，请重新选择。")
                    continue
            else:
                print(f"\n📂 当前分类：【{current_category}】")
                print("  输入编号选择文件，支持：1,3,5 或 1-5 或 1,3-5")
                print("  输入 all 全选   |   输入 0 取消当前分类所有选择")
                print("  输入 b 返回上一层   |   输入 d 完成选择")

                for idx, file_path in enumerate(current_files, 1):
                    filename = os.path.basename(file_path)
                    marked = "✅" if file_path in selected_files else "  "
                    print(f"  {marked} {idx}. {filename}")

                choice = input("\n请选择：").strip().lower()
                if choice == "b":
                    current_category = None
                    current_files = []
                    continue
                elif choice == "d":
                    break
                elif choice == "0":
                    for f in current_files:
                        if f in selected_files:
                            selected_files.remove(f)
                    print("✅ 已取消当前分类下的所有选择")
                    continue
                else:
                    selected_indices = parse_multi_choice(choice, len(current_files))
                    if selected_indices:
                        for idx in selected_indices:
                            file_path = current_files[idx]
                            if file_path not in selected_files:
                                selected_files.append(file_path)
                                print(f"✅ 已选择：{os.path.basename(file_path)}")
                            else:
                                selected_files.remove(file_path)
                                print(f"⏹️ 已取消选择：{os.path.basename(file_path)}")
                    else:
                        print("⚠️ 无效输入，请重新选择。")

        if selected_files:
            print(f"\n📚 已选择 {len(selected_files)} 个文件，正在加载...")
            kb_context = load_knowledge_by_category(selected_files)
            if kb_context:
                messages.append({"role": "user", "content": kb_context, "skip_save": True})
                messages.append({"role": "assistant", "content": f"好的，已加载 {len(selected_files)} 个文件的内容。",
                                 "skip_save": True})
                print(f"✅ 已加载 {len(selected_files)} 个文件到知识库（不保存到对话记录）")
        else:
            print("📝 未选择任何文件，将进行纯对话。")
    else:
        print("⚠️ 没有知识库索引，将进行纯对话。")

    # ---- 加载历史对话（兼容手动输入） ----
    print("\n💬 是否加载历史对话记录？")
    conv_choice = input("输入历史对话文件路径（直接回车跳过）：").strip()
    if conv_choice and os.path.exists(conv_choice):
        loaded = load_history_from_file(conv_choice)
        if loaded:
            messages = loaded + messages
            print(f"✅ 已加载历史对话：{os.path.basename(conv_choice)}")

    # 默认模式为解题
    chat_mode = False
    print(f"\n🔄 当前模式：{'聊天' if chat_mode else '解题'}（可通过输入“聊天”或“解题”自动切换）")

    # ---- 对话循环 ----
    print("\n" + "=" * 50)
    print("📌 输入 /save    手动保存")
    print("📌 输入 /nosave  关闭保存询问")
    print("📌 输入 /autosave 开启保存询问")
    print("📌 输入 /exit    退出（不保存）")
    print("📌 输入 /note    打开记事本编写多行问题")
    print("📌 输入 /chat    手动切换到聊天模式")
    print("📌 输入 /solve   手动切换到解题模式")
    print("📌 你也可以在输入中说“聊天”或“解题”，AI会自动切换。")
    print("=" * 50)

    while True:
        try:
            user_input = input("\n🧑 你：").strip()
            if not user_input:
                continue

            # ---- 自然语言自动切换检测 ----
            lower_input = user_input.lower()
            chat_keywords = ["聊天", "聊会天", "闲聊", "唠嗑", "说说话", "聊会儿"]
            solve_keywords = ["解题", "解析", "分析一下", "怎么做", "答案是", "为什么", "解释一下", "步骤"]

            is_chat = any(kw in lower_input for kw in chat_keywords)
            is_solve = any(kw in lower_input for kw in solve_keywords)

            if is_chat and not is_solve:
                chat_mode = True
                print("✅ 已自动切换到【聊天模式】")
            elif is_solve and not is_chat:
                chat_mode = False
                print("✅ 已自动切换到【解题模式】")
            elif is_chat and is_solve:
                chat_mode = False
                print("✅ 检测到解题意图，自动切换到【解题模式】")

            # ---- 手动模式切换命令 ----
            if user_input.lower() == "/chat":
                chat_mode = True
                print("✅ 已切换到【聊天模式】")
                continue

            if user_input.lower() == "/solve":
                chat_mode = False
                print("✅ 已切换到【解题模式】")
                continue

            # ---- 其他命令 ----
            if user_input.lower() == "/note" or user_input.lower() == "/input":
                print("\n📝 正在打开记事本，请编写你的问题（保存后关闭）...")
                multiline = get_multiline_input()
                if multiline:
                    user_input = multiline
                else:
                    print("⏭️ 未输入任何内容，取消本次提问。")
                    continue

            if user_input.lower() == "/exit":
                print("👋 再见！")
                break

            if user_input.lower() == "/save":
                if messages:
                    last_saved_index = save_to_markdown(save_path, messages, last_saved_index)
                else:
                    print("⚠️ 还没有对话内容可保存")
                continue

            if user_input.lower() == "/nosave":
                auto_save = False
                print("⏸️ 已关闭保存询问")
                continue

            if user_input.lower() == "/autosave":
                auto_save = True
                print("▶️ 已开启保存询问")
                continue

            # ---- 正常对话 ----
            messages.append({"role": "user", "content": user_input})
            context = build_context_from_messages(messages)
            reply = ask_ollama(context)
            messages.append({"role": "assistant", "content": reply})

            if auto_save:
                last_saved_index = prompt_save_decision(save_path, messages, last_saved_index)

        except KeyboardInterrupt:
            print("\n\n⚠️ 检测到中断，正在保存...")
            if messages:
                last_saved_index = save_to_markdown(save_path, messages, last_saved_index)
            print("👋 再见！")
            break
        except Exception as e:
            print(f"❌ 发生未预期的错误：{e}")


if __name__ == "__main__":
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError as e:
        print(f"❌ 缺少依赖库：{e}")
        print("请先安装：pip install requests beautifulsoup4")
        exit(1)
    main()
