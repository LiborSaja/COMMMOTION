import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogsdataService {
  private objectsArray: any[] = [];

  constructor() {}

  // Funkce pro vytvoření nového pole objektů
  createObjectsArray(gpxData: string | ArrayBuffer | null, csvData: string | ArrayBuffer | null): void {
    const pdData = this.parseGpxData(gpxData);
    const btsData = this.parseCsvData(csvData);

    this.objectsArray = pdData.map((pd) => ({
      BTS: this.findClosestBts(pd.time, btsData),
      PD: pd,
    }));
  }

  // Funkce pro získání pole objektů
  getObjectsArray(): any[] {
    return this.objectsArray;
  }

  // Pomocné funkce pro parsování dat (přesunuty z komponenty)
  parseGpxData(gpxData: string | ArrayBuffer | null): any[] {
    if (!gpxData) return [];

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxData as string, 'application/xml');
    const trkpts = Array.from(xmlDoc.getElementsByTagName('trkpt'));

    return trkpts.map((trkpt) => ({
      lat: parseFloat(trkpt.getAttribute('lat')!),
      lon: parseFloat(trkpt.getAttribute('lon')!),
      time: new Date(trkpt.getElementsByTagName('time')[0].textContent!),
    }));
  }

  parseCsvData(csvData: string | ArrayBuffer | null): any[] {
    if (!csvData) return [];

    const csvLines = (csvData as string).split('\n');
    const headers = csvLines[0].split(',').map((header) => header.trim());
    const indices = {
      cell_id: headers.indexOf('cell_id'),
      lat: headers.indexOf('lat'),
      lon: headers.indexOf('lon'),
      measured_at: headers.indexOf('measured_at'),
      mnc: headers.indexOf('mnc'),
      lac: headers.indexOf('lac'),
    };

    if (Object.values(indices).some((index) => index === -1)) {
      console.error('Chybí požadované sloupce v CSV souboru.');
      return [];
    }

    return csvLines.slice(1).map((line) => {
      const values = line.split(',').map((value) => value.trim());
      const parsedValues = {
        cell_id: this.parseValue(values[indices.cell_id], parseInt),
        lat: this.parseValue(values[indices.lat], parseFloat),
        lon: this.parseValue(values[indices.lon], parseFloat),
        measured_at: this.parseValue(values[indices.measured_at], (val) => new Date(val.replace(/"/g, ''))),
        mnc: this.parseValue(values[indices.mnc], parseInt),
        lac: this.parseValue(values[indices.lac], parseInt),
      };

      return Object.values(parsedValues).some((val) => val === null) ? null : parsedValues;
    }).filter((item) => item !== null);
  }

  parseValue(value: string, parseFn: (val: string) => any): any {
    return value ? parseFn(value) : null;
  }

  findClosestBts(time: Date, btsData: any[]): any {
    if (!time || !btsData.length) {
      console.error('Neplatný vstup pro hledání nejbližšího BTS záznamu.');
      return null;
    }

    return btsData.reduce((closest, bts) => {
      if (bts && bts.measured_at) {
        const diff = Math.abs(time.getTime() - bts.measured_at.getTime());
        return diff < Math.abs(time.getTime() - closest.measured_at.getTime()) ? bts : closest;
      }
      return closest;
    }, btsData[0]);
  }
}
