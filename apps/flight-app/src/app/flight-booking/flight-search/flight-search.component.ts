import { Component, OnInit } from '@angular/core';
import { FlightService } from '@flight-workspace/flight-lib';
import { Store } from '@ngrx/store';
import { flightsLoaded } from '../+state/flight-booking.actions';
import {
  FlightBookingAppState,
  flightBookingFeatureKey,
} from '../+state/flight-booking.reducer';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
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

  readonly flights$ = this.store.select((state) => state.flightBooking.flights);

  constructor(
    private flightService: FlightService,
    private store: Store<FlightBookingAppState>
  ) {}

  ngOnInit() {
    console.log('ngOnInit');
  }

  search(): void {
    if (!this.from || !this.to) return;

    // this.flightService
    //   .load(this.from, this.to, this.urgent);

    // dispatch flights
    this.flightService
      .find(this.from, this.to, this.urgent)
      .subscribe((flights) => {
        this.store.dispatch(flightsLoaded({ flights }));

        // reminder:
        // {flights} <===> {flights: flights}
      });
  }

  delay(): void {
    this.flightService.delay();
  }
}
