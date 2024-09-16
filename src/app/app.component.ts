import { Component } from "@angular/core";
import { MapComponent } from "./map/map.component";
import { LogViewerComponent } from "./log-viewer/log-viewer.component";
import { AboutComponent } from "./about/about.component";
import { CommonModule } from "@angular/common";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from "@angular/router";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [CommonModule, MapComponent, LogViewerComponent, AboutComponent, RouterOutlet, RouterLink],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.css",
})
export class AppComponent {
    currentRoute: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateBackgroundClass(event.urlAfterRedirects);
      }
    });
  }

  updateBackgroundClass(url: string): void {
    if (url.includes('map')) {
      this.currentRoute = 'map-background';
    } else if (url.includes('logViewer')) {
      this.currentRoute = 'log-viewer-background';
    } else {
      this.currentRoute = 'about-background';
    }
  }
  }
  
