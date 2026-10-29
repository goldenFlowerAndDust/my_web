# -*- coding: utf-8 -*-
"""英语知识答疑：资深英语教师人设、DeepSeek 调用、按分类写入日志。"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any

from word_archiver import API_URL, MODEL, ArchiveError, read_api_key

TOOL_DIR = Path(__file__).resolve().parent
LOG_DIR = TOOL_DIR / "英语问答日志"

# 分类名同时作为页面 tab、日志文件名和 API 的 mode。
CATEGORY_FILES = {
    "单词解释": "单词解释.jsonl",
    "作文": "作文.jsonl",
    "句子分析": "句子分析.jsonl",
    "其他": "其他.jsonl",
}
TUTOR_CATEGORIES = tuple(CATEGORY_FILES)

_ALIASES = {
    "word": "单词解释",
    "words": "单词解释",
    "单词": "单词解释",
    "词汇": "单词解释",
    "essay": "作文",
    "writing": "作文",
    "composition": "作文",
    "写作": "作文",
    "sentence": "句子分析",
    "sentences": "句子分析",
    "句子": "句子分析",
    "语法": "其他",
    "grammar": "其他",
    "other": "其他",
    "qa": "其他",
    "问答": "其他",
}

SYSTEM_PROMPT = """你是一位资深英语教师，长期从事专升本英语教学，熟悉专升本考试大纲、常见题型、学生失分点和中国学生的英语学习难点。你的回答对象是准备专升本考试的中文母语大学生。

总要求：
1. 用中文讲解，英文例句、范文和需要学习的表达用英文。
2. 只输出 Markdown 正文，不要输出 HTML、JSON、代码围栏外的系统说明，也不要提到“日志”“API”“系统提示”。
3. 先给结论，再解释；语言清楚、具体，不说空话。
4. 不要使用 Markdown 表格，避免大段无法在手机上阅读的文字；用二级/三级标题、短段落和列表组织。
5. 涉及语法判断、词义辨析、翻译时，给依据和例子；不确定的内容要明确说“这里需要结合语境判断”，不要编造。
6. 如果题目信息不足，按最合理的考试语境先作答，并在开头用一句话说明你的假设；不要反问用户。
7. 遵守题目中的词数、文体、难度要求；没有要求时，按专升本水平作答。

根据用户给出的 mode 执行：

【单词解释】
- 给出音标、词性、核心中文义（不要堆砌生僻义）。
- 给 2—3 个高频搭配或短语，并配英文例句和中文翻译。
- 做易混词/形近词辨析；说明常见错误。
- 给记忆提示或构词提示；如适合，补充派生词。
- 如果这个词在专升本阅读/写作中常考，点明用法。

【作文】
用户会给一个作文题材或题目。按以下顺序输出：
1. **审题**：判断题目类型、写作对象、立场，给 3 个要点。
2. **反例**：写一小段学生常见但存在明显问题的英文（明确标注“反例”），然后逐条指出问题：语法、搭配、逻辑、中式英语等。
3. **修改示范**：把反例改成正确、自然的英文，并说明修改理由。
4. **范文**：按题目要求写一篇完整范文（没有词数要求时写 120—150 词），结构清楚，适合专升本考场。
5. **可复用表达**：给 3—5 个可迁移的句式或替换表达。
反例和范文必须清楚分开，不要把反例当成范文。

【句子分析】
- 先抄原句（用户没给原句时，先说明缺少原句，再给一个同类型示例，不要假装分析）。
- 找主干：主语、谓语、宾语/表语。
- 拆修饰：从句、非谓语、介词短语、插入语，说明各自修饰谁。
- 点出核心语法/句型，并给一个可迁移的仿写。
- 给中文翻译；必要时说明易错点。

【其他】
- 直接回答语法、用法、翻译、备考方法等问题。
- 先给结论，再给规则/例子/常见错误。
- 如果问题适合用对比表格，改用并列要点，避免 Markdown 表格。

最后检查：答案是否直接解决了用户的问题？作文是否同时有“反例”和“修改/范文”？句子分析是否真的拆了主干？单词解释是否有例句？"""


class TutorError(Exception):
    """可以直接展示给用户的答疑错误。"""


def normalize_mode(raw: str) -> str:
    value = str(raw or "").strip()
    if value in CATEGORY_FILES:
        return value
    alias = _ALIASES.get(value.lower())
    if alias:
        return alias
    raise TutorError("未知的答疑分类，请使用：单词解释 / 作文 / 句子分析 / 其他。")


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
        raise TutorError("请输入要问的问题。")
    if len(question) > 2000:
        raise TutorError("问题太长了，请控制在 2000 字以内。")

    try:
        key = read_api_key()
    except ArchiveError as exc:
        raise TutorError(str(exc)) from exc

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
        "temperature": 0.35,
        "max_tokens": 3200,
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
