// Global state
let weeks = [];
const daysOfWeek = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
let draggedElement = null;

// Global state variables

// Storage functions
function loadData() {
    const storedData = localStorage.getItem("dinnerPlanner");
    if (storedData) {
        weeks = JSON.parse(storedData);
    }
    if (weeks.length === 0) {
        addWeek();
    }
    renderPlanner();
}

function saveData() {
    localStorage.setItem("dinnerPlanner", JSON.stringify(weeks));
}

// Week management
function addWeek() {
    weeks.push(daysOfWeek.map(() => ""));
    renderPlanner();
    saveData();
}

function deleteWeek(weekIndex) {
    if (weeks.length > 1) {
        weeks.splice(weekIndex, 1);
        saveData();
        renderPlanner();
    } else {
        alert("Du måste ha minst en vecka i planeringen.");
    }
}

function updateDinner(weekIndex, dayIndex, dinner) {
    weeks[weekIndex][dayIndex] = dinner;
    saveData();
}

// Rendering functions
function renderPlanner() {
    const plannerDiv = document.getElementById("planner");
    plannerDiv.innerHTML = "";

    const currentDate = new Date();
    const currentDayIndex = (currentDate.getDay() + 6) % 7;
    const currentWeekIndex = Math.floor(weeks.length * (currentDayIndex / 7)) % weeks.length;

    weeks.forEach((week, weekIndex) => {
        const weekHeaderDiv = document.createElement("div");
        weekHeaderDiv.className = "week-header";
        weekHeaderDiv.innerHTML = `
            <span>Vecka ${weekIndex + 1}</span>
            ${weekIndex > 0 ? `<button class="delete-week" onclick="deleteWeek(${weekIndex})">Ta bort vecka</button>` : ''}
        `;
        plannerDiv.appendChild(weekHeaderDiv);

        const table = document.createElement("table");
        table.className = "fade-in";

        week.forEach((dinner, dayIndex) => {
            const row = table.insertRow();
            row.draggable = true;
            row.classList.add("draggable");
            row.setAttribute("data-week-index", weekIndex);
            row.setAttribute("data-day-index", dayIndex);

            const dayCell = row.insertCell();
            const dinnerCell = row.insertCell();

            dayCell.textContent = daysOfWeek[dayIndex];
            const input = document.createElement("input");
            input.type = "text";
            input.value = dinner;
            input.placeholder = "Ange middagsplan";
            input.oninput = () => updateDinner(weekIndex, dayIndex, input.value);
            dinnerCell.appendChild(input);

            if (weekIndex === currentWeekIndex && dayIndex === currentDayIndex) {
                row.classList.add("current-day");
            }

            // Add drag and drop event listeners
            row.addEventListener("dragstart", dragStart);
            row.addEventListener("dragover", dragOver);
            row.addEventListener("dragenter", dragEnter);
            row.addEventListener("dragleave", dragLeave);
            row.addEventListener("drop", drop);
            row.addEventListener("dragend", dragEnd);
        });

        plannerDiv.appendChild(table);
    });
}

function renderSuggestions() {
    const suggestionsDiv = document.getElementById("suggestionsList");
    suggestionsDiv.innerHTML = "";
    
    vegetarianSuggestions.forEach((suggestion, index) => {
        const suggestionElement = document.createElement("div");
        suggestionElement.className = "suggestion";
        suggestionElement.textContent = suggestion;
        suggestionElement.draggable = true;
        suggestionElement.setAttribute("data-suggestion-index", index);
        suggestionElement.addEventListener("dragstart", dragStartSuggestion);
        suggestionsDiv.appendChild(suggestionElement);
    });
}

// Drag and drop handlers
function dragStartSuggestion(e) {
    draggedElement = e.target;
    e.dataTransfer.setData("text/plain", JSON.stringify({
        type: "suggestion",
        index: e.target.getAttribute("data-suggestion-index")
    }));
    setTimeout(() => e.target.classList.add("dragging"), 0);
}

function dragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.setData("text/plain", JSON.stringify({
        type: "plannerItem",
        weekIndex: e.target.getAttribute("data-week-index"),
        dayIndex: e.target.getAttribute("data-day-index")
    }));
    setTimeout(() => e.target.classList.add("dragging"), 0);
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    if (e.target.closest("tr") !== draggedElement) {
        e.target.closest("tr").classList.add("drag-over");
    }
}

function dragLeave(e) {
    e.target.closest("tr").classList.remove("drag-over");
}

function drop(e) {
    e.preventDefault();
    const targetRow = e.target.closest("tr");
    targetRow.classList.remove("drag-over");

    if (targetRow === draggedElement) return;

    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const targetWeekIndex = parseInt(targetRow.getAttribute("data-week-index"));
    const targetDayIndex = parseInt(targetRow.getAttribute("data-day-index"));

    if (data.type === "suggestion") {
        const suggestion = vegetarianSuggestions[data.index];
        weeks[targetWeekIndex][targetDayIndex] = suggestion;
        updateRow(targetWeekIndex, targetDayIndex);
    } else if (data.type === "plannerItem") {
        const draggedWeekIndex = parseInt(data.weekIndex);
        const draggedDayIndex = parseInt(data.dayIndex);

        if (draggedWeekIndex !== targetWeekIndex || draggedDayIndex !== targetDayIndex) {
            const tempDinner = weeks[draggedWeekIndex][draggedDayIndex];
            weeks[draggedWeekIndex][draggedDayIndex] = weeks[targetWeekIndex][targetDayIndex];
            weeks[targetWeekIndex][targetDayIndex] = tempDinner;

            updateRow(draggedWeekIndex, draggedDayIndex);
            updateRow(targetWeekIndex, targetDayIndex);
        }
    }
    saveData();
}

function dragEnd(e) {
    e.target.classList.remove("dragging");
    draggedElement = null;
}

function updateRow(weekIndex, dayIndex) {
    const row = document.querySelector(`tr[data-week-index="${weekIndex}"][data-day-index="${dayIndex}"]`);
    const input = row.querySelector("input");
    input.value = weeks[weekIndex][dayIndex];
}

// CSV Import/Export
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += daysOfWeek.join(",") + "\n";

    weeks.forEach((week) => {
        csvContent += week.map((dinner) => `"${dinner.replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "middagsplanering.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importFromCSV(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split("\n");
        weeks = lines
            .slice(1)
            .map(line => line.split(",").map(cell => 
                cell.trim()
                    .replace(/^"(.*)"$/, "$1")
                    .replace(/""/g, '"')
            ))
            .filter(week => week.length === 7 && week.some(day => day !== ""));
        saveData();
        renderPlanner();
    };
    reader.readAsText(file);
}

// Initialize application
function encodeWeeksToUrl() {
    const encoded = encodeURIComponent(btoa(weeks.map(week => 
        week.map(day => day || '_').join(',')
    ).join('|')));
    return `${window.location.origin}${window.location.pathname}?w=${encoded}`;
}

function decodeUrlToWeeks(encoded) {
    try {
        const decoded = atob(decodeURIComponent(encoded));
        return decoded.split('|').map(week => 
            week.split(',').map(day => day === '_' ? '' : day)
        );
    } catch (e) {
        console.error('Failed to decode URL:', e);
        return null;
    }
}

function shareSchedule() {
    const url = encodeWeeksToUrl();
    navigator.clipboard.writeText(url).then(() => {
        alert('Länk kopierad till urklipp!');
    }).catch(err => {
        console.error('Failed to copy URL:', err);
        prompt('Kopiera denna länk:', url);
    });
}

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('w');
    
    if (encodedData) {
        const decodedWeeks = decodeUrlToWeeks(encodedData);
        if (decodedWeeks) {
            weeks = decodedWeeks;
            saveData();
            renderPlanner();
        }
    } else {
        loadData();
    }
    
    renderSuggestions();
}

document.addEventListener("DOMContentLoaded", init);