import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import {
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
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

@Component({
  selector: 'flight-workspace-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
  styleUrls: ['./flight-lookahead.component.css'],
})
export class FlightLookaheadComponent implements OnInit, OnDestroy {
  control!: FormControl;
  flights$!: Observable<Flight[]>;
  private loadingSubject = new Subject<boolean>();
  readonly loading$ = this.loadingSubject.asObservable();
  private destroy = new Subject<void>();
  private subscription = new Subscription();

  online$!: Observable<boolean>;

  constructor(private readonly http: HttpClient) {}
  
  ngOnDestroy(): void {
    this.destroy.next();
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.control = new FormControl();

    this.subscription.add(
    interval(1000).pipe(
      tap(console.log),
      //takeUntil(this.destroy)
    ).subscribe()
    ); 

    this.loading$.pipe()

    this.online$ = interval(2000).pipe(
      startWith(0),
      map(() => true),
      distinctUntilChanged(),
      //shareReplay({bufferSize: 1, refCount: true})
      share({
        connector: () => new ReplaySubject()
      })
    );

    const input$ = this.control.valueChanges.pipe(
      filter((value): value is string => value.length > 2),
      debounceTime(300)
    );

    // this.flights$ = input$.pipe(
    //   withLatestFrom(this.online$),
    //   filter(([, online]) => online),
    //   tap(() => {
    //     this.loading = true;
    //   }),
    //   switchMap(([input]) => this.load(input)),
    //   tap(() => (this.loading = false))
    // );

    this.flights$ = combineLatest({
      input: input$,
      online: this.online$
    }).pipe(
      filter(({online}) => online),
      tap(() => this.loadingSubject.next(true)),
      exhaustMap(({input}) => this.load(input).pipe(
        delay(7000)
      )),
      tap(() => this.loadingSubject.next(false)),
    );

  }

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';

    const params = new HttpParams().set('from', from);

    // If you use json-server, use the parameter from_like:
    // const params = new HttpParams().set('from_like', from);

    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, { params, headers }).pipe(
      catchError(() => {
        console.error('error happened!');
        return ([]);
      })
    );
  }
}
