# Cricket Score - Enhanced Version

A feature-rich web application to manage a scoreboard for standard cricket matches with advanced tracking and persistence capabilities.

## 🌐 Live Demo

**Try it now:** [https://cricketscore.in.net/](https://cricketscore.in.net/)

Experience the full-featured cricket scorecard app online - no installation required!

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

### 🏏 Team Names Feature

#### Team Name Input
- **Optional Fields**: Add batting and bowling team names when setting max overs
- **Always Accessible**: Can add or edit team names anytime during the match
- **Top Left Display**: Shows first 2 characters of batting team (e.g., "MI" for Mumbai Indians)
- **Click to Edit**: Click team name box to view/edit full team names
- **Placeholder Display**: Shows "--" when no team name is set

#### Second Innings Integration
- **Auto-Swap**: Team names automatically swap when starting second innings
- **Persistent**: Team names saved and loaded correctly across page refreshes
- **Pre-filled**: Team names from first innings auto-populate in second innings setup

#### Display Locations
- **Top Row**: Team name box in top left corner (always visible, clickable)
- **Match History Modal**: Team names shown below match number and next to innings labels
  - Header: "Match 9" with "SS vs KK" below
  - Innings: "1ST INNINGS (SS)" and "2ND INNINGS (KK) Winner"
- **Match History Page**: Team names displayed in card headers and innings labels
- **PDF Reports**: Team names in header and next to innings labels

#### UI Refinements
- **Centered Displays**: Max overs and target displays centered for better layout
- **Clickable Max Overs**: Click max overs display to edit it along with team names
- **Bordered Box**: Team name box has border and background for visibility
- **White Text**: Team names in modal headers use white color for readability

### 💾 Save & Exit Feature

#### Match Completion Options
- **Two-Button Choice**: When a match ends, users get two options:
  - **Save & Exit**: Saves the match to history and returns to empty scorecard
  - **Start New Match**: Saves the match and immediately starts a fresh match
- **Available For All Outcomes**: Both buttons appear for:
  - Match won (batting team wins)
  - Match lost (batting team loses)
  - Match tied (scores are equal)
  - Over completed (first innings done, ready for second innings)

#### Smart Innings Detection
- **Automatic Context Detection**: System automatically determines innings type:
  - Max overs completed → Saves as "1st Innings"
  - Target mode active → Saves as "2nd Innings"
  - Normal match → Saves as "Single Innings"
- **Proper Match Linking**: First and second innings are correctly linked in match history

#### User Benefits
- **No Forced Actions**: Users can save and exit without being forced to start a new match
- **Clear Intent**: Separate buttons make user's intention clear
- **Data Safety**: Match is always saved before exiting or starting new match

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

### 🎯 Target Mode Enhancements

#### Target Display
- **Top Row Display**: Target information shown in top row ("Require X runs in Y balls")
- **Clean Interface**: Removed duplicate target display below score
- **Auto-Hide on Completion**: Target display automatically hidden when match ends
- **Match Result Messages**: Win/loss/tie messages displayed in blue box when match completes

#### Second Innings Management
- **Start Second Innings**: Click Target button → "Start Second Innings" option
- **Auto-Calculate**: Target runs and overs pre-filled from first innings
- **First Innings Save**: Automatically saves first innings to match history
- **Sequential Match Numbering**: Persistent counter ensures correct match numbers even after deletions

### 🏏 Wicket Options Feature

#### Wicket + Run Capability
- **Modal Popup**: Clicking wicket button shows two options:
  - **Wicket + No Run**: Traditional wicket (current behavior)
  - **Wicket + Run**: Record wicket with runs scored on same ball
- **Smart Display**: Wicket+run balls show:
  - "W" inside the ball circle
  - "+X" badge above (e.g., "+2", "+6") similar to wides/no balls
- **Accurate Tracking**: Both wicket and runs counted correctly in:
  - Top scorecard
  - Over breakdown (black circle with runs badge)
  - Change score popup
  - Ball-wise display

#### Undo Support
- **Complete Undo**: Both wicket types can be undone
- **State Restoration**: Correctly reverts wickets, runs, and ball state
- **Pending Wicket Undo**: Can undo if user cancels before selecting runs

### 📊 Match History Improvements

#### Match History Page Enhancements
- **Sleeker Design**: Reduced header padding and refined button styling
- **Delete All Matches**: New button to clear entire match history
  - Double confirmation to prevent accidental deletion
  - Resets match counter to 0
- **Proper Sorting**: Matches always sorted by timestamp (newest first)
- **Correct Display**: Modal shows 2 most recent matches, sorted correctly

#### Match Numbering Fix
- **Persistent Counter**: Uses localStorage counter that always increments
- **No Backwards Numbering**: Match numbers never decrease after deletions
- **Sequential Integrity**: Match 1, 2, 3... continues even if some deleted

### 🐛 Bug Fixes

#### Wicket + Run Fixes
- **Bug 1 Fixed**: Wicket count now correctly updated in top scorecard for wicket+run
- **Bug 2 Fixed**: Wicket+run balls show black circle in over breakdown
- **Bug 3 Fixed**: Wicket+run displayed correctly in change score popup

#### Target Display Fixes
- **Duplicate Display Removed**: Target only shows in top row, not in blue box below
- **Match Result Messages**: Win/loss/tie messages now display correctly
- **Over Completed Message**: "Start Second Innings" message displays properly

#### Match History Fixes
- **Modal Display**: Fixed missing matches in history modal (now shows 2 most recent)
- **Sorting Issue**: Matches sorted by timestamp before displaying
- **Match Numbering**: Fixed backwards numbering after deletions

#### Ball Count Display
- **Fixed Duplicate Increment**: Ball count now increments by 1 (not 2)
- **Fixed First Ball**: First ball now properly counted and displayed
- **Fixed Refresh Bug**: No extra ball count added after page refresh
- **Correct Over Display**: Shows completed overs as X.0 instead of (X-1).6

### 🆕 Recent Updates (December 2023)

#### Wicket+Wide Feature
- **Complete Implementation**: Wicket on wide delivery now fully supported
  - Wicket count increments correctly in scorecard
  - Wide run added to total
  - Ball count doesn't increment (extras are not legal deliveries)
- **Visual Display**: "Wd+W" shown in over breakdown with black circle
- **Individual Badges**: Each extra shows above respective ball circle
  - "Wd+W" for wicket on wide (black background)
  - "Wd" for regular wide (red background)
  - "NB" for no ball (red background)
  - Combined badges like "Wd+W,NB" when multiple extras on same ball
- **Consolidated Extras**: Format like "(2Wd+2W+1NB)" showing total wides + wicket count + no balls
- **Button State Management**: No Ball button disabled during wicket+run mode, re-enabled after selection

#### Match History Scoreboard Enhancements
- **Ball-by-Ball Breakdown**: Visual representation with colored circles
  - Blue: Regular runs (1-6)
  - Gray: Dot balls
  - Yellow: Wides
  - Red: No balls
  - Black: Wickets (including Wd+W, wicket+run)
- **Per-Over Totals**: Each over shows individual run total (not cumulative)
- **Grand Total Row**: Highlighted row at bottom showing total runs
- **Removed Redundancy**: Eliminated duplicate "Over Breakdown" section
- **PDF Export Updated**: PDF format matches modal display
- **Total Balls Calculation**: Accurately counts legal deliveries only

#### Bug Fixes
- **Wicket+Wide Counting**: Fixed wicket count for wicket on wide deliveries
- **Empty Over Display**: Fixed issue where empty overs showed in scoreboard
- **Over Total Calculation**: Corrected cumulative total calculations
- **Badge Display**: Fixed multiple wicket+wide badges overlapping
- **Extras Display Format**: Corrected to show "(XWd+YW+ZNB)" format

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
✅ **Wicket + Run option** for recording wickets with runs on same ball  
✅ **Smart wicket display** with W in circle and runs as badge  
✅ Match history with automatic saving  
✅ **Delete all matches** feature with double confirmation  
✅ **Persistent match numbering** that never goes backwards  
✅ Past scorecard viewer with full details  
✅ **Sorted match history** (newest first) in modal and page  
✅ Undo support for all delivery types (including wicket+run)  
✅ Over-wise totals in scoreboard  
✅ Standard cricket over notation (X.0 format)  
✅ Score editing with live updates  
✅ **Target display in top row** with clean interface  
✅ **Match result messages** (win/loss/tie) displayed correctly  
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
Developed/enhanced/Inspired from this project -> [Sahil3201/cricket-score](https://github.com/Sahil3201/cricket-score)