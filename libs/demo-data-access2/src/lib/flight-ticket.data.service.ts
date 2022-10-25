import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FlightTicket } from './flight-ticket';

@Injectable({ providedIn: 'root' })
export class FlightTicketDataService {
  constructor(private http: HttpClient) {}

  load(id: string): Observable<FlightTicket> {
    const url = 'http://demo.angulararchitects.io/api/flight-ticket';

    const params = new HttpParams().set('id', id);

    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<FlightTicket>(url, { params, headers });
  }
}
