"""kmukawa-website の画像を in-place 圧縮 (Netlify bandwidth 削減用)。

- 対象: images/, assets/img/ 配下の > 600KB のファイル
- 動作: long edge 1920px 上限 / JPEG quality 85 / 既存ファイル名・拡張子そのまま
- 透過 PNG は WebP 化せず PNG のままで pngquant 風の減色は行わない (見た目維持優先)
- 透過なし PNG は JPEG に変換 (画素はそのまま視覚上同等) — ただし参照を書き換えないため
  原則 PNG のまま (Pillow `optimize=True` で再エンコードのみ)
- HEIC ファイル: 同名 JPG がある場合は削除のみ (orphans script で先に処理済)

実行:
    python scripts/compress_images.py            # 全対象を圧縮 (上書き)
    python scripts/compress_images.py --dry-run  # 効果だけ確認
"""
from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

from PIL import Image, ImageOps

REPO_ROOT = Path(__file__).resolve().parent.parent
TARGET_DIRS = [REPO_ROOT / "images", REPO_ROOT / "assets" / "img"]
MIN_SIZE_BYTES = 600 * 1024          # < 600KB は対象外
MAX_LONG_EDGE = 1920                 # 長辺上限
JPEG_QUALITY = 85
PNG_OPTIMIZE = True


def _is_target(path: Path) -> bool:
    if not path.is_file():
        return False
    if path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
        return False
    return path.stat().st_size >= MIN_SIZE_BYTES


def _resize_if_needed(img: Image.Image) -> tuple[Image.Image, bool]:
    """長辺が MAX_LONG_EDGE を超えていれば縮小。 (img, resized) を返す。"""
    w, h = img.size
    long_edge = max(w, h)
    if long_edge <= MAX_LONG_EDGE:
        return img, False
    scale = MAX_LONG_EDGE / long_edge
    new_size = (int(w * scale), int(h * scale))
    return img.resize(new_size, Image.LANCZOS), True


def _compress(path: Path, *, dry_run: bool) -> tuple[int, int, str]:
    """1ファイルを処理。 (before_size, after_size, note) を返す。"""
    before = path.stat().st_size
    try:
        with Image.open(path) as raw:
            # EXIF 回転を解決して RGB に正規化 (Web 表示と同じ向きで保存)
            img = ImageOps.exif_transpose(raw)
            ext = path.suffix.lower()

            # 透過判定 — RGBA / LA / P+transparency なら透過あり
            has_alpha = (
                img.mode in ("RGBA", "LA")
                or (img.mode == "P" and "transparency" in img.info)
            )

            img, resized = _resize_if_needed(img)

            buf = io.BytesIO()
            if ext in (".jpg", ".jpeg"):
                rgb = img.convert("RGB")
                rgb.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
            elif ext == ".png":
                if has_alpha:
                    img.save(buf, format="PNG", optimize=PNG_OPTIMIZE)
                else:
                    # 透過無し PNG はサイズ削減効果が大きいので JPEG として再保存
                    # ※ 拡張子は維持 (.png のまま中身 JPEG はブラウザによっては表示崩れする
                    #     ため、必ず PNG として保存し直す)
                    img.convert("RGB").save(buf, format="PNG", optimize=PNG_OPTIMIZE)
            elif ext == ".webp":
                img.save(buf, format="WEBP", quality=JPEG_QUALITY, method=6)
            else:
                return before, before, f"skip (unsupported {ext})"

            data = buf.getvalue()
    except Exception as e:
        return before, before, f"error: {e}"

    after = len(data)
    if after >= before:
        return before, before, "skip (no gain)"

    note = "resize+recompress" if resized else "recompress"
    if not dry_run:
        path.write_bytes(data)
    return before, after, note


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true", help="保存せず効果のみ表示")
    args = p.parse_args(argv)

    total_before = 0
    total_after = 0
    rows: list[tuple[str, int, int, str]] = []
    for d in TARGET_DIRS:
        if not d.exists():
            continue
        for path in sorted(d.rglob("*")):
            if not _is_target(path):
                continue
            before, after, note = _compress(path, dry_run=args.dry_run)
            total_before += before
            total_after += after
            rows.append((str(path.relative_to(REPO_ROOT)), before, after, note))

    rows.sort(key=lambda r: r[1] - r[2], reverse=True)
    print(f"{'before':>9}  {'after':>9}  {'save':>9}  {'note':<20}  file")
    for rel, before, after, note in rows:
        save = before - after
        print(f"{before/1024:>8.0f}K  {after/1024:>8.0f}K  {save/1024:>8.0f}K  {note:<20}  {rel}")
    print("-" * 80)
    print(
        f"TOTAL: {total_before/1024/1024:.1f}MB → {total_after/1024/1024:.1f}MB "
        f"(削減 {(total_before-total_after)/1024/1024:.1f}MB)"
    )
    if args.dry_run:
        print("(dry-run: ファイル未変更)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
