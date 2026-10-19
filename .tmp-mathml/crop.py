import os
from PIL import Image

out = r"D:\GitHub\my_web\.tmp-mathml"
for name in ("20-fallback-full.png", "21-native-full.png"):
    im = Image.open(os.path.join(out, name))
    print(name, im.size)

im = Image.open(os.path.join(out, "20-fallback-full.png"))
W, H = im.size
for y in (2600, 4200, 5800, 7400, 9000, 10600, 12200):
    im.crop((0, y, W, min(y + 1150, H))).save(os.path.join(out, "crop-%d.png" % y))
    print("crop", y)
