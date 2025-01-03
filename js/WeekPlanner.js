class WeekPlanner {
    constructor() {
        this.weeks = [];
        this.daysOfWeek = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
        this.onStateChange = null;
    }

    init(onStateChange) {
        this.onStateChange = onStateChange;
    }

    getCurrentDayInfo() {
        const currentDate = new Date();
        const currentDayIndex = (currentDate.getDay() + 6) % 7;
        const currentWeekIndex = Math.floor(this.weeks.length * (currentDayIndex / 7)) % this.weeks.length;
        return { currentDayIndex, currentWeekIndex };
    }

    addWeek() {
        this.weeks.push(this.daysOfWeek.map(() => ""));
        this._notifyStateChange();
        return this.weeks.length - 1;
    }

    deleteWeek(weekIndex) {
        if (this.weeks.length <= 1) {
            throw new Error("Cannot delete the last week");
        }
        this.weeks.splice(weekIndex, 1);
        this._notifyStateChange();
    }

    updateDinner(weekIndex, dayIndex, dinner) {
        if (!this.weeks[weekIndex]) {
            throw new Error(`Invalid week index: ${weekIndex}`);
        }
        this.weeks[weekIndex][dayIndex] = dinner;
        this._notifyStateChange();
    }

    swapDinners(sourceWeek, sourceDay, targetWeek, targetDay) {
        const temp = this.weeks[sourceWeek][sourceDay];
        this.weeks[sourceWeek][sourceDay] = this.weeks[targetWeek][targetDay];
        this.weeks[targetWeek][targetDay] = temp;
        this._notifyStateChange();
    }

    getState() {
        return {
            weeks: [...this.weeks],
            daysOfWeek: [...this.daysOfWeek]
        };
    }

    setState(weeks) {
        this.weeks = weeks;
        this._notifyStateChange();
    }

    _notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
        }
    }
}