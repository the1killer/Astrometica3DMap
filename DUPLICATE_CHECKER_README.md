# AstroMetricaMap Duplicate Checker

A Node.js script to analyze your AstroMetricaMap data and identify potential duplicate locations and deposits based on proximity.

## Features

- ✅ Analyzes all zones for duplicate locations and deposits
- ✅ Checks for cross-zone duplicates
- ✅ Configurable proximity threshold
- ✅ Detailed console output with coordinates
- ✅ Generates JSON report file
- ✅ Color-coded console output with emojis

## Installation

No additional dependencies required! The script uses only Node.js built-in modules.

## Usage

### Basic Usage

```bash
node duplicate-checker.js
```

### With Custom Threshold

```bash
node duplicate-checker.js --threshold 5000
```

### Using NPM Scripts

```bash
# Default threshold (10,000 units)
npm run check-duplicates

# Strict checking (5,000 units)
npm run check-duplicates-strict

# Loose checking (20,000 units)
npm run check-duplicates-loose
```

### Help

```bash
node duplicate-checker.js --help
```

## Configuration

- **Default proximity threshold**: 10,000 units
- **Data file**: `data.json` (must be in the same directory)
- **Output**: Console + `duplicate-report.json`

## Output

The script provides:

1. **Console Output**: 
   - Zone-by-zone analysis
   - Cross-zone duplicate detection
   - Distance calculations
   - Object coordinates and identifiers

2. **JSON Report**: 
   - Detailed duplicate information
   - Timestamp
   - Configuration used
   - Machine-readable format

## Understanding Results

### Distance Thresholds
- **< 1,000 units**: Very likely duplicates, review immediately
- **1,000 - 5,000 units**: Possible duplicates, check if intentional
- **5,000 - 10,000 units**: Close objects, may be related locations
- **> 10,000 units**: Probably not duplicates (default threshold)

### Object Types Analyzed
- **Locations**: All zone locations (Pods, Domes, Habitats, etc.)
- **Deposits**: All resource deposits (Iron, Copper, Gold, etc.)

## Example Output

```
🔍 AstroMetricaMap Duplicate Checker
=====================================
📏 Proximity threshold: 10000 units

🌌 Analyzing Zone: Theta-9 Asteroid Field (ID: 0)
──────────────────────────────────────────────────
⚠️  Found 3 potential duplicate(s):
  1. Distance: 3955 units
     • Theta-9 Asteroid Field - Matthew Pod (T9L07) [Pod]
       📍 (-292641, -107791, 42949)
     • Theta-9 Asteroid Field - Theta-9 Station (T9L08) [Habitat]
       📍 (-292933, -111186, 44956)
```

## Current Findings

Based on your data, the script found:

### Within Zones
1. **Matthew Pod & Theta-9 Station** (3,955 units apart) - Very close, possibly intentionally placed near each other
2. **Hook Tool Dome & Hook Tool Cargo Dome** (7,553 units apart) - Related locations, likely intentional
3. **Two Iron Deposits** (8,780 units apart) - Close resource deposits

### Cross-Zone
1. **Escape Pod & Yunadel Emergency Pod** (2,311 units apart) - **Potential duplicate**
2. **Iron Deposit & Pyrolite Dome 4** (6,613 units apart) - Different types, likely not a duplicate
3. **Copper Deposit & Theta-145 Gate** (6,784 units apart) - Different types, likely not a duplicate

## Recommendations

1. **Immediate Review**: Escape Pod (T9L01) and Yunadel Emergency Pod (T12L17) are very close (2,311 units)
2. **Check Intent**: Matthew Pod and Theta-9 Station proximity (3,955 units)
3. **Verify Coordinates**: All flagged objects should have their coordinates verified
4. **Consider Consolidation**: True duplicates should be merged or one should be removed

## Troubleshooting

- **File not found**: Ensure `data.json` is in the same directory as the script
- **Parse errors**: Check that `data.json` is valid JSON
- **No Node.js**: Install Node.js version 12 or higher

## Customization

You can modify the script to:
- Change the default proximity threshold
- Add different analysis criteria
- Modify output format
- Add additional object properties to compare
