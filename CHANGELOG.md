# Changelog

All notable changes to this project will be documented in this file.

## [2.1] - 2025-11-16

### Added
- **Export History Feature**: Comprehensive history system to prevent clipboard data loss
  - Automatic saving of all exports to local storage
  - Full-page history viewer with beautiful dark theme interface
  - Copy any previous export back to clipboard
  - Download exports as `.md` files
  - Expand/collapse preview for long exports
  - Delete individual history items
  - Clear all history with confirmation dialog
  - Configurable history limit (1-200 items, default 50)
  - Empty state messaging when no history exists
- **History Access**:
  - History button in popup with clock icon
  - View History button in options page
  - Quick access from multiple locations
- **History Management Settings**:
  - Configure maximum history items to keep
  - View storage usage information
  - Clear all history from options page
- **Smart Storage Strategy**:
  - Uses `chrome.storage.local` for unlimited history storage
  - Saves final markdown content (not HTML)
  - Includes metadata: question, URL, timestamp
  - Automatic trimming when limit exceeded
  - Non-blocking saves (doesn't fail main operation)
- **History Page Features**:
  - Visual timeline of all exports
  - Character count display
  - Source URL links to original FastGPT page
  - Formatted timestamps (date and time)
  - One-click copy to clipboard
  - Download button for each export
  - Toast notifications for actions
  - Confirm dialogs for destructive actions
  - Responsive card-based layout

### Changed
- Updated popup layout to accommodate history button
- Modified `grabContent()` to return object with both HTML and question
- Enhanced background service worker to save history from keyboard shortcuts
- Improved storage permission usage documentation

### Technical Implementation
- Added `history/history.html` - Full history page UI
- Added `history/history.js` - History management logic
- Added `history/history.css` - Modern dark theme styling
- Updated `popup/popup.js` with `saveToHistory()` function
- Updated `background.js` to handle history from keyboard shortcuts
- Modified popup CSS for two-button layout with icons

## [2.0] - 2025-11-16

### Added
- **Options Page**: New settings page to customize export behavior
  - Toggle question inclusion
  - Toggle header removal
  - Add timestamp to exports
  - Add source URL to exports
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac) - Open popup
  - `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac) - Copy to Markdown
- **Visual Feedback**: Status messages for success, error, and loading states
- **Background Service Worker**: Handles keyboard shortcuts efficiently
- **Comprehensive README**: Full documentation with usage instructions and technical details
- **CHANGELOG**: This file to track version history

### Changed
- **Modernized JavaScript**:
  - Removed unnecessary Promise wrapping in `executeScript` calls
  - Native async/await throughout the codebase
  - Replaced deprecated `removeChild()` with modern `.remove()` method
- **Improved UI/UX**:
  - Changed anchor tag to semantic button element
  - Added loading states with button disabled during operations
  - Better visual feedback with color-coded status messages
  - Auto-hiding success messages
  - Expanded popup size for better usability
- **Better Error Handling**:
  - Comprehensive try-catch blocks
  - Detailed error messages for users
  - Validation for missing DOM elements
- **Enhanced HTML Structure**:
  - Added DOCTYPE declaration
  - Added viewport meta tag
  - Semantic HTML elements

### Fixed
- Chrome compatibility issues with modern versions
- Deprecated API usage
- Missing error handling for edge cases
- Inconsistent async patterns

### Technical Improvements
- Updated to Manifest V3 best practices
- Added storage permission for user preferences
- Improved icon declarations in manifest
- Better code organization and comments
- Modern CSS with proper transitions and states

## [1.0] - Initial Release

### Added
- Basic functionality to copy FastGPT questions and answers to Markdown
- Manifest V3 support
- Turndown library integration for HTML to Markdown conversion
- Basic popup interface
- Kagi.com content script integration
