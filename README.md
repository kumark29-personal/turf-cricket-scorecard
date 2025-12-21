# Cricket Score - Enhanced Version

A feature-rich web application to manage a scoreboard for standard cricket matches with advanced tracking and persistence capabilities.

## Credits

Original version by [Sahil3201/cricket-score](https://github.com/Sahil3201/cricket-score)

## New Features & Enhancements

### 📊 Enhanced Score Display

#### Ball-by-Ball Breakdown
- **Complete Over History**: Displays all overs with ball-by-ball breakdown, not just the current over
- **Reverse Chronological Order**: Most recent over appears first for easy viewing
- **Circular Ball Badges**: Visual representation of each ball with runs scored
- **Special Ball Formatting**: 
  - No balls displayed as "1NB+X" (e.g., "1NB+6" for a six on no ball)
  - Wides shown as "Wd"
  - Dots shown as "0"

#### Extras Tracking
- **Per-Ball Extras Count**: Small badges on each ball circle showing extras count
  - Format: "XW,YN" (e.g., "2W,1N" = 2 wides, 1 no ball)
- **Accurate Extras Display**: Shows wides and no balls between legal balls
- **Top Section Indicators**: Real-time extras count for current over

#### Over Display Format
- **Standard Cricket Notation**: Displays overs in proper format
  - First over: 0.1, 0.2, 0.3, 0.4, 0.5, then 1.0 (not 0.6)
  - Second over: 1.1, 1.2, 1.3, 1.4, 1.5, then 2.0
- **Accurate Ball Count**: First ball now properly counted and displayed

### 💾 Match Data Persistence

#### Auto-Save & Auto-Load
- **Automatic Saving**: Match data saved to browser's localStorage on every score update
- **Auto-Restore**: Data automatically loaded when page refreshes
- **Comprehensive State**: Saves all match details including:
  - Scoreboard and ball details
  - Extras data (wides and no balls)
  - Current over and ball position
  - Target mode settings
  - Edit history

#### Data Management
- **Refresh Icon**: 🔄 icon in top-right corner for controlled match reset
- **Refresh Modal**: Two options when clicking refresh icon:
  - "Continue Current Match" - keeps all data
  - "Start Fresh Match" - clears everything
- **Bottom Reset Button**: Full-width "🔄 Start Fresh Match" button at page bottom
- **No Accidental Loss**: Page refresh no longer clears your match data

### ↩️ Enhanced Undo Functionality

#### Complete Undo Support
- **Undo Wides**: Can now undo wide balls
- **Undo No Balls**: Can now undo no balls with runs
- **Undo Legal Balls**: Continues to support undoing regular balls
- **Delivery History**: Tracks all deliveries for accurate undo
- **Updated Modal**: Clear message indicating all delivery types can be undone

### 📈 Scoreboard Enhancements

#### Total Score Display
- **Over-wise Totals**: Each over shows total runs scored
- **Grand Total**: Overall score displayed at bottom of scoreboard
- **Live Updates**: Scoreboard updates when scores are changed via modal

#### Score Editing
- **Change Score Feature**: Edit any ball's score via scoreboard modal
- **Statistics Sync**: Changes reflected in "Over Breakdown" section
- **Edit History**: Tracks all score modifications

### 🎯 UI/UX Improvements

#### Button Layout
- **Optimized Spacing**: 
  - Scoreboard: 40% width
  - Target Mode: 20% width (icon-only 🎯)
  - Undo: 40% width
- **Target Mode Icon**: Space-saving icon button with mild color
- **Hidden Share Button**: "Share Match Code" button hidden by default

#### Section Improvements
- **Renamed Section**: "Match Statistics" → "Over Breakdown"
- **Cleaner Header**: Removed redundant inner heading
- **Milder Colors**: Header background changed to lighter blue (#5b9bd5)
- **Better Organization**: Clear visual hierarchy

### 🐛 Bug Fixes

#### Ball Count Display
- **Fixed Duplicate Increment**: Ball count now increments by 1 (not 2)
- **Fixed First Ball**: First ball now properly counted and displayed
- **Fixed Refresh Bug**: No extra ball count added after page refresh
- **Correct Over Display**: Shows completed overs as X.0 instead of (X-1).6

## Usage

1. Open `index.html` in a web browser
2. Click buttons to record runs, dots, wides, no balls, and wickets
3. View detailed breakdown in "Over Breakdown" section
4. Click "Scoreboard" to see over-wise totals
5. Use "Undo" to remove last delivery (including extras)
6. Click refresh icon or "Start Fresh Match" to reset

## Features Summary

✅ Ball-by-ball breakdown with circular badges  
✅ Extras tracking per ball position  
✅ Auto-save to localStorage  
✅ Undo support for all delivery types  
✅ Over-wise totals in scoreboard  
✅ Standard cricket over notation (X.0 format)  
✅ Score editing with live updates  
✅ Refresh modal for controlled reset  
✅ Enhanced UI with optimized layout  
✅ No data loss on page refresh  

## Technical Details

- **Frontend**: HTML, CSS, JavaScript, jQuery, Bootstrap
- **Storage**: Browser localStorage for persistence
- **Real-time Updates**: All displays sync automatically
- **Delivery Tracking**: Comprehensive history for undo functionality

## Browser Compatibility

Works in all modern browsers with localStorage support.