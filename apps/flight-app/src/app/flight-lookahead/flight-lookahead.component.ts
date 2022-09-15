import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  interval,
  map,
  Observable,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

@Component({
  selector: 'flight-workspace-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
  styleUrls: ['./flight-lookahead.component.css'],
})
export class FlightLookaheadComponent implements OnInit {
  control!: FormControl;
  flights$!: Observable<Flight[]>;
  loading = false; // this is bad --> should be reactive instead!

  online = false; // this is bad --> should be reactive instead!
  online$!: Observable<boolean>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.control = new FormControl();

    this.online$ = interval(2000).pipe(
      startWith(0), // starts immediately
      map(() => Math.random() < 0.5),
      distinctUntilChanged(),
      tap((value) => (this.online = value)) // tap --> code smell
    );

    const input$ = this.control.valueChanges.pipe(
      filter(value => value.length > 2),
      debounceTime(300)
    );

    this.flights$ = combineLatest({
      input: input$,
      online: this.online$
    }).pipe(
      filter(combined => combined.online),
      switchMap(combined => this.load(combined.input))
    );

    // DESTRUCTING
    // filter(({online, }) => online),
    // switchMap(({input, }) => this.load(input))

    // this.flights$ = input$.pipe(
    //   withLatestFrom(this.online$),
    //   filter(([, online]) => online),
    //   switchMap(([input]) => this.load(input))
    // );
  }

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';

    const params = new HttpParams().set('from', from);

    // If you use json-server, use the parameter from_like:
    // const params = new HttpParams().set('from_like', from);

    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, { params, headers });
  }
}
