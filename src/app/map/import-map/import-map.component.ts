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
        // setTimeout je použito k tomu, aby se inicializace mapy provedla až po vykreslení DOM
        setTimeout(() => {
            console.log("Initializing map...");

            // Kontrola, zda mapa už není inicializována, aby nebyla inicializována znovu
            if (!this.map) {
                // Inicializace mapy s výchozím pohledem na souřadnice Ostravy a zoomem 12
                this.map = L.map("map").setView([49.824473, 18.256109], 12);

                // Přidání vrstvy dlaždic z OpenStreetMap
                L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                        attribution: "&copy; OpenStreetMap contributors", // Zdroj mapových dat
                    }
                ).addTo(this.map);

                // Zajistí, že mapa bude správně vykreslena (vyřeší problémy s velikostí při dynamickém načítání)
                this.map.invalidateSize();
            }
        }, 0); // Zpoždění 0ms slouží k tomu, aby se úkol zařadil do fronty a počkal, až se DOM vykreslí
    }
}
