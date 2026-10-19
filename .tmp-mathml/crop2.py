import os
from PIL import Image

out = r"D:\GitHub\my_web\.tmp-mathml"
im = Image.open(os.path.join(out, "30-fallback-full.png"))
W, H = im.size
print("fallback", W, H)
for y in (7300, 8900, 10500, 12100, 13300):
    im.crop((0, y, W, min(y + 1150, H))).save(os.path.join(out, "fixcrop-%d.png" % y))
    print("crop", y)
