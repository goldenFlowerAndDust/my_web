# -*- coding: utf-8 -*-
"""
词素自动归档核心模块。

功能：
1. 调用 DeepSeek API 分析一个英文单词的构词方式；
2. 后缀/前缀词写入 专升本英语核心词汇通关.html 的对应词族；
3. 词根/复合词/原子词写入 词素/ 下对应页面；
4. 同步写入 复习清单/data.json，新词标记为第二天的“额外新增”（不占每日 20 个新词）。

API Key 读取顺序：
- 环境变量 DEEPSEEK_API_KEY
- 专升本备考/共享配置/API.txt（推荐，英语/数学共用）
- 词素工具/API.txt（旧位置，兼容）
- 用户目录 .word_archiver_api_key（备用）
- 兼容旧位置：词素工具/api_key.txt
"""

from __future__ import annotations

import html
import json
import os
import re
import shutil
import threading
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent.parent
TOOL_DIR = BASE / "词素工具"
WORD_PAGE = BASE / "专升本英语核心词汇通关.html"
DATA_JSON = BASE / "复习清单" / "data.json"
CI_DIR = BASE / "词素"
LOG_FILE = TOOL_DIR / "归档日志.jsonl"
BACKUP_DIR = TOOL_DIR / "backups"
REVIEW_BACKUP_DIR = TOOL_DIR / "review_backups"
API_TXT = TOOL_DIR / "API.txt"
SHARED_KEY_FILE = BASE.parent / "共享配置" / "API.txt"
HOME_KEY_FILE = Path.home() / ".word_archiver_api_key"
API_KEY_FILE = TOOL_DIR / "api_key.txt"  # 兼容旧位置

API_URL = os.environ.get("DEEPSEEK_API_URL", "https://api.deepseek.com/chat/completions")
MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
DAILY_NEW = 20
WRITE_LOCK = threading.Lock()

TYPE_LABELS = {
    "suffix": "后缀派生词",
    "prefix": "前缀派生词",
    "root_family": "词根族 / 词根本体-变体",
    "compound": "复合词",
    "atom": "原子词",
}

FOLDER_BY_TYPE = {
    "derived": "词根-本体-变体【派生词】",
    "root_family": "词根族",
    "compound": "复合词",
    "atom": "原子词",
}

SYSTEM_PROMPT = r"""你是一位严谨的英语构词法老师，服务对象是中国专升本英语学习者。
分析且只分析一个英文单词，输出一个 JSON 对象，不要输出 Markdown、解释文字或代码块。

分类规则（必须按真实构词判断，不能只看结尾字母）：
1. suffix：一个能产的派生后缀明确适用，去掉后缀后能得到真实词根/基础词，且词义能由构词解释。
   例如 helpful = help + -ful；happiness = happy + -ness（注意 y→i）。
   反例：corner、flower、mother 不能因为结尾是 -er 就当作 agent suffix。
2. prefix：一个明确的前缀适用，例如 unhappy = un- + happy；rewrite = re- + write。
3. root_family：这个词最适合通过词根族/词根本体与变体来记；root 可以是自由词根（如 law）
   或黏着词根（如 intellig-）。请给出 root、root_meaning_zh、root_is_free、related（同族词）。
4. compound：由两个或以上自由语素复合而成，如 sunflower = sun + flower；请给出 components。
5. atom：不能可靠拆分的原子词，如 book、water、corner；不要硬拆。

其他要求：
- word 必须与输入完全一致（小写）。
- meaning_zh 用简洁中文；senses 1–3 条；每条包含 zh，可选 collocation / collocation_zh。
- example 必须是自然、适合该词的英文例句；example_zh 是准确中文翻译。
- note 用中文说明构词/拼写/易混点，适合直接放进学习卡片。
- level 只能是：小学、初中、高中、专升本、超纲。
- related 只放真实存在的同族词，0–6 条，每条包含 word、meaning_zh、pos、note。
- 对没有把握的拆分要选择 atom 或 root_family，不要编造词根。
- 输出 JSON 字段：
{
  "word": "helpful",
  "meaning_zh": "有帮助的；有益的",
  "pos": "adj.",
  "level": "小学",
  "morphology": {
    "type": "suffix",
    "affix": "ful",
    "root": "help",
    "root_meaning_zh": "帮助；有助于",
    "root_is_free": true,
    "explanation": "help（帮助）+ -ful（充满……的）",
    "components": []
  },
  "senses": [
    {"zh": "有帮助的；有益的", "collocation": "helpful advice", "collocation_zh": "有用的建议"}
  ],
  "example": "She gave me some helpful advice.",
  "example_zh": "她给了我一些有用的建议。",
  "note": "help + -ful；-ful 常表示“充满……的”。",
  "related": [
    {"word": "helpfully", "meaning_zh": "有帮助地", "pos": "adv.", "note": "helpful + -ly"}
  ]
}"""


class ArchiveError(Exception):
    """可展示给用户的归档错误。"""


# ---------------------------------------------------------------------------
# 基础工具
# ---------------------------------------------------------------------------

def read_api_key() -> str:
    key = (os.environ.get("DEEPSEEK_API_KEY") or "").strip()
    if key:
        return key
    for path in (SHARED_KEY_FILE, API_TXT, HOME_KEY_FILE, API_KEY_FILE):
        if path.exists():
            key = path.read_text(encoding="utf-8").strip()
            if key:
                return key
    raise ArchiveError(
        "未配置 API Key：请写入 专升本备考/共享配置/API.txt，"
        "或设置 DEEPSEEK_API_KEY。"
    )


