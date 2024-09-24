import { Component } from "@angular/core";
import { LogsdataService } from "../services/logsdata.service";
import { Router } from "@angular/router";

@Component({
    selector: "app-log-viewer",
    standalone: true,
    imports: [],
    templateUrl: "./log-viewer.component.html",
    styleUrl: "./log-viewer.component.css",
})
export class LogViewerComponent {
    gpxFile: File | null = null;
    csvFile: File | null = null;
    errorMessage: string = "";

    constructor(
        private logsDataService: LogsdataService,
        private router: Router
    ) {}

    onFileSelected(event: Event, fileType: "gpx" | "csv"): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] || null;

        if (fileType === "gpx") {
            this.gpxFile = file;
        } else if (fileType === "csv") {
            this.csvFile = file;
        }
    }

    async importFiles(): Promise<void> {
        if (this.gpxFile && this.csvFile) {
            this.errorMessage = "";
            try {
                const [gpxData, csvData] = await Promise.all([
                    this.loadFile(this.gpxFile),
                    this.loadFile(this.csvFile),
                ]);

                this.logsDataService.createObjectsArray(gpxData, csvData);
                console.log(
                    "New Array of Objects:",
                    this.logsDataService.getObjectsArray()
                );

                // Přesměrování do MapComponent po importu souborů
                this.router.navigate(["/map"]);
            } catch (error) {
                console.error("Chyba při načítání souborů:", error);
            }
        } else {
            this.errorMessage = "Je nutné vložit oba soubory.";
            console.error(this.errorMessage);
        }
    }

    loadFile(file: File): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
}
