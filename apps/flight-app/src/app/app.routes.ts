import { Routes } from '@angular/router';
import { BasketComponent } from './basket/basket.component';
import { FlightLookaheadComponent } from './flight-lookahead/flight-lookahead.component';
import { HomeComponent } from './home/home.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'basket',
    component: BasketComponent,
    outlet: 'aux'
  },
  {
    path: 'flight-lookahead',
    component: FlightLookaheadComponent,
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
