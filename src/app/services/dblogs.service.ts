import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class DblogsService {
    private apiUrl = "https://localhost:7247/api/log"; // URL k backendu

    constructor(private http: HttpClient) {}

    // Metoda pro uložení logu
    createLog(logEntry: any): Observable<any> {
        return this.http.post(this.apiUrl, logEntry);
    }

    // Metoda pro načtení všech logů
    getLogs(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    // Přidání metody pro získání konkrétního logu podle jeho ID
    getLogById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
}
