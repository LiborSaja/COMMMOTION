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
    // Proměnné pro soubory GPX a CSV
    gpxFile: File | null = null;
    csvFile: File | null = null;
    errorMessage: string = "";

    constructor(
        private logsDataService: LogsdataService, // Injektování služby pro práci s daty logů
        private router: Router // Injektování routeru pro přesměrování mezi stránkami
    ) {}

    //Handler pro výběr souboru (GPX nebo CSV)
    //Ukládá vybraný soubor do proměnných `gpxFile` nebo `csvFile`
    onFileSelected(event: Event, fileType: "gpx" | "csv"): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] || null;

        // Ukládání GPX nebo CSV souboru podle typu
        if (fileType === "gpx") {
            this.gpxFile = file;
        } else if (fileType === "csv") {
            this.csvFile = file;
        }
    }

    //Metoda pro import souborů (GPX a CSV)
    //Zpracovává oba soubory, vytváří pole objektů a po úspěšném importu přesměrovává na MapComponent
    async importFiles(): Promise<void> {
        if (this.gpxFile && this.csvFile) {
            this.errorMessage = ""; // Vymazání chybové zprávy

            try {
                // Současné načtení obou souborů GPX a CSV
                const [gpxData, csvData] = await Promise.all([
                    this.loadFile(this.gpxFile),
                    this.loadFile(this.csvFile),
                ]);

                // Vytvoření nového pole objektů z dat logů
                this.logsDataService.createObjectsArray(gpxData, csvData);
                console.log(
                    "New Array of Objects:",
                    this.logsDataService.getObjectsArray()
                );

                // Přesměrování na komponentu MapComponent
                this.router.navigate(["/map"]);
            } catch (error) {
                console.error("Chyba při načítání souborů:", error);
            }
        } else {
            // Pokud nejsou oba soubory vloženy, zobrazí chybovou zprávu
            this.errorMessage = "Je nutné vložit oba soubory.";
            console.error(this.errorMessage);
        }
    }

    //Metoda pro načtení obsahu souboru
    //Používá FileReader k načtení obsahu jako text
    //Vrací Promise s obsahem souboru (string | ArrayBuffer)
    loadFile(file: File): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            // Načítání úspěšné - vrátí výsledek
            reader.onload = () => resolve(reader.result);

            // Při chybě - vrátí chybu
            reader.onerror = () => reject(reader.error);

            // Načítání souboru jako text
            reader.readAsText(file);
        });
    }
}
