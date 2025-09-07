let activeTabs = {}; // { tabId: intervalMs }

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    const { interval } = message;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        activeTabs[tabId] = interval;

        // Clear any old alarm and set new one
        chrome.alarms.clear("autoRefresh_" + tabId);
        chrome.alarms.create("autoRefresh_" + tabId, {
          periodInMinutes: interval / 60000,
        });

        sendResponse({ status: "running" });
      }
    });
  } else if (message.action === "stop") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.alarms.clear("autoRefresh_" + tabId);
        delete activeTabs[tabId];
        sendResponse({ status: "stopped" });
      }
    });
  } else if (message.action === "getStatus") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        sendResponse({ isRunning: !!activeTabs[tabId] });
      } else {
        sendResponse({ isRunning: false });
      }
    });
  }

  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("autoRefresh_")) {
    const tabId = parseInt(alarm.name.replace("autoRefresh_", ""), 10);
    if (activeTabs[tabId]) {
      chrome.tabs.reload(tabId);
    }
  }
});

// Clean up when a tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabs[tabId]) {
    chrome.alarms.clear("autoRefresh_" + tabId);
    delete activeTabs[tabId];
  }
});
