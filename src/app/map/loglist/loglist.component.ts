import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { DblogsService } from "../../services/dblogs.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-loglist",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./loglist.component.html",
    styleUrl: "./loglist.component.css",
})
export class LoglistComponent implements OnInit {
    logs: any[] = []; // Uchová všechny načtené logy z databáze

    // Dekorátor pro emisi události do MapComponent
    @Output() logSelected = new EventEmitter<any>();

    constructor(private dbLogsService: DblogsService) {}

    ngOnInit(): void {
        // Načteme logy z databáze při inicializaci komponenty
        this.dbLogsService.getLogs().subscribe({
            next: (data) => {
                this.logs = data;
            },
            error: (error) => {
                console.error("Chyba při načítání logů z databáze", error);
            },
        });
    }

    // Funkce pro zobrazení logu podle jeho ID
    showLog(logId: number): void {
        this.dbLogsService.getLogById(logId).subscribe({
            next: (response) => {
                this.logSelected.emit(response); // Vybraný log je odeslán do MapComponent
            },
            error: (error) => console.error("Došlo k chybě při načítání logu:", error)
        });
    }
}
