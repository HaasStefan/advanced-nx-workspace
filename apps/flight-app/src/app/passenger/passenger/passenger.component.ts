import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { addPassengers } from '../passenger.actions';
import { Passenger } from '../passenger.model';
import { PassengerAppState } from '../passenger.reducer';
import { selectAllPassengers } from '../passenger.selectors';

@Component({
  selector: 'flight-workspace-passenger',
  templateUrl: './passenger.component.html',
  styleUrls: ['./passenger.component.css'],
})
export class PassengerComponent implements OnInit {
  passengers$: Observable<Passenger[]> = this.store.select(selectAllPassengers);

  constructor(private store: Store<PassengerAppState>) {}

  ngOnInit(): void {
    this.store.dispatch(
      addPassengers({
        passengers: [
          { id: 1, name: 'Max' },
          { id: 2, name: 'Susi' },
        ],
      })
    );
  }
}
