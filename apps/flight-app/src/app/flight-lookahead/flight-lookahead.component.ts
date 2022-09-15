import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  interval,
  map,
  Observable,
  ReplaySubject,
  share,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'flight-workspace-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
  styleUrls: ['./flight-lookahead.component.css'],
})
export class FlightLookaheadComponent implements OnInit {
  control!: FormControl;
  flights$!: Observable<Flight[]>;

  private loadingSubject = new BehaviorSubject(false);
  loading$ = this.loadingSubject.asObservable();

  online$!: Observable<boolean>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.control = new FormControl();

    this.online$ = interval(2000).pipe(
      startWith(0), // starts immediately
      map(() => Math.random() < 0.5),
      distinctUntilChanged(),
      share({
        connector: () => new ReplaySubject(1),
      })
    );

    const input$ = this.control.valueChanges.pipe(
      filter((value) => value.length > 2),
      debounceTime(300)
    );

    this.flights$ = combineLatest({
      input: input$,
      online: this.online$,
    }).pipe(
      filter(({ online }) => online),
      tap(() => this.loadingSubject.next(true)),
      switchMap(({ input }) => this.load(input)),
      tap(() => this.loadingSubject.next(false))
    );
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
