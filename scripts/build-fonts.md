# Building `public/fonts/archivo-latin.woff2`

The display face is **Archivo Variable** (Omnibus-Type, [SIL OFL 1.1](https://openfontlicense.org/)),
trimmed on both axes and subset to latin. The checked-in `.woff2` is the build output — you only
need this if you are regenerating it.

## The order matters

`varLib.instancer` runs **first**. Subsetting alone leaves both full axis ranges in the file and
roughly doubles the result (≈90KB instead of ≈45KB). This is the single easiest way to silently
regress the font payload, so do not reorder these two steps.

```bash
pip install fonttools brotli

# source: https://github.com/google/fonts/tree/main/ofl/archivo
curl -fsSL -o Archivo.ttf \
  'https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf'

# 1. trim the axes  (wght 100–900 → 400–600, wdth 62–125 → 85–112)
python -m fontTools.varLib.instancer Archivo.ttf \
  'wght=400:600' 'wdth=85:112' \
  -o archivo-trim.ttf

# 2. subset to latin + the glyphs this store actually needs
python -m fontTools.subset archivo-trim.ttf \
  --flavor=woff2 \
  --output-file=public/fonts/archivo-latin.woff2 \
  --layout-features='kern,liga,calt,tnum' \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2212,U+2192'
```

## The unicode range is load-bearing

| Range | Why it must stay |
|---|---|
| `U+0000-00FF` | Latin-1. Contains **U+00D8 `Ø`** and U+00F8 `ø`, so the ØBJECT 29 wordmark and the Ø29 mark stay **live selectable text** and never become an SVG. Also carries `£`. |
| `U+20AC` | `€`. The storefront offers EUR as a display currency (`src/lib/CurrencyContext.jsx`). Outside Latin-1 and outside General Punctuation, so it has to be named explicitly — it was missing from the first build. |
| `U+2000-206F` | General punctuation: en/em dashes, curly quotes, the `·` separators used in variant labels. |
| `U+0131`, `U+0152-0153` | `ı`, `Œ`, `œ` — Latin Extended-A characters Google's own latin subset includes. |
| `U+2212`, `U+2192` | Minus and right arrow. |

Trimming this range to "just latin" in a later optimisation pass breaks the brand name. Don't.

## Verifying a rebuild

```bash
python -c "
from fontTools.ttLib import TTFont
f = TTFont('public/fonts/archivo-latin.woff2')
print('axes:', [(a.axisTag, a.minValue, a.maxValue) for a in f['fvar'].axes])
cmap = f.getBestCmap()
missing = [hex(c) for c in (0x00D8, 0x00F8, 0x20AC, 0x00A3) if c not in cmap]
print('missing:', missing or 'none')
"
```

Expect `wght 400–600`, `wdth 85–112`, `missing: none`, and a file of roughly 45KB. Together with
the existing `inter-latin.woff2` (48KB) the total font payload is about 92KB.

Both faces are preloaded from `index.html` and paired with metric-matched `local("Arial")` fallbacks
in `src/index.css`, so the 176px display line does not reflow when the real face swaps in.
