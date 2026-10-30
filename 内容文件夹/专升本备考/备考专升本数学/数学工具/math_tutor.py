# -*- coding: utf-8 -*-
"""专升本数学答疑：数学家/数学老师人设、DeepSeek 调用、按分类写入日志。"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any

TOOL_DIR = Path(__file__).resolve().parent
BASE = TOOL_DIR.parent
LOG_DIR = TOOL_DIR / "数学问答日志"

API_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-chat"

# 分类名同时作为页面 tab、日志文件名和 API 的 mode。
CATEGORY_FILES = {
    "题目讲解": "题目讲解.jsonl",
    "错题诊断": "错题诊断.jsonl",
    "概念公式": "概念公式.jsonl",
    "其他": "其他.jsonl",
}
TUTOR_CATEGORIES = tuple(CATEGORY_FILES)

_ALIASES = {
    "problem": "题目讲解",
    "question": "题目讲解",
    "solution": "题目讲解",
    "题目": "题目讲解",
    "讲解": "题目讲解",
    "错题": "错题诊断",
    "diagnosis": "错题诊断",
    "mistake": "错题诊断",
    "error": "错题诊断",
    "concept": "概念公式",
    "formula": "概念公式",
    "概念": "概念公式",
    "公式": "概念公式",
    "other": "其他",
    "qa": "其他",
    "问答": "其他",
}

SYSTEM_PROMPT = """你是一位严谨、耐心的专升本数学老师，具有数学家的严谨和教学经验。你熟悉专升本高等数学、初等数学衔接、常见题型、计算易错点和学生的思维卡点。你的回答对象是准备专升本考试的中文母语大学生。

总要求：
1. 用中文讲解；数学公式用 LaTeX，行内用 $...$，独立公式用 $$...$$。
2. 只输出 Markdown 正文，不要输出 HTML、JSON、代码围栏外的系统说明，也不要提到“日志”“API”“系统提示”。
3. 先判断题目类型和知识点，再给结论/步骤；不要跳步，关键变形说明依据。
4. 计算题要展示过程并检验；证明题要写清已知、求证、关键推理；应用题要写清变量和条件。
5. 不确定或题目信息不足时，先明确假设，再按最合理的考试语境作答；不要编造条件。
6. 不要使用 Markdown 表格；用二级/三级标题、短段落、编号列表组织。
7. 语言具体、克制，不堆砌套话；最后指出最容易错的一步。

根据用户给出的 mode 执行：

【题目讲解】
- 先抄出/概括题目，确认要求求什么。
- 指出知识点、所属章节和可能的方法。
- 给出完整解题步骤，每一步写清依据（公式、定理、等价变形）。
- 单独标出最终答案，并做代回/量纲/范围检验。
- 最后给 1—2 个同类题提醒或易错点。

【错题诊断】
- 先复述学生的解法或错误答案（如果没有，明确说明按常见错误分析）。
- 找到第一处真正的错误，说明错因（概念、公式条件、计算、逻辑、审题）。
- 给出正确解法，并对比错误解法的关键差异。
- 给一个同类型变式，帮助学生迁移。

【概念公式】
- 给定义、使用条件、几何/代数意义。
- 写清公式的常见变形和适用边界。
- 给一个典型例子和一个反例/易错点。
- 如果多个概念易混，用并列要点对比，不用表格。

【其他】
- 回答学习方法、考试策略、概念疑问、计算技巧等问题。
- 先给结论，再给依据和例子。
- 需要时给出可执行的练习建议。

