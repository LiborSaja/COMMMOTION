import { Component, OnInit } from "@angular/core";
import { ImportMapComponent } from "./import-map/import-map.component";
import { AllObjectsViewerComponent } from "./all-objects-viewer/all-objects-viewer.component";
import { RouterModule } from "@angular/router";
import { LoglistComponent } from "./loglist/loglist.component";
import { OneObjectViewerComponent } from "./one-object-viewer/one-object-viewer.component";
import { MapdataService } from "../services/mapdata.service";
import { LogsdataService } from "../services/logsdata.service";
import { DblogsService } from "../services/dblogs.service";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-map",
    standalone: true,
    imports: [
        ImportMapComponent,
        AllObjectsViewerComponent,
        RouterModule,
        LoglistComponent,
        OneObjectViewerComponent,
        FormsModule,
        CommonModule,
    ],
    templateUrl: "./map.component.html",
    styleUrl: "./map.component.css",
    providers: [HttpClient],
})
export class MapComponent implements OnInit {
    showBTS: boolean = true; //Pro checkboxy - zobrazení bodů na mapě ano/ne
    showPD: boolean = true;
    logName: string = "";
    isInvalid: boolean = false;
    validationMessage: string = "";

    constructor(
        private mapDataService: MapdataService,
        private logsDataService: LogsdataService,
        private dblogsService: DblogsService
    ) {}

    // Inicializace komponenty
    ngOnInit(): void {
        // Inicializace mapy na výchozí pozici (Ostrava) a zoomem
        const map = this.mapDataService.initializeMap(
            "map",
            [49.824473, 18.256109],
            12
        );
        // Načítání dat z logsdata.service a vykreslení bodů na mapě
        const logs = this.logsDataService.getObjectsArray();
        this.renderLogs(logs);

        // Naslouchání na výběr objektu z mapy, aby se přepnula záložka
        this.mapDataService.selectedObject$.subscribe(() => {
            this.switchToObjectInfoTab(); // Přepnutí záložky při výběru objektu
        });
    }

    // Přepínání zobrazení BTS bodů pomocí checkboxu
    toggleBTS(): void {
        this.showBTS = !this.showBTS; // Přepínání stavu BTS bodů
        this.renderLogs(this.logsDataService.getObjectsArray()); // Znovu vykreslit body podle stavu
    }

    // Přepínání zobrazení PD bodů pomocí checkboxu
    togglePD(): void {
        this.showPD = !this.showPD; // Přepínání stavu PD bodů
        this.renderLogs(this.logsDataService.getObjectsArray()); // Znovu vykreslit body podle stavu
    }

    renderLogs(logs: any[]): void {
        this.mapDataService.clearPoints(); // Vyčištění mapy před novým vykreslením bodů

        logs.forEach((log) => {
            const { BTS, PD } = log;

            // Zkontrolujte, zda jsou platné souřadnice BTS a přidání BTS bodu na mapu
            if (this.showBTS && BTS?.lat && BTS?.lon) {
                const btsMarker = this.mapDataService.addPoint(
                    BTS.lat,
                    BTS.lon,
                    "BTS"
                );

                if (btsMarker) {
                    (btsMarker as any).associatedData = { BTS, PD };
                    btsMarker.on("click", () =>
                        this.mapDataService.highlightPoint(btsMarker)
                    );
                }
            }

            // Zkontrolujte, zda jsou platné souřadnice PD a přidání PD bodu na mapu
            if (this.showPD && PD?.lat && PD?.lon) {
                const pdMarker = this.mapDataService.addPoint(
                    PD.lat,
                    PD.lon,
                    "PD"
                );

                if (pdMarker) {
                    (pdMarker as any).associatedData = { BTS, PD };
                    pdMarker.on("click", () =>
                        this.mapDataService.highlightPoint(pdMarker)
                    );
                }
            }

            // Přidání přímky mezi BTS a PD, pokud jsou oba body viditelné a platné
            if (
                this.showBTS &&
                this.showPD &&
                BTS?.lat &&
                BTS?.lon &&
                PD?.lat &&
                PD?.lon
            ) {
                this.mapDataService.addConnectionLine(
                    BTS.lat,
                    BTS.lon,
                    PD.lat,
                    PD.lon
                );
            }
        });

        // Přizpůsobení mapy, pokud jsou platné body
        this.mapDataService.fitToBounds();
    }

