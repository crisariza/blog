#!/usr/bin/env python3
"""Rebuilds the office scene's v5 images from the v4 ones.

The v4 scene was assembled from earlier renders and carries a few leftovers:
a noisy, cut-off wall shadow, a dashed seam on the rug, the ghost of the
pennant where it used to hang and a jagged pennant. This repairs them (from the first render where it is clean),
recuts the mouse sprite and redraws the hover masks with smooth outlines.

Usage: python3 scripts/office-retouch.py   (needs Pillow and numpy)
"""

import io
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OFFICE = ROOT / "public" / "office"
WIDTH, HEIGHT = 2336, 1744
SUPERSAMPLE = 4


def from_git(path: str, mode: str = "RGB") -> Image.Image:
    """The last committed version of a file that has since been replaced."""
    revisions = subprocess.run(
        ["git", "log", "--all", "--diff-filter=AM", "--format=%H", "--", path],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    ).stdout.split()
    data = subprocess.run(
        ["git", "show", f"{revisions[0]}:{path}"],
        cwd=ROOT,
        capture_output=True,
        check=True,
    ).stdout
    return Image.open(io.BytesIO(data)).convert(mode)


def to_array(image: Image.Image) -> np.ndarray:
    return np.asarray(image).astype(np.float32)


def to_image(array: np.ndarray) -> Image.Image:
    return Image.fromarray(np.clip(array + 0.5, 0, 255).astype(np.uint8))


def blur(array: np.ndarray, radius: float) -> np.ndarray:
    return to_array(to_image(array).filter(ImageFilter.GaussianBlur(radius)))


def soften(mask: Image.Image, grow: int, feather: float) -> np.ndarray:
    """A 0..1 mask grown by `grow` pixels with a feathered edge."""
    if grow > 0:
        mask = mask.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    return (np.asarray(mask).astype(np.float32) / 255)[..., None]


def polygon_mask(points, size=(WIDTH, HEIGHT)) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return mask


def smooth_outline(mask: Image.Image, radius: float) -> Image.Image:
    """Rounds a hard mask's staircase off and gives it an antialiased edge."""
    width, height = mask.size
    big = mask.resize(
        (width * SUPERSAMPLE, height * SUPERSAMPLE), Image.Resampling.BILINEAR
    )
    big = big.filter(ImageFilter.GaussianBlur(radius * SUPERSAMPLE))
    big = big.point(lambda value: 255 if value >= 128 else 0)
    return big.resize((width, height), Image.Resampling.LANCZOS)


def fill_holes(mask: Image.Image) -> Image.Image:
    padded = Image.new("L", (mask.width + 2, mask.height + 2), 0)
    padded.paste(mask, (1, 1))
    ImageDraw.floodfill(padded, (0, 0), 128)
    outside = padded.point(lambda value: 255 if value == 128 else 0)
    return ImageChops.invert(outside).crop((1, 1, mask.width + 1, mask.height + 1))


# --- Wall shadow -----------------------------------------------------------

WALL = (0, 330, 580, 1230)
"""Columns over which the shadow fades out before the left edge of the view"""
SHADOW_FADE = (392, 480)


def repair_wall_shadow(scene: np.ndarray, first: np.ndarray) -> None:
    """The first render's clean shadow, fading out towards the frame's edge."""
    x0, y0, x1, y1 = WALL
    source = first[y0:y1, x0:x1]
    target = scene[y0:y1, x0:x1]
    # Plain wall: the lit corner above the shadow, in each render's own tone
    source_wall = first[y0 : y0 + 60, 20:300].reshape(-1, 3).mean(axis=0)
    target_wall = scene[y0 : y0 + 60, 20:300].reshape(-1, 3).mean(axis=0)
    shade = source / source_wall

    columns = np.arange(x0, x1, dtype=np.float32)
    fade = np.clip(
        (columns - SHADOW_FADE[0]) / (SHADOW_FADE[1] - SHADOW_FADE[0]), 0, 1
    )
    fade = (fade * fade * (3 - 2 * fade))[None, :, None]
    repaired = target_wall * (1 + (shade - 1) * fade)

    # Only the wall: the cubicle's panel (blue) and the rug keep their pixels
    wall = source[..., 0] > 135
    mask = Image.fromarray((wall * 255).astype(np.uint8))
    mask = mask.filter(ImageFilter.MinFilter(3))
    rows = np.arange(y1 - y0, dtype=np.float32)
    edge = np.clip(np.minimum(rows, (y1 - y0 - 1) - rows) / 40, 0, 1)[:, None, None]
    alpha = soften(mask, 0, 0.8) * edge
    scene[y0:y1, x0:x1] = target * (1 - alpha) + repaired * alpha


# --- Rug -------------------------------------------------------------------

RUG_SEAM = (590, 1105, 870, 1395)


