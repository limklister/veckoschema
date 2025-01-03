class UIRenderer {
  constructor(weekPlanner, dragDropManager) {
    this.weekPlanner = weekPlanner;
    this.dragDropManager = dragDropManager;
    this.plannerElement = document.getElementById("planner");
    this.suggestionsElement = document.getElementById("suggestionsList");
  }

  renderPlanner() {
    const { weeks, daysOfWeek } = this.weekPlanner.getState();
    const { currentDayIndex, currentWeekIndex } =
      this.weekPlanner.getCurrentDayInfo();

    this.plannerElement.innerHTML = "";

    weeks.forEach((week, weekIndex) => {
      this._renderWeekHeader(weekIndex);
      this._renderWeekTable(week, weekIndex, currentDayIndex, currentWeekIndex);
    });
  }

  renderSuggestions(suggestions) {
    this.suggestionsElement.innerHTML = "";

    suggestions.forEach((suggestion, index) => {
      const element = document.createElement("div");
      element.className = "suggestion";
      element.textContent = suggestion;
      element.draggable = true;
      element.setAttribute("data-suggestion-index", index);

      element.addEventListener("dragstart", (e) =>
        this.dragDropManager.handleDragStart(e, { index })
      );

      this.suggestionsElement.appendChild(element);
    });
  }

  _renderWeekHeader(weekIndex) {
    const weekHeaderDiv = document.createElement("div");
    weekHeaderDiv.className = "week-header";
    weekHeaderDiv.innerHTML = `
            <span>Vecka ${weekIndex + 1}</span>
            ${
              weekIndex > 0
                ? `<button class="delete-week" onclick="handleDeleteWeek(${weekIndex})">Ta bort vecka</button>`
                : ""
            }
        `;
    this.plannerElement.appendChild(weekHeaderDiv);
  }

  _renderWeekTable(week, weekIndex, currentDayIndex, currentWeekIndex) {
    const { daysOfWeek } = this.weekPlanner.getState();
    const table = document.createElement("table");
    table.className = "fade-in";

    week.forEach((dinner, dayIndex) => {
      const row = this._createTableRow(dinner, weekIndex, dayIndex, daysOfWeek);

      if (weekIndex === currentWeekIndex && dayIndex === currentDayIndex) {
        row.classList.add("current-day");
      }

      this._addDragDropListeners(row);
      table.appendChild(row);
    });

    this.plannerElement.appendChild(table);
  }

  _createTableRow(dinner, weekIndex, dayIndex, daysOfWeek) {
    const getRandomIndex = (max) => Math.floor(Math.random() * max);
    const row = document.createElement("tr");
    row.draggable = true;
    row.classList.add("draggable");
    row.setAttribute("data-week-index", weekIndex);
    row.setAttribute("data-day-index", dayIndex);

    const dayCell = document.createElement("td");
    const dayContent = document.createElement("div");
    dayContent.className = "day-content";
    dayContent.textContent = daysOfWeek[dayIndex];

    const suggestButton = document.createElement("button");
    const suggestCell = document.createElement("td");
    suggestCell.appendChild(suggestButton);
    suggestButton.className = "suggest-button";
    suggestButton.innerHTML =
      '<img src="https://unpkg.com/lucide-static@latest/icons/lightbulb.svg" alt="Suggest" class="lightbulb-icon" />';
    suggestButton.onclick = (e) => {
      e.stopPropagation();

      // Close any existing popups
      const existingPopup = document.querySelector(".suggestions-popup");
      if (existingPopup) {
        existingPopup.classList.remove("active");
        setTimeout(() => existingPopup.remove(), 300);
      }
      e.stopPropagation();
      const suggestions = vegetarianSuggestions;
      const randomIndex = getRandomIndex(suggestions.length);

      const popup = document.createElement("div");
      popup.className = "suggestions-popup";

      const suggestionsList = document.createElement("div");
      suggestionsList.className = "suggestions-list";

      // Create all items first
      const items = suggestions.map((suggestion, index) => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        if (index === randomIndex) {
          item.classList.add("highlighted");
        }
        item.textContent = suggestion;
        item.onclick = () => {
          const input = row.querySelector("input");
          input.value = suggestion;
          this.weekPlanner.updateDinner(weekIndex, dayIndex, suggestion);
          popup.remove();
        };
        return item;
      });

      // Append all items
      items.forEach((item) => suggestionsList.appendChild(item));

      // Scroll to highlighted item after appending
      requestAnimationFrame(() => {
        const highlightedItem = items[randomIndex];
        if (highlightedItem) {
          highlightedItem.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });

      popup.appendChild(suggestionsList);
      document.body.appendChild(popup);

      // Close when clicking outside
      const closePopup = (e) => {
        if (!popup.contains(e.target) && e.target !== suggestButton) {
          popup.classList.remove("active");
          setTimeout(() => {
            popup.remove();
            document.removeEventListener("click", closePopup);
          }, 300);
        }
      };

      // Position popup based on screen size
      const buttonRect = suggestButton.getBoundingClientRect();
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        popup.classList.add("mobile");
        popup.style.bottom = "0";
        popup.style.left = "0";
        popup.style.right = "0";
        popup.style.maxWidth = "100%";
      } else {
        popup.style.top = `${buttonRect.top}px`;
        popup.style.left = `${buttonRect.right - 200}px`;
      }

      // Delay adding click listener and active class
      requestAnimationFrame(() => {
        popup.classList.add("active");
        setTimeout(() => document.addEventListener("click", closePopup), 100);
      });
    };

    dayCell.appendChild(dayContent);

    const dinnerCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.value = dinner;
    input.placeholder = "Ange middagsplan";
    input.addEventListener("input", () => {
      this.weekPlanner.updateDinner(weekIndex, dayIndex, input.value);
    });

    dinnerCell.appendChild(input);
    row.appendChild(dayCell);
    row.appendChild(dinnerCell);
    row.appendChild(suggestCell);

    return row;
  }

  _addDragDropListeners(row) {
    row.addEventListener("dragstart", (e) =>
      this.dragDropManager.handleDragStart(e)
    );
    row.addEventListener("dragover", (e) =>
      this.dragDropManager.handleDragOver(e)
    );
    row.addEventListener("dragenter", (e) =>
      this.dragDropManager.handleDragEnter(e)
    );
    row.addEventListener("dragleave", (e) =>
      this.dragDropManager.handleDragLeave(e)
    );
    row.addEventListener("drop", (e) =>
      this.dragDropManager.handleDrop(e, window.vegetarianSuggestions)
    );
    row.addEventListener("dragend", (e) =>
      this.dragDropManager.handleDragEnd(e)
    );
  }
}