def normalize_word(raw: str) -> str:
    word = (raw or "").strip().lower()
    if not re.fullmatch(r"[a-z][a-z'-]{0,48}", word):
        raise ArchiveError("请输入单个英文单词（只允许字母、连字符和撇号，最长 49 字符）。")
    if word.endswith("'s"):
        word = word[:-2]
    return word


def esc(value: Any) -> str:
    return html.escape(str(value if value is not None else ""), quote=False)


def esc_attr(value: Any) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


def strip_affix(value: str) -> str:
    return (value or "").strip().strip("-").strip().lower()


def safe_component(value: str, fallback: str = "word") -> str:
    value = (value or "").strip()
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "-", value)
    value = value.strip(" .-")
    return value or fallback


def today_str() -> str:
    return date.today().isoformat()


def add_days(date_str: str, days: int) -> str:
    return (date.fromisoformat(date_str) + timedelta(days=days)).isoformat()


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text_atomic(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(text, encoding="utf-8", newline="\n")
    os.replace(tmp, path)


def append_log(record: dict[str, Any]) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        **record,
    }
    with LOG_FILE.open("a", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")


def backup_paths(paths: list[Path]) -> str:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    target = BACKUP_DIR / stamp
    target.mkdir(parents=True, exist_ok=True)
    for path in paths:
        if not path.exists():
            continue
        try:
            rel = path.relative_to(BASE)
        except ValueError:
            rel = Path(path.name)
        dest = target / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
    return str(target.relative_to(BASE))


# ---------------------------------------------------------------------------
# DeepSeek API
# ---------------------------------------------------------------------------

def _extract_json_object(content: str) -> dict[str, Any]:
    text = (content or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end < start:
        raise ArchiveError("API 没有返回 JSON 对象，请重试。")
    try:
        obj = json.loads(text[start:end + 1])
    except json.JSONDecodeError as exc:
        raise ArchiveError("API 返回的 JSON 无法解析：%s" % exc) from exc
    if not isinstance(obj, dict):
        raise ArchiveError("API 返回的不是 JSON 对象。")
    return obj


def call_deepseek(word: str, hint: str = "") -> dict[str, Any]:
    key = read_api_key()
    user_payload = {"word": word}
    if hint.strip():
        user_payload["meaning_hint"] = hint.strip()

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
        ],
        "temperature": 0.15,
        "max_tokens": 2200,
        "response_format": {"type": "json_object"},
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise ArchiveError("DeepSeek API 返回 HTTP %s：%s" % (exc.code, detail)) from exc
    except urllib.error.URLError as exc:
        raise ArchiveError("无法连接 DeepSeek API：%s" % exc.reason) from exc
    except TimeoutError as exc:
        raise ArchiveError("DeepSeek API 请求超时，请稍后重试。") from exc

    try:
        data = json.loads(raw)
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise ArchiveError("DeepSeek API 响应格式异常：%s" % raw[:300]) from exc

    return _extract_json_object(content)


def _normalize_type(raw: str) -> str:
    value = str(raw or "").strip().lower().replace("-", "_")
    aliases = {
        "root": "root_family",
        "root_family": "root_family",
        "rootfamily": "root_family",
        "derived": "root_family",
        "derivation": "root_family",
        "compound": "compound",
        "atom": "atom",
        "atomic": "atom",
        "simple": "atom",
        "suffix": "suffix",
        "prefix": "prefix",
    }
    return aliases.get(value, "")


def _as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() not in {"false", "0", "no", "否", ""}
    return bool(value)


def validate_analysis(raw: dict[str, Any], expected_word: str) -> dict[str, Any]:
    word = normalize_word(str(raw.get("word") or expected_word))
    if word != expected_word:
        # 以用户输入为准，但保留 API 的词义分析；避免 API 改写单词
        word = expected_word

    meaning = str(raw.get("meaning_zh") or "").strip()
    if not meaning:
        raise ArchiveError("API 没有返回中文释义。")

    pos = str(raw.get("pos") or "").strip() or "word"
    level = str(raw.get("level") or "").strip() or "专升本"
    if level not in {"小学", "初中", "高中", "专升本", "超纲"}:
        level = "专升本"

    morph = raw.get("morphology") or {}
    if not isinstance(morph, dict):
        raise ArchiveError("API 返回的 morphology 不是对象。")
    mtype = _normalize_type(morph.get("type"))
    if not mtype:
        raise ArchiveError("API 没有给出可识别的构词类型。")

    affix = strip_affix(str(morph.get("affix") or ""))
    root = str(morph.get("root") or "").strip().strip("-")
    root_zh = str(morph.get("root_meaning_zh") or "").strip()
    root_free = _as_bool(morph.get("root_is_free", True))
    explanation = str(morph.get("explanation") or "").strip()
    components = morph.get("components") or []
    if not isinstance(components, list):
        components = []
    components = [str(x).strip() for x in components if str(x).strip()]

    if mtype in {"suffix", "prefix"}:
        if not affix or not re.fullmatch(r"[a-z]{1,10}", affix):
            raise ArchiveError("API 给出的词缀不合法。")
        if mtype == "suffix" and not word.endswith(affix):
            raise ArchiveError("API 把 %s 判为后缀 -%s，但单词不以该后缀结尾。" % (word, affix))
        if mtype == "prefix" and not word.startswith(affix):
            raise ArchiveError("API 把 %s 判为前缀 %s-，但单词不以该前缀开头。" % (word, affix))
        if not root:
            root = word[:-len(affix)] if mtype == "suffix" else word[len(affix):]
        if not root:
            raise ArchiveError("API 没有给出词根/基础词。")
        if not root_zh:
            root_zh = meaning
    elif mtype == "root_family":
        if not root:
            raise ArchiveError("API 判为词根族，但没有给出词根。")
        if not root_zh:
            root_zh = meaning
    elif mtype == "compound":
        if len(components) < 2:
            raise ArchiveError("API 判为复合词，但没有给出至少两个构词成分。")
        root = root or " + ".join(components)
        root_zh = root_zh or meaning
    elif mtype == "atom":
        root = root or word
        root_zh = root_zh or meaning

    senses_raw = raw.get("senses") or []
    senses: list[dict[str, str]] = []
    if isinstance(senses_raw, list):
        for item in senses_raw[:3]:
            if isinstance(item, str):
                zh = item.strip()
                if zh:
                    senses.append({"zh": zh, "collocation": "", "collocation_zh": ""})
            elif isinstance(item, dict):
                zh = str(item.get("zh") or "").strip()
                if not zh:
                    continue
                senses.append({
                    "zh": zh,
                    "collocation": str(item.get("collocation") or "").strip(),
                    "collocation_zh": str(item.get("collocation_zh") or "").strip(),
                })
    if not senses:
        senses = [{"zh": meaning, "collocation": "", "collocation_zh": ""}]

    example = str(raw.get("example") or "").strip()
    example_zh = str(raw.get("example_zh") or "").strip()
    if not example or not example_zh:
        raise ArchiveError("API 没有返回完整的英文例句和中文翻译。")

    note = str(raw.get("note") or "").strip() or explanation or "自动收录"

    related_raw = raw.get("related") or []
    related: list[dict[str, str]] = []
    if isinstance(related_raw, list):
        for item in related_raw[:6]:
            if not isinstance(item, dict):
                continue
            try:
                rw = normalize_word(str(item.get("word") or ""))
            except ArchiveError:
                continue
            if not rw or rw == word:
                continue
            related.append({
                "word": rw,
                "meaning_zh": str(item.get("meaning_zh") or "").strip(),
                "pos": str(item.get("pos") or "").strip(),
                "note": str(item.get("note") or "").strip(),
            })

    if mtype in {"suffix", "prefix"}:
        target_kind = "core"
        target_category = "核心词汇通关"
        target_folder = ""
        target_label = "核心词汇通关 · %s %s" % (
            "-" + affix if mtype == "suffix" else affix + "-",
            "后缀" if mtype == "suffix" else "前缀",
        )
    elif mtype == "root_family":
        if root_free:
            target_kind = "derived"
            target_folder = FOLDER_BY_TYPE["derived"]
            target_label = "词素 / 词根-本体-变体【派生词】"
        else:
            target_kind = "root_family"
            target_folder = FOLDER_BY_TYPE["root_family"]
            target_label = "词素 / 词根族"
        target_category = "词素/" + target_folder
    elif mtype == "compound":
        target_kind = "compound"
        target_folder = FOLDER_BY_TYPE["compound"]
        target_category = "词素/" + target_folder
        target_label = "词素 / 复合词"
    else:
        target_kind = "atom"
        target_folder = FOLDER_BY_TYPE["atom"]
        target_category = "词素/" + target_folder
        target_label = "词素 / 原子词"

    return {
        "word": word,
        "meaning_zh": meaning,
        "pos": pos,
        "level": level,
        "morphology": {
            "type": mtype,
            "affix": affix,
            "root": root,
            "root_meaning_zh": root_zh,
            "root_is_free": root_free,
            "explanation": explanation or ("%s = %s + %s" % (word, root, affix)),
            "components": components,
        },
        "senses": senses,
        "example": example,
        "example_zh": example_zh,
        "note": note,
        "related": related,
        "target": {
            "kind": target_kind,
            "category": target_category,
            "folder": target_folder,
            "label": target_label,
        },
        "raw_type": mtype,
    }


def analyze_word(word: str, hint: str = "") -> dict[str, Any]:
    word = normalize_word(word)
    if not word:
        raise ArchiveError("请输入英文单词。")
    raw = call_deepseek(word, hint)
    return validate_analysis(raw, word)


# ---------------------------------------------------------------------------
# 单词页面写入
# ---------------------------------------------------------------------------

def _sense_items_html(analysis: dict[str, Any]) -> str:
    controls = "①②③④⑤"
    rows = []
    for idx, sense in enumerate(analysis["senses"][:3]):
        colloc = ""
        if sense.get("collocation"):
            colloc = ' <span class="colloc"><code class="en">%s</code><span class="zh">%s</span></span>' % (
                esc(sense["collocation"]), esc(sense.get("collocation_zh", ""))
            )
        rows.append(
            '                    <li><span class="sense_no">%s</span><span class="zh">%s</span>%s</li>'
            % (controls[idx], esc(sense["zh"]), colloc)
        )
    return "\n".join(rows)


def word_card_html(analysis: dict[str, Any]) -> str:
    w = analysis
    morph = w["morphology"]
    word = w["word"]
    note = w.get("note") or morph.get("explanation", "")
    return f'''            <li class="word_item" id="word-{esc_attr(word)}" data-word="{esc_attr(word)}">
                <div class="word_line">
                    <code class="en">{esc(morph["root"])}(<span class="zh">{esc(morph["root_meaning_zh"])}</span>)</code>
                    <span class="arrow" aria-hidden="true">——&gt;</span>
                    <code class="en">{esc(word)}(<span class="zh">{esc(w["meaning_zh"])}</span>)</code>
                    <span class="word_pos">{esc(w["pos"])}</span>
                    <span class="word_level">{esc(w["level"])}</span>
                    <button type="button" class="card_toggle">显示</button>
                </div>
                <div class="answer">
                    <ul class="sense_list">
{_sense_items_html(w)}
                    </ul>
                    <p class="example"><span class="example_label">例</span><code class="en">{esc(w["example"])}</code><span class="zh">{esc(w["example_zh"])}</span></p>
                    <p class="note">{esc(note)}</p>
                </div>
            </li>'''


def _insert_into_group(page: str, suffix: str, card: str) -> tuple[str, bool] | None:
    pattern = re.compile(
        r'<article\b[^>]*data-suffix="' + re.escape(suffix) + r'"[^>]*>.*?</article>',
        re.S,
    )
    match = pattern.search(page)
    if not match:
        return None
    block = match.group(0)
    open_idx = block.find('<ol class="word_div">')
    close_idx = block.rfind("</ol>")
    if open_idx < 0 or close_idx < 0:
        raise ArchiveError("目标词族缺少 word_div 列表，无法插入。")
    new_block = block[:close_idx] + card + "\n" + block[close_idx:]
    return page[:match.start()] + new_block + page[match.end():], False


def _new_group_html(analysis: dict[str, Any]) -> str:
    w = analysis
    morph = w["morphology"]
    affix = morph["affix"]
    is_suffix = morph["type"] == "suffix"
    label = ("-" + affix) if is_suffix else (affix + "-")
    title = "%s %s自动收录" % (label, "后缀" if is_suffix else "前缀")
    return f'''        <article class="word_group" data-suffix="{esc_attr(affix)}" id="group_{esc_attr(affix)}" data-auto="1">
            <div class="group_head">
                <div class="group_title">
                    <span class="suffix_badge suffix_auto">{esc(label)}</span>
                    <div>
                        <h2>{esc(title)}</h2>
                        <p class="group_sub">API 自动补充：{esc(w["word"])}</p>
                    </div>
                </div>
                <span class="group_count">1 个词</span>
            </div>
            <div class="group_tips">
                <p><strong>构词提示</strong>{esc(morph["explanation"])}</p>
            </div>
            <ol class="word_div">
{word_card_html(w)}
            </ol>
        </article>'''

def _insert_new_group(page: str, analysis: dict[str, Any]) -> str:
    footer_idx = page.find("<!-- ================= 页脚")
    if footer_idx < 0:
        raise ArchiveError("单词页找不到页脚标记，无法追加新词族。")
    section_close = page.rfind("</section>", 0, footer_idx)
    if section_close < 0:
        raise ArchiveError("单词页找不到词族区域结尾，无法追加新词族。")
    group = _new_group_html(analysis)
    return page[:section_close] + group + "\n\n    " + page[section_close:]


def _ensure_auto_badge_css(page: str) -> str:
    if ".suffix_auto" in page:
        return page
    style_close = page.find("</style>")
    if style_close < 0:
        return page
    css = """
        .suffix_auto {
            background: linear-gradient(135deg, #6C3483 0%, #B7950B 100%);
        }
"""
    return page[:style_close] + css + page[style_close:]


def insert_into_word_page(analysis: dict[str, Any]) -> dict[str, Any]:
    word = analysis["word"]
    morph = analysis["morphology"]
    if morph["type"] not in {"suffix", "prefix"}:
        raise ArchiveError("只有后缀/前缀词才写入核心词汇页。")
    affix = morph["affix"]
    if not WORD_PAGE.exists():
        raise ArchiveError("找不到 专升本英语核心词汇通关.html。")
    page = read_text(WORD_PAGE)
    if re.search(r'data-word="' + re.escape(word) + r'"', page):
        raise ArchiveError("核心词汇页中已经有 %s，未重复写入。" % word)

    card = word_card_html(analysis)
    inserted = _insert_into_group(page, affix, card)
    if inserted:
        new_page, _ = inserted
        group_created = False
        target = "核心词汇通关 · -%s" % affix if morph["type"] == "suffix" else "核心词汇通关 · %s-" % affix
    else:
        new_page = _insert_new_group(page, analysis)
        new_page = _ensure_auto_badge_css(new_page)
        group_created = True
        target = "核心词汇通关 · 新词族 %s%s" % (
            "-" if morph["type"] == "suffix" else "",
            affix if morph["type"] == "suffix" else "-",
        )
    write_text_atomic(WORD_PAGE, new_page)
    return {
        "target": target,
        "group_created": group_created,
        "file": str(WORD_PAGE.relative_to(BASE)),
        "anchor": "word-" + word,
    }


# ---------------------------------------------------------------------------
# 词素页面
# ---------------------------------------------------------------------------

def _ci_page_path(analysis: dict[str, Any]) -> tuple[Path, str]:
    target = analysis["target"]
    kind = target["kind"]
    word = analysis["word"]
    morph = analysis["morphology"]
    root = safe_component(morph.get("root") or word, word)
    if kind == "derived":
        title = "本体-%s、以及它的变体" % root
        filename = "本体-%s、以及它的变体.html" % root
    elif kind == "root_family":
        title = "%s- 词根族" % root
        filename = "词根族：%s-.html" % root
    elif kind == "compound":
        title = "复合词：%s" % word
        filename = "复合词：%s.html" % word
    else:
        title = "原子词：%s" % word
        filename = "原子词：%s.html" % word
    folder = CI_DIR / target["folder"]
    return folder / safe_component(filename, word + ".html"), title


def _ci_card_html(analysis: dict[str, Any], is_main: bool) -> str:
    w = analysis
    morph = w["morphology"]
    word = w["word"]
    anchor = (' id="word-%s" data-word="%s"' % (esc_attr(word), esc_attr(word))) if is_main else ""
    note_parts = [morph.get("explanation", ""), w.get("pos", ""), w.get("level", "")]
    note = " · ".join([p for p in note_parts if p])
    return f'''            <li{anchor}>
                <span><code class="en">{esc(word)}</code>(<span class="zh">{esc(w["meaning_zh"])}</span>)
                <span class="note">{esc(note)}</span></span>
                <p class="example"><span class="example_label">例</span><code class="en">{esc(w["example"])}</code><span class="zh">{esc(w["example_zh"])}</span></p>
            </li>'''


def _related_cards_html(analysis: dict[str, Any]) -> str:
    rows = []
    for item in analysis.get("related", []):
        note = " · ".join([x for x in [item.get("pos", ""), item.get("note", "")] if x])
        rows.append(f'''            <li>
                <span><code class="en">{esc(item["word"])}</code>(<span class="zh">{esc(item.get("meaning_zh", ""))}</span>)
                <span class="note">{esc(note)}</span></span>
            </li>''')
    return "\n".join(rows)


def _ci_page_html(analysis: dict[str, Any], title: str, body_cards: str) -> str:
    w = analysis
    morph = w["morphology"]
    kind_note = {
        "derived": "词根-本体-变体：先抓本体，再扩展到派生词。",
        "root_family": "词根不能独立成词时，整族一起记。",
        "compound": "复合词：拆成自由语素理解，再合起来记。",
        "atom": "原子词：不可再分，直接整体记忆。",
    }.get(w["target"]["kind"], "")
    extra = ""
    if morph.get("components"):
        extra = '<p class="note">构词成分：%s</p>' % esc(" + ".join(morph["components"]))
    return f'''<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(title)}</title>
    <link rel="stylesheet" href="../../../../frontend——前端/JavaScript/JavaScript通用样式表.css">
    <link rel="stylesheet" href="../../单词独有样式表.css">
    <style>
        /* 让自动生成的词素页默认隐藏中文，点击词条或按钮再显示 */
        .hide-zh .zh, .hide-zh .note {{ opacity: 0 !important; visibility: hidden !important; }}
        .hide-zh .zh.show-zh, .hide-zh .note.show-note {{ opacity: 1 !important; visibility: visible !important; }}
    </style>
</head>
<body>
<main>
    <header>
        <h1>{esc(title)}</h1>
    </header>
    <section id="section_1">
        <p class="note">{esc(kind_note)}</p>
        <p class="note">{esc(morph.get("explanation", ""))}</p>
        {extra}
        <ol class="word_div">
{body_cards}
        </ol>
    </section>
    <section id="section_2"></section>
</main>
<script src="../../显示或隐藏.js"></script>
</body>
</html>
'''


def insert_into_ci(analysis: dict[str, Any]) -> dict[str, Any]:
    target = analysis["target"]
    if target["kind"] == "core":
        raise ArchiveError("后缀/前缀词应写入核心词汇页。")
    path, title = _ci_page_path(analysis)
    path.parent.mkdir(parents=True, exist_ok=True)
    main_card = _ci_card_html(analysis, True)
    related = _related_cards_html(analysis)
    created = not path.exists()

    if created:
        cards = main_card
        if related:
            cards += "\n" + related
        page = _ci_page_html(analysis, title, cards)
    else:
        page = read_text(path)
        if re.search(r'data-word="' + re.escape(analysis["word"]) + r'"', page):
            raise ArchiveError("%s 中已经有 %s，未重复写入。" % (path.name, analysis["word"]))
        open_idx = page.find('<ol class="word_div">')
        if open_idx < 0:
            # 在 section_1 末尾补一个列表
            section_close = page.find("</section>")
            if section_close < 0:
                raise ArchiveError("词素页面缺少 section，无法插入。")
            page = page[:section_close] + '\n        <ol class="word_div">\n' + main_card + "\n        </ol>\n    " + page[section_close:]
        else:
            close_idx = page.find("</ol>", open_idx)
            if close_idx < 0:
                raise ArchiveError("词素页面 word_div 未闭合。")
            page = page[:close_idx] + main_card + "\n" + page[close_idx:]

    write_text_atomic(path, page)
    return {
        "target": target["label"],
        "file": str(path.relative_to(BASE)),
        "created": created,
        "anchor": "word-" + analysis["word"],
    }


# ---------------------------------------------------------------------------
# 复习数据 / 日程
# ---------------------------------------------------------------------------

def load_data() -> dict[str, Any]:
    if not DATA_JSON.exists():
        raise ArchiveError("找不到 复习清单/data.json。")
    try:
        data = json.loads(read_text(DATA_JSON))
    except json.JSONDecodeError as exc:
        raise ArchiveError("data.json 不是合法 JSON：%s" % exc) from exc
    if not isinstance(data, dict):
        raise ArchiveError("data.json 顶层不是对象。")
    return data


def all_names(data: dict[str, Any]) -> set[str]:
    names = set()
    for arr in data.values():
        if isinstance(arr, list):
            for item in arr:
                if isinstance(item, dict) and item.get("name"):
                    names.add(str(item["name"]))
    return names


def next_schedule_date(data: dict[str, Any]) -> str:
    counts: dict[str, int] = {}
    for arr in data.values():
        if not isinstance(arr, list):
            continue
        for item in arr:
            if not isinstance(item, dict):
                continue
            if item.get("kind") != "word":
                continue
            if item.get("extra"):
                continue
            d = item.get("created")
            if isinstance(d, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
                counts[d] = counts.get(d, 0) + 1
    d = date.today()
    for _ in range(3650):
        ds = d.isoformat()
        if counts.get(ds, 0) < DAILY_NEW:
            return ds
        d += timedelta(days=1)
    raise ArchiveError("无法找到可用的新词日程。")


def build_data_item(
    analysis: dict[str, Any],
    target: dict[str, Any],
    created: str,
    *,
    extra: bool = False,
    extra_date: str = "",
    source: str = "",
) -> dict[str, Any]:
    w = analysis
    morph = w["morphology"]
    item = {
        "name": w["word"],
        "path": "../" + target["file"].replace("\\", "/") + "#word-" + w["word"],
        "category": w["target"]["category"],
        "level": 0,
        "nextDate": extra_date or created,
        "lastReviewed": None,
        "created": created,
        "modified": created,
        "kind": "word",
        "word": w["word"],
        "zh": w["meaning_zh"],
        "root": morph.get("root", ""),
        "rootZh": morph.get("root_meaning_zh", ""),
        "suffix": morph.get("affix", "") if morph["type"] in {"suffix", "prefix"} else "",
        "suffixLabel": (("-" + morph["affix"]) if morph["type"] == "suffix" else (morph["affix"] + "-")) if morph["type"] in {"suffix", "prefix"} else "",
        "pos": w["pos"],
        "levelTag": w["level"],
        "sense": w["senses"][0]["zh"] if w["senses"] else w["meaning_zh"],
        "anchor": "word-" + w["word"],
        "batch": "自动补充",
    }
    if extra:
        item["extra"] = True
        item["extraDate"] = extra_date or created
        item["source"] = source or "generator"
    return item


def append_data_item(
    analysis: dict[str, Any],
    target: dict[str, Any],
    *,
    extra: bool = True,
    source: str = "generator",
) -> dict[str, Any]:
    data = load_data()
    if analysis["word"] in all_names(data):
        raise ArchiveError("data.json 中已经有 %s，未重复写入。" % analysis["word"])
    today = date.today().isoformat()
    extra_date = (date.today() + timedelta(days=1)).isoformat() if extra else ""
    item = build_data_item(
        analysis,
        target,
        today,
        extra=extra,
        extra_date=extra_date,
        source=source,
    )
    category = analysis["target"]["category"]
    data.setdefault(category, [])
    if not isinstance(data[category], list):
        raise ArchiveError("data.json 的分类 %s 不是列表。" % category)
    data[category].append(item)
    write_text_atomic(DATA_JSON, json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return {"item": item, "category": category, "schedule": item["nextDate"]}


# ---------------------------------------------------------------------------
# 复习打卡：浏览器直接写回 data.json
# ---------------------------------------------------------------------------

def backup_review_data() -> None:
    """每次复习同步前留一份可回滚备份；每天再留一份日备份。"""
    if not DATA_JSON.exists():
        raise ArchiveError("找不到 复习清单/data.json。")
    rolling = DATA_JSON.with_name("data.json.bak")
    shutil.copy2(DATA_JSON, rolling)
    REVIEW_BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    daily = REVIEW_BACKUP_DIR / ("data-" + date.today().isoformat() + ".json")
    if not daily.exists():
        shutil.copy2(DATA_JSON, daily)


def apply_review_updates(updates: list[dict[str, Any]]) -> dict[str, Any]:
    """把复习清单的 level/nextDate/lastReviewed 写回 data.json。

    只允许更新已存在的词条，不接受新增/删除；所有字段先校验，再统一写盘。
    """
    if not isinstance(updates, list) or not updates:
        raise ArchiveError("没有需要同步的复习记录。")
    if len(updates) > 200:
        raise ArchiveError("一次最多同步 200 条复习记录。")

    today = today_str()
    with WRITE_LOCK:
        data = load_data()
        prepared: list[tuple[str, dict[str, Any], int, str, str | None]] = []
        errors: list[str] = []

        for raw in updates:
            if not isinstance(raw, dict):
                errors.append("记录格式不正确")
                continue
            name = str(raw.get("name") or "").strip()
            category, item = find_data_item(data, name)
            if not item:
                errors.append("%s 不在 data.json 中" % (name or "(空)"))
                continue
            level = clamp_int(raw.get("level"), -1)
            if level < 0 or level > 7:
                errors.append("%s 的 level 不合法" % name)
                continue
            next_date = str(raw.get("nextDate") or "").strip()
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", next_date):
                errors.append("%s 的 nextDate 不合法" % name)
                continue
            last_raw = raw.get("lastReviewed")
            last_reviewed = str(last_raw).strip() if last_raw else None
            if last_reviewed and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", last_reviewed):
                errors.append("%s 的 lastReviewed 不合法" % name)
                continue
            prepared.append((category, item, level, next_date, last_reviewed))

        if errors:
            raise ArchiveError("；".join(errors[:8]))

        backup_review_data()
        updated: list[dict[str, Any]] = []
        for category, item, level, next_date, last_reviewed in prepared:
            item["level"] = level
            item["nextDate"] = next_date
            item["lastReviewed"] = last_reviewed
            item["modified"] = today
            updated.append({
                "name": item.get("name"),
                "category": category,
                "level": level,
                "nextDate": next_date,
                "lastReviewed": last_reviewed,
            })

        write_text_atomic(DATA_JSON, json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        append_log({
            "word": ",".join(str(x.get("name") or "") for x in updated)[:300],
            "type": "review-sync",
            "target": "data.json",
            "file": "复习清单/data.json",
            "schedule": today,
            "status": "ok",
        })
        return {"ok": True, "count": len(updated), "updated": updated}


# ---------------------------------------------------------------------------
# 总入口
# ---------------------------------------------------------------------------

def find_existing_word(word: str) -> str:
    """在核心词页和所有词素页里找是否已有该词。"""
    # 核心词页只看真正的卡片 data-word，避免把例句/词根里的同形词误判为已收录
    core_pattern = re.compile(r'data-word="' + re.escape(word) + r'"')
    if WORD_PAGE.exists() and core_pattern.search(read_text(WORD_PAGE)):
        return "专升本英语核心词汇通关.html"
    # 词素页的旧卡片不一定有 data-word，兼容 <code class="en">word</code>
    ci_pattern = re.compile(
        r'(?:data-word="' + re.escape(word) + r'"|'
        r'<code class="en">' + re.escape(word) + r'(?:</code>|\s*\())'
    )
    if CI_DIR.exists():
        for path in CI_DIR.rglob("*.html"):
            try:
                if ci_pattern.search(read_text(path)):
                    return str(path.relative_to(BASE))
            except OSError:
                continue
    return ""


def find_data_item(data: dict[str, Any], word: str) -> tuple[str, dict[str, Any] | None]:
    for category, arr in data.items():
        if not isinstance(arr, list):
            continue
        for item in arr:
            if isinstance(item, dict) and str(item.get("name") or "") == word:
                return category, item
    return "", None


def infer_category_from_page(page_file: str) -> str:
    if page_file == "专升本英语核心词汇通关.html":
        return "核心词汇通关"
    parts = Path(page_file).parts
    if len(parts) >= 2 and parts[0] == "词素":
        return "词素/" + parts[1]
    return "词素"


def parse_word_meaning_from_page(page_file: str, word: str) -> str:
    path = BASE / page_file
    if not path.exists():
        return ""
    text = read_text(path)
    pattern = re.compile(
        r'<code class="en">\s*' + re.escape(word) + r'\s*</code>\s*'
        r'\(\s*<span class="zh">(.*?)</span>',
        re.S
    )
    match = pattern.search(text)
    if not match:
        # 核心词页的卡片格式：word(<span class="zh">...</span>)
        pattern = re.compile(
            r'<code class="en">\s*' + re.escape(word) + r'\s*\(\s*'
            r'<span class="zh">(.*?)</span>',
            re.S
        )
        match = pattern.search(text)
    if match:
        raw = match.group(1)
        raw = re.sub(r'<span class="note">.*?</span>', '', raw, flags=re.S)
        raw = re.sub(r"<[^>]+>", "", raw)
        raw = re.sub(r"\[[^\]]*\]", "", raw)
        return raw.strip()
    return ""


def check_word(word: str) -> dict[str, Any]:
    word = normalize_word(word)
    data = load_data()
    category, item = find_data_item(data, word)
    page_file = find_existing_word(word)
    exists = bool(item or page_file)
    return {
        "ok": True,
        "exists": exists,
        "word": word,
        "data_category": category,
        "data_item": item,
        "page_file": page_file,
        "message": (
            "已录入：不会新建，也不插队；需要复习时请在复习清单查看。"
            if exists else "尚未录入，可以分析并写入；写入后会排到明天的额外新增。"
        ),
    }


def prioritize_existing(word: str, page_file: str) -> dict[str, Any]:
    """已录入的词不新建页面，只更新 data.json：下次复习优先插队。"""
    today = today_str()
    data = load_data()
    category, item = find_data_item(data, word)
    if not item and not page_file:
        raise ArchiveError("未找到已录入的词：%s" % word)

    backup = backup_paths([DATA_JSON])

    if item:
        old = {
            "category": category,
            "level": item.get("level", 0),
            "nextDate": item.get("nextDate"),
        }
        item["nextDate"] = today
        item["priority"] = today
        item["modified"] = today
        if (category == "核心词汇通关" or category.startswith("词素/")
                or item.get("word") or item.get("kind") == "word"):
            item["kind"] = item.get("kind") or "word"
        data[category][data[category].index(item)] = item
        write_text_atomic(DATA_JSON, json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        mode = "new" if clamp_int(item.get("level")) == 0 else "review"
        append_log({
            "word": word,
            "type": "existing-priority",
            "target": category,
            "file": "复习清单/data.json",
            "schedule": today,
            "status": "ok",
        })
        return {
            "ok": True,
            "exists": True,
            "word": word,
            "message": "已录入，未新建页面；已插队到下一次复习清单。",
            "existing": {
                "data_category": category,
                "data_item": item,
                "page_file": page_file,
                "previous": old,
            },
            "review": {"schedule": today, "mode": mode},
            "backup": backup,
        }

    # 页面里已有，但 data.json 没有：补一条词级复习记录，不新建页面
    category = infer_category_from_page(page_file)
    page_path = BASE / page_file
    anchor = ""
    if page_path.exists() and ('id="word-' + word + '"') in read_text(page_path):
        anchor = "#word-" + word
    meaning = parse_word_meaning_from_page(page_file, word)
    new_item = {
        "name": word,
        "path": "../" + page_file.replace("\\", "/") + anchor,
        "category": category,
        "level": 0,
        "nextDate": today,
        "lastReviewed": None,
        "created": today,
        "modified": today,
        "kind": "word",
        "word": word,
        "zh": meaning,
        "root": "",
        "rootZh": "",
        "suffix": "",
        "suffixLabel": "",
        "pos": "",
        "levelTag": "",
        "sense": meaning,
        "anchor": anchor.lstrip("#"),
        "batch": "优先复习",
        "priority": today,
    }
    data.setdefault(category, [])
    if not isinstance(data[category], list):
        raise ArchiveError("data.json 的分类 %s 不是列表。" % category)
    data[category].append(new_item)
    write_text_atomic(DATA_JSON, json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    append_log({
        "word": word,
        "type": "existing-priority",
        "target": category,
        "file": "复习清单/data.json",
        "schedule": today,
        "status": "ok",
    })
    return {
        "ok": True,
        "exists": True,
        "word": word,
        "message": "页面里已录入，未新建页面；已补入复习清单并插队。",
        "existing": {
            "data_category": category,
            "data_item": new_item,
            "page_file": page_file,
            "previous": None,
        },
        "review": {"schedule": today, "mode": "new"},
        "backup": backup,
    }


def clamp_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def archive_word(word: str, hint: str = "") -> dict[str, Any]:
    with WRITE_LOCK:
        word = normalize_word(word)
        page_file = find_existing_word(word)
        data_before = load_data()
        category, item = find_data_item(data_before, word)

        if page_file or item:
            return {
                "ok": True,
                "exists": True,
                "word": word,
                "message": "已录入：不会重复创建，也不会插队；需要复习时请在复习清单或全部词条中查看。",
                "data": {
                    "category": category,
                    "item": item,
                    "schedule": (item or {}).get("nextDate", ""),
                },
                "page_file": page_file,
            }

        analysis = analyze_word(word, hint)
        target = analysis["target"]

        files_to_backup = [WORD_PAGE, DATA_JSON]
        if target["kind"] != "core":
            ci_path, _ = _ci_page_path(analysis)
            files_to_backup.append(ci_path)
        backup = backup_paths(files_to_backup)

        if target["kind"] == "core":
            location = insert_into_word_page(analysis)
            data_result = append_data_item(analysis, {
                "file": "专升本英语核心词汇通关.html",
                "anchor": location["anchor"],
            }, extra=True, source="generator")
        else:
            location = insert_into_ci(analysis)
            data_result = append_data_item(analysis, location, extra=True, source="generator")

        result = {
            "ok": True,
            "exists": False,
            "word": word,
            "analysis": analysis,
            "location": location,
            "data": data_result,
            "backup": backup,
            "summary": "%s → %s；额外新增 %s" % (word, location["target"], data_result["schedule"]),
        }
        append_log({
            "word": word,
            "type": analysis["morphology"]["type"],
            "target": location["target"],
            "file": location["file"],
            "schedule": data_result["schedule"],
            "status": "ok",
        })
        return result


def analyze_only(word: str, hint: str = "") -> dict[str, Any]:
    analysis = analyze_word(word, hint)
    return {"ok": True, "analysis": analysis}


# ---------------------------------------------------------------------------
# 供服务器读取的简单状态
# ---------------------------------------------------------------------------

def health() -> dict[str, Any]:
    configured = bool((os.environ.get("DEEPSEEK_API_KEY") or "").strip())
    if not configured:
        configured = any(p.exists() and p.read_text(encoding="utf-8").strip()
                         for p in (SHARED_KEY_FILE, API_TXT, HOME_KEY_FILE, API_KEY_FILE))
    return {
        "ok": True,
        "word_page": WORD_PAGE.exists(),
        "data_json": DATA_JSON.exists(),
        "api_key": configured,
        "model": MODEL,
        "base": str(BASE),
    }
