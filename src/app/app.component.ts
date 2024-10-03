import { Component } from "@angular/core";
import { MapComponent } from "./map/map.component";
import { LogViewerComponent } from "./log-viewer/log-viewer.component";
import { AboutComponent } from "./about/about.component";
import { GuideComponent } from "./guide/guide.component";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import {
    NavigationEnd,
    Router,
    RouterLink,
    RouterOutlet,
    RouterModule,
} from "@angular/router";


@Component({
    selector: "app-root",
    standalone: true,
    imports: [
        CommonModule,
        MapComponent,
        LogViewerComponent,
        AboutComponent,
        RouterOutlet,
        RouterLink,
        GuideComponent,
        RouterModule,
    ],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.css",
    providers: [HttpClient],
})
export class AppComponent {
    currentRoute: string = ""; // Uchovává název aktuální cesty (route) pro aplikaci třídy pozadí

    constructor(private router: Router) {
        // Sleduje změny v navigaci (routeru) a reaguje při ukončení navigace (NavigationEnd)
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.updateBackgroundClass(event.urlAfterRedirects); // Volá funkci pro změnu třídy pozadí na základě aktuální cesty
            }
        });
    }

    // Aktualizuje třídu pozadí aplikace na základě aktuální cesty
    updateBackgroundClass(url: string): void {
        if (url.includes("map")) {
            this.currentRoute = "map-background"; // Pokud cesta obsahuje "map", nastaví třídu pro pozadí mapy
        } else if (url.includes("logViewer")) {
            this.currentRoute = "log-viewer-background"; // Pokud cesta obsahuje "logViewer", nastaví třídu pro pozadí log vieweru
        }  else if (url.includes("guide")){
            this.currentRoute = "guide-background";
        } else {
            this.currentRoute = "about-background"; // Pro ostatní cesty nastaví třídu pro pozadí sekce "O nás"
        }
    }

    // Funkce pro automatické zavírání menu při prohlížení na malých obrazovkách
    closeMenu() {
        const navbarCollapse = document.getElementById("navbarNav");

        // Zkontroluje, zda je menu zobrazeno (má třídu 'show'), a pokud ano, odstraní ji
        if (navbarCollapse && navbarCollapse.classList.contains("show")) {
            navbarCollapse.classList.remove("show"); // Skryje menu na malých obrazovkách
        }
    }
}
