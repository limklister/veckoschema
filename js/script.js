// Global state
let weeks = [];
const daysOfWeek = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
let draggedElement = null;

// Meal suggestions
const vegetarianSuggestions = [
    "Tofustroganoff", "Morotssoppa", "linsgryta med matvete", 
    "Pastasallad med pesto och kikärtor", "hamburgare", 
    "Klyftpotatis + bön/tofubiffar", "Sojafärssås M spagetti",
    "Broccolisoppa/ pasta m broccoli/spenat/grönkålssås",
    "Chili sin carne", "Potatis och sojabollar", "one-pot pasta",
    "Pizza", "tofubowl", "Lasagne", "Potatissoppa m lök/purjolök",
    "pasta svamp ärtor havregrädde + (quorn)", "thaicurry m ris",
    "Spagetti och linsragu bolognese", "Tacos",
    "Risotto med svamp och zuccini",
    "Rotfrukter i ugn med fetaost och bönsallad",
    "Grönsakslasagne", "Vegetarisk chili",
    "Quinoasallad med rostade grönsaker",
    "Linsgryta med kokosmjölk", "Vegetariska biffar med sötpotatis",
    "Svamprisotto", "Grönsakscurry med ris",
    "Falafel med hummus och pitabröd", "Vegetarisk pastagratäng",
    "Vegetarisk pizza med grillad paprika",
    "Vegetarisk sushi med avokado", "Grönsakswok med tofu",
    "Vegetarisk shepherd's pie", "Stuffade paprikor med quinoa",
    "Vegetarisk tacos med svarta bönor", "Kikärtsbiffar med tzatziki",
    "Vegetarisk lasagne med spenat och ricotta",
    "Grönsakssoppa med linser", "Auberginegratäng med tomatsås",
    "Vegetarisk moussaka", "Grönsakspaj med fetaost",
    "Broccolipasta med vitlök och chili", "Vegetariska vårrullar",
    "Halloumiburgare med grillad ananas", "Vegetarisk paella",
    "Spenatpannkakor med svamp", "Vegetarisk bibimbap",
    "Grönsakstempura med dippsås",
    "Vegetarisk bolognese med zucchininudlar", "Vegetarisk sushi bowl"
];

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
    renderSuggestions();
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
            <button class="delete-week" onclick="deleteWeek(${weekIndex})">Ta bort vecka</button>
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
document.addEventListener("DOMContentLoaded", loadData);