class DragDropManager {
    constructor(weekPlanner) {
        this.weekPlanner = weekPlanner;
        this.draggedElement = null;
    }

    handleDragStart(e, suggestionData = null) {
        this.draggedElement = e.target;
        
        const data = suggestionData ? {
            type: 'suggestion',
            index: suggestionData.index
        } : {
            type: 'plannerItem',
            weekIndex: e.target.getAttribute('data-week-index'),
            dayIndex: e.target.getAttribute('data-day-index')
        };

        e.dataTransfer.setData('text/plain', JSON.stringify(data));
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        const row = e.target.closest('tr');
        if (row && row !== this.draggedElement) {
            row.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const row = e.target.closest('tr');
        if (row) {
            row.classList.remove('drag-over');
        }
    }

    handleDrop(e, suggestions) {
        e.preventDefault();
        const targetRow = e.target.closest('tr');
        if (!targetRow) return;

        targetRow.classList.remove('drag-over');
        if (targetRow === this.draggedElement) return;

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const targetWeekIndex = parseInt(targetRow.getAttribute('data-week-index'));
            const targetDayIndex = parseInt(targetRow.getAttribute('data-day-index'));

            if (data.type === 'suggestion') {
                const suggestion = suggestions[data.index];
                this.weekPlanner.updateDinner(targetWeekIndex, targetDayIndex, suggestion);
            } else if (data.type === 'plannerItem') {
                const sourceWeekIndex = parseInt(data.weekIndex);
                const sourceDayIndex = parseInt(data.dayIndex);
                this.weekPlanner.swapDinners(sourceWeekIndex, sourceDayIndex, targetWeekIndex, targetDayIndex);
            }
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
    }
}