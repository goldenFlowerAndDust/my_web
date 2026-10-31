# -*- coding: utf-8 -*-
"""一键同步全部科目的云端答疑记录与英语待归档单词。

只读云端、保存 JSON、调用现有本地导入器；不在导入后立即删除云端。
云端记录由 Worker 的 24 小时保留策略处理。

用法：
    python 共享配置/sync_all_subjects.py --once
    python 共享配置/sync_all_subjects.py --status
    python 共享配置/sync_all_subjects.py --setup
    python 共享配置/sync_all_subjects.py --menu
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

from history_archive import build_all as build_history_archives
from datetime import datetime
from pathlib import Path
from typing import Any

DEFAULT_SUBJECTS = [
    {
        "id": "english",
        "label": "英语",
        "enabled": True,
        "worker_subject": "english",
        "export_root": "..\\备考专升本英语\\导出记录",
        "filename_prefix": "英语答疑记录",
        "import_adapter": "english",
        "include_pending_words": True
    },
    {
        "id": "math",
        "label": "数学",
        "enabled": True,
        "worker_subject": "math",
        "export_root": "..\\备考专升本数学\\导出记录",
        "filename_prefix": "数学答疑记录",
        "import_adapter": "math",
        "include_pending_words": False
    },
    {
        "id": "politics",
        "label": "政治",
        "enabled": False,
        "worker_subject": "politics",
        "export_root": "..\\备考专升本政治\\导出记录",
        "filename_prefix": "政治答疑记录",
        "import_adapter": "politics",
        "include_pending_words": False
    },
    {
        "id": "it",
        "label": "信息技术",
        "enabled": False,
        "worker_subject": "it",
        "export_root": "..\\备考专升本信息技术\\导出记录",
        "filename_prefix": "信息技术答疑记录",
        "import_adapter": "it",
        "include_pending_words": False
    },
]


def now_text() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def today_text() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)


def load_json(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict):
        raise ValueError("配置必须是 JSON 对象：%s" % path)
    return data


class SyncError(RuntimeError):
    pass


class SyncRunner:
    def __init__(self, base: Path, no_import: bool = False) -> None:
        self.base = base.resolve()
        self.config_dir = self.base / "共享配置"
        self.subject_file = self.config_dir / "科目配置.json"
        self.cloud_file = self.config_dir / "云端同步.json"
        self.status_file = self.config_dir / "同步状态.json"
        self.no_import = no_import
        self.config: dict[str, Any] = {}
        self.cloud: dict[str, Any] = {}
        self.last_route = ""
        self.previous_status: dict[str, Any] = {}
        if self.status_file.exists():
            try:
                loaded = load_json(self.status_file)
                if isinstance(loaded, dict):
                    self.previous_status = loaded
            except (OSError, ValueError, json.JSONDecodeError):
                self.previous_status = {}
        self.status: dict[str, Any] = {
            "last_run": "",
            "started_at": "",
            "finished_at": "",
            "subjects": {},
            "pending_words": {},
            "errors": [],
        }

    # ------------------------------------------------------------------
    # 配置
    # ------------------------------------------------------------------
    def ensure_subject_config(self) -> None:
        self.config_dir.mkdir(parents=True, exist_ok=True)
        if self.subject_file.exists():
            return
        write_json(self.subject_file, {"version": 1, "subjects": DEFAULT_SUBJECTS})
        print("已创建科目配置：%s" % self.subject_file)
        print("默认启用英语和数学；政治、信息技术为 enabled=false，可直接编辑配置。")

    def load_subject_config(self) -> None:
        self.ensure_subject_config()
        data = load_json(self.subject_file)
        subjects = data.get("subjects")
        if not isinstance(subjects, list) or not subjects:
            raise SyncError("科目配置里没有 subjects 数组。")
        seen: set[str] = set()
        normalized: list[dict[str, Any]] = []
        for raw in subjects:
            if not isinstance(raw, dict):
                continue
            sid = str(raw.get("id") or "").strip()
            if not sid:
                continue
            if sid in seen:
                raise SyncError("科目 id 重复：%s" % sid)
            seen.add(sid)
            item = dict(raw)
            item["id"] = sid
            item["label"] = str(item.get("label") or sid)
            item["enabled"] = bool(item.get("enabled", False))
            item["worker_subject"] = str(item.get("worker_subject") or sid)
            item["export_root"] = str(item.get("export_root") or "").strip()
            item["filename_prefix"] = str(item.get("filename_prefix") or item["label"] + "答疑记录")
            item["import_adapter"] = str(item.get("import_adapter") or sid)
            item["include_pending_words"] = bool(item.get("include_pending_words", False))
            normalized.append(item)
        data["subjects"] = normalized
        self.config = data

    def resolve_export_root(self, value: str) -> Path:
        text = str(value or "").strip()
        if not text:
            raise SyncError("已启用科目缺少 export_root。")
        path = Path(text).expanduser()
        if not path.is_absolute():
            path = self.config_dir / path
        return path.resolve()

    def config_path(self, path: str) -> Path:
        p = Path(path).expanduser()
        if not p.is_absolute():
            p = self.base / p
        return p.resolve()

    # ------------------------------------------------------------------
    # 云端
    # ------------------------------------------------------------------
    def promote_fallback(self) -> bool:
        """把已经保存的备用线路换到主线路，不要求重新输入令牌。"""
        if not self.cloud_file.exists():
            print("还没有云端配置。")
            return False
        try:
            data = load_json(self.cloud_file)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print("云端配置读取失败：%s" % exc)
            return False
        url = str(data.get("url") or "").strip()
        token = str(data.get("token") or "").strip()
        fallback_url = str(data.get("fallback_url") or "").strip()
        fallback_token = str(data.get("fallback_token") or "").strip()
        if not fallback_url or not fallback_token:
            print("还没有保存备用线路，请先选 5 配置。")
            return False
        data["url"] = fallback_url
        data["token"] = fallback_token
        data["fallback_url"] = url
        data["fallback_token"] = token
        data.pop("endpoints", None)
        data.setdefault("timeout_seconds", 30)
        write_json(self.cloud_file, data)
        self.cloud = {}
        if self.load_cloud_config(interactive=False):
            print("已把备用线路切换为主线路，原主线路转为备用。")
            labels = [x.get("label") for x in self.cloud.get("endpoints", [])]
            print("当前线路：" + "、".join(str(x) for x in labels))
            return True
        print("切换后线路不完整，请重新配置。")
        return False

    def configure_scf_as_primary(self) -> bool:
        """把腾讯云 SCF 放到主线路，原来可用的 Worker 自动转为备用。"""
        data: dict[str, Any] = {}
        if self.cloud_file.exists():
            try:
                data = load_json(self.cloud_file)
            except (OSError, ValueError, json.JSONDecodeError):
                data = {}
        print("")
        print("配置腾讯云 SCF 为主线路（不依赖 VPN）。")
        url = input("腾讯云 SCF Function URL：").strip().rstrip("/")
        if not url.startswith(("http://", "https://")):
            print("地址必须以 http:// 或 https:// 开头。")
            return False
        token = input("SCF 的 PROXY_TOKEN（会显示）：").strip()
        if not token:
            print("访问口令不能为空。")
            return False
        old_url = str(data.get("url") or "").strip().rstrip("/")
        old_token = str(data.get("token") or "").strip()
        if old_url and old_token and old_url != url:
            data["fallback_url"] = old_url
            data["fallback_token"] = old_token
        data["url"] = url
        data["token"] = token
        data.pop("endpoints", None)
        data.setdefault("timeout_seconds", 30)
        write_json(self.cloud_file, data)
        self.cloud = {}
        if self.load_cloud_config(interactive=False):
            print("已把腾讯云 SCF 设为主线路。")
            labels = [x.get("label") for x in self.cloud.get("endpoints", [])]
            print("当前线路：" + "、".join(str(x) for x in labels))
            return True
        print("配置已保存，但线路还不完整。")
        return False

    def configure_cloud_part(self, part: str) -> bool:
        """单独配置主线路或备用线路，保留另一边已有配置。"""
        data: dict[str, Any] = {}
        if self.cloud_file.exists():
            try:
                data = load_json(self.cloud_file)
            except (OSError, ValueError, json.JSONDecodeError):
                data = {}
        if part == "primary":
            print("")
            print("配置主线路 Cloudflare / 其他 Worker 地址。")
            url = input("主线路地址：").strip().rstrip("/")
            if not url.startswith(("http://", "https://")):
                print("地址必须以 http:// 或 https:// 开头。")
                return False
            token = input("主线路访问口令（会显示）：").strip()
            if not token:
                print("访问口令不能为空。")
                return False
            data["url"] = url
            data["token"] = token
        elif part == "fallback":
            print("")
            print("配置备用线路（腾讯云 SCF）。直接留空地址可清除备用线路。")
            url = input("备用线路地址（留空清除）：").strip().rstrip("/")
            if not url:
                data.pop("fallback_url", None)
                data.pop("fallback_token", None)
                data.pop("endpoints", None)
                write_json(self.cloud_file, data)
                self.cloud = {}
                self.load_cloud_config(interactive=False)
                print("已清除备用线路。")
                return True
            if not url.startswith(("http://", "https://")):
                print("地址必须以 http:// 或 https:// 开头。")
                return False
            token = input("备用线路访问口令（会显示）：").strip()
            if not token:
                print("访问口令不能为空。")
                return False
            data["fallback_url"] = url
            data["fallback_token"] = token
        else:
            return False
        data.setdefault("timeout_seconds", 30)
        data.pop("endpoints", None)
        write_json(self.cloud_file, data)
        self.cloud = {}
        if self.load_cloud_config(interactive=False):
            print("配置已保存：%s" % self.cloud_file)
            labels = [x.get("label") for x in self.cloud.get("endpoints", [])]
            print("当前线路：" + "、".join(str(x) for x in labels))
            return True
        print("配置已保存，但主线路还不完整，请继续配置主线路。")
        return False

    def load_cloud_config(self, interactive: bool = False) -> bool:
        self.config_dir.mkdir(parents=True, exist_ok=True)
        data: dict[str, Any] = {}
        if self.cloud_file.exists():
            try:
                data = load_json(self.cloud_file)
            except (OSError, ValueError, json.JSONDecodeError) as exc:
                print("云端配置读取失败：%s" % exc)
                data = {}

        def endpoint_label(url_value: str, fallback: bool = False) -> str:
            if "tencentscf.com" in url_value:
                return "腾讯云 SCF"
            if "workers.dev" in url_value:
                return "Cloudflare"
            return "备用线路" if fallback else "主线路"

        def add_endpoint(url_value: Any, token_value: Any, label: str) -> None:
            url = str(url_value or "").strip().rstrip("/")
            token = str(token_value or "").strip()
            if url.startswith(("http://", "https://")) and token:
                endpoints.append({
                    "url": url,
                    "token": token,
                    "label": label or endpoint_label(url),
                })

        endpoints: list[dict[str, str]] = []
        raw_endpoints = data.get("endpoints")
        if isinstance(raw_endpoints, list):
            for index, item in enumerate(raw_endpoints, start=1):
                if isinstance(item, dict):
                    add_endpoint(
                        item.get("url"),
                        item.get("token"),
                        str(item.get("label") or ("线路%d" % index)),
                    )
        if not endpoints:
            add_endpoint(
                data.get("url"),
                data.get("token"),
                endpoint_label(str(data.get("url") or "")),
            )
            add_endpoint(
                data.get("fallback_url"),
                data.get("fallback_token"),
                endpoint_label(str(data.get("fallback_url") or ""), fallback=True),
            )

        if endpoints:
            try:
                timeout = max(5, int(data.get("timeout_seconds") or 30))
            except (TypeError, ValueError):
                timeout = 30
            self.cloud = {"endpoints": endpoints, "timeout_seconds": timeout}
            return True

        if not interactive:
            return False

        print("")
        print("第一次同步需要配置云端连接。")
        print("国内网络不稳定时，建议把腾讯云 SCF 配成备用线路。")
        url = input("主线路 Worker / SCF 地址（例如 https://xxx.workers.dev）：").strip().rstrip("/")
        if not url.startswith(("http://", "https://")):
            print("地址必须以 http:// 或 https:// 开头。")
            return False
        token = input("主线路访问口令（会显示，确认后再回车）：").strip()
        if not token:
            print("访问口令不能为空。")
            return False
        fallback_url = input("备用线路地址（腾讯云 SCF Function URL，可留空）：").strip().rstrip("/")
        fallback_token = ""
        if fallback_url:
            if not fallback_url.startswith(("http://", "https://")):
                print("备用地址必须以 http:// 或 https:// 开头。")
                return False
            fallback_token = input("备用线路访问口令（会显示，确认后再回车）：").strip()
            if not fallback_token:
                print("备用线路口令不能为空。")
                return False

        self.cloud = {
            "endpoints": [{"url": url, "token": token, "label": "主线路"}],
            "timeout_seconds": 30,
        }
        saved = {
            "url": url,
            "token": token,
            "timeout_seconds": 30,
        }
        if fallback_url:
            self.cloud["endpoints"].append({
                "url": fallback_url,
                "token": fallback_token,
                "label": "腾讯云 SCF",
            })
            saved["fallback_url"] = fallback_url
            saved["fallback_token"] = fallback_token
        write_json(self.cloud_file, saved)
        print("云端配置已保存：%s" % self.cloud_file)
        return True

    def api_get(self, path: str, params: dict[str, str] | None = None) -> dict[str, Any]:
        errors: list[str] = []
        self.last_route = ""
        endpoints = self.cloud.get("endpoints") or []
        for index, endpoint in enumerate(endpoints):
            url = endpoint["url"] + path
            if params:
                url += "?" + urllib.parse.urlencode(params)
            request = urllib.request.Request(
                url,
                headers={
                    "X-Tutor-Token": endpoint["token"],
                    "Accept": "application/json",
                },
                method="GET",
            )
            try:
                with urllib.request.urlopen(request, timeout=self.cloud["timeout_seconds"]) as response:
                    raw = response.read().decode("utf-8", errors="replace")
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")[:300]
                errors.append("%s HTTP %s：%s" % (endpoint.get("label", "线路"), exc.code, detail))
            except (urllib.error.URLError, TimeoutError, OSError) as exc:
                errors.append("%s 连接失败：%s" % (endpoint.get("label", "线路"), exc))
            else:
                try:
                    data = json.loads(raw)
                except json.JSONDecodeError as exc:
                    errors.append("%s 返回的不是 JSON：%s" % (endpoint.get("label", "线路"), exc))
                else:
                    if isinstance(data, dict) and data.get("ok"):
                        self.last_route = str(endpoint.get("label") or "线路")
                        return data
                    errors.append("%s 返回失败：%s" % (
                        endpoint.get("label", "线路"),
                        str((data or {}).get("error") if isinstance(data, dict) else data),
                    ))
            if index + 1 < len(endpoints):
                print("线路 %s 失败，切换备用线路..." % endpoint.get("label", "线路"))
        raise SyncError("所有云端线路都失败：" + "；".join(errors))

    # ------------------------------------------------------------------
    # 保存
    # ------------------------------------------------------------------
    def unique_path(self, folder: Path, stem: str, suffix: str = ".json") -> Path:
        folder.mkdir(parents=True, exist_ok=True)
        target = folder / (stem + suffix)
        if not target.exists():
            return target
        for index in range(1, 1000):
            candidate = folder / ("%s-%d%s" % (stem, index, suffix))
            if not candidate.exists():
                return candidate
        raise SyncError("同名导出文件过多：%s" % target)

    def save_export(self, subject: dict[str, Any], kind: str, entries: list[dict[str, Any]]) -> Path:
        root = self.resolve_export_root(subject["export_root"])
        folder = root / today_text()
        stamp = datetime.now().strftime("%Y-%m-%d-%H%M")
        prefix = subject["filename_prefix"]
        if kind == "pending_words":
            stem = "%s单词待归档-%s" % (subject["label"], stamp)
        else:
            stem = "%s-%s" % (prefix, stamp)
        target = self.unique_path(folder, stem)
        payload = {
            "exported_at": datetime.now().isoformat(timespec="seconds"),
            "source": "cloudflare-kv",
            "subject": subject["worker_subject"],
            "kind": kind,
            "count": len(entries),
            "entries": entries,
        }
        write_json(target, payload)
        return target

    # ------------------------------------------------------------------
    # 本地导入
    # ------------------------------------------------------------------
    def run_import(self, script: Path, json_file: Path) -> dict[str, Any]:
        if self.no_import:
            return {"status": "skipped", "exit_code": 0, "message": "dry-run，未导入"}
        if not script.exists():
            return {"status": "adapter_missing", "exit_code": None, "message": "找不到导入器：%s" % script}
        env = dict(os.environ)
        env["PYTHONIOENCODING"] = "utf-8"
        command = [sys.executable, str(script), str(json_file), "--write"]
        try:
            result = subprocess.run(
                command,
                cwd=str(script.parent),
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                env=env,
                timeout=600,
            )
        except (OSError, subprocess.SubprocessError) as exc:
            return {"status": "error", "exit_code": None, "message": "导入器启动失败：%s" % exc}
        output = "\n".join(x for x in [result.stdout.strip(), result.stderr.strip()] if x)
        lines = [line.strip() for line in output.splitlines() if line.strip()]
        message = lines[-1] if lines else ""
        if result.returncode == 0:
            status = "ok"
        else:
            status = "error"
        return {
            "status": status,
            "exit_code": result.returncode,
            "message": message,
            "output": output[-4000:],
        }

    def import_tutor(self, subject: dict[str, Any], json_file: Path) -> dict[str, Any]:
        adapter = subject["import_adapter"]
        if adapter == "english":
            script = self.base / "备考专升本英语" / "词素工具" / "import_tutor_logs.py"
        elif adapter == "math":
            script = self.base / "备考专升本数学" / "数学工具" / "import_math_tutor_logs.py"
        else:
            return {
                "status": "adapter_missing",
                "exit_code": None,
                "message": "科目 %s 的本地导入器尚未实现（import_adapter=%s）" % (
                    subject["label"], adapter
                ),
            }
        return self.run_import(script, json_file)

    def import_pending_words(self, subject: dict[str, Any], json_file: Path) -> dict[str, Any]:
        script = self.base / "备考专升本英语" / "词素工具" / "import_pending_words.py"
        return self.run_import(script, json_file)

    @staticmethod
    def fingerprint(entries: list[dict[str, Any]], scope: str = "") -> str:
        raw = json.dumps(
            {"scope": scope, "entries": entries},
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def unchanged(self, previous: dict[str, Any], fingerprint: str) -> bool:
        if not previous or previous.get("fingerprint") != fingerprint:
            return False
        if previous.get("status") not in ("ok", "unchanged"):
            return False
        if (previous.get("import") or {}).get("status") != "ok":
            return False
        saved = str(previous.get("saved") or "")
        return bool(saved and Path(saved).exists())

    @staticmethod
    def category_counts(entries: list[dict[str, Any]]) -> dict[str, int]:
        counts: dict[str, int] = {}
        for item in entries:
            name = str(item.get("mode") or item.get("category") or "未分类").strip() or "未分类"
            counts[name] = counts.get(name, 0) + 1
        return counts

    @staticmethod
    def parse_import_details(output: str, kind: str) -> dict[str, Any]:
        """从导入器输出里提取新增/重复/单词归档数量。"""
        details: dict[str, Any] = {
            "imported": 0,
            "duplicates": 0,
            "failed": 0,
            "archived": 0,
            "existing_words": 0,
            "repaired_words": 0,
            "categories": {},
        }
        category_duplicates = 0
        for line in output.splitlines():
            line = line.strip()
            if not line:
                continue
            match = re.match(r"^([^：:]+)[：:]\s*新增\s*(\d+)", line)
            if match:
                category = match.group(1).strip()
                if category not in ("合计", "完成"):
                    details["categories"][category] = int(match.group(2))
                    duplicate_match = re.search(r"重复\s*(\d+)", line)
                    if duplicate_match:
                        category_duplicates += int(duplicate_match.group(1))
            match = re.search(r"合计[：:]\s*新增\s*(\d+)", line)
            if match:
                details["imported"] = int(match.group(1))
            match = re.search(r"完成[：:]\s*新增\s*(\d+)\s*条", line)
            if match:
                details["imported"] = int(match.group(1))
            match = re.search(r"完成[：:]\s*新写入\s*(\d+)", line)
            if match:
                details["archived"] = int(match.group(1))
                details["imported"] = int(match.group(1))
            match = re.search(r"合计[：:]\s*新增\s*\d+[，,]\s*重复\s*(\d+)", line)
            if match:
                details["duplicates"] = int(match.group(1))
            match = re.search(r"已存在\s*(\d+)", line)
            if match:
                details["existing_words"] = int(match.group(1))
            match = re.search(r"修复孤儿页面\s*(\d+)", line)
            if match:
                details["repaired_words"] = int(match.group(1))
            match = re.search(r"失败\s*(\d+)", line)
            if match:
                details["failed"] = int(match.group(1))
        details["duplicates"] = max(details["duplicates"], category_duplicates)
        return details

    # ------------------------------------------------------------------
    # 同步
    # ------------------------------------------------------------------
    def sync_subject(self, subject: dict[str, Any]) -> dict[str, Any]:
        result: dict[str, Any] = {
            "id": subject["id"],
            "label": subject["label"],
            "status": "ok",
            "exported": 0,
            "saved": "",
            "fingerprint": "",
            "route": "",
            "import": {},
            "categories": {},
            "imported": 0,
            "duplicates": 0,
            "message": "",
        }
        try:
            data = self.api_get("/api/tutor-log", {
                "subject": subject["worker_subject"],
                "category": "all",
                "limit": "50",
                "export": "1",
            })
            result["route"] = self.last_route
            entries = data.get("entries")
            if not isinstance(entries, list):
                entries = []
            clean_entries = [item for item in entries if isinstance(item, dict)]
            result["exported"] = len(clean_entries)
            result["categories"] = self.category_counts(clean_entries)
            fingerprint = self.fingerprint(
                clean_entries,
                "%s|%s|%s" % (
                    subject["export_root"],
                    subject["filename_prefix"],
                    subject["worker_subject"],
                ),
            )
            result["fingerprint"] = fingerprint
            previous = (self.previous_status.get("subjects") or {}).get(subject["id"]) or {}
            if self.unchanged(previous, fingerprint):
                result["status"] = "unchanged"
                result["saved"] = str(previous.get("saved") or "")
                result["import"] = previous.get("import") or {}
                result["imported"] = int(previous.get("imported") or 0)
                result["duplicates"] = int(previous.get("duplicates") or 0)
                result["categories"] = previous.get("categories") or result["categories"]
                result["message"] = "无变化，跳过重复保存/导入。"
                return result
            if clean_entries:
                saved = self.save_export(subject, "tutor", clean_entries)
                result["saved"] = str(saved)
                result["import"] = self.import_tutor(subject, saved)
                details = self.parse_import_details(result["import"].get("output", ""), "tutor")
                result["imported"] = details["imported"]
                result["duplicates"] = details["duplicates"]
                result["new_categories"] = details["categories"]
                if result["import"].get("status") not in ("ok", "skipped"):
                    result["status"] = "import_error"
                result["message"] = result["import"].get("message", "")
            else:
                result["message"] = "云端没有该科目的答疑记录。"
        except (SyncError, OSError, ValueError) as exc:
            result["status"] = "error"
            result["message"] = str(exc)
        return result

    def sync_pending_words(self, subject: dict[str, Any]) -> dict[str, Any]:
        result: dict[str, Any] = {
            "status": "ok",
            "exported": 0,
            "saved": "",
            "fingerprint": "",
            "route": "",
            "import": {},
            "words": [],
            "archived": 0,
            "existing_words": 0,
            "repaired_words": 0,
            "failed": 0,
            "message": "",
        }
        try:
            data = self.api_get("/api/pending-words")
            result["route"] = self.last_route
            entries = data.get("entries")
            if not isinstance(entries, list):
                entries = []
            clean_entries = [item for item in entries if isinstance(item, dict)]
            clean_entries = [item for item in clean_entries if str(item.get("source") or "generator") == "generator"]
            result["exported"] = len(clean_entries)
            words: list[str] = []
            for item in clean_entries:
                word = str(item.get("word") or "").strip()
                if word and word not in words:
                    words.append(word)
            result["words"] = words
            fingerprint = self.fingerprint(
                clean_entries,
                "%s|%s|pending_words" % (
                    subject["export_root"],
                    subject["filename_prefix"],
                ),
            )
            result["fingerprint"] = fingerprint
            previous = self.previous_status.get("pending_words") or {}
            if self.unchanged(previous, fingerprint):
                result["status"] = "unchanged"
                result["saved"] = str(previous.get("saved") or "")
                result["import"] = previous.get("import") or {}
                result["words"] = previous.get("words") or result["words"]
                result["archived"] = int(previous.get("archived") or 0)
                result["existing_words"] = int(previous.get("existing_words") or 0)
                result["repaired_words"] = int(previous.get("repaired_words") or 0)
                result["failed"] = int(previous.get("failed") or 0)
                result["message"] = "无变化，跳过重复保存/导入。"
                return result
            if clean_entries:
                saved = self.save_export(subject, "pending_words", clean_entries)
                result["saved"] = str(saved)
                result["import"] = self.import_pending_words(subject, saved)
                details = self.parse_import_details(result["import"].get("output", ""), "pending")
                result["archived"] = details["archived"]
                result["existing_words"] = details["existing_words"]
                result["repaired_words"] = details["repaired_words"]
                result["failed"] = details["failed"]
                if result["import"].get("status") not in ("ok", "skipped"):
                    result["status"] = "import_error"
                result["message"] = result["import"].get("message", "")
            else:
                result["message"] = "云端没有待归档单词。"
        except (SyncError, OSError, ValueError) as exc:
            result["status"] = "error"
            result["message"] = str(exc)
        return result

    def sync_all(self, interactive: bool = False) -> int:
        self.status = {
            "last_run": now_text(),
            "started_at": now_text(),
            "finished_at": "",
            "subjects": {},
            "pending_words": {},
            "errors": [],
        }
        try:
            self.load_subject_config()
            if not self.load_cloud_config(interactive=interactive):
                raise SyncError("缺少云端配置，请先运行“配置云端连接”。")
        except (SyncError, OSError, ValueError, json.JSONDecodeError) as exc:
            self.status["errors"].append(str(exc))
            self.status["finished_at"] = now_text()
            write_json(self.status_file, self.status)
            print("同步失败：%s" % exc)
            return 1

        any_enabled = False
        for subject in self.config["subjects"]:
            if not subject.get("enabled"):
                self.status["subjects"][subject["id"]] = {
                    "label": subject["label"],
                    "status": "disabled",
                    "message": "未启用",
                }
                continue
            any_enabled = True
            print("")
            print("=== %s ===" % subject["label"])
            result = self.sync_subject(subject)
            self.status["subjects"][subject["id"]] = result
            print("导出 %d 条；%s" % (result["exported"], result["message"] or result["status"]))
            if subject.get("include_pending_words"):
                pending = self.sync_pending_words(subject)
                self.status["pending_words"] = pending
                print("待归档单词：导出 %d 条；%s" % (
                    pending["exported"], pending["message"] or pending["status"]
                ))

        if not any_enabled:
            self.status["errors"].append("没有启用任何科目。")

        try:
            self.status["history_archives"] = build_history_archives(self.base)
        except (OSError, ValueError) as exc:
            self.status["history_archives"] = {}
            print("历史归档生成失败：%s" % exc)

        self.status["finished_at"] = now_text()
        write_json(self.status_file, self.status)
        # 同一进程内的菜单/自动循环下一次运行也要以本次结果为基准。
        self.previous_status = json.loads(json.dumps(self.status, ensure_ascii=False))
        print("")
        print("========== 同步结果 ==========")
        for item in self.status["subjects"].values():
            print(self.describe_result(item))
        pending = self.status.get("pending_words") or {}
        if pending:
            print(self.describe_result(pending, "待归档单词"))
        archives = self.status.get("history_archives") or {}
        if archives:
            print("GitHub 历史归档：英语 %d 条，数学 %d 条，添加日志 %d 条" % (
                int(archives.get("english") or 0),
                int(archives.get("math") or 0),
                int(archives.get("added_log") or 0),
            ))
            print("记得上传 答疑历史.json 和 添加日志/添加日志.json。")
        print("云端记录不会立即删除，按 24 小时保留。")
        print("同步状态已写入：%s" % self.status_file)
        if self.status["errors"]:
            for error in self.status["errors"]:
                print("错误：%s" % error)
            return 1
        failed = [x for x in self.status["subjects"].values() if x.get("status") not in ("ok", "unchanged", "disabled")]
        pending_status = (self.status.get("pending_words") or {}).get("status")
        if pending_status not in (None, "ok", "unchanged", "skipped"):
            failed.append(self.status.get("pending_words") or {})
        if failed:
            return 1
        return 0

    # ------------------------------------------------------------------
    # 菜单/状态
    # ------------------------------------------------------------------
    @staticmethod
    def describe_result(item: dict[str, Any], label: str = "") -> str:
        name = label or str(item.get("label") or "科目")
        status = str(item.get("status") or "")
        exported = int(item.get("exported") or 0)
        route = str(item.get("route") or "")
        message = str(item.get("message") or "").strip()
        if status == "disabled":
            return "%s：未启用" % name
        if status == "error":
            return "%s：同步失败%s" % (name, ("（%s）" % message) if message else "")
        if status == "import_error":
            return "%s：拉取 %d 条，但本地导入失败%s" % (
                name, exported, ("（%s）" % message) if message else "")
        if status == "unchanged":
            return "%s：无变化，已跳过重复保存/导入" % name

        if "words" in item:
            words = [str(word) for word in (item.get("words") or []) if str(word).strip()]
            if exported == 0:
                base = "待归档单词：云端 0 个，无需归档"
            else:
                history = "、".join(words[:8])
                if len(words) > 8:
                    history += " 等 %d 个" % len(words)
                base = "待归档单词：云端 %d 个" % exported
                if history:
                    base += "（%s）" % history
                base += "；归档 %d 个，已存在 %d 个，失败 %d 个" % (
                    int(item.get("archived") or 0),
                    int(item.get("existing_words") or 0),
                    int(item.get("failed") or 0),
                )
        else:
            categories = item.get("categories") or {}
            category_text = ""
            if isinstance(categories, dict) and categories:
                category_text = "（%s）" % "、".join(
                    "%s %d 条" % (str(k), int(v)) for k, v in categories.items()
                )
            if exported == 0:
                base = "%s：云端 0 条，无需导入" % name
            else:
                base = "%s：云端 %d 条%s" % (name, exported, category_text)
                imported = int(item.get("imported") or 0)
                duplicates = int(item.get("duplicates") or 0)
                if "imported" in item or "duplicates" in item:
                    base += "；本地新增 %d 条" % imported
                    if duplicates:
                        base += "，重复跳过 %d 条" % duplicates
                elif message:
                    base += "；%s" % message
        if route:
            base += "；线路：%s" % route
        return base

    def show_status(self) -> None:
        if not self.status_file.exists():
            print("还没有同步状态。先执行一次同步。")
            return
        try:
            data = load_json(self.status_file)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print("状态读取失败：%s" % exc)
            return
        print("最近同步：%s" % data.get("last_run", ""))
        subjects = data.get("subjects") or {}
        for sid, item in subjects.items():
            print(self.describe_result(item, str(item.get("label") or sid)))
        pending = data.get("pending_words") or {}
        if pending:
            print(self.describe_result(pending, "待归档单词"))
        archives = data.get("history_archives") or {}
        if archives:
            print("GitHub 历史归档：英语 %d 条，数学 %d 条" % (
                int(archives.get("english") or 0),
                int(archives.get("math") or 0),
            ))


def find_default_base() -> Path:
    return Path(__file__).resolve().parent.parent


def main() -> int:
    parser = argparse.ArgumentParser(description="同步全部科目的云端答疑记录")
    parser.add_argument("--base", default="", help="专升本备考根目录（一般不用改）")
    parser.add_argument("--once", action="store_true", help="同步一次")
    parser.add_argument("--status", action="store_true", help="查看状态")
    parser.add_argument("--setup", action="store_true", help="配置云端连接")
    parser.add_argument("--menu", action="store_true", help="打开菜单")
    parser.add_argument("--no-import", action="store_true", help="只拉取保存，不导入")
    args = parser.parse_args()

    base = Path(args.base).expanduser().resolve() if args.base else find_default_base()
    runner = SyncRunner(base, no_import=args.no_import)

    if args.setup:
        runner.load_cloud_config(interactive=True)
        return 0
    if args.status:
        runner.show_status()
        return 0
    if args.once:
        return runner.sync_all(interactive=True)
    if not args.menu:
        return runner.sync_all(interactive=True)

    # 菜单：先显示选项，不在启动时强行同步
    runner.ensure_subject_config()
    while True:
        print("")
        print("========== 专升本全部科目同步 ==========")
        print("1. 立即同步全部科目")
        print("2. 查看上次同步状态")
        print("3. 打开科目配置")
        print("4. 配置主线路云端")
        print("5. 配置备用线路云端（腾讯云 SCF）")
        print("6. 使用腾讯云 SCF 作为主线路（推荐国内）")
        print("7. 把已保存的备用线路切为主线路（不重输令牌）")
        print("0. 退出")
        choice = input("请选择：").strip()
        if choice == "0":
            return 0
        if choice == "1":
            runner.sync_all(interactive=True)
        elif choice == "2":
            runner.show_status()
        elif choice == "3":
            try:
                os.startfile(str(runner.subject_file))  # type: ignore[attr-defined]
            except OSError as exc:
                print("打开失败：%s" % exc)
                print("路径：%s" % runner.subject_file)
        elif choice == "4":
            runner.configure_cloud_part("primary")
        elif choice == "5":
            runner.configure_cloud_part("fallback")
        elif choice == "6":
            runner.configure_scf_as_primary()
        elif choice == "7":
            runner.promote_fallback()
        else:
            print("没有这个选项。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
