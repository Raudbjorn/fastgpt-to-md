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

  const loadHistory = async () => {
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
  };

  const createHistoryItem = (item, index) => {
    const div = document.createElement('div');
    div.className = 'history-item';

    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    // Truncate preview if too long
    const preview = item.content.substring(0, 300);
    const isTruncated = item.content.length > 300;

    // Build DOM structure safely without innerHTML
    const header = document.createElement('div');
    header.className = 'history-item-header';

    const info = document.createElement('div');
    info.className = 'history-item-info';

    const questionDiv = document.createElement('div');
    questionDiv.className = 'history-item-question';
    questionDiv.textContent = item.question || 'Untitled Export';

    const meta = document.createElement('div');
    meta.className = 'history-item-meta';

    // Time meta item
    const timeItem = createMetaItem(`${formattedDate} at ${formattedTime}`, 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z');
    meta.appendChild(timeItem);

    // URL meta item (if exists)
    if (item.url) {
      const urlItem = document.createElement('div');
      urlItem.className = 'meta-item';
      const svg = createSVG('M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1');
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.className = 'source-link';
      link.textContent = 'View Source';
      urlItem.appendChild(svg);
      urlItem.appendChild(link);
      meta.appendChild(urlItem);
    }

    // Characters meta item
    const charsItem = createMetaItem(`${item.content.length} characters`, 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z');
    meta.appendChild(charsItem);

    info.appendChild(questionDiv);
    info.appendChild(meta);
    header.appendChild(info);

    // Preview section
    const previewDiv = document.createElement('div');
    previewDiv.className = 'history-item-preview';
    previewDiv.id = `preview-${index}`;

    const previewContent = document.createElement('div');
    previewContent.className = 'preview-content';
    previewContent.textContent = preview + (isTruncated ? '...' : '');

    previewDiv.appendChild(previewContent);

    if (isTruncated) {
      const fade = document.createElement('div');
      fade.className = 'preview-fade';
      previewDiv.appendChild(fade);
    }

    // Actions section
    const actions = document.createElement('div');
    actions.className = 'history-item-actions';

    // Copy button
    const copyBtn = createActionButton('copy', index, 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', 'Copy to Clipboard', true);
    actions.appendChild(copyBtn);

    // Expand button (if truncated)
    if (isTruncated) {
      const expandBtn = createActionButton('expand', index, 'M19 9l-7 7-7-7', 'Show Full', false);
      actions.appendChild(expandBtn);
    }

    // Download button
    const downloadBtn = createActionButton('download', index, 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', 'Download', false);
    actions.appendChild(downloadBtn);

    // Delete button
    const deleteBtn = createActionButton('delete', index, 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', 'Delete', false);
    actions.appendChild(deleteBtn);

    // Assemble the div
    div.appendChild(header);
    div.appendChild(previewDiv);
    div.appendChild(actions);

    // Add event listeners
    div.querySelectorAll('.action-button').forEach(button => {
      button.addEventListener('click', async (e) => {
        const { action } = button.dataset;
        const itemIndex = parseInt(button.dataset.index);

        switch (action) {
          case 'copy':
            await copyToClipboard(item.content);
            showToast('Copied to clipboard!');
            break;
          case 'expand':
            togglePreview(index, item.content);
            // Update button to "Show Less"
            button.querySelector('svg').querySelector('path').setAttribute('d', 'M5 15l7-7 7 7');
            button.childNodes[1].textContent = 'Show Less';
            button.dataset.action = 'collapse';
            break;
          case 'collapse':
            togglePreview(index, item.content, false);
            // Update button to "Show Full"
            button.querySelector('svg').querySelector('path').setAttribute('d', 'M19 9l-7 7-7-7');
            button.childNodes[1].textContent = 'Show Full';
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
  };

  // Helper function to create SVG element
  const createSVG = (pathData) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', pathData);

    svg.appendChild(path);
    return svg;
  };

  // Helper function to create meta item
  const createMetaItem = (text, svgPath) => {
    const item = document.createElement('div');
    item.className = 'meta-item';

    const svg = createSVG(svgPath);
    const span = document.createElement('span');
    span.textContent = text;

    item.appendChild(svg);
    item.appendChild(span);
    return item;
  };

  // Helper function to create action button
  const createActionButton = (action, index, svgPath, label, isPrimary = false) => {
    const button = document.createElement('button');
    button.className = isPrimary ? 'action-button primary' : 'action-button';
    button.dataset.action = action;
    button.dataset.index = index;

    const svg = createSVG(svgPath);
    button.appendChild(svg);
    button.appendChild(document.createTextNode(label));

    return button;
  };

  const togglePreview = (index, fullContent, expand = true) => {
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
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const downloadFile = (content, questionText) => {
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
  };

  const deleteHistoryItem = async (index) => {
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
  };

  const showToast = (message, type = 'success') => {
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
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';

    const content = document.createElement('div');
    content.className = 'confirm-content';

    const h2 = document.createElement('h2');
    h2.textContent = title;

    const p = document.createElement('p');
    p.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'confirm-actions';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'confirm-button cancel';
    cancelButton.textContent = 'Cancel';

    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm-button confirm';
    confirmButton.textContent = 'Confirm';

    actions.appendChild(cancelButton);
    actions.appendChild(confirmButton);

    content.appendChild(h2);
    content.appendChild(p);
    content.appendChild(actions);

    dialog.appendChild(content);

    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);

    cancelButton.addEventListener('click', () => {
      dialog.classList.remove('show');
      setTimeout(() => dialog.remove(), 300);
    });

    confirmButton.addEventListener('click', async () => {
      dialog.classList.remove('show');
      setTimeout(() => dialog.remove(), 300);
      await onConfirm();
    });
  };

});
