#!/bin/bash

###############################################################################
# Font Web Format Conversion Script
# Converts TTF/OTF fonts to WOFF2 and WOFF formats
#
# Requirements:
#   - Python 3.x
#   - fonttools (pip install fonttools)
#   - brotli (pip install brotli)
#
# Usage:
#   ./scripts/convert-to-web-formats.sh [options]
#
# Options:
#   --sample       Convert only 5 sample families for testing
#   --family NAME  Convert only specified family
#   --dry-run      Show what would be converted without converting
#   --force        Overwrite existing web fonts
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TYPEFACES_DIR="$PROJECT_DIR/typefaces"
WEB_DIR="$PROJECT_DIR/typefaces-web"
LOG_FILE="$PROJECT_DIR/data/conversion-log.json"

# Parse arguments
DRY_RUN=false
SAMPLE_MODE=false
FORCE=false
TARGET_FAMILY=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --sample)
      SAMPLE_MODE=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --family)
      TARGET_FAMILY="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

###############################################################################
# Check Dependencies
###############################################################################

echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Font Web Format Conversion${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

check_dependencies() {
  echo -e "${GRAY}Checking dependencies...${NC}"

  # Check Python
  if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Python 3: $(python3 --version | cut -d' ' -f2)${NC}"

  # Check fonttools
  if ! python3 -c "import fontTools" 2>/dev/null; then
    echo -e "${RED}✗ fonttools not installed${NC}"
    echo -e "${YELLOW}  Install with: pip3 install --user fonttools brotli${NC}"
    echo -e "${GRAY}  Or use alternative method in scripts/README.md${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ fonttools installed${NC}"

  # Check brotli
  if ! python3 -c "import brotli" 2>/dev/null; then
    echo -e "${YELLOW}⚠ brotli not installed (WOFF2 compression will be slower)${NC}"
    echo -e "${GRAY}  Install with: pip3 install --user brotli${NC}"
  else
    echo -e "${GREEN}✓ brotli installed${NC}"
  fi

  echo
}

###############################################################################
# Conversion Functions
###############################################################################

convert_to_woff2() {
  local input_file="$1"
  local output_file="$2"

  if [[ "$DRY_RUN" == true ]]; then
    echo -e "  ${GRAY}Would convert: $(basename "$input_file") → $(basename "$output_file")${NC}"
    return 0
  fi

  # Use fonttools to convert to WOFF2
  python3 -m fontTools.ttLib.woff2 compress -o "$output_file" "$input_file" 2>/dev/null

  if [[ $? -eq 0 ]]; then
    return 0
  else
    return 1
  fi
}

convert_to_woff() {
  local input_file="$1"
  local output_file="$2"

  if [[ "$DRY_RUN" == true ]]; then
    echo -e "  ${GRAY}Would convert: $(basename "$input_file") → $(basename "$output_file")${NC}"
    return 0
  fi

  # Use fonttools to convert to WOFF
  python3 << EOF
from fontTools.ttLib import TTFont
font = TTFont("$input_file")
font.flavor = 'woff'
font.save("$output_file")
EOF

  if [[ $? -eq 0 ]]; then
    return 0
  else
    return 1
  fi
}

get_file_size_mb() {
  local file="$1"
  if [[ -f "$file" ]]; then
    local size_bytes=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    echo "scale=2; $size_bytes / 1024 / 1024" | bc
  else
    echo "0"
  fi
}

###############################################################################
# Main Conversion Loop
###############################################################################

main() {
  # Check dependencies first
  if [[ "$DRY_RUN" == false ]]; then
    check_dependencies
  fi

  # Create output directory
  if [[ "$DRY_RUN" == false ]]; then
    mkdir -p "$WEB_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
  fi

  # Initialize counters
  local total_families=0
  local total_files=0
  local converted_woff2=0
  local converted_woff=0
  local failed=0
  local skipped=0

  # Initialize log
  local log_entries="[]"

  # Get list of families
  if [[ -n "$TARGET_FAMILY" ]]; then
    families=("$TYPEFACES_DIR/$TARGET_FAMILY")
  elif [[ "$SAMPLE_MODE" == true ]]; then
    mapfile -t families < <(find "$TYPEFACES_DIR" -maxdepth 1 -type d | tail -n +2 | head -5)
  else
    mapfile -t families < <(find "$TYPEFACES_DIR" -maxdepth 1 -type d | tail -n +2)
  fi

  total_families=${#families[@]}

  echo -e "${YELLOW}Converting ${total_families} font families...${NC}"
  echo

  # Process each family
  for family_dir in "${families[@]}"; do
    family_name=$(basename "$family_dir")

    echo -e "${CYAN}$family_name${NC}"

    # Create web output directory for this family
    if [[ "$DRY_RUN" == false ]]; then
      mkdir -p "$WEB_DIR/$family_name"
    fi

    # Find all font files
    local font_files=()
    while IFS= read -r -d '' file; do
      font_files+=("$file")
    done < <(find "$family_dir" -maxdepth 1 \( -name "*.ttf" -o -name "*.otf" \) -print0)

    # Convert each font file
    for font_file in "${font_files[@]}"; do
      filename=$(basename "$font_file")
      basename_no_ext="${filename%.*}"

      # Output paths
      woff2_output="$WEB_DIR/$family_name/$basename_no_ext.woff2"
      woff_output="$WEB_DIR/$family_name/$basename_no_ext.woff"

      # Check if already exists
      if [[ -f "$woff2_output" ]] && [[ -f "$woff_output" ]] && [[ "$FORCE" == false ]]; then
        echo -e "  ${GRAY}⊘ $filename (already converted)${NC}"
        ((skipped++))
        continue
      fi

      # Convert to WOFF2
      if convert_to_woff2 "$font_file" "$woff2_output"; then
        if [[ "$DRY_RUN" == false ]]; then
          ((converted_woff2++))
          echo -e "  ${GREEN}✓ $filename → ${basename_no_ext}.woff2${NC}"
        fi
      else
        echo -e "  ${RED}✗ Failed: $filename → WOFF2${NC}"
        ((failed++))
      fi

      # Convert to WOFF
      if convert_to_woff "$font_file" "$woff_output"; then
        if [[ "$DRY_RUN" == false ]]; then
          ((converted_woff++))
        fi
      else
        echo -e "  ${RED}✗ Failed: $filename → WOFF${NC}"
        ((failed++))
      fi

      ((total_files++))
    done

    echo
  done

  # Summary
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  Conversion Summary${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo
  echo -e "  Families Processed:   ${BOLD}$total_families${NC}"
  echo -e "  Total Font Files:     ${BOLD}$total_files${NC}"
  echo -e "  ${GREEN}WOFF2 Created:        $converted_woff2${NC}"
  echo -e "  ${GREEN}WOFF Created:         $converted_woff${NC}"
  echo -e "  ${GRAY}Skipped (existing):   $skipped${NC}"
  echo -e "  ${RED}Failed:               $failed${NC}"

  if [[ "$DRY_RUN" == false ]]; then
    # Calculate total sizes
    local original_size=$(du -sh "$TYPEFACES_DIR" | cut -f1)
    local web_size=$(du -sh "$WEB_DIR" | cut -f1 2>/dev/null || echo "0")
    echo
    echo -e "  Original Size:        ${BOLD}$original_size${NC}"
    echo -e "  Web Fonts Size:       ${BOLD}$web_size${NC}"
  fi

  echo

  if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}⚠ This was a dry run. No files were converted.${NC}"
    echo -e "${GRAY}Run without --dry-run to perform conversion.${NC}"
  else
    echo -e "${GREEN}✓ Conversion complete!${NC}"
    echo -e "${GRAY}Web fonts saved to: $WEB_DIR${NC}"
  fi
  echo
}

###############################################################################
# Execute
###############################################################################

main
