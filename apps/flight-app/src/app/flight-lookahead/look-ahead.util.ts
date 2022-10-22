import { debounceTime, distinctUntilChanged, filter, Observable } from 'rxjs';

// export function lookAhead<T>(source$: Observable<T>): Observable<T> {
//     return source$.pipe(
//         //filter(x => x.length > 2),
//         debounceTime(300),
//         distinctUntilChanged(),
//     );
// }

export function lookAhead<T>(
  debounce: number
): (source$: Observable<T>) => Observable<T> {
  return (source$) =>
    source$.pipe(debounceTime(debounce), distinctUntilChanged());
}

export function freezeUntil<T1, T2>(
  until$: Observable<T2>
): (source$: Observable<T1>) => Observable<T1> {
  return (source$) =>
    new Observable((observer) => {
      let cache: T1 | null;

      until$.subscribe(() => {
        cache = null;
      });

      source$.subscribe((value) => {
        if (!cache) {
          cache = value;
          observer.next(value);
        }
      });
    });
}
