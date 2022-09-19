import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FligthDto, PassengerDto, TicketDto } from './enities';
import * as fromFlightBooking from './flight-booking.reducer';

export const selectFlightBookingState =
  createFeatureSelector<fromFlightBooking.State>(
    fromFlightBooking.flightBookingFeatureKey
  );

export const selectFlights = createSelector(
  selectFlightBookingState,
  (state) => state.flights
);

export const selectBlacklist = createSelector(
  selectFlightBookingState,
  (state) => state.blackList
);

export const selectFilteredFlights = createSelector(
  selectFlights,
  selectBlacklist,
  (flights, blackList) => flights.filter((f) => !blackList.includes(f.id))
);

export const selectFlightsWithParams = (id: number) =>
  createSelector(selectFlights, (flights) =>
    flights.filter((f) => f.id === id)
  );

export const selectFlightNormalized = (id: string) =>
  createSelector(selectFlightBookingState, (state) => {
    const _flight = state._flights[id];

    const tickets = _flight.ticketIds.map((id) => {
      const _ticket = state._tickets[id];
      const _passenger = state._passengers[_ticket.passengerId];
      const passenger: PassengerDto = {
        id: _passenger.id,
        firstName: _passenger.firstName,
        lastName: _passenger.lastName,
      };

      return {
        id: _ticket.id,
        price: _ticket.price,
        passenger,
      } as TicketDto;
    });

    return {
      id: _flight.id,
      from: _flight.from,
      to: _flight.to,
      tickets
    } as FligthDto;
  });
