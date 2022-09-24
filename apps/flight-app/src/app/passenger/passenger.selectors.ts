import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter, passengersFeatureKey, State } from './passenger.reducer';


export const selectPassengerAppState = createFeatureSelector<State>(
  passengersFeatureKey
);


export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export const selectAllPassengers = createSelector(
  selectPassengerAppState,
  selectAll
)


