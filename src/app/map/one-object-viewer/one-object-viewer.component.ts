import { Component, OnInit } from "@angular/core";
import { MapdataService } from "../../services/mapdata.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-one-object-viewer",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./one-object-viewer.component.html",
    styleUrl: "./one-object-viewer.component.css",
})
export class OneObjectViewerComponent implements OnInit {
    selectedObject: any = null; // Zde bude uložen vybraný objekt (BTS a PD)

    constructor(private mapDataService: MapdataService) {} // Injektujeme MapdataService

    ngOnInit(): void {
        // Nasloucháme na vybraný objekt, když je uživatel klikne na bod v mapě
        this.mapDataService.selectedObject$.subscribe((object) => {
            this.selectedObject = object;
        });
    }

    // Funkce pro přesměrování na přehled všech objektů
    scrollToAllObjectsViewer(): void {
        const element = document.getElementById("all-objects-viewer-section");
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
}
