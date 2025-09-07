document.addEventListener("DOMContentLoaded", () => {
  const intervalInput = document.getElementById("interval");
  const toggleButton = document.getElementById("toggleButton");
  const statusDiv = document.getElementById("status");
  const themeToggle = document.getElementById("themeToggle");

  function updateStatus(isRunning) {
    statusDiv.textContent = isRunning
      ? "✅ Auto-refresh is running on this tab"
      : "⏹️ Auto-refresh is stopped";
  }

  function setButtonToStart() {
    toggleButton.textContent = "Start Auto Refresh";
    toggleButton.classList.remove("stop");
    toggleButton.classList.add("start");
  }

  function setButtonToStop() {
    toggleButton.textContent = "Stop Auto Refresh";
    toggleButton.classList.remove("start");
    toggleButton.classList.add("stop");
  }

  // Check current status on load
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (response.isRunning) {
      setButtonToStop();
      updateStatus(true);
    } else {
      setButtonToStart();
      updateStatus(false);
    }
  });

  // Theme toggle
  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
  });

  // Start/Stop button
  toggleButton.addEventListener("click", () => {
    if (toggleButton.classList.contains("start")) {
      const interval = Math.max(5, parseInt(intervalInput.value, 10)) * 1000;

      chrome.runtime.sendMessage({ action: "start", interval }, (response) => {
        if (response.status === "running") {
          setButtonToStop();
          updateStatus(true);
        }
      });
    } else {
      chrome.runtime.sendMessage({ action: "stop" }, (response) => {
        if (response.status === "stopped") {
          setButtonToStart();
          updateStatus(false);
        }
      });
    }
  });
});
