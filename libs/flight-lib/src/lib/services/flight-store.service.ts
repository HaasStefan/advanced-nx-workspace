import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, switchMap } from 'rxjs';
import { Flight } from '../models/flight';

import { ComponentStore, tapResponse } from '@ngrx/component-store';

interface State {
  flights: Flight[];
}

@Injectable()
export class FlightStore extends ComponentStore<State> {
  #baseUrl = `http://www.angular.at/api`;

  // selector
  readonly flights$ = this.select(({ flights }) => flights);

  // effect
  readonly load = this.effect(
    (
      params$: Observable<{
        from: string;
        to: string;
        urgent: boolean;
      }>
    ) => {
      return params$.pipe(
        switchMap(({ from, to, urgent }) =>
          this.#find(from, to, urgent).pipe(
            tapResponse((flights) => this.setState({ flights }), console.error)
          )
        )
      );
    }
  );

  // reducer
  readonly delay = this.updater((state: State) => {
    const flights = [...state.flights];
    const firstFlight = flights.slice()[0];

    const ONE_MINUTE = 1000 * 60;
    const oldDate = new Date(firstFlight.date);
    oldDate.setTime(oldDate.getTime() + 15 * ONE_MINUTE);
    firstFlight.date = oldDate.toISOString();

    return {
      ...state,
      flights: [
        firstFlight,
        ...flights
      ]
    };
  });

  constructor(private http: HttpClient) {
    super({ flights: [] });
  }

  #find(
    from: string,
    to: string,
    urgent: boolean = false
  ): Observable<Flight[]> {
    let url = [this.#baseUrl, 'flight'].join('/');

    if (urgent) {
      url = [this.#baseUrl, 'error?code=403'].join('/');
    }

    const params = new HttpParams().set('from', from).set('to', to);
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<Flight[]>(url, { params, headers });
  }

  findById(id: string): Observable<Flight> {
    const reqObj = { params: new HttpParams().set('id', id) };
    const url = [this.#baseUrl, 'flight'].join('/');
    return this.http.get<Flight>(url, reqObj);
  }

  save(flight: Flight): Observable<Flight> {
    const url = [this.#baseUrl, 'flight'].join('/');
    return this.http.post<Flight>(url, flight);
  }

}
