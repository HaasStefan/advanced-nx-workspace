import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';

import { loadPassenger } from '../+state/passenger/passenger.actions';
import * as fromPassenger from '../+state/passenger/passenger.reducer';
import * as PassengerSelectors from '../+state/passenger/passenger.selectors';
import { Passenger } from '../entities/passenger';
import { PassengerDataService } from '../infrastructure/passenger.data.service';

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

@Injectable({ providedIn: 'root' })
export class AlternativeManageFacade {
  private _passengerList = new BehaviorSubject<Passenger[]>([]);
  readonly passengerList$ = this._passengerList.asObservable();

  constructor(private passengerService: PassengerDataService) {}

  load(): void {
    this.passengerService.load().subscribe(
      (passengers) => this._passengerList.next(passengers)
    );
  }

}