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
    private map: any;

    ngOnInit(): void {
        setTimeout(() => {
            console.log("Initializing map...");

            if (!this.map) {
                this.map = L.map("map").setView([49.824473, 18.256109], 12);
                L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                        attribution: "&copy; OpenStreetMap contributors",
                    }
                ).addTo(this.map);

                // zajistí, že velikost mapy bude správně vypočtena
                this.map.invalidateSize();
            }
        }, 0); // zpoždění pro vykreslení kontejneru
    }
}
