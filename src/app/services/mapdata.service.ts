import { Injectable } from "@angular/core";
import * as L from "leaflet";

@Injectable({
    providedIn: "root",
})
export class MapdataService {
    private map: L.Map | null = null;
    private pointsLayer: L.LayerGroup | null = null;
    private selectedMarker: L.CircleMarker | null = null;
    private pointsBounds: L.LatLngBounds | null = null; //proměnná pro přizpůsobení pohledu

    // Inicializace mapy
    initializeMap(
        mapId: string,
        center: [number, number],
        zoom: number
    ): L.Map {
        if (this.map) {
            this.map.remove(); // Odstraníme mapu, pokud již existuje
            this.map = null;
        }
        this.map = L.map(mapId).setView(center, zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(this.map);

        this.pointsLayer = L.layerGroup().addTo(this.map);
        this.pointsBounds = new L.LatLngBounds([]); //inicializace
        return this.map;
    }

    // Přidávání bodů do mapy
    addPoint(lat: number, lon: number, type: "BTS" | "PD"): L.CircleMarker {
        const color = type === "BTS" ? "red" : "blue";
        const marker = L.circleMarker([lat, lon], {
            color,
            fillColor: color, // Použijeme `fillColor` pro plné body
            fillOpacity: 1, // Plná neprůhlednost
            radius: 5,
        }).addTo(this.pointsLayer!); // Přidání do vrstvy

        this.pointsBounds?.extend([lat,lon]); //přidání bodu

        // Uložíme typ markeru jako vlastní atribut
        (marker as any).markerType = type;

        return marker;
    }

    // Nastavení mapy tak, aby se přizpůsobila všem bodům
    fitToBounds(): void {
        if (this.pointsBounds && this.map) {
            this.map.fitBounds(this.pointsBounds); // Změní zoom a pozici mapy, aby všechny body byly vidět
        }
    }

    // Vyčištění všech bodů z mapy
    clearPoints(): void {
        if (this.pointsLayer) {
            this.pointsLayer.clearLayers();
        }
        this.pointsBounds = new L.LatLngBounds([]);
    }

    // Zvýraznění bodu po kliknutí
    highlightPoint(
        marker: L.CircleMarker,
        type: "BTS" | "PD",
        data: any
    ): void {
        // Resetování předchozího vybraného bodu
        if (this.selectedMarker) {
            this.resetMarker(this.selectedMarker);
        }

        // Zvýraznění aktuálního bodu
        marker.setStyle({
            radius: 10,
            weight: 2,
        });

        // Uložení aktuálního markeru jako vybraného
        this.selectedMarker = marker;

        // Zobrazení popoveru s informacemi
        const info =
            type === "BTS"
                ? `Informace o BTS<br>Cell ID: ${data.cell_id}<br>Zem. šířka: ${data.lat}<br>Zem. délka: ${data.lon}<br>Čas: ${data.measured_at}<br>Vlastník:${data.mnc}`
                : `Informace o mobilním telefonu<br>Zem. šířka: ${data.lat}<br>Zem. délka: ${data.lon}<br>Čas: ${data.time}`;

        marker.bindPopup(info, { closeButton: true }).openPopup();
    }

    // Resetování bodu zpět na původní barvu
    resetMarker(marker: L.CircleMarker): void {
        // Použití uloženého typu markeru (BTS nebo PD)
        const type = (marker as any).markerType;
        const color = type === "BTS" ? "red" : "blue";
        marker.setStyle({
            color: color,
            fillColor: color,
            radius: 5,
            weight: 1,
        });
    }

    // Přidání přímky mezi body BTS a PD
    addConnectionLine(
        btsLat: number,
        btsLon: number,
        pdLat: number,
        pdLon: number
    ): void {
        const line = L.polyline(
            [
                [btsLat, btsLon],
                [pdLat, pdLon],
            ],
            { color: "black" }
        );
        this.pointsLayer?.addLayer(line); // Přidáme přímku do vrstvy
    }
}
