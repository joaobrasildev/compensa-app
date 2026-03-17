#!/usr/bin/env python3
"""
Update splash.png and splash-icon.png to match the new "E ai, compensa?" branding.

- splash.png (2778x2778): same treatment as icon - scale original down, add "E ai," in orange
- splash-icon.png (1024x1024): copy from the new adaptive-icon (same design, RGBA)
"""
from PIL import Image, ImageDraw, ImageFont
import shutil
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# --- Config ---
ORANGE = (209, 128, 23)
ORANGE_RGBA = (209, 128, 23, 255)

FONT_CANDIDATES = [
    '/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/SFCompact.ttf',
    '/System/Library/Fonts/Supplemental/Verdana Bold.ttf',
]

def find_font(size):
    for fc in FONT_CANDIDATES:
        if os.path.exists(fc):
            try:
                return ImageFont.truetype(fc, size)
            except Exception:
                continue
    return ImageFont.load_default()

def measure_text(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox[1]

# ========================================
# 1. Update splash-icon.png (1024x1024)
#    Copy from new adaptive-icon.png
# ========================================
print('--- splash-icon.png ---')
adaptive = Image.open('assets/adaptive-icon.png')
adaptive.save('assets/splash-icon.png', 'PNG')
print('Copied adaptive-icon.png -> splash-icon.png (1024x1024 RGBA)')

# ========================================
# 2. Update splash.png (2778x2778)
#    Same approach as icon: scale original down, add "E ai,"
# ========================================
print()
print('--- splash.png ---')

SPLASH_SIZE = 2778
SCALE = 0.72

# The original splash.png has the same "compensa?" art as the original icon
# but at 2778x2778. We apply the same approach.
original = Image.open('assets/splash.png').convert('RGBA')

# Scale down
scaled_size = int(SPLASH_SIZE * SCALE)  # ~2000
original_scaled = original.resize((scaled_size, scaled_size), Image.LANCZOS)

# Font size proportional to canvas (splash is 2.71x the icon)
ratio = SPLASH_SIZE / 1024.0
font_size = int(130 * ratio)  # ~353
font = find_font(font_size)
print(f'Font size: {font_size}')

# Measure "E ai," text
temp = Image.new('RGBA', (SPLASH_SIZE, SPLASH_SIZE), (0, 0, 0, 0))
temp_draw = ImageDraw.Draw(temp)
eai_w, eai_h, eai_y_off = measure_text(temp_draw, "E ai,", font)
print(f'"E ai," measured: {eai_w}x{eai_h}')

# Layout: same proportions as icon
# Original content in splash: green y=[~1000-1720] (estimated proportionally from icon)
# Scaled content top: ~1000 * 0.72 = 720 (relative to scaled image)
scaled_content_top = int(368 * (SPLASH_SIZE / 1024.0) * SCALE)
scaled_content_bottom = int(634 * (SPLASH_SIZE / 1024.0) * SCALE)
scaled_content_h = scaled_content_bottom - scaled_content_top

GAP = int(10 * ratio)
total_block = eai_h + GAP + scaled_content_h
block_top = (SPLASH_SIZE - total_block) // 2

eai_y = block_top - eai_y_off
eai_x = (SPLASH_SIZE - eai_w) // 2

target_content_top = block_top + eai_h + GAP
orig_place_y = target_content_top - scaled_content_top
orig_place_x = (SPLASH_SIZE - scaled_size) // 2

print(f'Layout: eai at ({eai_x},{eai_y}), original at ({orig_place_x},{orig_place_y})')

# Create splash on black background
canvas = Image.new('RGB', (SPLASH_SIZE, SPLASH_SIZE), (0, 0, 0))
# Convert scaled to RGB for pasting on black bg
scaled_rgb = Image.new('RGB', (scaled_size, scaled_size), (0, 0, 0))
scaled_rgb.paste(original_scaled, (0, 0), original_scaled)
canvas.paste(scaled_rgb, (orig_place_x, orig_place_y))
draw = ImageDraw.Draw(canvas)
draw.text((eai_x, eai_y), "E ai,", fill=ORANGE, font=font)
canvas.save('assets/splash.png', 'PNG')
print('Saved assets/splash.png')

print()
print('Done! Both splash files updated.')
