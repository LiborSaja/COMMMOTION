import { Component, ElementRef, Renderer2 } from "@angular/core";
import { MapComponent } from "./map/map.component";
import { LogViewerComponent } from "./log-viewer/log-viewer.component";
import { AboutComponent } from "./about/about.component";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [CommonModule, MapComponent, LogViewerComponent, AboutComponent],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.css",
})
export class AppComponent {
    currentView: "about" | "map" | "logViewer" = "about"; // přepínání mezi komponentami

    // proměnná pro definování různých pozadí
    backgrounds = {
        about: "url(mmm5.jpg)",
        map: "url(/mmm3.jpg)",
        logViewer: "url(/mmm2.jpg)",
    };

    // Metoda pro nastavení aktuálního pozadí
    getBackground(): string {
        return this.backgrounds[this.currentView];
    }

    // přepínání mezi zobrazeními
    switchComponent(view: "about" | "map" | "logViewer"): void {
        this.currentView = view;

        console.log("Switching to:", view); // pro debug
    }
}
