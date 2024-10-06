import { Injectable } from "@angular/core";
import * as L from "leaflet";
import { Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class MapdataService {
    private map: L.Map | null = null; // Instance Leaflet mapy
    private pointsLayer: L.LayerGroup | null = null; // Vrstvy pro uložení všech bodů na mapě
    private selectedMarker: L.CircleMarker | null = null; // Uložený bod, který byl naposledy vybrán
    // Uložené souřadnice všech bodů, které se použijí pro přizpůsobení pohledu mapy
    private pointsBounds: L.LatLngBounds | null = null;
    // RxJS Subject, který slouží k předávání informací o vybraném objektu mezi komponentami
    private selectedObjectSource = new Subject<any>();
    // Exponujeme Observable, na který mohou ostatní komponenty naslouchat
    /**
     * Když v nějaké části kódu dojde ke změně dat (např. zde při kliknutí na bod na mapě), Subject tuto změnu zaznamená a
     * informuje všechny komponenty nebo služby, které "naslouchají" na tento Observable (pomocí .subscribe()).
     */
    selectedObject$ = this.selectedObjectSource.asObservable();

    // Funkce pro inicializaci mapy
    initializeMap(
        mapId: string,
        center: [number, number],
        zoom: number
    ): L.Map {
        // Pokud již mapa existuje, bude odtraněna a inicializována znovu
        if (this.map) {
            this.map.remove();
        }

        // Vytvoření nové mapy
        this.map = L.map(mapId).setView(center, zoom);

        // Přidání vrstev OpenStreetMap do mapy
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(this.map);

        // Vytvoření skupiny bodů na mapě
        this.pointsLayer = L.layerGroup().addTo(this.map);

        // Inicializace souřadnic všech bodů pro úpravu zobrazení mapy
        this.pointsBounds = new L.LatLngBounds([]);

        return this.map;
    }

    // Přidání nového bodu (BTS nebo PD) do mapy
    addPoint(lat: number, lon: number, type: "BTS" | "PD"): L.CircleMarker {
        // Nastavení barvy bodu podle typu (BTS - červená, PD - modrá)
        const color = type === "BTS" ? "red" : "blue";

        // Vytvoření nového bodu s barvou a vlastnostmi
        const marker = L.circleMarker([lat, lon], {
            color,
            fillColor: color,
            fillOpacity: 1, // Plně vybarvený bod
            radius: 5,
        }).addTo(this.pointsLayer!); // Přidání bodu do vrstvy

        // Rozšíření bounds, aby bylo možné přizpůsobit zobrazení mapy
        this.pointsBounds?.extend([lat, lon]);

        // Uložení typu markeru (BTS nebo PD) a připravení asociovaných dat (vzájemná vazba mezi PD a BTS)
        (marker as any).markerType = type;
        (marker as any).associatedData = null; // Asociovaná data budou přidána později

        return marker;
    }

    // Přizpůsobení zobrazení mapy tak, aby byly vidět všechny body
    fitToBounds(): void {
        if (
            this.pointsBounds &&
            this.pointsBounds.isValid() &&
            this.pointsBounds.getNorthEast() !==
                this.pointsBounds.getSouthWest()
        ) {
            this.map?.fitBounds(this.pointsBounds);
        } else {
            console.warn("Bounds are empty or invalid.");
        }
    }

    // Vyčištění všech bodů z mapy
    clearPoints(): void {
        if (this.pointsLayer) {
            this.pointsLayer.clearLayers(); // Odstraní všechny vrstvy bodů z mapy
        }

        // Obnovení bounds pro nové body
        this.pointsBounds = new L.LatLngBounds([]);
    }

    // Zvýraznění vybraného bodu při kliknutí
    highlightPoint(marker: L.CircleMarker): void {
        // Pokud byl vybrán nějaký bod předtím, bude resetován jeho styl
        if (this.selectedMarker) {
            this.resetMarker(this.selectedMarker);
        }

        // Zvýraznění aktuálního vybraného bodu
        marker.setStyle({
            radius: 10, // Zvýšení velikosti
            weight: 2, // Zvýšení tloušťky okraje
        });

        // Uložení tohoto bodu jako aktuálně vybraný
        this.selectedMarker = marker;

        // Získání typu markeru a asociovaná data (BTS nebo PD)
        const type = (marker as any).markerType;
        const associatedData = (marker as any).associatedData;

        // Emitování vybraného objektu (BTS a PD data) pro naslouchající komponenty
        this.selectedObjectSource.next(associatedData);

        // Zobrazení bubliny s informacemi o bodu na mapě, na mapě
        if (associatedData) {
            const info =
                type === "BTS"
                    ? `Informace o BTS<br>Cell ID: ${associatedData.cellId}<br>Zem. šířka: ${associatedData.btsLat}<br>Zem. délka: ${associatedData.btsLon}<br>Čas: ${associatedData.measuredAt}<br>Oblast:${associatedData.lac}<br>Vlastník: ${associatedData.mnc}`
                    : `Informace o mobilním telefonu<br>Zem. šířka: ${associatedData.pdLat}<br>Zem. délka: ${associatedData.pdLon}<br>Čas: ${associatedData.pdTime}`;

            marker.bindPopup(info, { closeButton: true }).openPopup(); // bublina s detaily
        } else {
            console.warn(
                "Data pro popup nejsou dostupná nebo neplatná",
                associatedData
            );
        }
    }

    // Resetování vybraného bodu na původní styl
    resetMarker(marker: L.CircleMarker): void {
        // Získání typu markeru (BTS nebo PD) a vrácení původní barvy
        const type = (marker as any).markerType;
        const color = type === "BTS" ? "red" : "blue";
        marker.setStyle({
            color: color,
            fillColor: color,
            radius: 5,
            weight: 1,
        });
    }

    // Přidání přímky mezi BTS a PD body na mapě
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
            { color: "black", interactive: false } // Interaktivita je vypnutá, aby přímka nepřekážela klikání na body
        );

        // Přidání přímky mezi body do vrstvy
        this.pointsLayer?.addLayer(line);
    }
}
