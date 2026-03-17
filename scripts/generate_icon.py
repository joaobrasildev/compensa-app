#!/usr/bin/env python3
"""
Generate new icon with "E aí," above the existing "compensa?" content.
Strategy: scale the entire original image down (no cropping = no clipping)
and draw "E aí," in orange above.
"""
from PIL import Image, ImageDraw, ImageFont
import shutil
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Backup originals (only if not already backed up)
for f in ['assets/icon.png', 'assets/adaptive-icon.png']:
    backup = f + '.bak'
    if not os.path.exists(backup):
        shutil.copy2(f, backup)
        print(f'Backed up {f} -> {backup}')

# --- Configuration ---
CANVAS = 1024
SCALE = 0.72  # scale original down to 72% to make room for "E aí,"
ORANGE = (209, 128, 23)
ORANGE_RGBA = (209, 128, 23, 255)

# Font: try Arial Rounded Bold first (rounded sans-serif matches the icon style)
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
                f = ImageFont.truetype(fc, size)
                print(f'Using font: {fc} at size {size}')
                return f
            except Exception:
                continue
    print('WARNING: using default font')
    return ImageFont.load_default()

def measure_text(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox[1]  # w, h, y_offset

# --- Scale original image (full, no crop) ---
original = Image.open('assets/icon.png.bak')
scaled_size = int(CANVAS * SCALE)
original_scaled = original.resize((scaled_size, scaled_size), Image.LANCZOS)

# The original content is vertically centered in the 1024 image.
# After scaling to 72%, it becomes ~737px. Content area scales proportionally.
# Original content center was at ~y=500 (of 1024), so in scaled it's at ~360 (of 737).

# --- Layout calculation ---
# We want "E aí," above, then the scaled original below, all vertically centered.
# First, figure out "E aí," text dimensions
# Try font sizes to get "E aí," roughly proportional to "compensa" in the scaled image.
# Original "compensa" text height was ~264px in 1024 -> ~190px in scaled.
# "E aí," should be about 55-65% of that -> ~110-120px rendered height.

font_eai = find_font(130)
temp_canvas = Image.new('RGB', (CANVAS, CANVAS), (0, 0, 0))
temp_draw = ImageDraw.Draw(temp_canvas)
eai_w, eai_h, eai_y_off = measure_text(temp_draw, "E aí,", font_eai)
print(f'"E aí," measured: {eai_w}x{eai_h}, y_offset={eai_y_off}')

# Gap between "E aí," and the scaled original content
GAP = 10

# Original visible content starts at y=~368 (of 1024). In scaled image that's y=~265 (of 737).
# So when we place the scaled image, the visible content starts at: placement_y + 265
# We want "E aí," bottom edge to be GAP pixels above the visible content.

# Total height to center: eai_h + GAP + visible_content_in_scaled
# Original visible content: y=368 to y=634 -> height=266 -> scaled: ~192
# In the scaled image, visible content at relative y: 368*0.72=265 to 634*0.72=456
scaled_content_top = int(368 * SCALE)  # ~265
scaled_content_bottom = int(634 * SCALE)  # ~456
scaled_content_h = scaled_content_bottom - scaled_content_top  # ~191

# Total visual block: eai_h + GAP + scaled_content_h
total_block = eai_h + GAP + scaled_content_h

# Center this block vertically in the canvas
block_top = (CANVAS - total_block) // 2

# "E aí," starts at block_top
eai_y = block_top - eai_y_off  # subtract y_offset for precise positioning
eai_x = (CANVAS - eai_w) // 2

# Scaled original image placement: visible content top should be at block_top + eai_h + GAP
target_content_top = block_top + eai_h + GAP
# In the scaled image, content starts at scaled_content_top, so:
orig_place_y = target_content_top - scaled_content_top
orig_place_x = (CANVAS - scaled_size) // 2

print(f'Layout: eai at ({eai_x},{eai_y}), original at ({orig_place_x},{orig_place_y})')
print(f'Block: top={block_top}, total_h={total_block}')

# --- Generate icon.png ---
canvas = Image.new('RGB', (CANVAS, CANVAS), (0, 0, 0))
# Paste the scaled original (black bg blends with canvas)
canvas.paste(original_scaled, (orig_place_x, orig_place_y))
draw = ImageDraw.Draw(canvas)
draw.text((eai_x, eai_y), "E aí,", fill=ORANGE, font=font_eai)
canvas.save('assets/icon.png', 'PNG')
print('Saved assets/icon.png')

# --- Generate adaptive-icon.png ---
original_adaptive = Image.open('assets/adaptive-icon.png.bak')
adaptive_scaled = original_adaptive.resize((scaled_size, scaled_size), Image.LANCZOS)

canvas_adaptive = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
canvas_adaptive.paste(adaptive_scaled, (orig_place_x, orig_place_y), adaptive_scaled)
draw_adaptive = ImageDraw.Draw(canvas_adaptive)
draw_adaptive.text((eai_x, eai_y), "E aí,", fill=ORANGE_RGBA, font=font_eai)
canvas_adaptive.save('assets/adaptive-icon.png', 'PNG')
print('Saved assets/adaptive-icon.png')

print('\nDone! Open assets/icon.png to preview.')
