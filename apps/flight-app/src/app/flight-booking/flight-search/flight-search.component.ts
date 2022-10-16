import { Component, OnInit } from '@angular/core';
import { FlightService, FlightStore } from '@flight-workspace/flight-lib';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import {
  flightsLoaded,
  loadFlight,
  updateFlight,
} from '../+state/flight-booking.actions';
import {
  FlightBookingAppState,
  flightBookingFeatureKey,
} from '../+state/flight-booking.reducer';
import {
  selectFilteredFlights,
  selectFlights,
  selectFlightsWithParams,
} from '../+state/flight-booking.selectors';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  providers: [FlightStore],
})
export class FlightSearchComponent implements OnInit {
  from = 'Hamburg'; // in Germany
  to = 'Graz'; // in Austria
  urgent = false;
  // "shopping basket" with selected flights
  basket: { [id: number]: boolean } = {
    3: true,
    5: true,
  };

  readonly flights$ = this.store.flights$;

  constructor(
    // private flightService: FlightService,
    private store: FlightStore
  ) {}

  ngOnInit() {
    console.log('ngOnInit');
  }

  search(): void {
    if (!this.from || !this.to) return;

    this.store.load({ from: this.from, to: this.to, urgent: this.urgent });
  }

  delay(): void {
    this.store.delay();

    // this.flights$.pipe(take(1)).subscribe((flights) => {
    //   const flight = flights[0];
 
    //   const oldDate = new Date(flight.date);
    //   const newDate = new Date(oldDate.getTime() + 15 * 60 * 1000);
    //   const newFlight = { ...flight, date: newDate.toISOString() };
 
    //   this.store.dispatch(updateFlight({ flight: newFlight }));
    // });
  }
}
