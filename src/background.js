async function getWorkspaceId(apiToken) {
  try {
    const response = await fetch('https://api.track.toggl.com/api/v9/workspaces', {
      headers: {
        'Authorization': `Basic ${btoa(`${apiToken}:api_token`)}`
      }
    });
    
    if (response.ok) {
      const workspaces = await response.json();
      if (workspaces.length > 0) {
        return workspaces[0].id;
      }
    }
    throw new Error('No workspace found');
  } catch (error) {
    console.error('Error getting workspace:', error);
    throw error;
  }
}

async function createTogglTimer(apiToken, description) {
  const workspaceId = await getWorkspaceId(apiToken);
  
  const response = await fetch('https://api.track.toggl.com/api/v9/time_entries', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${apiToken}:api_token`)}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: description,
      created_with: 'Azure DevOps Extension',
      start: new Date().toISOString(),
      duration: -1,
      tags: ['azure-devops'],
      workspace_id: workspaceId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to start timer');
  }
  
  return await response.json();
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'createTimer') {
    createTogglTimer(request.apiToken, request.description)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
}); 