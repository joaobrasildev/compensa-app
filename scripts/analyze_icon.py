from PIL import Image

img = Image.open('assets/icon.png')
for y in range(350, 650, 10):
    row_content = []
    for x in range(0, 1024, 2):
        p = img.getpixel((x, y))
        if p[0] > 20 or p[1] > 20 or p[2] > 20:
            row_content.append(x)
    if row_content:
        print(f'y={y}: x=[{min(row_content)}-{max(row_content)}], count={len(row_content)}')
