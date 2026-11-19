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


def merge_documents(local: dict[str, Any], cloud: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]], list[str]]:
    """合并两套 windows，返回 (合并文档, 需要上传的窗口, 需要删除的窗口 ID)。"""
    local_windows = (local or {}).get("windows") if isinstance(local, dict) else {}
    cloud_windows = (cloud or {}).get("windows") if isinstance(cloud, dict) else {}
    local_deleted = (local or {}).get("deleted") if isinstance(local, dict) else {}
    cloud_deleted = (cloud or {}).get("deleted") if isinstance(cloud, dict) else {}
    if not isinstance(local_windows, dict):
        local_windows = {}
    if not isinstance(cloud_windows, dict):
        cloud_windows = {}
    if not isinstance(local_deleted, dict):
        local_deleted = {}
    if not isinstance(cloud_deleted, dict):
        cloud_deleted = {}

    merged = {}
    merged_deleted = {}
    upload: list[dict[str, Any]] = []
    deletions: list[str] = []
    for window_id in sorted(set(local_windows) | set(cloud_windows) | set(local_deleted) | set(cloud_deleted)):
        tombstone = max(str(local_deleted.get(window_id) or ""), str(cloud_deleted.get(window_id) or ""))
        local_window = local_windows.get(window_id)
        cloud_window = cloud_windows.get(window_id)
        winner, source = merge_window(local_window, cloud_window)
        window_time = str((winner or {}).get("updated_at") or "")
        if tombstone and tombstone >= window_time:
            merged_deleted[window_id] = tombstone
            cloud_tombstone = str(cloud_deleted.get(window_id) or "")
            if not cloud_tombstone or tombstone > cloud_tombstone:
                deletions.append(window_id)
            continue
        if winner is None:
            continue
        merged[window_id] = winner
        if source == "local":
            cloud_window = cloud_windows.get(window_id)
            if not cloud_window or _updated_at(winner) > _updated_at(cloud_window):
                upload.append(winner)
        if cloud_deleted.get(window_id):
            upload.append(winner)

    result = dict(local or {})
    result["windows"] = merged
    result["deleted"] = merged_deleted
    return result, upload, deletions
