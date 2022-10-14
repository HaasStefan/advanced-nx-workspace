import { Observable } from 'rxjs';


export function freezeUntil<T1, T2>(
  until$: Observable<T2>
): (source$: Observable<T1>) => Observable<T1> {
  return (source$) =>
    new Observable((subscriber) => {
      let cache: T1 | null;

      until$.subscribe(() => {
        cache = null;
      });

      source$.subscribe((value) => {
        if (!cache) {
          cache = value;
          subscriber.next(value);
        }
      });
    });
}
