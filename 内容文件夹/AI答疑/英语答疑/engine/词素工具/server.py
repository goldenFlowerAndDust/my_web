# -*- coding: utf-8 -*-
"""
本地 HTTP 服务：
- 为 单词模块/词汇代码生成器.html 提供 /api/analyze、/api/check、/api/archive
- 为 复习清单/核心词汇复习清单.html 提供 /api/review（把打卡写回 data.json）
- 为 英语答疑/英语答疑.html 提供 /api/tutor、/api/tutor-log
- 同时把当前目录作为静态站点根目录，方便直接打开工具页
- 不暴露 词素工具/ 下的 API Key、日志和备份

运行：
    python 词素工具/server.py
然后打开：
    http://127.0.0.1:8767/单词模块/词汇代码生成器.html
"""

from __future__ import annotations

import json
import posixpath
import sys
import traceback
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

TOOL_DIR = Path(__file__).resolve().parent
CONTENT_ROOT = Path(__file__).resolve().parents[4]
AI_ROOT = CONTENT_ROOT / "AI答疑"
CONVERSATION_DIR = AI_ROOT / "共享配置"
sys.path.insert(0, str(TOOL_DIR))
sys.path.insert(0, str(CONVERSATION_DIR))
BASE = CONTENT_ROOT / "专升本备考" / "备考专升本英语"

from word_archiver import ArchiveError, analyze_only, apply_review_updates, archive_word, archive_word_pair, audit_word_json, check_word, health  # noqa: E402
from english_tutor import TutorError, ask_tutor, read_tutor_logs  # noqa: E402
from archive_added_logs import refresh as refresh_added_logs, recover_missing_extra_entries  # noqa: E402
from 对话历史 import ConversationError, delete_window, read_document, remove_round, upsert_window  # noqa: E402

DEFAULT_PORT = 8767
SHARED_DIR = Path(__file__).resolve().parent.parent.parent.parent / "共享工具"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))


def _conversation_action(payload: dict) -> dict:
    action = str(payload.get("action") or "upsert")
    if action == "upsert":
        window = upsert_window(
            "english",
            payload.get("window_id"),
            payload.get("title") or "新对话",
            payload.get("messages") or [],
            mode=str(payload.get("mode") or ""),
            language=str(payload.get("language") or ""),
            language_name=str(payload.get("language_name") or ""),
            topic=str(payload.get("topic") or ""),
        )
        return {"ok": True, "window": window, "document": read_document("english")}
    if action == "remove_round":
        window = remove_round("english", payload.get("window_id"), int(payload.get("round") or 0))
        return {"ok": True, "window": window, "document": read_document("english")}
    if action == "delete_window":
        deleted = delete_window("english", payload.get("window_id"))
        return {"ok": True, "deleted": deleted, "document": read_document("english")}
    raise ConversationError("未知对话历史操作：%s" % action)


def refresh_archive() -> None:
    try:
        from 归档答疑历史 import refresh
        refresh("english")
    except Exception as exc:  # noqa: BLE001
        print("答疑归档更新失败（不影响服务）：%s" % exc)


