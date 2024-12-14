document.addEventListener('DOMContentLoaded', async () => {
  // Load saved API token
  const result = await chrome.storage.local.get(['togglApiToken']);
  if (result.togglApiToken) {
    document.getElementById('apiToken').value = result.togglApiToken;
  }

  // Save API token
  document.getElementById('saveButton').addEventListener('click', async () => {
    const apiToken = document.getElementById('apiToken').value.trim();
    
    if (!apiToken) {
      alert('Please enter your Toggl API token');
      return;
    }

    // Verify the token by making a test API call
    try {
      const response = await fetch('https://api.track.toggl.com/api/v9/me', {
        headers: {
          'Authorization': `Basic ${btoa(`${apiToken}:api_token`)}`
        }
      });

      if (response.ok) {
        await chrome.storage.local.set({ togglApiToken: apiToken });
        alert('API token saved successfully!');
      } else {
        alert('Invalid API token. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating token:', error);
      alert('Failed to validate API token. Please try again.');
    }
  });
}); 