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
    objectsArray: any[] = [];

    constructor(private logsdataService: LogsdataService) {}

    ngOnInit(): void {
        // Získání dat ze služby
        this.objectsArray = this.logsdataService.getObjectsArray();
    }
}
