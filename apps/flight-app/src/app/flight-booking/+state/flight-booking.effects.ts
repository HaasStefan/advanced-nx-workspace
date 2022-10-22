import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import * as FlightBookingActions from './flight-booking.actions';
import { FlightService } from '@flight-workspace/flight-lib';
import { Action } from '@ngrx/store';

@Injectable()
export class FlightBookingEffects {
  loadFlights$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(FlightBookingActions.loadFlights),
      switchMap((payload) =>
        this.flightService.find(payload.from, payload.to, payload.urgent).pipe(
          map((flights) => FlightBookingActions.flightsLoaded({ flights })),
          catchError(() => of(FlightBookingActions.loadFlightsError()))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private flightService: FlightService
  ) {}
}
