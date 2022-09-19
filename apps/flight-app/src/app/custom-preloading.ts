import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { delay, map, Observable, of } from 'rxjs';

@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data && route.data['preload']) {
      if (route.data['delay']) {
        return of(null).pipe(
          delay(2000),
          map(() => load())
        );
      } else {
        return load();
      }
    } else {
      return of(null);
    }
  }
}
