import { Routes } from "@angular/router";
import { AboutComponent } from "./about/about.component";
import { MapComponent } from "./map/map.component";
import { LogViewerComponent } from "./log-viewer/log-viewer.component";
import { GuideComponent } from "./guide/guide.component";

export const routes: Routes = [
    {
        path: "",
        title: "O aplikaci",
        component: AboutComponent,
    },
    {
        path: "map",
        title: "Mapa",
        component: MapComponent,
    },
    {
        path: "logViewer",
        title: "Import souborů",
        component: LogViewerComponent,
    },
    {
        path: "guide",
        title: "Průvodce",
        component: GuideComponent,
    },
];
