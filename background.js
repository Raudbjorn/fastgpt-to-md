// Background service worker for handling keyboard shortcuts and commands

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'copy-to-markdown') {
    try {
      // Get the active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!activeTab) {
        console.error('No active tab found');
        return;
      }

      // Validate that we're on a FastGPT page
      if (!activeTab.url.startsWith("https://kagi.com/fastgpt?query=")) {
        console.log('Not on a FastGPT page');
        // Could optionally show a notification here
        return;
      }

      // Execute the content extraction script
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: grabContentFromPage,
        args: []
      });

      if (!results || results.length === 0 || !results[0].result) {
        console.error('Failed to extract content');
        return;
      }

      const result = results[0].result;

      // Check for error responses
      if (typeof result === 'string' && (result === 'not found' || result === 'no question')) {
        console.error('Content not found on page');
        return;
      }

      const htmlContent = result.html;
      const question = result.question;

      // Get user settings
      const settings = await chrome.storage.sync.get({
        includeQuestion: true,
        removeHeaders: true,
        addTimestamp: false,
        addSourceUrl: true
      });

      // Inject Turndown library and convert to markdown
      const convertResults = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: convertAndCopyToClipboard,
        args: [htmlContent, settings, activeTab.url]
      });

      // Save to history after successful copy
      if (convertResults && convertResults[0] && convertResults[0].result) {
        const result = convertResults[0].result;
        if (result.status === 'success' && result.markdown) {
          await saveToHistory(result.markdown, question, activeTab.url);
        }
      }

    } catch (error) {
      console.error('Error in copy-to-markdown command:', error);
    }
  }
});

// This function runs in the context of the web page
function grabContentFromPage() {
  const main = document.querySelector('.content');
  const questionInput = document.querySelector('input[name="query"]');

  if (!questionInput) {
    return 'no question';
  }

  const question = questionInput.value;

  if (!main) {
    return 'not found';
  }

  // Clone the main element to avoid modifying the page
  const mainClone = main.cloneNode(true);

  const h3Element = mainClone.querySelector('h3');
  if (h3Element) {
    h3Element.remove();
  }

  const formattedContent = `
  <h2>Question</h2><br>${question}<h2>Answer</h2><br>${mainClone.outerHTML}
  `;

  return {
    html: formattedContent,
    question: question
  };
}

// This function runs in the context of the web page
async function convertAndCopyToClipboard(htmlContent, settings, sourceUrl) {
  try {
    // TurndownService is already loaded via content script
    if (typeof TurndownService === 'undefined') {
      console.error('TurndownService not available');
      return { status: 'error', error: 'TurndownService not available' };
    }

    const turndownService = new TurndownService();
    let markdownContent = turndownService.turndown(htmlContent);

    // Add timestamp if enabled
    if (settings.addTimestamp) {
      const timestamp = new Date().toLocaleString();
      markdownContent = `*Exported: ${timestamp}*\n\n${markdownContent}`;
    }

    // Add source URL if enabled
    if (settings.addSourceUrl) {
      markdownContent += `\n\n---\n*Source: [FastGPT](${sourceUrl})*`;
    }

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(markdownContent);
      console.log('Content copied to clipboard via keyboard shortcut');
      return { status: 'success', markdown: markdownContent };
    } catch (clipboardError) {
      console.error('Failed to copy to clipboard:', clipboardError);
      return { status: 'error', error: 'Failed to copy to clipboard' };
    }
  } catch (error) {
    console.error('Error in convertAndCopyToClipboard:', error);
    return { status: 'error', error: error.message };
  }
}

// Save to history (runs in background context)
async function saveToHistory(content, question, url) {
  try {
    // Get current history
    const { exportHistory = [] } = await chrome.storage.local.get('exportHistory');

    // Get max history limit from settings (default 50)
    const { maxHistoryItems = 50 } = await chrome.storage.sync.get('maxHistoryItems');

    // Create new history item
    const historyItem = {
      content,
      question,
      url,
      timestamp: Date.now()
    };

    // Add to beginning of array
    exportHistory.unshift(historyItem);

    // Trim to max limit
    if (exportHistory.length > maxHistoryItems) {
      exportHistory.splice(maxHistoryItems);
    }

    // Save back to storage
    await chrome.storage.local.set({ exportHistory });
    console.log('Saved to history via keyboard shortcut');
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}
