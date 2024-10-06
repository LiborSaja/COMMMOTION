import { Component, OnInit } from "@angular/core";
import { LogsdataService } from "../../services/logsdata.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-all-objects-viewer",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./all-objects-viewer.component.html",
    styleUrl: "./all-objects-viewer.component.css",
})
export class AllObjectsViewerComponent implements OnInit {
    // Proměnná pro ukládání pole objektů (BTS a PD)
    objectsArray: any[] = [];

    constructor(private logsdataService: LogsdataService) {}

    //Metoda ngOnInit, která se spustí při inicializaci komponenty
    //Načítá data z LogsdataService a ukládá je do proměnné objectsArray
    ngOnInit(): void {
        // Získání dat (pole objektů) ze služby LogsdataService
        this.objectsArray = this.logsdataService.getObjectsArray();

        // Naslouchání na změny v datech z LogsdataService
        this.logsdataService
            .getObjectsArrayUpdateListener()
            .subscribe((data) => {
                this.objectsArray = data; // Aktualizace pole pro zobrazení dat
                console.log("Načtená data do AllObjectsViewer:", data);
            });
    }
}
