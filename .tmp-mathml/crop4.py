import os
from PIL import Image

out = r"D:\GitHub\my_web\.tmp-mathml"
im = Image.open(os.path.join(out, "21-native-full.png"))
W, H = im.size
im.crop((330, 2600, W, 3750)).save(os.path.join(out, "native-2x.png"))
im2 = Image.open(os.path.join(out, "31-native-full.png"))
im2.crop((330, 2600, W, 3750)).save(os.path.join(out, "native-2x-b.png"))
print("ok")
