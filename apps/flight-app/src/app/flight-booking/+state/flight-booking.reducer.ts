import { Flight } from '@flight-workspace/flight-lib';
import { Action, createReducer, on } from '@ngrx/store';
import { FlightInStore, PassengerInStore, TicketInStore } from './enities';
import * as FlightBookingActions from './flight-booking.actions';

export const flightBookingFeatureKey = 'flightBooking';

export interface FlightBookingAppState {
  [flightBookingFeatureKey]: State;
}

export interface State {
  flights: Flight[];
  blackList: number[];

  _flights: {
    [id: string]: FlightInStore;
  };
  _tickets: {
    [id: string]: TicketInStore;
  };
  _passengers: {
    [id: string]: PassengerInStore;
  };
}

export const initialState: State = {
  flights: [],
  blackList: [3], // default: blacklist flight with id 3
  _flights: {
    '1': {
      id: '1',
      from: new Date(),
      to: new Date(),
      ticketIds: ['2'],
    },
  },
  _tickets: {
    '2': {
      id: '2',
      price: 99,
      flightId: '1',
      passengerId: '5',
    },
  },
  _passengers: {
    '5': {
      id: '5',
      firstName: 'John',
      lastName: 'Smith',
      ticketId: '1',
    },
  },
};

export const reducer = createReducer(
  initialState,

  on(FlightBookingActions.flightBookingFlightBookings, (state) => state),

  on(FlightBookingActions.flightsLoaded, (state, action) => {
    const flights: Flight[] = [...action.flights];
    return {
      ...state,
      flights,
    };
  }),

  on(FlightBookingActions.updateFlight, (state, { flight }) => {
    const flights = state.flights.map((f) => (f.id === flight.id ? flight : f));
    return {
      ...state,
      flights,
    };
  }),

  on(FlightBookingActions.normalizeFlightDto, (state, { flightDto }) => {
    const _passengers: {
      [id: string]: PassengerInStore;
    } = { ...state._passengers };

    flightDto.tickets.forEach((t) => {
      _passengers[t.passenger.id] = {
        id: t.passenger.id,
        firstName: t.passenger.firstName,
        lastName: t.passenger.lastName,
        ticketId: t.id,
      };
    });

    const _tickets: {
      [id: string]: TicketInStore;
    } = { ...state._tickets };

    flightDto.tickets.forEach((t) => {
      _tickets[t.id] = {
        id: t.id,
        price: t.price,
        flightId: flightDto.id,
        passengerId: t.passenger.id,
      };
    });

    const _flights: {
      [id: string]: FlightInStore;
    } = {
      ...state._flights,
      [flightDto.id]: {
        id: flightDto.id,
        from: flightDto.from,
        to: flightDto.to,
        ticketIds: Object.keys(_tickets),
      },
    };

    return {
      ...state,
      _passengers,
      _tickets,
      _flights,
    };
  })

  // NGRX-immer
  // https://github.com/timdeschryver/ngrx-immer
  //
  // immerOn(FlightBookingActions.flightsLoaded, (state, action) => {
  //   state.flights = [...action.flights];
  //   return state;
  // })
);
