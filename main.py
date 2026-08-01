import sys
import os

target_path = r"D:\编程-GitHub\my_web\内容文件夹\python_study\关于学习当中的自建功能库"
print("目标路径是否存在？", os.path.exists(target_path))
sys.path.append(target_path)

from student_system.py import Student