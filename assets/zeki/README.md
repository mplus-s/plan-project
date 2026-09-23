# Zeki brand assets

Downloaded from <https://zekiexperts.com/> on **2026-09-23**. Usage rules,
colours and type live in [`../../references/brand-zeki.md`](../../references/brand-zeki.md).

| File | Source | Notes |
| --- | --- | --- |
| `zeki-wordmark.svg` | `/wp-content/uploads/2024/12/Zeki-Experts-Logo-03-1.svg` | Byte-for-byte as served. 291×81; a vector wrapper around a 1667×834 PNG |
| `zeki-wordmark.png` | extracted from that SVG | Trimmed to content, resampled to 1200×276 |
| `zeki-wordmark-white.png` | derived | Alpha of the lockup filled white, for dark surfaces |
| `zeki-mark.png` | `/wp-content/uploads/2024/12/zekilogo-new-1-e1680198668733.png` | The site favicon; trimmed to 103×118 |
| `zeki-mark-white.png` | derived | Knockout version of the mark |

Regenerating the derived files:

```python
from PIL import Image
def trim(im): return im.crop(im.getchannel("A").getbbox())
def knockout(im, rgb=(255, 255, 255)):
    k = Image.new("RGBA", im.size, rgb + (0,)); k.putalpha(im.getchannel("A")); return k
```

If the company rebrands, replace these files **and** re-read the Elementor kit
CSS (`/wp-content/uploads/elementor/css/post-8.css`, which holds
`--e-global-color-*` and `--e-global-typography-*`) before editing the hex
values in `brand-zeki.md`. Don't update one without the other.
