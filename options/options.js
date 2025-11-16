document.addEventListener('DOMContentLoaded', async function () {
  const saveButton = document.getElementById('saveButton');
  const statusMessage = document.getElementById('statusMessage');
  const openShortcutsButton = document.getElementById('openShortcuts');

  // Form elements
  const includeQuestion = document.getElementById('includeQuestion');
  const removeHeaders = document.getElementById('removeHeaders');
  const addTimestamp = document.getElementById('addTimestamp');
  const addSourceUrl = document.getElementById('addSourceUrl');

  // Load saved settings
  await loadSettings();

  // Save settings
  saveButton.addEventListener('click', async () => {
    try {
      const settings = {
        includeQuestion: includeQuestion.checked,
        removeHeaders: removeHeaders.checked,
        addTimestamp: addTimestamp.checked,
        addSourceUrl: addSourceUrl.checked
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

  async function loadSettings() {
    try {
      const defaults = {
        includeQuestion: true,
        removeHeaders: true,
        addTimestamp: false,
        addSourceUrl: true
      };

      const settings = await chrome.storage.sync.get(defaults);

      includeQuestion.checked = settings.includeQuestion;
      removeHeaders.checked = settings.removeHeaders;
      addTimestamp.checked = settings.addTimestamp;
      addSourceUrl.checked = settings.addSourceUrl;
    } catch (error) {
      console.error('Error loading settings:', error);
      showStatus('Failed to load settings', 'error');
    }
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    if (type === 'success') {
      setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
      }, 3000);
    }
  }
});
