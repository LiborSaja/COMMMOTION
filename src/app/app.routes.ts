import { Routes } from "@angular/router";

import { AboutComponent } from "./about/about.component";
import { MapComponent } from "./map/map.component";
import { LogViewerComponent } from "./log-viewer/log-viewer.component";

export const routes: Routes = [
    {
        path: "",
        title: "App Home Page",
        component: AboutComponent,
    },
    {
        path: "map",
        title: "App Map Page",
        component: MapComponent,
    },
    {
        path: "logViewer",
        title: "App Log View Page",
        component: LogViewerComponent,
    },
];