    // Přepnutí na záložku s informacemi o objektu po kliknutí na marker
    switchToObjectInfoTab(): void {
        const logTab = document.getElementById("loglist-tab");
        const importedLogTab = document.getElementById("importedlog-tab");
        const objectInfoTab = document.getElementById("objectinfo-tab");

        const logPane = document.getElementById("loglist");
        const importedLogPane = document.getElementById("importedlog");
        const objectInfoPane = document.getElementById("objectinfo");

        if (objectInfoTab && objectInfoPane) {
            // Aktivování záložky Data vybraného objektu
            objectInfoTab.classList.add("active");
            objectInfoTab.setAttribute("aria-selected", "true");
            objectInfoPane.classList.add("show", "active");

            // Deaktivování ostatních záložek
            if (logTab && logPane) {
                logTab.classList.remove("active");
                logTab.setAttribute("aria-selected", "false");
                logPane.classList.remove("show", "active");
            }

            if (importedLogTab && importedLogPane) {
                importedLogTab.classList.remove("active");
                importedLogTab.setAttribute("aria-selected", "false");
                importedLogPane.classList.remove("show", "active");
            }
        }
    }

    // Uložit aktuálně vytvořený log do databáze
    saveLogToDatabase(): void {
        const logsArray = this.logsDataService.getObjectsArray();

        // Ověření, zda je zadán název logu
        if (!this.logName || this.logName.trim() === "") {
            this.isInvalid = true;
            this.validationMessage = "Název logu je povinný.";
            return;
        }

        // Ověření, zda bylo něco importováno
        if (!logsArray || logsArray.length === 0) {
            this.isInvalid = true;
            this.validationMessage =
                "Nelze uložit log bez importovaných dat. Nejprve importujte soubory.";
            return;
        }

        // Pokud jsou všechna data v pořádku, resetujeme chybový stav
        this.isInvalid = false;
        this.validationMessage = ""; // Vymazání zprávy o chybě

        const logEntry = {
            name: this.logName,
            records: logsArray.map((log) => ({
                CellId: log.BTS.cell_id,
                Lac: log.BTS.lac,
                BtsLat: log.BTS.lat,
                BtsLon: log.BTS.lon,
                MeasuredAt: log.BTS.measured_at,
                Mnc: log.BTS.mnc,
                PdLat: log.PD.lat,
                PdLon: log.PD.lon,
                PdTime: log.PD.time,
            })),
        };

        console.log("Sending log entry:", logEntry);

        this.dblogsService.createLog(logEntry).subscribe({
            next: (response) =>
                console.log("Log byl úspěšně uložen!", response),
            error: (error) =>
                console.error("Došlo k chybě při ukládání logu:", error),
        });
    }

    // Funkce pro načtení a zobrazení logu na mapě z databáze
    displayLog(logData: any): void {
        this.mapDataService.clearPoints(); // Vyčistit mapu

        logData.records.forEach((logRecord: any) => {
            // Přidáme BTS bod na mapu, pokud je checkbox aktivní
            let btsMarker: any;
            if (this.showBTS && logRecord.btsLat && logRecord.btsLon) {
                btsMarker = this.mapDataService.addPoint(
                    logRecord.btsLat,
                    logRecord.btsLon,
                    "BTS"
                );
                (btsMarker as any).associatedData = logRecord; // Přidáme data BTS i PD
                btsMarker.on("click", () =>
                    this.mapDataService.highlightPoint(btsMarker)
                );
            }

            // Přidáme PD bod na mapu, pokud je checkbox aktivní
            let pdMarker: any;
            if (this.showPD && logRecord.pdLat && logRecord.pdLon) {
                pdMarker = this.mapDataService.addPoint(
                    logRecord.pdLat,
                    logRecord.pdLon,
                    "PD"
                );
                (pdMarker as any).associatedData = logRecord; // Přidáme data BTS i PD
                pdMarker.on("click", () =>
                    this.mapDataService.highlightPoint(pdMarker)
                );
            }

            // Vykreslení černé čáry mezi BTS a PD, pokud jsou oba body viditelné
            if (
                this.showBTS &&
                this.showPD &&
                logRecord.btsLat &&
                logRecord.btsLon &&
                logRecord.pdLat &&
                logRecord.pdLon
            ) {
                this.mapDataService.addConnectionLine(
                    logRecord.btsLat,
                    logRecord.btsLon,
                    logRecord.pdLat,
                    logRecord.pdLon
                );
            }
        });

        // Přizpůsobení mapy, pokud existují body
        this.mapDataService.fitToBounds();
    }

    displayImportedLog(): void {
        const importedLogs = this.logsDataService.getObjectsArray(); // Předpokládám, že už máte data načtená
        this.renderLogs(importedLogs); // Zobrazí body na mapě
    }
    
}
