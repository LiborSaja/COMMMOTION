import { Component } from "@angular/core";

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

    // Zpracování výběru souboru
    onFileSelected(event: Event, fileType: "gpx" | "csv"): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] || null;

        if (fileType === "gpx") {
            this.gpxFile = file;
        } else if (fileType === "csv") {
            this.csvFile = file;
        }
    }

    // Načtení souboru jako Promise
    loadFile(file: File): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    // importování a zpracování dat z obou souborů
    async importFiles(): Promise<void> {
        if (this.gpxFile && this.csvFile) {
            this.errorMessage = "";
            try {
                const [gpxData, csvData] = await Promise.all([
                    this.loadFile(this.gpxFile),
                    this.loadFile(this.csvFile),
                ]);

                const newObjectsArray = this.createObjectsArray(
                    gpxData,
                    csvData
                );
                console.log("New Array of Objects:", newObjectsArray);
            } catch (error) {
                console.error("Chyba při načítání souborů:", error);
            }
        } else {
            this.errorMessage = "Je nutné vložit oba soubory.";
            console.error(this.errorMessage);
        }
    }

    // Funkce pro vytvoření nového pole objektů
    createObjectsArray(
        gpxData: string | ArrayBuffer | null,
        csvData: string | ArrayBuffer | null
    ): any[] {
        const pdData = this.parseGpxData(gpxData);
        const btsData = this.parseCsvData(csvData);

        return pdData.map((pd) => ({
            BTS: this.findClosestBts(pd.time, btsData),
            PD: pd,
        }));
    }

    // Pomocná funkce pro parsování GPX dat
    parseGpxData(gpxData: string | ArrayBuffer | null): any[] {
        if (!gpxData) return [];

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(
            gpxData as string,
            "application/xml"
        );
        const trkpts = Array.from(xmlDoc.getElementsByTagName("trkpt"));

        return trkpts.map((trkpt) => ({
            lat: parseFloat(trkpt.getAttribute("lat")!),
            lon: parseFloat(trkpt.getAttribute("lon")!),
            time: new Date(trkpt.getElementsByTagName("time")[0].textContent!),
        }));
    }

    // Pomocná funkce pro parsování CSV dat
    parseCsvData(csvData: string | ArrayBuffer | null): any[] {
        if (!csvData) return [];

        const csvLines = (csvData as string).split("\n");
        const headers = csvLines[0].split(",").map((header) => header.trim());
        const indices = {
            cell_id: headers.indexOf("cell_id"),
            lat: headers.indexOf("lat"),
            lon: headers.indexOf("lon"),
            measured_at: headers.indexOf("measured_at"),
            mnc: headers.indexOf("mnc"),
            lac: headers.indexOf("lac"),
        };

        // Kontrola, zda všechny požadované sloupce existují
        if (Object.values(indices).some((index) => index === -1)) {
            console.error("Chybí požadované sloupce v CSV souboru.");
            return [];
        }

        return csvLines
            .slice(1)
            .map((line) => {
                const values = line.split(",").map((value) => value.trim());
                const parsedValues = {
                    cell_id: this.parseValue(values[indices.cell_id], parseInt),
                    lat: this.parseValue(values[indices.lat], parseFloat),
                    lon: this.parseValue(values[indices.lon], parseFloat),
                    measured_at: this.parseValue(
                        values[indices.measured_at],
                        (val) => new Date(val.replace(/"/g, ""))
                    ),
                    mnc: this.parseValue(values[indices.mnc], parseInt),
                    lac: this.parseValue(values[indices.lac], parseInt),
                };

                return Object.values(parsedValues).some((val) => val === null)
                    ? null
                    : parsedValues;
            })
            .filter((item) => item !== null);
    }

    // Obecná funkce pro zpracování hodnot
    parseValue(value: string, parseFn: (val: string) => any): any {
        return value ? parseFn(value) : null;
    }

    // Pomocná funkce pro nalezení nejbližšího BTS záznamu podle času
    findClosestBts(time: Date, btsData: any[]): any {
        if (!time || !btsData.length) {
            console.error(
                "Neplatný vstup pro hledání nejbližšího BTS záznamu."
            );
            return null;
        }

        return btsData.reduce((closest, bts) => {
            if (bts && bts.measured_at) {
                const diff = Math.abs(
                    time.getTime() - bts.measured_at.getTime()
                );
                return diff <
                    Math.abs(time.getTime() - closest.measured_at.getTime())
                    ? bts
                    : closest;
            }
            return closest;
        }, btsData[0]);
    }
}
