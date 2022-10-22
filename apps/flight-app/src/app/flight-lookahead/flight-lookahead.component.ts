import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  delay,
  distinctUntilChanged,
  exhaustMap,
  filter,
  interval,
  map,
  mergeMap,
  Observable,
  of,
  ReplaySubject,
  share,
  shareReplay,
  startWith,
  Subject,
  Subscription,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { freezeUntil, lookAhead } from './look-ahead.util';

@Component({
  selector: 'flight-workspace-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
  styleUrls: ['./flight-lookahead.component.css'],
})
export class FlightLookaheadComponent implements OnInit, OnDestroy {
  control!: FormControl;
  flights$!: Observable<Flight[]>;
  loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();
  online$!: Observable<boolean>;
  destroy = new Subject<void>();

  subscription = new Subscription();

  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();

    this.destroy.next();
  }

  ngOnInit(): void {
    this.subscription.add(interval(500).pipe(tap(console.log)).subscribe());

    this.subscription.add(interval(500).pipe(tap(console.log)).subscribe());

    this.control = new FormControl();

    this.online$ = interval(2000).pipe(
      startWith(0),
      map(() => true),
      distinctUntilChanged(),
      share({
        connector: () => new ReplaySubject(1),
      })
      //shareReplay({bufferSize: 1, refCount: true})
    );

    const input$ = this.control.valueChanges.pipe(
      filter((value) => value.length > 2),
      lookAhead(300)
    );

    this.flights$ = combineLatest({
      input: input$,
      online: this.online$,
    }).pipe(
      filter(({ online }) => online),
      tap(() => this.loading.next(true)),
      mergeMap(({ input }) => this.load(input).pipe(delay(7000))),
      tap(() => this.loading.next(false))
    );

    //this.flights$ = input$.pipe(
    //  withLatestFrom(this.online$),
    //  filter(([, online]) => online),
    //  switchMap(([input]) => this.load(input))
    //);
  }

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';

    const params = new HttpParams().set('from', from);

    // If you use json-server, use the parameter from_like:
    // const params = new HttpParams().set('from_like', from);

    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, { params, headers }).pipe(
      catchError((error) => {
        console.log('hallo');
        console.error(error);
        return of([]);
      })
    );
  }
}