def repair_rug(scene: np.ndarray, first: np.ndarray) -> None:
    """Puts the first render's weave back where a dashed seam was drawn."""
    x0, y0, x1, y1 = RUG_SEAM
    source = first[y0:y1, x0:x1]
    target = scene[y0:y1, x0:x1]
    darker = source.sum(axis=2) - target.sum(axis=2)
    seam = Image.fromarray(((darker > 45) * 255).astype(np.uint8))
    alpha = soften(seam, 4, 2)
    scene[y0:y1, x0:x1] = target * (1 - alpha) + source * alpha


# --- Pennant ---------------------------------------------------------------

PENNANT_BOX = (1870, 955, 2050, 1360)
"""Where the pennant used to hang, before it was centered on the cabinet"""
GHOST_BOX = (1940, 870, 2135, 1330)
"""Clean wood to cover the ghost with: this far along the cabinet's side (2:1)"""
GHOST_SHIFT = (-166, 83)
"""The cabinet side's top edge (x, y, rise per pixel) and its right edge"""
SIDE_TOP = (1860, 1042, -0.5)
SIDE_RIGHT = 2117


def is_maroon(pixels: np.ndarray) -> np.ndarray:
    red, green, blue = pixels[..., 0], pixels[..., 1], pixels[..., 2]
    return (red > 60) & (red < 160) & (green < 70) & (blue < 90)


def clean_cabinet_side(third: np.ndarray) -> np.ndarray:
    """The cabinet's side with no pennant: wood from beside it over the old one."""
    x0, y0, x1, y1 = GHOST_BOX
    old = Image.fromarray((is_maroon(third[y0:y1, x0:x1]) * 255).astype(np.uint8))
    old = old.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    dx, dy = GHOST_SHIFT
    # Only on the cabinet's side, and only where the patch comes from it too
    columns, rows = np.meshgrid(np.arange(x0, x1), np.arange(y0, y1))
    edge_x, edge_y, rise = SIDE_TOP
    on_side = (
        (rows > edge_y + (columns - edge_x) * rise + 3)
        & (columns < SIDE_RIGHT)
        & (columns > 1795 - dx)
    )
    old = Image.fromarray((np.asarray(old) * on_side).astype(np.uint8))
    grown = np.asarray(old.filter(ImageFilter.MaxFilter(65))) * on_side
    alpha = soften(Image.fromarray(grown.astype(np.uint8)), 0, 2.5)
    grain = third[y0 + dy : y1 + dy, x0 + dx : x1 + dx]
    clean = third.copy()
    clean[y0:y1, x0:x1] = third[y0:y1, x0:x1] * (1 - alpha) + grain * alpha
    return clean


def redraw_pennant(scene: np.ndarray, wood: np.ndarray) -> None:
    """The pennant again in flat colors with smooth edges, over clean wood."""
    x0, y0, x1, y1 = PENNANT_BOX
    target = scene[y0:y1, x0:x1].copy()
    silhouette = Image.open(OFFICE / "mask-pennant-v2.png").split()[-1]
    inside = np.asarray(
        silhouette.crop(PENNANT_BOX).filter(ImageFilter.MaxFilter(5))
    ) > 0

    maroon = is_maroon(target) & inside
    white = (target.min(axis=2) > 185) & inside
    cloth = Image.fromarray(((maroon | white) * 255).astype(np.uint8))
    field = Image.fromarray((maroon * 255).astype(np.uint8))
    cloth_alpha = np.asarray(smooth_outline(fill_holes(cloth), 0.9)) / 255
    field_alpha = np.asarray(smooth_outline(field, 0.55)) / 255
    field_alpha = np.minimum(field_alpha, cloth_alpha)

    maroon_color = np.median(target[maroon], axis=0)
    white_color = np.median(target[white], axis=0)
    cloth_alpha = cloth_alpha[..., None]
    field_alpha = field_alpha[..., None]
    # The whole side goes back to clean wood, then the pennant on top of it
    gx0, gy0, gx1, gy1 = GHOST_BOX
    scene[gy0:gy1, gx0:gx1] = wood[gy0:gy1, gx0:gx1]
    scene[y0:y1, x0:x1] = (
        wood[y0:y1, x0:x1] * (1 - cloth_alpha)
        + white_color * (cloth_alpha - field_alpha)
        + maroon_color * field_alpha
    )


# --- Mouse sprite ----------------------------------------------------------


"""The mouse's outline on its sprite, clockwise from the back-left corner"""
MOUSE_OUTLINE = [
    (34.3, 19.5), (65, 7.2), (85.5, 14), (90.5, 16.5), (98.4, 25.6), (98, 41),
    (92, 49.5), (70, 59.5), (50, 72.8), (46.5, 72), (16.5, 60), (13.5, 54.5),
    (14, 45), (17.5, 38),
]


def rounded(points, passes=3):
    """Chaikin corner cutting: a closed polygon with its corners rounded off."""
    for _ in range(passes):
        cut = []
        for index, (ax, ay) in enumerate(points):
            bx, by = points[(index + 1) % len(points)]
            cut.append((ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25))
            cut.append((ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75))
        points = cut
    return points


