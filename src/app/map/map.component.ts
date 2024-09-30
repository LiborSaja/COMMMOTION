import { Component, OnInit } from "@angular/core";
import { ImportMapComponent } from "./import-map/import-map.component";
import { AllObjectsViewerComponent } from "./all-objects-viewer/all-objects-viewer.component";
import { RouterModule } from "@angular/router";
import { LoglistComponent } from "./loglist/loglist.component";
import { OneObjectViewerComponent } from "./one-object-viewer/one-object-viewer.component";
import { MapdataService } from "../services/mapdata.service";
import { LogsdataService } from "../services/logsdata.service";

@Component({
    selector: "app-map",
    standalone: true,
    imports: [
        ImportMapComponent,
        AllObjectsViewerComponent,
        RouterModule,
        LoglistComponent,
        OneObjectViewerComponent,
    ],
    templateUrl: "./map.component.html",
    styleUrl: "./map.component.css",
})
export class MapComponent implements OnInit {
    showBTS: boolean = true; //Pro checkboxy - zobrazení bodů na mapě ano/ne
    showPD: boolean = true;

    constructor(
        private mapDataService: MapdataService,
        private logsDataService: LogsdataService
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

    // Vykreslení logů na mapě na základě aktuálního stavu checkboxů
    renderLogs(logs: any[]): void {
        this.mapDataService.clearPoints(); // Vyčištění mapy před novým vykreslením bodů

        logs.forEach((log) => {
            const { BTS, PD } = log;

            // Přidání BTS bodu na mapu, pokud je checkbox aktivní
            if (this.showBTS) {
                const btsMarker = this.mapDataService.addPoint(
                    BTS.lat,
                    BTS.lon,
                    "BTS"
                );
                // K markeru BTS přidáno data BTS i PD, aby při kliknutí byly zobrazeny data obou
                (btsMarker as any).associatedData = { BTS, PD };
                // Při kliknutí na BTS marker dojde ke zvýraznění a zobrazení informací
                btsMarker.on("click", () =>
                    this.mapDataService.highlightPoint(btsMarker)
                );
            }

            // Přidání PD bodu na mapu, pokud je checkbox aktivní
            if (this.showPD) {
                const pdMarker = this.mapDataService.addPoint(
                    PD.lat,
                    PD.lon,
                    "PD"
                );
                // K markeru PD přidáno data BTS i PD, aby při kliknutí byly zobrazeny data obou
                (pdMarker as any).associatedData = { BTS, PD };
                // Při kliknutí na PD marker dojde ke zvýraznění a zobrazení informací
                pdMarker.on("click", () =>
                    this.mapDataService.highlightPoint(pdMarker)
                );
            }

            // Přidání přímky mezi BTS a PD, pokud jsou oba body viditelné
            if (this.showBTS && this.showPD) {
                this.mapDataService.addConnectionLine(
                    BTS.lat,
                    BTS.lon,
                    PD.lat,
                    PD.lon
                );
            }
        });
        // Přizpůsobení mapy všem bodům
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
}
