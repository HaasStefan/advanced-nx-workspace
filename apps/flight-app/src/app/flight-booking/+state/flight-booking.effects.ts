import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import * as FlightBookingActions from './flight-booking.actions';
import { FlightService } from '@flight-workspace/flight-lib';

@Injectable()
export class FlightBookingEffects {

  loadFlights$ = createEffect(() => this.actions$.pipe(
    ofType(FlightBookingActions.loadFlights),
    switchMap(a => this.flightService.find(a.from, a.to, a.urgent).pipe(
      map(flights => FlightBookingActions.flightsLoaded({flights})),
      catchError(err => of(FlightBookingActions.loadFlightsError))
    )),
  ));

  constructor(private actions$: Actions, private flightService: FlightService) {}
}