def recut_mouse() -> None:
    """A solid mouse with a clean edge: no see-through side, no baked shadow."""
    sprite = from_git("public/office/mouse.png", "RGBA")
    scale = SUPERSAMPLE * 2
    big = Image.new("L", (sprite.width * scale, sprite.height * scale), 0)
    outline = [(x * scale, y * scale) for x, y in rounded(MOUSE_OUTLINE)]
    ImageDraw.Draw(big).polygon(outline, fill=255)
    body = big.resize(sprite.size, Image.Resampling.LANCZOS)
    result = sprite.convert("RGB").convert("RGBA")
    result.putalpha(body)
    result.save(OFFICE / "mouse-v2.png", optimize=True)


# --- Hover masks -----------------------------------------------------------

MUG_BODY = {"left": 1293.0, "right": 1369.5, "rim": 557.5, "base": 631.0}
MUG_RIM_RADIUS = 17.0
"""Middle of the carabiner handle's tube, from the rim down to the body"""
MUG_HANDLE = [
    (1294, 566), (1282.5, 562), (1273.8, 562.5), (1267, 566.5), (1263.8, 573.8),
    (1265.8, 592.5), (1269.5, 608.8), (1275, 617), (1283.8, 620), (1294, 616.5),
]
MUG_HANDLE_WIDTH = 5.5


def save_scene_mask(shape: Image.Image, name: str) -> None:
    """A full-scene PNG, white where the object is, for CSS and SVG masks."""
    mask = Image.new("RGBA", (WIDTH, HEIGHT), (255, 255, 255, 0))
    mask.putalpha(shape)
    mask.save(OFFICE / name, optimize=True)


def draw_outline(points, name: str, origin, size, feather=0.6) -> None:
    """Fills a rounded outline given in scene pixels and saves it as a scene mask."""
    scale = SUPERSAMPLE
    big = Image.new("L", (size[0] * scale, size[1] * scale), 0)
    ImageDraw.Draw(big).polygon(
        [((x - origin[0]) * scale, (y - origin[1]) * scale) for x, y in points],
        fill=255,
    )
    big = big.filter(ImageFilter.GaussianBlur(scale * feather))
    full = Image.new("L", (WIDTH, HEIGHT), 0)
    full.paste(big.resize(size, Image.Resampling.LANCZOS), origin)
    save_scene_mask(full, name)


"""The mints tin: its lid and the steel base under it"""
MINTS_OUTLINE = [
    (1753.7, 873.3), (1759.3, 862.7), (1766.7, 858.7), (1831.7, 843),
    (1851.7, 842.3), (1864, 850.7), (1880.7, 886), (1882, 897.3),
    (1878, 908.7), (1807.3, 929), (1791.7, 928.7), (1776.7, 921.7),
    (1757.3, 899.3), (1754.3, 885),
]


def draw_mints_mask() -> None:
    draw_outline(
        rounded(MINTS_OUTLINE, 2), "mask-mints-v2.png", (1720, 810), (190, 140)
    )


def draw_mug_mask() -> None:
    """A cylinder and its carabiner handle, drawn rather than traced."""
    scale = SUPERSAMPLE
    # Only the mug's corner of the scene is drawn, enlarged, then pasted in place
    origin = (1200, 500)
    big = Image.new("L", (240 * scale, 200 * scale), 0)
    draw = ImageDraw.Draw(big)

    def at(x, y):
        return ((x - origin[0]) * scale, (y - origin[1]) * scale)

    body = MUG_BODY
    radius = MUG_RIM_RADIUS
    draw.rectangle([at(body["left"], body["rim"]), at(body["right"], body["base"])], fill=255)
    for level in (body["rim"], body["base"]):
        draw.ellipse(
            [at(body["left"], level - radius), at(body["right"], level + radius)],
            fill=255,
        )
    # Rounded as a closed loop; the stretch that closes it lies inside the body
    points = [at(x, y) for x, y in rounded(MUG_HANDLE, 2)]
    width = int(MUG_HANDLE_WIDTH * scale)
    draw.line(points, fill=255, width=width, joint="curve")
    for x, y in points:
        draw.ellipse([x - width / 2, y - width / 2, x + width / 2, y + width / 2], fill=255)

    big = big.filter(ImageFilter.GaussianBlur(scale * 0.6))
    small = big.resize((big.width // scale, big.height // scale), Image.Resampling.LANCZOS)
    full = Image.new("L", (WIDTH, HEIGHT), 0)
    full.paste(small, origin)
    save_scene_mask(full, "mask-mug-v3.png")


# --- Build -----------------------------------------------------------------


def build(state: str) -> np.ndarray:
    scene = to_array(from_git(f"public/office/office-{state}-v4.webp"))
    first = to_array(from_git(f"public/office/office-{state}.webp"))
    third = to_array(from_git(f"public/office/office-{state}-v3.webp"))

    repair_wall_shadow(scene, first)
    repair_rug(scene, first)
    redraw_pennant(scene, clean_cabinet_side(third))

    to_image(scene).save(
        OFFICE / f"office-{state}-v5.webp", quality=95, method=6
    )
    return scene


if __name__ == "__main__":
    build("on")
    build("off")
    recut_mouse()
    draw_mints_mask()
    draw_mug_mask()
