import { Injectable } from '@angular/core';
import { FlightService } from '@flight-workspace/flight-lib';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, Observable, of, switchMap } from 'rxjs';
import { FligthDto, PassengerDto, TicketDto } from './enities';
import {
  flightsLoaded,
  loadFlight,
  loadFlightDto,
  normalizeFlightDto,
} from './flight-booking.actions';

@Injectable()
export class FlightBookingEffects {
  loadFlight$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFlight),
      switchMap((action) =>
        this.flightService.find(action.from, action.to, action.urgent)
      ),
      map((flights) => flightsLoaded({ flights }))
    )
  );

  //loadFlight$ = createEffect(() =>
  //  this.actions$.pipe(
  //    ofType(loadFlightDto),
  //    switchMap((action) => this.#loadFlightsFromBackend(action.id)),
  //    map((flightDto) => normalizeFlightDto({ flightDto }))
  //  )
  //);

  constructor(
    private actions$: Actions,
    private flightService: FlightService
  ) {}

  // should be in flightService
  // #loadFlightsFromBackend(flightId: string): Observable<FligthDto> {
  //   const passenger: PassengerDto = {
  //     id: '7',
  //     firstName: 'Jane',
  //     lastName: 'Doe',
  //   };
  //   const ticket: TicketDto = {
  //     id: '4',
  //     price: 110,
  //     passenger,
  //   };
  //   const flight: FligthDto = {
  //     id: '9',
  //     from: new Date(),
  //     to: new Date(),
  //     tickets: [ticket],
  //   };
  //   return of(flight);
  // }
}
