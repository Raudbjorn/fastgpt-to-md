document.addEventListener('DOMContentLoaded', function () {
  const copyButton = document.getElementById('copyButton');
  const statusMessage = document.getElementById('statusMessage');

  copyButton.addEventListener('click', async () => {
    try {
      // Get active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Validate tab URL
      if (!activeTab) {
        showStatus('No active tab found', 'error');
        return;
      }

      if (!activeTab.url.startsWith("https://kagi.com/fastgpt?query=")) {
        showStatus('Please navigate to a FastGPT page', 'error');
        return;
      }

      // Show loading state
      showStatus('Extracting content...', 'loading');
      copyButton.disabled = true;

      // Execute script in tab (modern async/await - no Promise wrapping needed)
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: grabContent,
        args: []
      });

      // Check if we got results
      if (!results || results.length === 0 || !results[0].result) {
        throw new Error('Failed to extract content from page');
      }

      const htmlContent = results[0].result;

      // Check for error responses
      if (htmlContent === 'not found') {
        throw new Error('FastGPT content not found on page');
      }

      if (htmlContent === 'no question') {
        throw new Error('Question field not found on page');
      }

      // Get user settings
      const settings = await chrome.storage.sync.get({
        includeQuestion: true,
        removeHeaders: true,
        addTimestamp: false,
        addSourceUrl: true
      });

      // Convert to markdown
      await copyResultToClipboard(htmlContent, settings, activeTab.url);

      showStatus('Copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error:', error);
      showStatus(error.message || 'Failed to copy content', 'error');
    } finally {
      copyButton.disabled = false;
    }
  });

  async function copyResultToClipboard(htmlContent, settings, sourceUrl) {
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

    // Modern async/await for clipboard API
    try {
      await navigator.clipboard.writeText(markdownContent);
      console.log('Text copied to clipboard successfully');
    } catch (error) {
      console.error('Error copying text to clipboard:', error);
      throw new Error('Failed to copy to clipboard. Please grant clipboard permissions.');
    }
  }

  function showStatus(message, type) {
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    // Auto-hide success messages after 2 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
      }, 2000);
    }
  }

  // This function runs in the context of the web page
  function grabContent() {
    const main = document.querySelector('.content');
    const questionInput = document.querySelector('input[name="query"]');

    // Better error handling
    if (!questionInput) {
      return 'no question';
    }

    const question = questionInput.value;

    if (!main) {
      return 'not found';
    }

    // Modern DOM method - remove() instead of removeChild()
    const h3Element = main.querySelector('h3');
    if (h3Element) {
      h3Element.remove();
    }

    const formattedContent = `
    <h2>Question</h2><br>${question}<h2>Answer</h2><br>${main.outerHTML}
    `;

    return formattedContent;
  }

});
