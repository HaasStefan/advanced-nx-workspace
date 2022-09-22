import { Routes } from '@angular/router';
import { BasketComponent } from './basket/basket.component';
import { HomeComponent } from './home/home.component';
import { loadRemoteModule } from '@angular-architects/module-federation';
import {
  WebComponentWrapper,
  WebComponentWrapperOptions,
} from '@angular-architects/module-federation-tools';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'basket',
    component: BasketComponent,
    outlet: 'aux',
  },
  {
    path: 'passenger',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module', // >= 13, vor 13 script --> weil seit 13 Angular in typescript module kompiliert
        remoteEntry: 'http://localhost:3000/remoteEntry.js',
        exposedModule: './Module',
      }).then((m) => m.PassengerModule),
  },

  {
    path: 'react',
    component: WebComponentWrapper,
    data: {
      remoteEntry:
        'https://witty-wave-0a695f710.azurestaticapps.net/remoteEntry.js',
      remoteName: 'react',
      exposedModule: './web-components',
      elementName: 'react-element', // <react-element>
    } as WebComponentWrapperOptions,
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];
