"""本地 / 云端对话历史合并逻辑。

以窗口为最小单位：
- 同一窗口按 updated_at 选较新版本。
- 只在云端缺失或本地更新时上传。
- 删除窗口/轮次由调用方生成新 updated_at 的窗口或直接执行删除动作。
"""
from __future__ import annotations

from typing import Any


def _updated_at(item: dict[str, Any]) -> str:
    return str((item or {}).get("updated_at") or "")


def merge_window(local: dict[str, Any] | None, cloud: dict[str, Any] | None) -> tuple[dict[str, Any] | None, str]:
    """返回 (最终版本, 'local'|'cloud')。"""
    if not local and not cloud:
        return None, "local"
    if not local:
        return cloud, "cloud"
    if not cloud:
        return local, "local"
    return (local, "local") if _updated_at(local) >= _updated_at(cloud) else (cloud, "cloud")


def merge_documents(local: dict[str, Any], cloud: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """合并两套 windows，返回 (合并文档, 需要上传到云端的窗口列表)。"""
    local_windows = (local or {}).get("windows") if isinstance(local, dict) else {}
    cloud_windows = (cloud or {}).get("windows") if isinstance(cloud, dict) else {}
    if not isinstance(local_windows, dict):
        local_windows = {}
    if not isinstance(cloud_windows, dict):
        cloud_windows = {}

    merged = {}
    upload: list[dict[str, Any]] = []
    for window_id in sorted(set(local_windows) | set(cloud_windows)):
        winner, source = merge_window(local_windows.get(window_id), cloud_windows.get(window_id))
        if winner is None:
            continue
        merged[window_id] = winner
        if source == "local":
            cloud_window = cloud_windows.get(window_id)
            if not cloud_window or _updated_at(winner) > _updated_at(cloud_window):
                upload.append(winner)
    result = dict(local or {})
    result["windows"] = merged
    return result, upload
