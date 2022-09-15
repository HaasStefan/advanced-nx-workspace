import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Passenger} from '../entities/passenger';

@Injectable({ providedIn: 'root' })
export class PassengerDataService {

  constructor(private http: HttpClient) {
  }

  load(name: string, firstname: string): Observable<Passenger[]> {
    const url = 'http://demo.angulararchitects.io/api/passenger';

    const params = new HttpParams()
      .set('name', name)
      .set('firstname', firstname);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Passenger[]>(url, {params, headers});
  }
}
