document.addEventListener('DOMContentLoaded', async function () {
  const historyList = document.getElementById('historyList');
  const emptyState = document.getElementById('emptyState');
  const clearHistoryButton = document.getElementById('clearHistory');

  // Load and display history
  await loadHistory();

  // Clear all history
  clearHistoryButton.addEventListener('click', () => {
    showConfirmDialog(
      'Clear All History?',
      'This will permanently delete all your saved exports. This action cannot be undone.',
      async () => {
        await chrome.storage.local.set({ exportHistory: [] });
        await loadHistory();
        showToast('History cleared');
      }
    );
  });

  async function loadHistory() {
    try {
      const { exportHistory = [] } = await chrome.storage.local.get('exportHistory');

      if (exportHistory.length === 0) {
        historyList.style.display = 'none';
        emptyState.style.display = 'block';
        clearHistoryButton.disabled = true;
        clearHistoryButton.style.opacity = '0.5';
        clearHistoryButton.style.cursor = 'not-allowed';
        return;
      }

      historyList.style.display = 'flex';
      emptyState.style.display = 'none';
      clearHistoryButton.disabled = false;
      clearHistoryButton.style.opacity = '1';
      clearHistoryButton.style.cursor = 'pointer';

      // Sort by timestamp (newest first)
      const sortedHistory = exportHistory.sort((a, b) => b.timestamp - a.timestamp);

      // Clear existing items
      historyList.innerHTML = '';

      // Create history items
      sortedHistory.forEach((item, index) => {
        const historyItem = createHistoryItem(item, index);
        historyList.appendChild(historyItem);
      });

    } catch (error) {
      console.error('Error loading history:', error);
      showToast('Failed to load history', 'error');
    }
  }

  function createHistoryItem(item, index) {
    const div = document.createElement('div');
    div.className = 'history-item';

    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    // Truncate preview if too long
    const preview = item.content.substring(0, 300);
    const isTruncated = item.content.length > 300;

    div.innerHTML = `
      <div class="history-item-header">
        <div class="history-item-info">
          <div class="history-item-question">${escapeHtml(item.question || 'Untitled Export')}</div>
          <div class="history-item-meta">
            <div class="meta-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>${formattedDate} at ${formattedTime}</span>
            </div>
            ${item.url ? `
              <div class="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                <a href="${escapeHtml(item.url)}" target="_blank" style="color: #60a5fa; text-decoration: none;">View Source</a>
              </div>
            ` : ''}
            <div class="meta-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>${item.content.length} characters</span>
            </div>
          </div>
        </div>
      </div>
      <div class="history-item-preview" id="preview-${index}">
        <div class="preview-content">${escapeHtml(preview)}${isTruncated ? '...' : ''}</div>
        ${isTruncated ? '<div class="preview-fade"></div>' : ''}
      </div>
      <div class="history-item-actions">
        <button class="action-button primary" data-action="copy" data-index="${index}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          Copy to Clipboard
        </button>
        ${isTruncated ? `
          <button class="action-button" data-action="expand" data-index="${index}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            Show Full
          </button>
        ` : ''}
        <button class="action-button" data-action="download" data-index="${index}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Download
        </button>
        <button class="action-button" data-action="delete" data-index="${index}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete
        </button>
      </div>
    `;

    // Add event listeners
    div.querySelectorAll('.action-button').forEach(button => {
      button.addEventListener('click', async (e) => {
        const action = button.dataset.action;
        const itemIndex = parseInt(button.dataset.index);

        switch (action) {
          case 'copy':
            await copyToClipboard(item.content);
            showToast('Copied to clipboard!');
            break;
          case 'expand':
            togglePreview(index, item.content);
            button.innerHTML = `
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
              </svg>
              Show Less
            `;
            button.dataset.action = 'collapse';
            break;
          case 'collapse':
            togglePreview(index, item.content, false);
            button.innerHTML = `
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              Show Full
            `;
            button.dataset.action = 'expand';
            break;
          case 'download':
            downloadFile(item.content, item.question || 'export');
            showToast('Download started');
            break;
          case 'delete':
            await deleteHistoryItem(itemIndex);
            break;
        }
      });
    });

    return div;
  }

  function togglePreview(index, fullContent, expand = true) {
    const preview = document.getElementById(`preview-${index}`);
    const previewContent = preview.querySelector('.preview-content');

    if (expand) {
      preview.classList.add('expanded');
      previewContent.textContent = fullContent;
    } else {
      preview.classList.remove('expanded');
      const truncated = fullContent.substring(0, 300);
      previewContent.textContent = truncated + (fullContent.length > 300 ? '...' : '');
    }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  }

  function downloadFile(content, questionText) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Create safe filename from question
    const safeFilename = questionText
      .replace(/[^a-z0-9]/gi, '_')
      .substring(0, 50)
      .toLowerCase();
    a.download = `fastgpt_${safeFilename}_${Date.now()}.md`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function deleteHistoryItem(index) {
    showConfirmDialog(
      'Delete Export?',
      'Are you sure you want to delete this export? This action cannot be undone.',
      async () => {
        try {
          const { exportHistory = [] } = await chrome.storage.local.get('exportHistory');
          const sortedHistory = exportHistory.sort((a, b) => b.timestamp - a.timestamp);
          sortedHistory.splice(index, 1);
          await chrome.storage.local.set({ exportHistory: sortedHistory });
          await loadHistory();
          showToast('Export deleted');
        } catch (error) {
          console.error('Error deleting history item:', error);
          showToast('Failed to delete export', 'error');
        }
      }
    );
  }

  function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function showConfirmDialog(title, message, onConfirm) {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <div class="confirm-content">
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        <div class="confirm-actions">
          <button class="confirm-button cancel">Cancel</button>
          <button class="confirm-button confirm">Confirm</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);

    const cancelButton = dialog.querySelector('.cancel');
    const confirmButton = dialog.querySelector('.confirm');

    cancelButton.addEventListener('click', () => {
      dialog.classList.remove('show');
      setTimeout(() => dialog.remove(), 300);
    });

    confirmButton.addEventListener('click', async () => {
      dialog.classList.remove('show');
      setTimeout(() => dialog.remove(), 300);
      await onConfirm();
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
