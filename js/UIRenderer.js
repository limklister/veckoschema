class UIRenderer {
    constructor(weekPlanner, dragDropManager) {
        this.weekPlanner = weekPlanner;
        this.dragDropManager = dragDropManager;
        this.plannerElement = document.getElementById('planner');
        this.suggestionsElement = document.getElementById('suggestionsList');
    }

    renderPlanner() {
        const { weeks, daysOfWeek } = this.weekPlanner.getState();
        const { currentDayIndex, currentWeekIndex } = this.weekPlanner.getCurrentDayInfo();
        
        this.plannerElement.innerHTML = '';

        weeks.forEach((week, weekIndex) => {
            this._renderWeekHeader(weekIndex);
            this._renderWeekTable(week, weekIndex, currentDayIndex, currentWeekIndex);
        });
    }

    renderSuggestions(suggestions) {
        this.suggestionsElement.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const element = document.createElement('div');
            element.className = 'suggestion';
            element.textContent = suggestion;
            element.draggable = true;
            element.setAttribute('data-suggestion-index', index);
            
            element.addEventListener('dragstart', (e) => 
                this.dragDropManager.handleDragStart(e, { index })
            );
            
            this.suggestionsElement.appendChild(element);
        });
    }

    _renderWeekHeader(weekIndex) {
        const weekHeaderDiv = document.createElement('div');
        weekHeaderDiv.className = 'week-header';
        weekHeaderDiv.innerHTML = `
            <span>Vecka ${weekIndex + 1}</span>
            ${weekIndex > 0 ? `<button class="delete-week" onclick="handleDeleteWeek(${weekIndex})">Ta bort vecka</button>` : ''}
        `;
        this.plannerElement.appendChild(weekHeaderDiv);
    }

    _renderWeekTable(week, weekIndex, currentDayIndex, currentWeekIndex) {
        const { daysOfWeek } = this.weekPlanner.getState();
        const table = document.createElement('table');
        table.className = 'fade-in';

        week.forEach((dinner, dayIndex) => {
            const row = this._createTableRow(dinner, weekIndex, dayIndex, daysOfWeek);
            
            if (weekIndex === currentWeekIndex && dayIndex === currentDayIndex) {
                row.classList.add('current-day');
            }

            this._addDragDropListeners(row);
            table.appendChild(row);
        });

        this.plannerElement.appendChild(table);
    }

    _createTableRow(dinner, weekIndex, dayIndex, daysOfWeek) {
        const row = document.createElement('tr');
        row.draggable = true;
        row.classList.add('draggable');
        row.setAttribute('data-week-index', weekIndex);
        row.setAttribute('data-day-index', dayIndex);

        const dayCell = document.createElement('td');
        dayCell.textContent = daysOfWeek[dayIndex];
        
        const dinnerCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = dinner;
        input.placeholder = 'Ange middagsplan';
        input.addEventListener('input', () => {
            this.weekPlanner.updateDinner(weekIndex, dayIndex, input.value);
        });
        
        dinnerCell.appendChild(input);
        row.appendChild(dayCell);
        row.appendChild(dinnerCell);
        
        return row;
    }

    _addDragDropListeners(row) {
        row.addEventListener('dragstart', (e) => this.dragDropManager.handleDragStart(e));
        row.addEventListener('dragover', (e) => this.dragDropManager.handleDragOver(e));
        row.addEventListener('dragenter', (e) => this.dragDropManager.handleDragEnter(e));
        row.addEventListener('dragleave', (e) => this.dragDropManager.handleDragLeave(e));
        row.addEventListener('drop', (e) => this.dragDropManager.handleDrop(e, window.vegetarianSuggestions));
        row.addEventListener('dragend', (e) => this.dragDropManager.handleDragEnd(e));
    }
}