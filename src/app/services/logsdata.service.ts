import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class LogsdataService {
    private objectsArray: any[] = []; // Pole, které bude obsahovat kombinované objekty z GPX a CSV dat

    // Funkce pro vytvoření nového pole objektů z GPX a CSV dat
    createObjectsArray(
        gpxData: string | ArrayBuffer | null,
        csvData: string | ArrayBuffer | null
    ): void {
        // Parsování GPX dat (údaje o mobilním telefonu)
        const pdData = this.parseGpxData(gpxData);
        // Parsování CSV dat (údaje o BTS)
        const btsData = this.parseCsvData(csvData);

        // Kombinování dat z obou souborů na základě časového klíče
        this.objectsArray = pdData.map((pd) => ({
            BTS: this.findClosestBts(pd.time, btsData), // Najdeme nejbližší BTS pro každé PD
            PD: pd, // Uchováme údaje o mobilním telefonu (PD)
        }));
    }

    // Funkce pro získání již vytvořeného pole objektů
    getObjectsArray(): any[] {
        return this.objectsArray;
    }

    // Pomocná funkce pro parsování GPX dat (data mobilního telefonu)
    parseGpxData(gpxData: string | ArrayBuffer | null): any[] {
        if (!gpxData) return []; // Pokud nejsou žádná GPX data, vracíme prázdné pole

        const parser = new DOMParser();
        // Parsování GPX dat do XML formátu
        const xmlDoc = parser.parseFromString(
            gpxData as string,
            "application/xml"
        );
        // Získání všech bodů z GPX souboru
        const trkpts = Array.from(xmlDoc.getElementsByTagName("trkpt"));

        // Převedení každého bodu na objekt s lat, lon a time
        return trkpts.map((trkpt) => ({
            lat: parseFloat(trkpt.getAttribute("lat")!),
            lon: parseFloat(trkpt.getAttribute("lon")!),
            time: new Date(trkpt.getElementsByTagName("time")[0].textContent!),
        }));
    }

    // Pomocná funkce pro parsování CSV dat (data BTS)
    parseCsvData(csvData: string | ArrayBuffer | null): any[] {
        if (!csvData) return []; // Pokud nejsou žádná CSV data, vracíme prázdné pole

        // Rozdělení CSV dat na jednotlivé řádky
        const csvLines = (csvData as string).split("\n");
        // Získání záhlaví CSV souboru a identifikace potřebných indexů sloupců (cell_id,lat,lon,measured_at,mnc,lac)
        const headers = csvLines[0].split(",").map((header) => header.trim());
        const indices = {
            cell_id: headers.indexOf("cell_id"),
            lat: headers.indexOf("lat"),
            lon: headers.indexOf("lon"),
            measured_at: headers.indexOf("measured_at"),
            mnc: headers.indexOf("mnc"),
            lac: headers.indexOf("lac"),
        };

        // Kontrola, zda všechny potřebné sloupce existují
        if (Object.values(indices).some((index) => index === -1)) {
            console.error("Chybí požadované sloupce v CSV souboru.");
            return [];
        }

        // Parsování každého řádku CSV souboru na objekt
        return csvLines
            .slice(1)
            .map((line) => {
                const values = line.split(",").map((value) => value.trim()); // Rozdělení řádku na hodnoty
                const parsedValues = {
                    cell_id: this.parseValue(values[indices.cell_id], parseInt), // Parsování cell_id
                    lat: this.parseValue(values[indices.lat], parseFloat), // Parsování lat
                    lon: this.parseValue(values[indices.lon], parseFloat), // Parsování lon
                    measured_at: this.parseValue(
                        values[indices.measured_at],
                        (val) => new Date(val.replace(/"/g, ""))
                    ), // Parsování času
                    mnc: this.parseValue(values[indices.mnc], parseInt), // Parsování MNC
                    lac: this.parseValue(values[indices.lac], parseInt), // Parsování LAC
                };

                // Pokud jsou všechny hodnoty platné, vracíme objekt; jinak null
                return Object.values(parsedValues).some((val) => val === null)
                    ? null
                    : parsedValues;
            })
            .filter((item) => item !== null); // Filtrujeme neplatné řádky
    }

    // Pomocná funkce pro parsování hodnoty z řádku CSV souboru
    parseValue(value: string, parseFn: (val: string) => any): any {
        return value ? parseFn(value) : null; // Pokud hodnota existuje, použije se parsovací funkce
    }

    // Funkce pro nalezení nejbližší BTS záznamu na základě času
    findClosestBts(time: Date, btsData: any[]): any {
        if (!time || !btsData.length) {
            console.error(
                "Neplatný vstup pro hledání nejbližšího BTS záznamu."
            );
            return null;
        }

        // Vyhledání BTS s nejbližším časem měření k danému času mobilního telefonu (PD)
        return btsData.reduce((closest, bts) => {
            if (bts && bts.measured_at) {
                const diff = Math.abs(
                    time.getTime() - bts.measured_at.getTime()
                ); // Vypočítáme rozdíl v čase
                return diff <
                    Math.abs(time.getTime() - closest.measured_at.getTime())
                    ? bts
                    : closest;
            }
            return closest;
        }, btsData[0]); // Začneme s prvním BTS záznamem jako výchozím
    }
}
