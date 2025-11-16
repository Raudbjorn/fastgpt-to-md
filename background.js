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

      const htmlContent = results[0].result;

      // Check for error responses
      if (htmlContent === 'not found' || htmlContent === 'no question') {
        console.error('Content not found on page');
        return;
      }

      // Get user settings
      const settings = await chrome.storage.sync.get({
        includeQuestion: true,
        removeHeaders: true,
        addTimestamp: false,
        addSourceUrl: true
      });

      // Inject Turndown library and convert to markdown
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: convertAndCopyToClipboard,
        args: [htmlContent, settings, activeTab.url]
      });

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

  return formattedContent;
}

// This function runs in the context of the web page
function convertAndCopyToClipboard(htmlContent, settings, sourceUrl) {
  try {
    // TurndownService is already loaded via content script
    if (typeof TurndownService === 'undefined') {
      console.error('TurndownService not available');
      return;
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
    navigator.clipboard.writeText(markdownContent)
      .then(() => {
        console.log('Content copied to clipboard via keyboard shortcut');
      })
      .catch((error) => {
        console.error('Failed to copy to clipboard:', error);
      });
  } catch (error) {
    console.error('Error in convertAndCopyToClipboard:', error);
  }
}
