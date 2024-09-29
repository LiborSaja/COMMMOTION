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
    showBTS: boolean = true;
    showPD: boolean = true;

    constructor(
        private mapDataService: MapdataService,
        private logsDataService: LogsdataService
    ) {}

    ngOnInit(): void {
        const map = this.mapDataService.initializeMap(
            "map",
            [49.824473, 18.256109],
            12
        );

        // Načítání dat z logsdata.service
        const logs = this.logsDataService.getObjectsArray();
        this.renderLogs(logs);

        // Naslouchání na kliknutí markerů z MapDataService
        this.mapDataService.selectedObject$.subscribe(() => {
            this.switchToObjectInfoTab(); // Přepnutí záložky při výběru objektu
        });
    }

    // Přepínače pro zobrazení bodů
    toggleBTS(): void {
        this.showBTS = !this.showBTS;
        this.renderLogs(this.logsDataService.getObjectsArray());
    }

    togglePD(): void {
        this.showPD = !this.showPD;
        this.renderLogs(this.logsDataService.getObjectsArray());
    }

    // Zobrazení bodů na mapě podle stavu checkboxů
    renderLogs(logs: any[]): void {
        this.mapDataService.clearPoints();

        logs.forEach((log) => {
            const { BTS, PD } = log;

            // Přidání BTS bodu pouze pokud je zapnutý checkbox
            if (this.showBTS) {
                const btsMarker = this.mapDataService.addPoint(
                    BTS.lat,
                    BTS.lon,
                    "BTS"
                );
                // Přidáme oba objekty (BTS i PD) k markeru - když kliknu na jakýkoli marker, budi mít přístup k oběma propojeným objektům
                (btsMarker as any).associatedData = { BTS, PD };
                btsMarker.on("click", () =>
                    this.mapDataService.highlightPoint(btsMarker)
                );
            }

            // Přidání PD bodu pouze pokud je zapnutý checkbox
            if (this.showPD) {
                const pdMarker = this.mapDataService.addPoint(
                    PD.lat,
                    PD.lon,
                    "PD"
                );
                // Přidat oba objekty (BTS i PD) k markeru - když kliknu na jakýkoli marker, budi mít přístup k oběma propojeným objektům
                (pdMarker as any).associatedData = { BTS, PD };
                pdMarker.on("click", () =>
                    this.mapDataService.highlightPoint(pdMarker)
                );
            }

            // Přidání přímky mezi BTS a PD pouze pokud jsou oba body viditelné
            if (this.showBTS && this.showPD) {
                this.mapDataService.addConnectionLine(
                    BTS.lat,
                    BTS.lon,
                    PD.lat,
                    PD.lon
                );
            }
        });
        this.mapDataService.fitToBounds();
    }

    // Přepnutí na záložku s informacemi o objektu
    switchToObjectInfoTab(): void {
        const logTab = document.getElementById("loglist-tab");
        const importedLogTab = document.getElementById("importedlog-tab");
        const objectInfoTab = document.getElementById("objectinfo-tab");

        const logPane = document.getElementById("loglist");
        const importedLogPane = document.getElementById("importedlog");
        const objectInfoPane = document.getElementById("objectinfo");

        if (objectInfoTab && objectInfoPane) {
            // Aktivujeme záložku Data vybraného objektu
            objectInfoTab.classList.add("active");
            objectInfoTab.setAttribute("aria-selected", "true");
            objectInfoPane.classList.add("show", "active");

            // Deaktivujeme ostatní záložky
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