最后检查：题目条件是否用全？每一步是否可复核？最终答案是否单独标出？公式是否符合 LaTeX？"""


class TutorError(Exception):
    """可以直接展示给用户的答疑错误。"""


def read_api_key() -> str:
    env_key = str(os.environ.get("DEEPSEEK_API_KEY", "")).strip()
    if env_key:
        return env_key

    candidates = [
        BASE.parent / "共享配置" / "API.txt",
        TOOL_DIR / "API.txt",
        BASE.parent / "备考专升本英语" / "词素工具" / "API.txt",
        Path.home() / ".word_archiver_api_key",
    ]
    for path in candidates:
        try:
            key = path.read_text(encoding="utf-8-sig").strip()
        except OSError:
            continue
        if key:
            return key
    raise TutorError(
        "缺少 DeepSeek API Key。请把 Key 写入 专升本备考/共享配置/API.txt，"
        "或设置环境变量 DEEPSEEK_API_KEY。"
    )


def normalize_mode(raw: str) -> str:
    value = str(raw or "").strip()
    if value in CATEGORY_FILES:
        return value
    alias = _ALIASES.get(value.lower())
    if alias:
        return alias
    raise TutorError(
        "未知的答疑分类，请使用：题目讲解 / 错题诊断 / 概念公式 / 其他。"
    )


def _log_path(category: str) -> Path:
    return LOG_DIR / CATEGORY_FILES[category]


def _append_log(record: dict[str, Any], category: str) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    line = json.dumps(record, ensure_ascii=False)
    with _log_path(category).open("a", encoding="utf-8", newline="\n") as fh:
        fh.write(line + "\n")


def ask_tutor(mode: str, question: str) -> dict[str, Any]:
    category = normalize_mode(mode)
    question = str(question or "").strip()
    if not question:
        raise TutorError("请输入要问的题目或问题。")
    if len(question) > 4000:
        raise TutorError("题目太长了，请控制在 4000 字以内。")

    key = read_api_key()
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": json.dumps(
                    {"mode": category, "question": question}, ensure_ascii=False
                ),
            },
        ],
        "temperature": 0.2,
        "max_tokens": 4000,
    }
    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
        },
        method="POST",
    )

    started = time.monotonic()
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            raw = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise TutorError("DeepSeek API 返回 HTTP %s：%s" % (exc.code, detail)) from exc
    except urllib.error.URLError as exc:
        raise TutorError("无法连接 DeepSeek API：%s" % exc.reason) from exc
    except TimeoutError as exc:
        raise TutorError("DeepSeek API 请求超时，请稍后重试。") from exc

    try:
        data = json.loads(raw)
        answer = str(data["choices"][0]["message"]["content"]).strip()
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise TutorError("DeepSeek API 响应格式异常，请稍后重试。") from exc

    if not answer:
        raise TutorError("AI 没有返回内容，请换一种问法重试。")

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    record = {
        "time": now,
        "mode": category,
        "question": question,
        "answer": answer,
        "model": MODEL,
        "duration_ms": int((time.monotonic() - started) * 1000),
        "status": "ok",
        "subject": "math",
    }
    logged = True
    warning = ""
    try:
        _append_log(record, category)
    except OSError as exc:
        logged = False
        warning = "答案已生成，但日志写入失败：%s" % exc

    result: dict[str, Any] = {
        "ok": True,
        "mode": category,
        "time": now,
        "answer": answer,
        "model": MODEL,
        "logged": logged,
    }
    if warning:
        result["warning"] = warning
    return result


def read_tutor_logs(category: str = "all", limit: int = 20) -> dict[str, Any]:
    category = str(category or "all").strip()
    if category and category.lower() != "all":
        category = normalize_mode(category)
    else:
        category = "all"

    try:
        limit = int(limit)
    except (TypeError, ValueError):
        limit = 20
    limit = max(1, min(limit, 50))

    paths = (
        [_log_path(category)]
        if category != "all"
        else [LOG_DIR / name for name in CATEGORY_FILES.values()]
    )
    entries: list[dict[str, Any]] = []
    for path in paths:
        if not path.exists():
            continue
        try:
            lines = path.read_text(encoding="utf-8-sig").splitlines()
        except OSError:
            continue
        for line in lines:
            line = line.strip()
            if not line:
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(item, dict):
                entries.append(item)

    entries.sort(key=lambda item: str(item.get("time", "")), reverse=True)
    return {
        "ok": True,
        "category": category,
        "total": len(entries),
        "entries": entries[:limit],
    }


def health() -> dict[str, Any]:
    try:
        read_api_key()
        has_key = True
    except TutorError:
        has_key = False
    return {
        "ok": True,
        "service": "math-tutor",
        "model": MODEL,
        "api_key": has_key,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
