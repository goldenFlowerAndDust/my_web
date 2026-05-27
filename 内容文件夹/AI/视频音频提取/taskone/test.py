from moviepy import VideoFileClip
import os

# ==== 路径配置（根据你的实际目录调整） ====
# 假设脚本位置：视频音频提取/taskone/test.py
# 那么原视频在：../video/搞笑视频/原文件/搞笑视频1.mp4
# 无声视频输出：../video/搞笑视频/newVideo/搞笑视频1.mp4
# 音频输出：../video/搞笑视频/mp3/搞笑视频1.mp3

video_name = "搞笑视频1.mp4"  # 可以根据需要改
video_path = f"../video/搞笑视频/原文件/{video_name}"
silent_video_path = f"../video/搞笑视频/newVideo/{video_name}"  # 保持相同文件名
audio_path = f"../video/搞笑视频/mp3/{video_name.replace('.mp4', '.mp3')}"

# 自动创建输出目录（如果不存在）
os.makedirs(os.path.dirname(silent_video_path), exist_ok=True)
os.makedirs(os.path.dirname(audio_path), exist_ok=True)

# 检查原视频是否存在
if not os.path.exists(video_path):
    print(f"文件不存在: {video_path}")
    exit()

print(f"原视频文件大小: {os.path.getsize(video_path) / (1024 * 1024):.2f} MB")

try:
    video = VideoFileClip(video_path)

    # 1. 提取音频并保存为 mp3
    if video.audio is None:
        print("该视频没有音频轨道，无法提取")
    else:
        print(f"正在提取音频，时长: {video.duration:.2f} 秒")
        video.audio.write_audiofile(audio_path, codec='libmp3lame')  # mp3格式
        print(f"音频已保存: {os.path.abspath(audio_path)}")
        audio_size = os.path.getsize(audio_path) / (1024 * 1024)
        print(f"音频文件大小: {audio_size:.2f} MB")

    # 2. 生成无声视频（移除音频轨道）
    print("正在生成无声视频...")
    silent_video = video.without_audio()  # 新版MoviePy方法
    # 或者用旧版兼容写法：silent_video = video.set_audio(None)
    silent_video.write_videofile(silent_video_path, codec='libx264', audio_codec=None)
    silent_video.close()
    print(f"无声视频已保存: {os.path.abspath(silent_video_path)}")
    silent_size = os.path.getsize(silent_video_path) / (1024 * 1024)
    print(f"无声视频文件大小: {silent_size:.2f} MB")

    video.close()
    print("全部完成！")

except Exception as e:
    print(f"错误: {e}")
