import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';

import { loadPassenger } from '../+state/passenger/passenger.actions';
import * as fromPassenger from '../+state/passenger/passenger.reducer';
import * as PassengerSelectors from '../+state/passenger/passenger.selectors';

@Injectable({ providedIn: 'root' })
export class ManageFacade {
  loaded$ = this.store.pipe(select(PassengerSelectors.getPassengerLoaded));
  passengerList$ = this.store.pipe(select(PassengerSelectors.getAllPassenger));
  selectedPassenger$ = this.store.pipe(select(PassengerSelectors.getSelected));

  constructor(private store: Store<fromPassenger.PassengerPartialState>) {}

  load(): void {
    this.store.dispatch(loadPassenger());
  }
}

