#!/usr/bin/env python3
"""Turn a README screenshot into a site image.

Crops the black/transparent margin that macOS window captures carry,
scales to 1600px wide, writes WebP (q82). Prints the size to put in
the <img width height> attributes.

    python3 scripts/optimize-image.py ~/src/kvtop/docs/assets/dashboard.png kvtop-dashboard
"""
import sys
from PIL import Image, ImageChops

src, name = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
rgb = im.convert("RGB")
not_black = ImageChops.difference(rgb, Image.new("RGB", rgb.size)).convert("L").point(lambda v: 255 if v > 20 else 0)
opaque = im.split()[3].point(lambda v: 255 if v > 200 else 0)
box = ImageChops.multiply(not_black, opaque).getbbox() or (0, 0, *im.size)
out = rgb.crop(box)
w = min(1600, out.width)
out = out.resize((w, round(out.height * w / out.width)), Image.LANCZOS)
dest = f"public/img/{name}.webp"
out.save(dest, "WEBP", quality=82)
print(f'{dest}  width="{out.width}" height="{out.height}"')
