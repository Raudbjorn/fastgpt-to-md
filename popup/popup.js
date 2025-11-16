document.addEventListener('DOMContentLoaded', function () {
  const copyButton = document.getElementById('copyButton');
  const statusMessage = document.getElementById('statusMessage');
  const historyButton = document.getElementById('historyButton');

  // Open history page
  if (historyButton) {
    historyButton.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('history/history.html') });
    });
  }

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

      const result = results[0].result;

      // Handle error responses
      if (typeof result === 'string') {
        if (result === 'not found') {
          throw new Error('FastGPT content not found on page');
        }
        if (result === 'no question') {
          throw new Error('Question field not found on page');
        }
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

      // Convert to markdown and save to history
      await copyResultToClipboard(htmlContent, settings, activeTab.url, question);

      showStatus('Copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error:', error);
      showStatus(error.message || 'Failed to copy content', 'error');
    } finally {
      copyButton.disabled = false;
    }
  });

  async function copyResultToClipboard(htmlContent, settings, sourceUrl, question) {
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

      // Save to history
      await saveToHistory(markdownContent, question, sourceUrl);
    } catch (error) {
      console.error('Error copying text to clipboard:', error);
      throw new Error('Failed to copy to clipboard. Please grant clipboard permissions.');
    }
  }

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
      console.log('Saved to history');
    } catch (error) {
      console.error('Error saving to history:', error);
      // Don't throw - history save failure shouldn't block the main operation
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

    // Clone to avoid modifying the actual page
    const mainClone = main.cloneNode(true);

    // Modern DOM method - remove() instead of removeChild()
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

});
