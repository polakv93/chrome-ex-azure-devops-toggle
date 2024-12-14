async function getApiToken() {
  const result = await chrome.storage.local.get(['togglApiToken']);
  return result.togglApiToken;
}

addTogglButton();

function addTogglButton() {
  const observer = new MutationObserver((_mutations, obs) => {
    const toolbar = document.querySelector('.bolt-clipboard-button');
    if (toolbar && !toolbar.nextElementSibling?.hasAttribute('data-toggl-button')) {
      insertButton(toolbar);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true
  });
}

function insertButton(toolbar) {
  const button = document.createElement('button');
  button.className = 'bolt-button bolt-icon-button';
  button.innerHTML = 'Start Toggl ⏱️';
  button.style.marginLeft = '10px';
  button.setAttribute('data-toggl-button', 'true');
  
  button.addEventListener('click', createTogglTimeEntry);
  
  toolbar.parentNode.insertBefore(button, toolbar.nextSibling);
}

async function createTogglTimeEntry() {
  try {
    const apiToken = await getApiToken();
    if (!apiToken) {
      alert('Please set your Toggl API token in the extension popup first.');
      return;
    }

    const titleElement = document.querySelector('input[aria-label="Title field"]');
    const workItemId = getWorkItemId() || '';
    const title = titleElement ? titleElement.value : 'Azure DevOps Task';
    const description = `#${workItemId}: ${title}`;

    const response = await chrome.runtime.sendMessage({
      action: 'createTimer',
      apiToken: apiToken,
      description: description
    });

    if (response.success) {
      const successToast = document.createElement('div');
      successToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #107c10;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
      successToast.textContent = `Toggl timer started successfully! Description: ${description}`;
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 3000);
    } else {
      throw new Error(response.error || 'Failed to start timer');
    }
  } catch (error) {
    console.error('Error creating Toggl time entry:', error);
    alert('Failed to start Toggl timer. Please check console for details.');
  }
}

function getWorkItemId() {
    // Start from the title input field
    const titleInput = document.querySelector('input[aria-label="Title field"]');
    if (!titleInput) return null;

    // Navigate up to find the common container
    const container = titleInput.closest('.flex-row.body-xl');
    if (!container) return null;

    // Get the first text node's content (the ID)
    const id = parseInt(container.childNodes[0].textContent.trim());
    return isNaN(id) ? null : id;
} 