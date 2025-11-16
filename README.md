# Kagi FastGPT To Markdown

A modern Chrome extension that exports Kagi's FastGPT questions and answers to Markdown format with one click.

## Features

- **One-Click Export**: Instantly copy FastGPT conversations to Markdown format
- **Export History**: Never lose your exports! All exports are automatically saved to history
  - Access previous exports anytime from the history page
  - Copy any export back to clipboard
  - Download exports as markdown files
  - Configurable history limit (1-200 items)
- **Modern Chrome Extension**: Built with Manifest V3 and modern JavaScript APIs
- **Customizable Options**: Configure what gets exported (questions, timestamps, source URLs)
- **Keyboard Shortcuts**: Quick access via configurable keyboard shortcuts
- **Visual Feedback**: Clear status messages and loading states
- **Robust Error Handling**: Informative error messages when things go wrong

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the extension directory

### Publishing (TODO)
This extension is not yet published to the Chrome Web Store.

## Usage

### Method 1: Click the Extension Icon

1. Navigate to a FastGPT page on Kagi (e.g., `https://kagi.com/fastgpt?query=...`)
2. Click the extension icon in your browser toolbar
3. Click the "Copy to Markdown" button
4. The content is now copied to your clipboard!

### Method 2: Keyboard Shortcuts

- **Open Popup**: `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac)
- **Copy to Markdown**: `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac)

You can customize these shortcuts at `chrome://extensions/shortcuts`

### Method 3: Access Export History

Never lose an export again! All your exports are automatically saved.

1. Click the extension icon and then click the "History" button
2. Or go to Options and click "View History"
3. From the history page you can:
   - Copy any previous export to clipboard
   - Download exports as `.md` files
   - View export metadata (timestamp, source URL)
   - Delete individual exports or clear all history

## Configuration

Click the extension icon and select "Options" to configure:

- **Include Question**: Whether to include the original question
- **Remove Headers**: Remove H3 headers from answers
- **Add Timestamp**: Include export date/time
- **Add Source URL**: Add a link to the original FastGPT page
- **Maximum History Items**: How many exports to keep (1-200, default 50)

## Technical Details

### Modern Chrome APIs

This extension uses the latest Chrome Extension APIs:

- **Manifest V3**: The current standard for Chrome extensions
- **Service Workers**: For background tasks instead of persistent background pages
- **Async/await**: Modern JavaScript throughout, no callback-based APIs
- **Native Promise APIs**: No manual Promise wrapping
- **Modern DOM Methods**: Uses `.remove()` instead of deprecated `.removeChild()`

### Architecture

```
fastgpt-to-md/
├── manifest.json          # Extension configuration (MV3)
├── background.js          # Service worker for keyboard shortcuts & history
├── popup/                 # Extension popup UI
│   ├── popup.html
│   ├── popup.js          # Modern async/await, native Promises, history saving
│   └── popup.css         # Styled UI with status messages
├── options/              # Settings page
│   ├── options.html
│   ├── options.js
│   └── options.css
├── history/              # Export history viewer
│   ├── history.html      # Full-page history interface
│   ├── history.js        # History management, copy, download, delete
│   └── history.css       # Modern dark theme
├── libs/
│   └── turndown.umd.js   # HTML to Markdown converter
└── images/               # Extension icons
```

### Permissions

- **scripting**: Execute scripts on Kagi pages to extract content
- **activeTab**: Access the currently active tab
- **storage**: Save user preferences and export history
  - `chrome.storage.sync`: User settings (max 100KB)
  - `chrome.storage.local`: Export history (unlimited)

## Development

### Version History

- **v2.0** (Current)
  - Modernized to current Chrome extension standards
  - Added options page with customizable settings
  - Added keyboard shortcut support
  - Improved error handling and user feedback
  - Updated to use native async/await throughout
  - Replaced deprecated DOM methods
  - Added visual status messages
  - Better UI/UX with loading states

- **v1.0** (Original)
  - Basic functionality to copy FastGPT to Markdown

### Improvements Over v1.0

1. **Modern JavaScript**
   - Removed unnecessary Promise wrapping
   - Native async/await throughout
   - Modern DOM methods (`.remove()` instead of `.removeChild()`)

2. **Better User Experience**
   - Visual feedback (loading, success, error states)
   - Disabled button during operations
   - Auto-hiding success messages
   - Detailed error messages

3. **Enhanced Features**
   - Customizable export options
   - Keyboard shortcuts
   - Settings page
   - Timestamp and source URL options

4. **Code Quality**
   - Comprehensive error handling
   - Better code organization
   - Modern Chrome Extension best practices
   - Proper HTML structure with DOCTYPE

## Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers with MV3 support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see below for details.

Copyright (c) 2024 Pedro Miranda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Author

Pedro Miranda

## Acknowledgments

- Uses [Turndown](https://github.com/domchristie/turndown) for HTML to Markdown conversion
- Built for use with [Kagi FastGPT](https://kagi.com/fastgpt)
