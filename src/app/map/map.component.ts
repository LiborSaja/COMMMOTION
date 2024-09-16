import { Component } from "@angular/core";
import { ImportMapComponent } from "./import-map/import-map.component";

@Component({
    selector: "app-map",
    standalone: true,
    imports: [ImportMapComponent],
    templateUrl: "./map.component.html",
    styleUrl: "./map.component.css",
})
export class MapComponent {}
