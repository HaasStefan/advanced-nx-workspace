import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as PassengerActions from './passenger.actions';
import { PassengerDataService } from '../../infrastructure/passenger.data.service';

@Injectable()
export class PassengerEffects {
  loadPassenger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PassengerActions.loadPassenger),
      switchMap((action) =>
        this.passengerDataService.load().pipe(
          map((passenger) =>
            PassengerActions.loadPassengerSuccess({ passenger })
          ),
          catchError((error) =>
            of(PassengerActions.loadPassengerFailure({ error }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private passengerDataService: PassengerDataService
  ) {}
}
