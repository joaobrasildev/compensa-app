from PIL import Image
import collections

# --- Analyze splash-icon.png ---
img = Image.open('assets/splash-icon.png').convert('RGBA')
print('splash-icon.png:', img.size)
colors = collections.Counter()
non_transparent = []
for y in range(0, 1024, 2):
    for x in range(0, 1024, 2):
        r, g, b, a = img.getpixel((x, y))
        if a > 10:
            non_transparent.append((x, y, r, g, b, a))
            colors[(r, g, b)] += 1

if non_transparent:
    xs = [p[0] for p in non_transparent]
    ys = [p[1] for p in non_transparent]
    print(f'Content box: x=[{min(xs)}-{max(xs)}], y=[{min(ys)}-{max(ys)}]')
print(f'Non-transparent pixels: {len(non_transparent)}')
print('Top colors:')
for c, count in colors.most_common(15):
    print(f'  rgb{c}: {count}')

# --- Analyze splash.png ---
img2 = Image.open('assets/splash.png').convert('RGBA')
print()
print('splash.png:', img2.size)
non_black = []
green_px = []
orange_px = []
for y in range(0, 2778, 4):
    for x in range(0, 2778, 4):
        r, g, b, a = img2.getpixel((x, y))
        if r > 10 or g > 10 or b > 10:
            non_black.append((x, y))
            if g > 100 and g > r and g > b:
                green_px.append((x, y))
            elif r > 150 and g > 80 and b < 80:
                orange_px.append((x, y))

if non_black:
    xs = [p[0] for p in non_black]
    ys = [p[1] for p in non_black]
    print(f'Content box: x=[{min(xs)}-{max(xs)}], y=[{min(ys)}-{max(ys)}]')
if green_px:
    xs = [p[0] for p in green_px]
    ys = [p[1] for p in green_px]
    print(f'Green box: x=[{min(xs)}-{max(xs)}], y=[{min(ys)}-{max(ys)}]')
if orange_px:
    xs = [p[0] for p in orange_px]
    ys = [p[1] for p in orange_px]
    print(f'Orange box: x=[{min(xs)}-{max(xs)}], y=[{min(ys)}-{max(ys)}]')
