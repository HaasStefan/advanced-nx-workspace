import { Component, OnInit } from '@angular/core';
import {
  FlightService,
  FlightStoreService,
} from '@flight-workspace/flight-lib';
import { Store } from '@ngrx/store';
import { flightsLoaded, loadFlights } from '../+state/flight-booking.actions';
import {
  FlightBookingAppState,
  flightBookingFeatureKey,
} from '../+state/flight-booking.reducer';
import {
  selectFlight,
  selectFlights,
  selectWhitelist,
} from '../+state/flight-booking.selectors';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  providers: [FlightStoreService],
})
export class FlightSearchComponent implements OnInit {
  from = 'Hamburg'; // in Germany
  to = 'Graz'; // in Austria
  urgent = false;

  flights$ = this.flightStore.flights$;

  // get flights() {
  //   return this.flightService.flights;
  // }

  // "shopping basket" with selected flights
  basket: { [id: number]: boolean } = {
    3: true,
    5: true,
  };

  constructor(
    private flightStore: FlightStoreService,
    private store: Store<FlightBookingAppState>,
    private flightService: FlightService
  ) {}

  ngOnInit() {
    console.log('ngOnInit');
  }

  search(): void {
    if (!this.from || !this.to) return;

    this.flightStore.load({
      from: this.from,
      to: this.to,
      urgent: this.urgent,
    });

    //this.store.dispatch(loadFlights({
    //  from: this.from,
    //  to: this.to,
    //  urgent: this.urgent
    //}));

    //this.flightService
    //  .find(this.from,this.to, this.urgent)
    //  .subscribe((flights) => {
    //    this.store.dispatch(flightsLoaded({flights}));
    //  })
  }

  delay(): void {
    this.flightStore.delay();
    //this.flightService.delay();
  }
}
