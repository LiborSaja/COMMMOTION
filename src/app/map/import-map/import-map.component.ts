import { Component, OnInit } from "@angular/core";
import * as L from "leaflet";

@Component({
    selector: "app-import-map",
    standalone: true,
    imports: [],
    templateUrl: "./import-map.component.html",
    styleUrl: "./import-map.component.css",
})
export class ImportMapComponent implements OnInit {
    // Deklarace proměnné pro uložení instance mapy
    private map: any;

    // Lifecycle hook, který se spustí při inicializaci komponenty
    ngOnInit(): void {
        setTimeout(() => {
            console.log("Initializing map...");

            // Zkontrolujte, zda už mapa neexistuje, pokud ano, nechte ji jak je
            const mapContainer = document.getElementById("map");

            // Kontrola, zda není mapa již inicializována
            if (mapContainer && !mapContainer.hasChildNodes()) {
                // Inicializace mapy s výchozím pohledem na souřadnice Ostravy a zoomem 12
                this.map = L.map("map").setView([49.824473, 18.256109], 12);

                // Přidání vrstvy dlaždic z OpenStreetMap
                L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                        attribution: "&copy; OpenStreetMap contributors",
                    }
                ).addTo(this.map);

                // Zajistí, že mapa bude správně vykreslena
                this.map.invalidateSize();
            }
        }, 0); // Zpoždění 0ms, aby byl DOM vykreslen před inicializací
    }
}
