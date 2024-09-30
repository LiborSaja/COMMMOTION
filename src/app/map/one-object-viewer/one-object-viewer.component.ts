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
    // Proměnná pro uložení vybraného objektu (BTS a PD)
    selectedObject: any = null; 

    constructor(private mapDataService: MapdataService) {} 

    // Lifecycle hook, který se spustí při inicializaci komponenty
    ngOnInit(): void {
        // Odběr na Observable `selectedObject$` ze služby MapdataService, aby mohla komponenta reagovat, když uživatel klikne na bod na mapě
        this.mapDataService.selectedObject$.subscribe((object) => {
            this.selectedObject = object; // Uložení vybraného objektu, který bude zobrazen v html šabloně
        });
    }

    // Funkce pro přesměrování na přehled všech objektů
    scrollToAllObjectsViewer(): void {
        const element = document.getElementById("all-objects-viewer-section"); // Nalezení elementu podle ID
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" }); // Plynulé scrollování k elementu
        }
    }
}
