import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Flight } from '../models/flight';

@Injectable({
  providedIn: 'root',
})
export class CachedFlightService {
  cache: Record<string, Observable<Flight[]>> = {};

  constructor(private http: HttpClient) {}

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';
    const params = new HttpParams().set('from', from);
    // If you use json-server, use the parameter from_like:
    // const params = new HttpParams().set('from_like', from);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    if (!this.cache[from]) {
      this.cache[from] = this.http
        .get<Flight[]>(url, { params, headers })
        .pipe(shareReplay(1));
    } else {
        console.log('loaded form cache.')
    }

    return this.cache[from];
  }
}
