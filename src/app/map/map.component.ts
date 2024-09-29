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
                btsMarker.on("click", () =>
                    this.mapDataService.highlightPoint(btsMarker, "BTS", BTS)
                );
            }

            // Přidání PD bodu pouze pokud je zapnutý checkbox
            if (this.showPD) {
                const pdMarker = this.mapDataService.addPoint(
                    PD.lat,
                    PD.lon,
                    "PD"
                );
                pdMarker.on("click", () =>
                    this.mapDataService.highlightPoint(pdMarker, "PD", PD)
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
}
