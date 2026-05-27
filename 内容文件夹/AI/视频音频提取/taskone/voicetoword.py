import whisper   #openai-whisper
from moviepy import VideoFileClip
# 1. 从视频中提取音频
video_path = r"D:\雷根华\人工智能\蜡笔小新.mp4"
audio_path = "temp_audio.mp3"
video_clip = VideoFileClip(video_path)
audio_clip = video_clip.audio
audio_clip.write_audiofile(audio_path)
print("音频提取完成")
# 2. 加载Whisper模型（首次运行会自动下载模型）
model = whisper.load_model("base")  # 可选: tiny, base, small, medium, large
print("模型加载完成，开始识别...")
# 3. 转写音频
result = model.transcribe(audio_path, language='zh')
print("识别结果:", result["text"])