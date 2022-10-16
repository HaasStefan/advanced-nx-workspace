import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CachedFlightService, Flight } from '@flight-workspace/flight-lib';
import { lookAhead } from '@flight-workspace/shared/util-rxjs-operators';
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
  take,
  takeUntil,
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

  constructor(private http: HttpClient,
    private flightService: CachedFlightService) {}

  ngOnInit(): void {
    this.control = new FormControl();

    this.online$ = interval(2000).pipe(
      startWith(0), // starts immediately
      tap(console.log),
      map(() => true),
      distinctUntilChanged(),
      share({
        connector: () => new ReplaySubject(1),
      })
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
      tap(() => this.loadingSubject.next(true)),
      switchMap(({ input }) => this.load(input)),
      tap(() => this.loadingSubject.next(false))
    );
  }

  load(from: string): Observable<Flight[]> {
    return this.flightService.load(from);
  }
}
