import { createAction, props } from '@ngrx/store';
import { Passenger } from '../../entities/passenger';

export const loadPassenger = createAction('[Passenger] Load Passenger');

export const loadPassengerSuccess = createAction(
  '[Passenger] Load Passenger Success',
  props<{ passenger: Passenger[] }>()
);

export const loadPassengerFailure = createAction(
  '[Passenger] Load Passenger Failure',
  props<{ error: any }>()
);
