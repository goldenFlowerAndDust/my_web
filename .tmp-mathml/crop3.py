import os
from PIL import Image

out = r"D:\GitHub\my_web\.tmp-mathml"
im = Image.open(os.path.join(out, "30-fallback-full.png"))
im.crop((330, 780, 1180, 1620)).save(os.path.join(out, "check-sets.png"))
print("ok")
