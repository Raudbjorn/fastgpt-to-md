# Changelog

All notable changes to this project will be documented in this file.

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
