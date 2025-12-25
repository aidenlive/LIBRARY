#!/usr/bin/env python3
"""
Batch font converter - converts TTF/OTF to WOFF2 and WOFF formats
"""

import os
import sys
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
import time
import json

# Try to import fonttools
try:
    from fontTools.ttLib import TTFont
    from fontTools.ttLib.woff2 import compress
except ImportError:
    print("Error: fonttools not installed. Run: pip3 install fonttools brotli")
    sys.exit(1)

# Directories
PROJECT_DIR = Path(__file__).parent.parent
TYPEFACES_DIR = PROJECT_DIR / 'typefaces'
WEB_DIR = PROJECT_DIR / 'typefaces-web'

def convert_font(args):
    """Convert a single font file to WOFF2 and WOFF formats."""
    font_path, output_dir = args
    results = {'source': str(font_path), 'woff2': False, 'woff': False, 'errors': []}

    try:
        basename = font_path.stem
        woff2_path = output_dir / f"{basename}.woff2"
        woff_path = output_dir / f"{basename}.woff"

        # Convert to WOFF2
        try:
            compress(str(font_path), str(woff2_path))
            results['woff2'] = True
        except Exception as e:
            results['errors'].append(f"WOFF2: {str(e)[:50]}")

        # Convert to WOFF
        try:
            font = TTFont(str(font_path))
            font.flavor = 'woff'
            font.save(str(woff_path))
            results['woff'] = True
        except Exception as e:
            results['errors'].append(f"WOFF: {str(e)[:50]}")

    except Exception as e:
        results['errors'].append(str(e)[:100])

    return results

def main():
    print("=" * 60)
    print("  Font Web Format Conversion")
    print("=" * 60)
    print()

    # Collect all font files
    print("Scanning fonts...")
    font_jobs = []
    families = sorted([d for d in TYPEFACES_DIR.iterdir() if d.is_dir()])

    for family_dir in families:
        output_dir = WEB_DIR / family_dir.name
        output_dir.mkdir(parents=True, exist_ok=True)

        for ext in ['*.ttf', '*.otf']:
            for font_file in family_dir.glob(ext):
                # Check if already converted
                woff2_path = output_dir / f"{font_file.stem}.woff2"
                woff_path = output_dir / f"{font_file.stem}.woff"

                if not woff2_path.exists() or not woff_path.exists():
                    font_jobs.append((font_file, output_dir))

    if not font_jobs:
        print("All fonts already converted!")
        return

    print(f"Found {len(font_jobs)} fonts to convert")
    print(f"Families: {len(families)}")
    print()

    # Progress tracking
    start_time = time.time()
    converted_woff2 = 0
    converted_woff = 0
    failed = 0

    # Sequential processing (more stable)
    print("Converting fonts...")
    for i, args in enumerate(font_jobs, 1):
        font_path = args[0]
        family = font_path.parent.name

        result = convert_font(args)

        if result['woff2']:
            converted_woff2 += 1
        if result['woff']:
            converted_woff += 1
        if result['errors']:
            failed += 1

        # Progress update every 50 fonts
        if i % 50 == 0 or i == len(font_jobs):
            elapsed = time.time() - start_time
            rate = i / elapsed if elapsed > 0 else 0
            remaining = (len(font_jobs) - i) / rate if rate > 0 else 0
            print(f"  Progress: {i}/{len(font_jobs)} ({i*100/len(font_jobs):.1f}%) - {rate:.1f}/s - ETA: {remaining:.0f}s")

    # Summary
    elapsed = time.time() - start_time
    print()
    print("=" * 60)
    print("  Conversion Complete!")
    print("=" * 60)
    print()
    print(f"  Time:           {elapsed:.1f} seconds")
    print(f"  WOFF2 Created:  {converted_woff2}")
    print(f"  WOFF Created:   {converted_woff}")
    print(f"  Failed:         {failed}")
    print()

    # Calculate sizes
    if WEB_DIR.exists():
        total_size = sum(f.stat().st_size for f in WEB_DIR.rglob('*') if f.is_file())
        print(f"  Web fonts size: {total_size / 1024 / 1024:.1f} MB")

if __name__ == '__main__':
    main()
