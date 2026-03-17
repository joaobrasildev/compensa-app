from PIL import Image

# Check splash-icon vertical profile - content seems spread across entire image
img = Image.open('assets/splash-icon.png').convert('RGBA')
for y in range(0, 1024, 50):
    row = []
    for x in range(0, 1024, 2):
        r, g, b, a = img.getpixel((x, y))
        if a > 10:
            row.append(x)
    if row:
        print(f'y={y}: x=[{min(row)}-{max(row)}], count={len(row)}')

print()
# Check where the dense content is
print('Dense rows (count > 50):')
for y in range(0, 1024, 10):
    row = []
    for x in range(0, 1024, 2):
        r, g, b, a = img.getpixel((x, y))
        if a > 10:
            row.append(x)
    if len(row) > 50:
        print(f'y={y}: x=[{min(row)}-{max(row)}], count={len(row)}')
