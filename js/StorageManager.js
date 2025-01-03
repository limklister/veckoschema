class StorageManager {
  constructor(storageKey = "dinnerPlanner") {
    this.storageKey = storageKey;
  }

  loadData() {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error("Failed to load data from storage:", error);
      return null;
    }
  }

  async saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save data to storage:", error);
      return false;
    }
  }

  encodeWeeksToUrl(weeks) {
    try {
      const encoded = encodeURIComponent(
        btoa(
          weeks.map((week) => week.map((day) => day || "_").join(",")).join("|")
        )
      );
      return `${window.location.origin}${window.location.pathname}?w=${encoded}`;
    } catch (error) {
      console.error("Failed to encode URL:", error);
      return null;
    }
  }

  decodeUrlToWeeks(encoded) {
    try {
      const decoded = atob(decodeURIComponent(encoded));
      return decoded
        .split("|")
        .map((week) => week.split(",").map((day) => (day === "_" ? "" : day)));
    } catch (error) {
      console.error("Failed to decode URL:", error);
      return null;
    }
  }
}
