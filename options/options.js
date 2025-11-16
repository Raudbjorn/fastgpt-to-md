document.addEventListener('DOMContentLoaded', async function () {
  const saveButton = document.getElementById('saveButton');
  const statusMessage = document.getElementById('statusMessage');
  const openShortcutsButton = document.getElementById('openShortcuts');
  const viewHistoryButton = document.getElementById('viewHistory');
  const clearAllHistoryButton = document.getElementById('clearAllHistory');

  // Form elements
  const includeQuestion = document.getElementById('includeQuestion');
  const removeHeaders = document.getElementById('removeHeaders');
  const addTimestamp = document.getElementById('addTimestamp');
  const addSourceUrl = document.getElementById('addSourceUrl');
  const maxHistoryItems = document.getElementById('maxHistoryItems');

  // Load saved settings
  await loadSettings();

  // Save settings
  saveButton.addEventListener('click', async () => {
    try {
      const maxHistory = parseInt(maxHistoryItems.value);
      if (isNaN(maxHistory) || maxHistory < 1 || maxHistory > 200) {
        showStatus('Maximum history items must be between 1 and 200', 'error');
        return;
      }

      const settings = {
        includeQuestion: includeQuestion.checked,
        removeHeaders: removeHeaders.checked,
        addTimestamp: addTimestamp.checked,
        addSourceUrl: addSourceUrl.checked,
        maxHistoryItems: maxHistory
      };

      await chrome.storage.sync.set(settings);
      showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('Failed to save settings', 'error');
    }
  });

  // Open keyboard shortcuts configuration
  openShortcutsButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // View history
  viewHistoryButton.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('history/history.html') });
  });

  // Clear all history
  clearAllHistoryButton.addEventListener('click', async () => {
    showConfirmDialog(
      'Clear All History?',
      'Are you sure you want to clear all export history? This action cannot be undone.',
      async () => {
        try {
          await chrome.storage.local.set({ exportHistory: [] });
          showStatus('All history cleared', 'success');
        } catch (error) {
          console.error('Error clearing history:', error);
          showStatus('Failed to clear history', 'error');
        }
      }
    );
  });

  const loadSettings = async () => {
    try {
      const defaults = {
        includeQuestion: true,
        removeHeaders: true,
        addTimestamp: false,
        addSourceUrl: true,
        maxHistoryItems: 50
      };

      const settings = await chrome.storage.sync.get(defaults);

      includeQuestion.checked = settings.includeQuestion;
      removeHeaders.checked = settings.removeHeaders;
      addTimestamp.checked = settings.addTimestamp;
      addSourceUrl.checked = settings.addSourceUrl;
      maxHistoryItems.value = settings.maxHistoryItems;
    } catch (error) {
      console.error('Error loading settings:', error);
      showStatus('Failed to load settings', 'error');
    }
  };

  const showStatus = (message, type) => {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    if (type === 'success') {
      setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
      }, 3000);
    }
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
