import { Component } from "@angular/core";
import { ImportMapComponent } from "./import-map/import-map.component";
import { AllObjectsViewerComponent } from "./all-objects-viewer/all-objects-viewer.component";
import { RouterModule } from "@angular/router";

@Component({
    selector: "app-map",
    standalone: true,
    imports: [ImportMapComponent, AllObjectsViewerComponent, RouterModule],
    templateUrl: "./map.component.html",
    styleUrl: "./map.component.css",
})
export class MapComponent {}
