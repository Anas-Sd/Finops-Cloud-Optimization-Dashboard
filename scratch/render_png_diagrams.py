import os
from PIL import Image, ImageDraw, ImageFont

output_dir = r"c:\PROJECTS\CAPSTONE\report_assets"
os.makedirs(output_dir, exist_ok=True)

def get_font(size, bold=False):
    # Try common Windows font paths
    font_names = ["arialbd.ttf" if bold else "arial.ttf", "segoeuib.ttf" if bold else "segoeui.ttf"]
    for fn in font_names:
        p = os.path.join(r"C:\Windows\Fonts", fn)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

font_title = get_font(22, bold=True)
font_sub = get_font(15, bold=False)
font_label = get_font(14, bold=True)

# -------------------------------------------------------------
# FIGURE 4.1: SYSTEM TOPOLOGY
# -------------------------------------------------------------
w, h = 1200, 560
img1 = Image.new("RGB", (w, h), (255, 255, 255))
d1 = ImageDraw.Draw(img1)

def draw_arrow(d, p1, p2, label=""):
    d.line([p1, p2], fill=(51, 65, 85), width=3)
    # Arrow head
    x1, y1 = p1
    x2, y2 = p2
    if x1 == x2: # vertical
        sign = 1 if y2 > y1 else -1
        d.polygon([(x2, y2), (x2 - 6, y2 - sign*12), (x2 + 6, y2 - sign*12)], fill=(51, 65, 85))
        if label:
            d.text((x2 + 10, (y1 + y2)//2 - 10), label, fill=(51, 65, 85), font=font_label)
    else: # horizontal
        sign = 1 if x2 > x1 else -1
        d.polygon([(x2, y2), (x2 - sign*12, y2 - 6), (x2 - sign*12, y2 + 6)], fill=(51, 65, 85))
        if label:
            bbox = font_label.getbbox(label)
            tw = bbox[2] - bbox[0]
            d.text(((x1 + x2)//2 - tw//2, y1 - 22), label, fill=(51, 65, 85), font=font_label)

def draw_card(d, x, y, width, height, title, lines, fill_col, border_col, title_col, text_col):
    d.rounded_rectangle([x, y, x + width, y + height], radius=16, fill=fill_col, outline=border_col, width=3)
    # Title
    t_bbox = font_title.getbbox(title)
    tw = t_bbox[2] - t_bbox[0]
    d.text((x + (width - tw)//2, y + 25), title, fill=title_col, font=font_title)
    # Subtext lines
    curr_y = y + 70
    for line in lines:
        l_bbox = font_sub.getbbox(line)
        lw = l_bbox[2] - l_bbox[0]
        d.text((x + (width - lw)//2, curr_y), line, fill=text_col, font=font_sub)
        curr_y += 24

# Row 1
draw_card(d1, 50, 40, 310, 160, "Multi-Container Ingestion", ["Docker Socket (/var/run/docker.sock)", "cgroups Metric Extraction", "Team & SKU Metadata Labels"], (238, 246, 255), (37, 99, 235), (30, 58, 138), (37, 99, 235))
draw_card(d1, 440, 40, 310, 160, "Telemetry Normalization", ["Limit-Aligned Scaling (0.95/2=47.5%)", "EMA Jitter Filter (alpha = 0.4)", "Kernel Delta Tracking"], (240, 253, 244), (22, 163, 74), (20, 83, 45), (21, 128, 61))
draw_card(d1, 830, 40, 320, 160, "Anomaly & Waste Monitor", ["<20% Idle Threshold Classifier", "Transient Spike Suppressor", "Degraded-Mode Recovery"], (240, 253, 244), (21, 128, 61), (20, 83, 45), (21, 128, 61))

# Row 2
draw_card(d1, 50, 310, 310, 160, "O2 Reference Baseline", ["Raw Host-Relative Compute", "Unsmoothed Telemetry Oracle", "Baseline KPI-1..KPI-6 Envelope"], (248, 250, 252), (100, 116, 139), (30, 41, 59), (71, 85, 105))
draw_card(d1, 440, 310, 310, 160, "O3 FinOps Cost Engine", ["Multi-Team Attribution (Platform, Growth)", "INR (₹) Rate Card Matrix", "Right-Sizing Savings Engine"], (255, 251, 235), (217, 119, 6), (120, 53, 15), (180, 83, 9))
draw_card(d1, 830, 310, 320, 160, "Evaluation & Telemetry", ["Vite/React Executive Dashboard", "AC-1..AC-4 Verification", "KPI-1..KPI-6 & NT-1..NT-5 Suite"], (250, 245, 255), (124, 58, 237), (76, 29, 149), (109, 40, 217))

# Arrows
draw_arrow(d1, (360, 120), (440, 120), "FR-1")
draw_arrow(d1, (750, 120), (830, 120), "FR-4")
draw_arrow(d1, (205, 200), (205, 310), "FR-2")
draw_arrow(d1, (360, 390), (440, 390), "Baseline")
draw_arrow(d1, (595, 200), (595, 310), "Normalized Stream")
draw_arrow(d1, (750, 390), (830, 390), "FR-3")
draw_arrow(d1, (990, 200), (990, 310), "NT-1..5")

img1.save(os.path.join(output_dir, "figure_4_1_topology.png"))

# -------------------------------------------------------------
# FIGURE 4.2: INDEPENDENT VALIDATION
# -------------------------------------------------------------
img2 = Image.new("RGB", (w, h), (255, 255, 255))
d2 = ImageDraw.Draw(img2)

def draw_diag_arrow(d, p1, p2):
    d.line([p1, p2], fill=(51, 65, 85), width=3)
    x1, y1 = p1
    x2, y2 = p2
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_len = 12
    p_a = (x2 - arrow_len * math.cos(angle - math.pi/6), y2 - arrow_len * math.sin(angle - math.pi/6))
    p_b = (x2 - arrow_len * math.cos(angle + math.pi/6), y2 - arrow_len * math.sin(angle + math.pi/6))
    d.polygon([p2, p_a, p_b], fill=(51, 65, 85))

draw_card(d2, 50, 190, 270, 160, "AC-3 Evidence", ["12 Versioned Microservices", "Multi-Team Workload Fixtures", "Known Active vs Idle States"], (238, 246, 255), (37, 99, 235), (30, 58, 138), (37, 99, 235))

draw_card(d2, 380, 60, 260, 150, "O2 Baseline Run", ["Unfiltered Telemetry", "Host-Relative Calculation", "Static Threshold Baseline"], (248, 250, 252), (100, 116, 139), (30, 41, 59), (71, 85, 105))
draw_card(d2, 380, 330, 260, 150, "O3 Candidate Run", ["Limit-Normalized Scaling", "EMA Jitter Filter (0.4)", "INR Multi-Team Engine"], (255, 251, 235), (217, 119, 6), (120, 53, 15), (180, 83, 9))

draw_card(d2, 700, 190, 240, 160, "KPI & Gate Check", ["KPI-1..KPI-6 Audit", "Mathematical Limit Sync", "AC-1..AC-4 Verification"], (240, 253, 250), (15, 118, 110), (19, 78, 74), (15, 118, 110))

draw_card(d2, 990, 60, 180, 150, "Negative Suite", ["NT-1 to NT-5", "Socket Drop", "OOM Eviction"], (240, 253, 244), (21, 128, 61), (20, 83, 45), (21, 128, 61))
draw_card(d2, 990, 330, 180, 150, "Release Gate", ["Accept / Hold", "Right-Sizing", "Production Ver."], (250, 245, 255), (124, 58, 237), (76, 29, 149), (109, 40, 217))

# Diagonals & connectors
draw_diag_arrow(d2, (320, 230), (380, 160))
draw_diag_arrow(d2, (320, 310), (380, 380))

draw_diag_arrow(d2, (640, 160), (700, 230))
draw_diag_arrow(d2, (640, 380), (700, 310))

draw_diag_arrow(d2, (940, 230), (990, 160))
draw_arrow(d2, (1080, 210), (1080, 330), "")

img2.save(os.path.join(output_dir, "figure_4_2_validation.png"))

print("Successfully generated high-resolution PNGs!")