class Handler(SimpleHTTPRequestHandler):
    server_version = "WordArchiver/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE), **kwargs)

    # ------------------------------------------------------------------
    # 基础响应
    # ------------------------------------------------------------------
    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _safe_path(self) -> bool:
        raw = unquote(urlparse(self.path).path)
        path = posixpath.normpath(raw)
        # 绝不通过静态服务暴露工具目录（API Key、日志、备份），
        # 同时挡住 /单词模块/../词素工具/... 这类路径穿越。
        if path.startswith("/词素工具") or "/词素工具/" in path:
            self.send_error(403, "Forbidden")
            return False
        if path.startswith("/.git") or path.startswith("/.dsh"):
            self.send_error(403, "Forbidden")
            return False
        return True

    # ------------------------------------------------------------------
    # GET
    # ------------------------------------------------------------------
    def do_GET(self):  # noqa: N802
        path = unquote(urlparse(self.path).path)
        if path == "/api/conversations":
            try:
                self._send_json(200, {"ok": True, "document": read_document("english")})
            except ConversationError as exc:
                self._send_json(400, {"ok": False, "error": str(exc)})
            return
        if path == "/api/health":
            self._send_json(200, health())
            return
        if path == "/api/log":
            log_file = TOOL_DIR / "归档日志.jsonl"
            entries = []
            if log_file.exists():
                for line in log_file.read_text(encoding="utf-8-sig").splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        item = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if isinstance(item, dict):
                        entries.append(item)
            total = len(entries)
            entries.reverse()
            query = parse_qs(urlparse(self.path).query)
            try:
                limit = int((query.get("limit") or ["200"])[0])
            except ValueError:
                limit = 200
            limit = max(1, min(limit, 500))
            self._send_json(200, {"ok": True, "total": total, "entries": entries[:limit]})
            return
        if path == "/api/tutor-log":
            query = parse_qs(urlparse(self.path).query)
            category = (query.get("category") or ["all"])[0]
            try:
                limit = int((query.get("limit") or ["20"])[0])
            except ValueError:
                limit = 20
            try:
                self._send_json(200, read_tutor_logs(category, limit))
            except TutorError as exc:
                self._send_json(400, {"ok": False, "error": str(exc)})
            except Exception as exc:
                traceback.print_exc()
                self._send_json(500, {"ok": False, "error": "读取答疑日志失败：%s" % exc})
            return
        if not self._safe_path():
            return
        super().do_GET()

    # ------------------------------------------------------------------
    # POST
    # ------------------------------------------------------------------
    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):  # noqa: N802
        path = unquote(urlparse(self.path).path)
        if path not in {"/api/analyze", "/api/archive", "/api/check", "/api/review", "/api/tutor", "/api/json-audit", "/api/conversations"}:
            self._send_json(404, {"ok": False, "error": "未知接口"})
            return

        try:
            length = int(self.headers.get("Content-Length") or "0")
            if length <= 0 or length > 200000:
                raise ArchiveError("请求体为空或过大。")
            raw = self.rfile.read(length).decode("utf-8", errors="replace")
            payload = json.loads(raw)
            if not isinstance(payload, dict):
                raise ArchiveError("请求体必须是 JSON 对象。")

            if path == "/api/conversations":
                result = _conversation_action(payload)
                self._send_json(200, result)
                return

            if path == "/api/tutor":
                result = ask_tutor(payload.get("mode"), payload.get("question"), payload.get("history"), payload.get("conversation_id"))
                refresh_archive()
                self._send_json(200, result)
                return

            if path == "/api/review":
                result = apply_review_updates(payload.get("updates") or [])
                self._send_json(200, result)
                return

            if path == "/api/json-audit":
                self._send_json(200, audit_word_json())
                return

            word = str(payload.get("word") or "").strip()
            hint = str(payload.get("hint") or "").strip()
            if not word:
                raise ArchiveError("请输入英文单词。")

            if path == "/api/check":
                result = check_word(word)
            elif path == "/api/analyze":
                result = analyze_only(word, hint)
            elif payload.get("overwrite") or payload.get("repair"):
                result = archive_word(
                    word,
                    hint,
                    overwrite=bool(payload.get("overwrite")),
                    repair=bool(payload.get("repair")),
                )
            else:
                result = archive_word_pair(word, hint)
            self._send_json(200, result)
        except ArchiveError as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except TutorError as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except json.JSONDecodeError:
            self._send_json(400, {"ok": False, "error": "请求体不是合法 JSON。"})
        except Exception as exc:  # 不把堆栈或 API Key 返回给浏览器
            traceback.print_exc()
            self._send_json(500, {"ok": False, "error": "服务内部错误：%s" % exc})

    def log_message(self, format, *args):  # noqa: A003
        # 保留简洁访问日志，不打印 API Key（本服务不会把 Key 放进 URL）
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format % args))


def archive_conversation_history() -> None:
    try:
        from 归档对话历史 import archive_once
        files = archive_once()
        if files:
            print("对话历史已归档：%d 个文件" % len(files))
    except Exception as exc:  # noqa: BLE001
        print("对话历史归档失败（不影响服务）：%s" % exc)


def main() -> None:
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("端口必须是数字。")
            return
    archive_conversation_history()
    refresh_archive()
    recover_missing_extra_entries()
    refresh_added_logs()
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print("词素自动归档服务已启动：")
    print("  工具页: http://127.0.0.1:%d/单词模块/词汇代码生成器.html" % port)
    print("  英语答疑: http://127.0.0.1:%d/英语答疑/英语答疑.html" % port)
    print("  健康检查: http://127.0.0.1:%d/api/health" % port)
    print("  按 Ctrl+C 停止。")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
