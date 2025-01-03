// Initialize core components
const weekPlanner = new WeekPlanner();
const storageManager = new StorageManager();
const dragDropManager = new DragDropManager(weekPlanner);
const csvManager = new CSVManager(weekPlanner);
const uiRenderer = new UIRenderer(weekPlanner, dragDropManager);

// Setup state management
function handleStateChange(state, redraw) {
  console.log("State changed", state);
  storageManager.saveData(state.weeks);
  if (redraw) {
    console.log("Trigger redraw", state);
    uiRenderer.renderPlanner();
  }
}

function init() {
  weekPlanner.init(handleStateChange);

  // Check for shared URL data
  const urlParams = new URLSearchParams(window.location.search);
  const encodedData = urlParams.get("w");

  if (encodedData) {
    const decodedWeeks = storageManager.decodeUrlToWeeks(encodedData);
    if (decodedWeeks) {
      weekPlanner.setState(decodedWeeks);
    }
  } else {
    // Load from local storage
    const savedData = storageManager.loadData();
    if (savedData) {
      weekPlanner.setState(savedData);
    } else {
      weekPlanner.addWeek();
    }
  }

  // Render UI
  uiRenderer.renderSuggestions(vegetarianSuggestions);
}

// Export functions for global access (used in HTML)
window.handleDeleteWeek = (weekIndex) => {
  try {
    weekPlanner.deleteWeek(weekIndex);
  } catch (error) {
    alert(error.message);
  }
};

window.addWeek = () => {
  weekPlanner.addWeek();
};

window.shareSchedule = () => {
  const url = storageManager.encodeWeeksToUrl(weekPlanner.getState().weeks);
  navigator.clipboard
    .writeText(url)
    .then(() => alert("Länk kopierad till urklipp!"))
    .catch(() => {
      const manualCopy = prompt("Kopiera denna länk:", url);
      if (!manualCopy) {
        alert(
          "Kunde inte kopiera länken automatiskt. Vänligen kopiera den manuellt."
        );
      }
    });
};

window.exportToCSV = () => {
  try {
    csvManager.exportToCSV();
  } catch (error) {
    alert("Ett fel uppstod vid export av schemat: " + error.message);
  }
};

window.importFromCSV = async (file) => {
  try {
    await csvManager.importFromCSV(file);
  } catch (error) {
    alert("Ett fel uppstod vid import av schemat: " + error.message);
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
