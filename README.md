# Cricket Score - Enhanced Version

A feature-rich web application to manage a scoreboard for standard cricket matches with advanced tracking and persistence capabilities.

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
  - "Start Fresh Match" - clears everything and saves current match to history
- **Bottom Buttons**: Two buttons at page bottom (50/50 layout)
  - "🔄 Start Fresh Match" - saves current match and starts new one
  - "📋 Past Scorecard" - view saved match history
- **No Accidental Loss**: Page refresh no longer clears your match data

### 📋 Match History

#### Automatic Match Saving
- **Auto-Save on Fresh Start**: Current match automatically saved when starting a new match
- **Sequential Naming**: Matches named as "Match 1", "Match 2", etc.
- **Smart Saving**: Only saves matches with actual data (won't save empty matches)
- **Separate Storage**: Uses `cricketMatchHistory` localStorage key (doesn't affect current match)

#### Past Scorecard Viewer
- **Match List Modal**: Click "📋 Past Scorecard" to view all saved matches
- **Match Summaries**: Each match shows:
  - Match name (Match 1, Match 2, etc.)
  - Final score (e.g., "66/0")
  - Total overs (e.g., "4.1 overs")
  - Date and time played
- **Newest First**: Matches sorted with most recent at top
- **Empty State**: Helpful message when no matches saved yet

#### Match Details View
- **Full Scoreboard**: Click any match to view complete details
- **Match Summary**: Final score, total overs, balls, and timestamp
- **Over-by-Over Breakdown**: Complete scoreboard table with cumulative totals
- **Ball-by-Ball Visualization**: Same styled ball circles as current match
  - Color-coded: Blue (runs), Gray (dot), Yellow (wide), Red (no ball), Black (wicket)
- **Easy Navigation**: "← Back to List" button to return to match list

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
- **Top Row Spacing**: 
  - Scoreboard: 40% width
  - Target Mode: 20% width (icon-only 🎯)
  - Undo: 40% width
- **Bottom Row**: 50/50 split for "Start Fresh Match" and "Past Scorecard"
- **Target Mode Icon**: Space-saving icon button with mild color
- **Hidden Share Button**: "Share Match Code" button hidden by default

#### Section Improvements
- **Renamed Section**: "Match Statistics" → "Over Breakdown"
- **Cleaner Header**: Removed redundant inner heading
- **Milder Colors**: Header background changed to lighter blue (#5b9bd5)
- **Better Organization**: Clear visual hierarchy

### 🏏 Max Overs Feature

#### Setting Max Overs
- **Quick Access Button**: "🏏 Max Overs" button on home screen for easy access
- **Set Max Overs Button**: Appears above dot ball when max overs not set (first innings only)
- **Simple Input**: Enter maximum overs for the innings
- **Data Persistence**: Max overs setting saved across page refreshes

#### Max Overs Display
- **Top Row Display**: Shows "Max Overs: X" in compact top row when set
- **Auto-Hide**: Only visible during first innings
- **Clean Layout**: Minimal space usage with refresh icon on the right

#### Over Completion
- **Automatic Detection**: Checks after each ball if max overs reached
- **Over Completed Message**: Displays in target board area when overs complete
- **Start Second Innings**: One-click button to transition to second innings
- **Auto-Calculate Target**: Automatically sets target runs (first innings score + 1)

#### Second Innings Integration
- **Seamless Transition**: Saves first innings to history automatically
- **Target Mode Activation**: Second innings starts with target mode enabled
- **Hidden Controls**: Max overs button hidden during second innings

### 🐛 Bug Fixes

#### Ball Count Display
- **Fixed Duplicate Increment**: Ball count now increments by 1 (not 2)
- **Fixed First Ball**: First ball now properly counted and displayed
- **Fixed Refresh Bug**: No extra ball count added after page refresh
- **Correct Over Display**: Shows completed overs as X.0 instead of (X-1).6

## Usage

1. Open `index.html` in a web browser
2. Click buttons to record runs, dots, wides, no balls, and wickets
3. Set max overs using "🏏 Max Overs" button for limited overs matches
4. View detailed breakdown in "Over Breakdown" section
5. Click "Scoreboard" to see over-wise totals
6. Use "Undo" to remove last delivery (including extras)
7. Click "Start Fresh Match" to save current match and start new one
8. Click "Past Scorecard" to view saved match history
9. Click any saved match to view full details

## Features Summary

✅ Ball-by-ball breakdown with circular badges  
✅ Extras tracking per ball position  
✅ Auto-save to localStorage  
✅ Max overs feature with automatic over completion detection  
✅ Seamless first and second innings transition  
✅ Match history with automatic saving  
✅ Past scorecard viewer with full details  
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


## Credits
Developed and enhanced from this project -> [Sahil3201/cricket-score](https://github.com/Sahil3201/cricket-score)