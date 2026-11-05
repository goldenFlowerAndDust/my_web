# -*- coding: utf-8 -*-
"""词性迁移工具：以 data.json 为唯一数据源，补齐 senses / pos / pos_zh。

用法：
    python 词性迁移工具.py --report
    python 词性迁移工具.py --apply

报告会写到 词性迁移报告.json。
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent
DATA_JSON = BASE / "复习清单" / "data.json"
AI_RESULTS = BASE / "词性迁移AI结果.json"
REPORT_JSON = BASE / "词性迁移报告.json"
BACKUP_DIR = BASE / "词性重构备份"

POS_ZH = {
    "n.": "名词",
    "v.": "动词",
    "vt.": "及物动词",
    "vi.": "不及物动词",
    "adj.": "形容词",
    "adv.": "副词",
    "pron.": "代词",
    "prep.": "介词",
    "conj.": "连词",
    "num.": "数词",
    "art.": "冠词",
    "interj.": "感叹词",
    "int.": "感叹词",
    "aux.": "助动词",
    "modal": "情态动词",
    "phrase": "短语",
    "phr.": "短语",
}

ALIASES = {
    "int.": "interj.",
    "phr.": "phrase",
    "interj": "interj.",
    "phrase.": "phrase",
    "modal.": "modal",
}


def normalize_pos(value: object) -> str:
    text = str(value or "").strip().lower()
    text = text.replace("，", "/").replace(",", "/").replace("；", "/")
    text = re.sub(r"\s+", "", text)
    text = text.rstrip(".")
    if text in {"interj", "interjection", "int", "intj"}:
        return "interj."
    if text in {"phrase", "phr"}:
        return "phrase"
    if text in {"modal", "aux"}:
        return text
    return text + "." if text in {"n", "v", "vt", "vi", "adj", "adv", "pron", "prep", "conj", "num", "art", "interj", "aux"} else text


def split_pos(value: object) -> list[str]:
    text = str(value or "").strip()
    text = text.replace("，", "/").replace(",", "/")
    result: list[str] = []
    for part in re.split(r"/|\s+", text):
        part = part.strip()
        if not part:
            continue
        if part.endswith(".") and part not in POS_ZH:
            # 保留标准缩写
            pass
        token = normalize_pos(part)
        if token in POS_ZH and token not in result:
            result.append(token)
    return result


def pos_zh(pos: str) -> str:
    return POS_ZH.get(normalize_pos(pos), "其他")


def normalize_sense(raw: dict[str, Any], fallback_pos: str = "") -> dict[str, Any] | None:
    pos = normalize_pos(raw.get("pos") or fallback_pos)
    if pos not in POS_ZH:
        return None
    zh = str(raw.get("zh") or raw.get("meaning_zh") or "").strip()
    if not zh:
        return None
    item: dict[str, Any] = {
        "pos": pos,
        "pos_zh": pos_zh(pos),
        "zh": zh,
    }
    for key in ("example", "example_zh", "collocation", "collocation_zh"):
        value = str(raw.get(key) or "").strip()
        if value:
            item[key] = value
    return item


def word_items(data: dict[str, Any]) -> list[tuple[str, dict[str, Any]]]:
    result: list[tuple[str, dict[str, Any]]] = []
    for category, items in data.items():
        if not isinstance(items, list):
            continue
        for item in items:
            if isinstance(item, dict) and str(item.get("kind") or "") == "word":
                result.append((category, item))
    return result


def build_ai_senses(result: dict[str, Any]) -> list[dict[str, Any]]:
    raw = result.get("senses") if isinstance(result, dict) else None
    senses: list[dict[str, Any]] = []
    if isinstance(raw, list):
        for item in raw:
            if isinstance(item, dict):
                sense = normalize_sense(item)
                if sense:
                    senses.append(sense)
    return senses


def build_legacy_senses(item: dict[str, Any], tokens: list[str]) -> list[dict[str, Any]]:
    if not tokens:
        return []
    meaning = str(item.get("sense") or item.get("zh") or "").strip()
    if not meaning:
        return []
    return [{
        "pos": tokens[0],
        "pos_zh": pos_zh(tokens[0]),
        "zh": meaning,
    }]


def apply_item(item: dict[str, Any], ai_result: dict[str, Any] | None) -> tuple[dict[str, Any], str]:
    tokens = split_pos(item.get("pos"))
    ai_senses = build_ai_senses(ai_result or {})
    if ai_senses:
        senses = ai_senses
        source = "ai"
    else:
        senses = build_legacy_senses(item, tokens)
        source = "legacy"
    # 去重，保持词性顺序
    unique: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for sense in senses:
        key = (sense["pos"], sense["zh"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(sense)
    if not unique:
        return item, "unresolved"
    order = [sense["pos"] for sense in unique]
    ordered_tokens = list(dict.fromkeys(order))
    item["pos"] = " / ".join(ordered_tokens)
    item["pos_zh"] = " / ".join(dict.fromkeys(pos_zh(token) for token in ordered_tokens))
    item["senses"] = unique
    item["sense"] = unique[0]["zh"]
    item["posSource"] = source
    item["posMigratedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return item, source


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--report", action="store_true", help="只生成报告，不写 data.json")
    args = parser.parse_args()

    if not DATA_JSON.exists():
        raise SystemExit("找不到 data.json：%s" % DATA_JSON)
    data = json.loads(DATA_JSON.read_text(encoding="utf-8-sig"))
    ai = {}
    if AI_RESULTS.exists():
        try:
            loaded = json.loads(AI_RESULTS.read_text(encoding="utf-8-sig"))
            if isinstance(loaded, dict):
                ai = loaded
        except (OSError, ValueError, json.JSONDecodeError):
            ai = {}

    words = word_items(data)
    report: dict[str, Any] = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "data": str(DATA_JSON.relative_to(BASE)),
        "counts": {
            "data_items": sum(len(v) for v in data.values() if isinstance(v, list)),
            "word_items": len(words),
            "ai_results": len(ai),
        },
        "sources": {},
        "unresolved": [],
        "page_mismatch": {},
        "details": [],
    }
    sources = Counter()
    for category, item in words:
        name = str(item.get("name") or "")
        ai_result = ai.get(name) if isinstance(ai.get(name), dict) and ai.get(name, {}).get("ok") else None
        updated, source = apply_item(item, ai_result)
        sources[source] += 1
        if source == "unresolved":
            report["unresolved"].append({"name": name, "category": category, "pos": item.get("pos")})
        report["details"].append({
            "name": name,
            "category": category,
            "pos": updated.get("pos"),
            "pos_zh": updated.get("pos_zh"),
            "senses": updated.get("senses"),
            "source": source,
        })
        if args.apply and updated is not item:
            # 同一对象已被修改；这里保留，方便后续写回。
            pass

    # 页面与数据对账
    html = BASE / "专升本英语核心词汇通关.html"
    if html.exists():
        page_words = set(re.findall(r'data-word="([^"]+)"', html.read_text(encoding="utf-8"), re.I))
        data_words = {str(item.get("name") or "") for _, item in words}
        report["page_mismatch"] = {
            "page_not_data": sorted(page_words - data_words),
            "data_not_page": sorted(data_words - page_words),
        }

    report["sources"] = dict(sources)
    report["pos_distribution"] = dict(Counter(str(item.get("pos") or "") for _, item in words).most_common())
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("report:", REPORT_JSON)
    print("sources:", dict(sources))
    print("unresolved:", len(report["unresolved"]))
    print("page mismatch:", report["page_mismatch"])

    if args.apply:
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        backup = BACKUP_DIR / ("data.before-pos-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".json")
        shutil.copy2(DATA_JSON, backup)
        tmp = DATA_JSON.with_name(DATA_JSON.name + ".pos.tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        tmp.replace(DATA_JSON)
        print("applied:", DATA_JSON)
        print("backup:", backup)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
