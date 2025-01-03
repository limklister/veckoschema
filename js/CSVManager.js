class CSVManager {
    constructor(weekPlanner) {
        this.weekPlanner = weekPlanner;
    }

    exportToCSV() {
        try {
            const { weeks, daysOfWeek } = this.weekPlanner.getState();
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
        } catch (error) {
            console.error('Failed to export CSV:', error);
            throw new Error('Failed to export schedule to CSV');
        }
    }

    importFromCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const lines = content.split("\n");
                    const weeks = lines
                        .slice(1)
                        .map(line => line.split(",").map(cell => 
                            cell.trim()
                                .replace(/^"(.*)"$/, "$1")
                                .replace(/""/g, '"')
                        ))
                        .filter(week => week.length === 7 && week.some(day => day !== ""));
                    
                    this.weekPlanner.setState(weeks);
                    resolve(weeks);
                } catch (error) {
                    reject(new Error('Failed to parse CSV file'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read CSV file'));
            reader.readAsText(file);
        });
    }
}